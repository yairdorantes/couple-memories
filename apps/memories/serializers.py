from rest_framework import serializers

from apps.mediafiles.serializers import MediaAssetSerializer

from .models import Memory, MemoryCategory, MemoryMedia, Place, PlaceCategory
from .services import delete_place_if_empty


class PlaceSerializer(serializers.ModelSerializer):
    cover_media_detail = MediaAssetSerializer(source="cover_media", read_only=True)
    memory_count = serializers.IntegerField(read_only=True)

    class Meta:
        model = Place
        fields = [
            "id",
            "couple",
            "name",
            "description",
            "category",
            "latitude",
            "longitude",
            "cover_media",
            "cover_media_detail",
            "memory_count",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["created_at", "updated_at"]

    def validate_category(self, value):
        if value not in PlaceCategory.values:
            raise serializers.ValidationError("Invalid place category.")
        return value

    def validate(self, attrs):
        request = self.context["request"]
        couple = attrs.get("couple") or getattr(self.instance, "couple", None)
        if (
            request.user.is_authenticated
            and couple
            and not couple.members.filter(user=request.user).exists()
        ):
            raise serializers.ValidationError("You are not a member of this couple.")
        return attrs


class MemoryMediaSerializer(serializers.ModelSerializer):
    media_detail = MediaAssetSerializer(source="media", read_only=True)
    place_detail = PlaceSerializer(source="place", read_only=True)

    class Meta:
        model = MemoryMedia
        fields = [
            "id",
            "memory",
            "media",
            "media_detail",
            "sort_order",
            "caption",
            "taken_at",
            "location_name",
            "latitude",
            "longitude",
            "place",
            "place_detail",
            "created_at",
        ]
        read_only_fields = ["created_at"]

    def validate(self, attrs):
        latitude = attrs.get("latitude", getattr(self.instance, "latitude", None))
        longitude = attrs.get("longitude", getattr(self.instance, "longitude", None))

        if (latitude is None) != (longitude is None):
            raise serializers.ValidationError(
                "Latitude and longitude must be provided together.",
            )
        return attrs

    def create(self, validated_data):
        memory_media = super().create(validated_data)
        self.sync_place(memory_media)
        return memory_media

    def update(self, instance, validated_data):
        previous_place_id = instance.place_id
        memory_media = super().update(instance, validated_data)
        self.sync_place(memory_media, previous_place_id=previous_place_id)
        return memory_media

    def sync_place(self, memory_media, previous_place_id=None):
        if memory_media.latitude is None or memory_media.longitude is None:
            if memory_media.place_id:
                memory_media.place = None
                memory_media.save(update_fields=["place", "updated_at"])
                delete_place_if_empty(previous_place_id)
            return

        memory = memory_media.memory
        place_name = memory_media.location_name.strip() or memory.location_name.strip() or memory.title
        place, created = Place.objects.get_or_create(
            couple=memory.couple,
            name=place_name,
            defaults={
                "description": memory_media.caption or memory.caption,
                "category": get_place_category(memory.category),
                "latitude": memory_media.latitude,
                "longitude": memory_media.longitude,
                "cover_media": memory_media.media,
            },
        )

        if not created and place.cover_media_id is None:
            place.cover_media = memory_media.media
            place.save(update_fields=["cover_media", "updated_at"])

        if memory_media.place_id != place.id:
            memory_media.place = place
            memory_media.save(update_fields=["place", "updated_at"])

        if previous_place_id and previous_place_id != place.id:
            delete_place_if_empty(previous_place_id)


class MemorySerializer(serializers.ModelSerializer):
    primary_media_detail = MediaAssetSerializer(source="primary_media", read_only=True)
    place_detail = PlaceSerializer(source="place", read_only=True)
    media_links = MemoryMediaSerializer(many=True, read_only=True)

    class Meta:
        model = Memory
        fields = [
            "id",
            "couple",
            "title",
            "caption",
            "location_name",
            "latitude",
            "longitude",
            "mood_emoji",
            "category",
            "happened_at",
            "is_favorite",
            "place",
            "place_detail",
            "primary_media",
            "primary_media_detail",
            "media_links",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["created_at", "updated_at"]

    def validate_category(self, value):
        if value not in MemoryCategory.values:
            raise serializers.ValidationError("Invalid memory category.")
        return value

    def validate(self, attrs):
        request = self.context["request"]
        couple = attrs.get("couple") or getattr(self.instance, "couple", None)
        if (
            request.user.is_authenticated
            and couple
            and not couple.members.filter(user=request.user).exists()
        ):
            raise serializers.ValidationError("You are not a member of this couple.")

        latitude = attrs.get("latitude", getattr(self.instance, "latitude", None))
        longitude = attrs.get("longitude", getattr(self.instance, "longitude", None))
        latitude_is_empty = latitude is None
        longitude_is_empty = longitude is None

        if latitude_is_empty != longitude_is_empty:
            raise serializers.ValidationError(
                "Latitude and longitude must be provided together.",
            )

        if latitude is not None and not (-90 <= latitude <= 90):
            raise serializers.ValidationError("Latitude must be between -90 and 90.")

        if longitude is not None and not (-180 <= longitude <= 180):
            raise serializers.ValidationError("Longitude must be between -180 and 180.")

        return attrs

    def create(self, validated_data):
        memory = super().create(validated_data)
        self.sync_place(memory)
        return memory

    def update(self, instance, validated_data):
        previous_primary_media_id = instance.primary_media_id
        memory = super().update(instance, validated_data)
        self.sync_place(memory, previous_primary_media_id=previous_primary_media_id)
        return memory

    def sync_place(self, memory: Memory, previous_primary_media_id: int | None = None) -> None:
        if memory.latitude is None or memory.longitude is None:
            if memory.place_id:
                previous_place_id = memory.place_id
                memory.place = None
                memory.save(update_fields=["place", "updated_at"])
                delete_place_if_empty(previous_place_id)
            return

        place_name = memory.location_name.strip() or memory.title
        place, created = Place.objects.get_or_create(
            couple=memory.couple,
            name=place_name,
            defaults={
                "description": memory.caption,
                "category": get_place_category(memory.category),
                "latitude": memory.latitude,
                "longitude": memory.longitude,
                "cover_media": memory.primary_media,
            },
        )

        changed_fields = []
        if not created:
            if place.latitude != memory.latitude:
                place.latitude = memory.latitude
                changed_fields.append("latitude")
            if place.longitude != memory.longitude:
                place.longitude = memory.longitude
                changed_fields.append("longitude")
            if not place.description and memory.caption:
                place.description = memory.caption
                changed_fields.append("description")
            if place.category == PlaceCategory.OTHER:
                place.category = get_place_category(memory.category)
                changed_fields.append("category")
            if previous_primary_media_id and place.cover_media_id == previous_primary_media_id:
                place.cover_media = memory.primary_media
                changed_fields.append("cover_media")
            elif place.cover_media_id is None and memory.primary_media_id:
                place.cover_media = memory.primary_media
                changed_fields.append("cover_media")
            if changed_fields:
                place.save(update_fields=[*changed_fields, "updated_at"])

        if memory.place_id != place.id:
            memory.place = place
            memory.save(update_fields=["place", "updated_at"])


def get_place_category(memory_category: str) -> str:
    if memory_category == MemoryCategory.COFFEE:
        return PlaceCategory.COFFEE
    if memory_category == MemoryCategory.TRAVEL:
        return PlaceCategory.TRIP
    return PlaceCategory.DATE


class MemoryFavoriteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Memory
        fields = ["is_favorite"]
