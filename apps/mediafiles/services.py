from dataclasses import dataclass
import logging

import cloudinary.uploader
from cloudinary import CloudinaryImage
from django.conf import settings
from django.core.exceptions import ValidationError
from django.core.files.uploadedfile import UploadedFile

logger = logging.getLogger(__name__)


@dataclass(frozen=True)
class UploadedMediaMetadata:
    width: int | None
    height: int | None
    public_id: str
    secure_url: str
    optimized_url: str


def validate_upload(file: UploadedFile) -> None:
    if file.size > settings.MAX_UPLOAD_SIZE_BYTES:
        raise ValidationError(f"File exceeds {settings.MAX_UPLOAD_SIZE_MB} MB.")

    content_type = getattr(file, "content_type", "")
    if content_type not in settings.ALLOWED_UPLOAD_MIME_TYPES:
        raise ValidationError("Unsupported file type.")


def upload_image_to_cloudinary(file: UploadedFile) -> UploadedMediaMetadata:
    validate_upload(file)
    result = cloudinary.uploader.upload(
        file,
        folder="couple-memories",
        resource_type="image",
        quality="auto",
        fetch_format="auto",
    )

    public_id = result.get("public_id", "")
    optimized_url = CloudinaryImage(public_id).build_url(
        secure=True,
        quality="auto",
        fetch_format="auto",
        width=1600,
        crop="limit",
    )

    return UploadedMediaMetadata(
        width=result.get("width"),
        height=result.get("height"),
        public_id=public_id,
        secure_url=result.get("secure_url", ""),
        optimized_url=optimized_url,
    )


def delete_cloudinary_asset(public_id: str) -> None:
    if public_id:
        try:
            cloudinary.uploader.destroy(public_id, resource_type="image")
        except Exception:
            logger.exception("Could not delete Cloudinary asset %s.", public_id)


def delete_media_asset_if_unreferenced(media_id: int | None) -> None:
    if not media_id:
        return

    from .models import MediaAsset

    asset = MediaAsset.objects.filter(pk=media_id).first()
    if not asset or is_media_asset_referenced(asset):
        return

    asset.delete()


def is_media_asset_referenced(asset) -> bool:
    return (
        asset.primary_memories.exists()
        or asset.memory_links.exists()
        or asset.cover_places.exists()
        or asset.avatar_members.exists()
        or asset.couple_hero_images.exists()
    )
