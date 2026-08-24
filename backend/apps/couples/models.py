from django.conf import settings
from django.core.validators import MaxLengthValidator
from django.db import models

from apps.common.models import TimeStampedModel


class Couple(TimeStampedModel):
    name = models.TextField()
    anniversary_date = models.DateField(null=True, blank=True)
    owner = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="owned_couples",
    )

    class Meta:
        db_table = "couples"
        indexes = [
            models.Index(fields=["owner", "-created_at"]),
        ]

    def __str__(self) -> str:
        return self.name


class CoupleMember(TimeStampedModel):
    class Role(models.TextChoices):
        HER = "her", "Her"
        HIM = "him", "Him"

    couple = models.ForeignKey(Couple, on_delete=models.CASCADE, related_name="members")
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="couple_memberships",
    )
    role = models.TextField(choices=Role.choices)
    name = models.TextField()
    birthday = models.DateField(null=True, blank=True)
    accent_color = models.CharField(max_length=7, default="#ed93b1")
    description = models.TextField(blank=True)
    avatar = models.ForeignKey(
        "mediafiles.MediaAsset",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="avatar_members",
    )
    status_note = models.TextField(blank=True, validators=[MaxLengthValidator(80)])

    class Meta:
        db_table = "couple_members"
        constraints = [
            models.UniqueConstraint(
                fields=["couple", "role"],
                name="unique_member_role_per_couple",
            ),
        ]
        indexes = [
            models.Index(fields=["couple", "role"]),
            models.Index(fields=["user"]),
        ]

    def __str__(self) -> str:
        return f"{self.name} ({self.role})"


class CoupleHeroImage(TimeStampedModel):
    couple = models.ForeignKey(
        Couple,
        on_delete=models.CASCADE,
        related_name="hero_images",
    )
    media = models.ForeignKey(
        "mediafiles.MediaAsset",
        on_delete=models.CASCADE,
        related_name="couple_hero_images",
    )
    crop = models.JSONField(default=dict, blank=True)
    sort_order = models.PositiveIntegerField(default=0)

    class Meta:
        db_table = "couple_hero_images"
        ordering = ["sort_order", "-created_at"]
        indexes = [
            models.Index(fields=["couple", "sort_order"]),
            models.Index(fields=["media"]),
        ]
        constraints = [
            models.UniqueConstraint(
                fields=["couple", "media"],
                name="unique_hero_media_per_couple",
            ),
        ]

    def __str__(self) -> str:
        return f"{self.couple_id}:{self.media_id}"
