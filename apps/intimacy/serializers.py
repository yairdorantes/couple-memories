from rest_framework import serializers

from apps.common.api import VALID_COUPLE_MEMBER_ROLES

from .models import IntimacyMood, IntimacyRecord


class IntimacyRecordSerializer(serializers.ModelSerializer):
    class Meta:
        model = IntimacyRecord
        fields = [
            "id",
            "couple",
            "title",
            "happened_at",
            "place",
            "mood",
            "note",
            "is_favorite",
            "created_by_role",
            "updated_by_role",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["created_by_role", "updated_by_role", "created_at", "updated_at"]

    def validate_mood(self, value):
        if value not in IntimacyMood.values:
            raise serializers.ValidationError("Invalid intimacy mood.")
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

    def create(self, validated_data):
        current_role = self.context.get("current_member_role") or ""
        if current_role in VALID_COUPLE_MEMBER_ROLES:
            validated_data["created_by_role"] = current_role
            validated_data["updated_by_role"] = current_role
        return super().create(validated_data)

    def update(self, instance, validated_data):
        current_role = self.context.get("current_member_role") or ""
        if current_role in VALID_COUPLE_MEMBER_ROLES:
            validated_data["updated_by_role"] = current_role
        return super().update(instance, validated_data)


class IntimacyFavoriteSerializer(serializers.ModelSerializer):
    class Meta:
        model = IntimacyRecord
        fields = ["is_favorite"]

