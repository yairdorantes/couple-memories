from django.core.validators import MaxLengthValidator
from django.db import models

from apps.common.models import TimeStampedModel


class IntimacyMood(models.TextChoices):
    TENDER = "tender", "Tender"
    PASSIONATE = "passionate", "Passionate"
    QUIET = "quiet", "Quiet"
    SPECIAL = "special", "Special"


class IntimacyRecordQuerySet(models.QuerySet):
    def for_user(self, user):
        return self.filter(couple__members__user=user).distinct()

    def search(self, query: str):
        if not query:
            return self
        return self.filter(
            models.Q(title__icontains=query)
            | models.Q(place__icontains=query)
            | models.Q(note__icontains=query)
        )


class IntimacyRecord(TimeStampedModel):
    couple = models.ForeignKey(
        "couples.Couple",
        on_delete=models.CASCADE,
        related_name="intimacy_records",
    )
    title = models.TextField(validators=[MaxLengthValidator(160)])
    happened_at = models.DateTimeField()
    place = models.TextField(blank=True)
    mood = models.TextField(choices=IntimacyMood.choices, default=IntimacyMood.TENDER)
    note = models.TextField(blank=True, validators=[MaxLengthValidator(300)])
    is_favorite = models.BooleanField(default=False)
    created_by_role = models.TextField(blank=True)
    updated_by_role = models.TextField(blank=True)

    objects = IntimacyRecordQuerySet.as_manager()

    class Meta:
        db_table = "intimacy_records"
        ordering = ["-happened_at", "-created_at"]
        indexes = [
            models.Index(fields=["couple", "-happened_at"]),
            models.Index(fields=["couple", "mood"]),
            models.Index(fields=["couple", "is_favorite"]),
            models.Index(fields=["couple", "created_by_role"]),
        ]

    def __str__(self) -> str:
        return self.title

