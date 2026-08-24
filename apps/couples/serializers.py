from rest_framework import serializers

from apps.mediafiles.serializers import MediaAssetSerializer

from .models import Couple, CoupleHeroImage, CoupleMember


class CoupleMemberSerializer(serializers.ModelSerializer):
    avatar_detail = MediaAssetSerializer(source="avatar", read_only=True)

    class Meta:
        model = CoupleMember
        fields = [
            "id",
            "couple",
            "role",
            "name",
            "birthday",
            "accent_color",
            "description",
            "status_note",
            "avatar",
            "avatar_detail",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["created_at", "updated_at"]


class CoupleSerializer(serializers.ModelSerializer):
    members = CoupleMemberSerializer(many=True, read_only=True)

    class Meta:
        model = Couple
        fields = ["id", "name", "anniversary_date", "members", "created_at", "updated_at"]
        read_only_fields = ["created_at", "updated_at"]


class CoupleHeroImageSerializer(serializers.ModelSerializer):
    media_detail = MediaAssetSerializer(source="media", read_only=True)

    class Meta:
        model = CoupleHeroImage
        fields = [
            "id",
            "couple",
            "media",
            "media_detail",
            "crop",
            "sort_order",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["created_at", "updated_at"]

    def validate_crop(self, value):
        if not isinstance(value, dict):
            raise serializers.ValidationError("Crop must be an object.")

        return {
            "x": self._clamp_number(value.get("x", 50), 0, 100, 50),
            "y": self._clamp_number(value.get("y", 50), 0, 100, 50),
            "zoom": self._clamp_number(value.get("zoom", 1), 1, 3, 1),
            "fit": "contain" if value.get("fit") == "contain" else "cover",
        }

    def _clamp_number(
        self,
        raw_value,
        minimum: float,
        maximum: float,
        fallback: float,
    ) -> float:
        try:
            value = float(raw_value)
        except (TypeError, ValueError):
            value = fallback

        return min(max(value, minimum), maximum)
