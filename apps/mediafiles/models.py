from django.conf import settings
from django.db import models

from apps.common.models import TimeStampedModel


class MediaAsset(TimeStampedModel):
    class Kind(models.TextChoices):
        IMAGE = "image", "Image"
        VIDEO = "video", "Video"
        OTHER = "other", "Other"

    owner = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="media_assets",
    )
    kind = models.TextField(choices=Kind.choices, default=Kind.IMAGE)
    original_filename = models.TextField(blank=True)
    mime_type = models.TextField(blank=True)
    file_size = models.PositiveBigIntegerField(default=0)
    width = models.PositiveIntegerField(null=True, blank=True)
    height = models.PositiveIntegerField(null=True, blank=True)
    cloudinary_public_id = models.TextField(blank=True)
    secure_url = models.URLField(max_length=1200, blank=True)
    optimized_url = models.URLField(max_length=1200, blank=True)

    class Meta:
        db_table = "media_assets"
        indexes = [
            models.Index(fields=["owner", "-created_at"]),
            models.Index(fields=["kind"]),
        ]

    def __str__(self) -> str:
        return self.original_filename or self.cloudinary_public_id
