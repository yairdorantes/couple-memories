from django.core.validators import MaxLengthValidator
from django.db import models

from apps.common.models import TimeStampedModel


class MemoryCategory(models.TextChoices):
    TRAVEL = "travel", "Travel"
    FOOD = "food", "Food"
    MOVIE = "movie", "Movie"
    COFFEE = "coffee", "Coffee"
    GIFT = "gift", "Gift"
    OTHER = "other", "Other"


class PlaceCategory(models.TextChoices):
    TRIP = "trip", "Trip"
    COFFEE = "coffee", "Coffee"
    HOME = "home", "Home"
    DATE = "date", "Date"
    OTHER = "other", "Other"


class Place(TimeStampedModel):
    couple = models.ForeignKey("couples.Couple", on_delete=models.CASCADE, related_name="places")
    name = models.TextField()
    description = models.TextField(blank=True)
    category = models.TextField(choices=PlaceCategory.choices, default=PlaceCategory.OTHER)
    latitude = models.DecimalField(max_digits=9, decimal_places=6)
    longitude = models.DecimalField(max_digits=9, decimal_places=6)
    cover_media = models.ForeignKey(
        "mediafiles.MediaAsset",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="cover_places",
    )

    class Meta:
        db_table = "places"
        constraints = [
            models.UniqueConstraint(fields=["couple", "name"], name="unique_place_name_per_couple"),
            models.CheckConstraint(
                check=models.Q(latitude__gte=-90) & models.Q(latitude__lte=90),
                name="place_latitude_range",
            ),
            models.CheckConstraint(
                check=models.Q(longitude__gte=-180) & models.Q(longitude__lte=180),
                name="place_longitude_range",
            ),
        ]
        indexes = [
            models.Index(fields=["couple", "category"]),
            models.Index(fields=["couple", "name"]),
        ]

    def __str__(self) -> str:
        return self.name


class MemoryQuerySet(models.QuerySet):
    def for_user(self, user):
        return self.filter(couple__members__user=user).distinct()

    def search(self, query: str):
        if not query:
            return self
        return self.filter(
            models.Q(title__icontains=query)
            | models.Q(caption__icontains=query)
            | models.Q(location_name__icontains=query)
            | models.Q(place__name__icontains=query)
        )


class Memory(TimeStampedModel):
    couple = models.ForeignKey("couples.Couple", on_delete=models.CASCADE, related_name="memories")
    title = models.TextField(validators=[MaxLengthValidator(160)])
    caption = models.TextField(blank=True)
    location_name = models.TextField(blank=True)
    latitude = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)
    longitude = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)
    mood_emoji = models.CharField(max_length=16, default="❤️")
    category = models.TextField(choices=MemoryCategory.choices, default=MemoryCategory.OTHER)
    happened_at = models.DateTimeField()
    is_favorite = models.BooleanField(default=False)
    place = models.ForeignKey(
        Place,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="memories",
    )
    primary_media = models.ForeignKey(
        "mediafiles.MediaAsset",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="primary_memories",
    )

    objects = MemoryQuerySet.as_manager()

    class Meta:
        db_table = "memories"
        ordering = ["-happened_at", "-created_at"]
        indexes = [
            models.Index(fields=["couple", "-happened_at"]),
            models.Index(fields=["couple", "category"]),
            models.Index(fields=["couple", "is_favorite"]),
            models.Index(fields=["place"]),
            models.Index(fields=["couple", "latitude", "longitude"]),
        ]
        constraints = [
            models.CheckConstraint(
                check=models.Q(latitude__isnull=True) | (models.Q(latitude__gte=-90) & models.Q(latitude__lte=90)),
                name="memory_latitude_range",
            ),
            models.CheckConstraint(
                check=models.Q(longitude__isnull=True)
                | (models.Q(longitude__gte=-180) & models.Q(longitude__lte=180)),
                name="memory_longitude_range",
            ),
        ]

    def __str__(self) -> str:
        return self.title


class MemoryMedia(TimeStampedModel):
    memory = models.ForeignKey(Memory, on_delete=models.CASCADE, related_name="media_links")
    media = models.ForeignKey("mediafiles.MediaAsset", on_delete=models.CASCADE, related_name="memory_links")
    sort_order = models.PositiveIntegerField(default=0)
    caption = models.TextField(blank=True)
    taken_at = models.DateTimeField(null=True, blank=True)
    location_name = models.TextField(blank=True)
    latitude = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)
    longitude = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)
    place = models.ForeignKey(
        Place,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="memory_media",
    )

    class Meta:
        db_table = "memory_media"
        ordering = ["sort_order", "created_at"]
        indexes = [
            models.Index(fields=["memory", "sort_order"]),
            models.Index(fields=["media"]),
            models.Index(fields=["place"]),
        ]
        constraints = [
            models.UniqueConstraint(fields=["memory", "media"], name="unique_media_per_memory"),
            models.CheckConstraint(
                check=models.Q(latitude__isnull=True) | (models.Q(latitude__gte=-90) & models.Q(latitude__lte=90)),
                name="memory_media_latitude_range",
            ),
            models.CheckConstraint(
                check=models.Q(longitude__isnull=True)
                | (models.Q(longitude__gte=-180) & models.Q(longitude__lte=180)),
                name="memory_media_longitude_range",
            ),
        ]

    def __str__(self) -> str:
        return f"{self.memory_id}:{self.media_id}"
