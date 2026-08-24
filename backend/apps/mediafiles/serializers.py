from django.core.exceptions import ValidationError as DjangoValidationError
from rest_framework import serializers

from apps.common.api import get_request_user_or_default

from .models import MediaAsset
from .services import upload_image_to_cloudinary


class MediaAssetSerializer(serializers.ModelSerializer):
    url = serializers.SerializerMethodField()

    class Meta:
        model = MediaAsset
        fields = [
            "id",
            "kind",
            "original_filename",
            "mime_type",
            "file_size",
            "width",
            "height",
            "secure_url",
            "optimized_url",
            "url",
            "created_at",
            "updated_at",
        ]
        read_only_fields = fields

    def get_url(self, obj: MediaAsset) -> str:
        return obj.optimized_url or obj.secure_url


class MediaUploadSerializer(serializers.Serializer):
    file = serializers.FileField()

    def validate_file(self, file):
        try:
            from .services import validate_upload

            validate_upload(file)
        except DjangoValidationError as exc:
            raise serializers.ValidationError(exc.messages) from exc
        return file

    def create(self, validated_data):
        request = self.context["request"]
        owner = get_request_user_or_default(request)
        if owner is None:
            raise serializers.ValidationError("Create a user before uploading media.")
        file = validated_data["file"]
        metadata = upload_image_to_cloudinary(file)

        return MediaAsset.objects.create(
            owner=owner,
            kind=MediaAsset.Kind.IMAGE,
            original_filename=file.name,
            mime_type=getattr(file, "content_type", ""),
            file_size=file.size,
            width=metadata.width,
            height=metadata.height,
            cloudinary_public_id=metadata.public_id,
            secure_url=metadata.secure_url,
            optimized_url=metadata.optimized_url,
        )
