from datetime import date, timedelta

from django.db.models import Case, Count, IntegerField, Value, When
from django.db.models.functions import ExtractYear
from django.utils import timezone
from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.response import Response

from apps.common.api import get_request_couple_member_role

from .models import Memory, MemoryMedia, Place
from .permissions import IsMemoryCoupleMember
from .services import delete_place_if_empty
from .serializers import (
    MemoryFavoriteSerializer,
    MemoryMediaSerializer,
    MemorySerializer,
    PlaceSerializer,
)


class PlaceViewSet(viewsets.ModelViewSet):
    serializer_class = PlaceSerializer
    permission_classes = [IsMemoryCoupleMember]

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context["current_member_role"] = get_request_couple_member_role(self.request)
        return context

    def get_queryset(self):
        queryset = Place.objects.select_related("couple", "cover_media").annotate(
            memory_count=Count("memories"),
        )
        if self.request.user.is_authenticated:
            queryset = queryset.filter(couple__members__user=self.request.user).distinct()
        return queryset.order_by("name")


class MemoryViewSet(viewsets.ModelViewSet):
    serializer_class = MemorySerializer
    permission_classes = [IsMemoryCoupleMember]

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context["current_member_role"] = get_request_couple_member_role(self.request)
        return context

    def get_queryset(self):
        queryset = Memory.objects.select_related(
            "couple",
            "place",
            "primary_media",
        ).prefetch_related("media_links", "media_links__media")
        if self.request.user.is_authenticated:
            queryset = queryset.for_user(self.request.user)
        category = self.request.query_params.get("category")
        couple_id = self.request.query_params.get("couple")
        favorite = self.request.query_params.get("favorite")
        query = self.request.query_params.get("search", "").strip()

        if couple_id:
            queryset = queryset.filter(couple_id=couple_id)
        if category and category != "all":
            queryset = queryset.filter(category=category)
        if favorite in {"true", "1"}:
            queryset = queryset.filter(is_favorite=True)

        return queryset.search(query)

    @action(detail=False, methods=["get"])
    def featured(self, request):
        featured_date = parse_featured_date(
            request.query_params.get("date"),
        )
        limit = parse_featured_limit(request.query_params.get("limit"))
        timezone_offset = parse_timezone_offset(
            request.query_params.get("timezone_offset"),
        )
        queryset = (
            self.get_queryset()
            .annotate(
                has_primary_media=Case(
                    When(primary_media__isnull=False, then=Value(1)),
                    default=Value(0),
                    output_field=IntegerField(),
                ),
                memory_year=ExtractYear("happened_at"),
            )
        )
        memories = get_on_this_day_memories(
            list(queryset),
            featured_date,
            timezone_offset,
            limit,
        )
        if len(memories) < limit:
            fallback_queryset = queryset
            if memories:
                fallback_queryset = fallback_queryset.exclude(
                    id__in=[memory.id for memory in memories],
                )

            memories.extend(
                list(
                    fallback_queryset.order_by(
                        "-is_favorite",
                        "-has_primary_media",
                        "?",
                    )[: limit - len(memories)],
                ),
            )

        serializer = self.get_serializer(memories, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=["patch"])
    def favorite(self, request, pk=None):
        memory = self.get_object()
        serializer = MemoryFavoriteSerializer(memory, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(MemorySerializer(memory, context={"request": request}).data)


class MemoryMediaViewSet(viewsets.ModelViewSet):
    serializer_class = MemoryMediaSerializer
    permission_classes = [IsMemoryCoupleMember]

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context["current_member_role"] = get_request_couple_member_role(self.request)
        return context

    def get_queryset(self):
        queryset = MemoryMedia.objects.select_related(
            "memory",
            "media",
            "place",
        )
        if self.request.user.is_authenticated:
            queryset = queryset.filter(memory__couple__members__user=self.request.user)
        return queryset

    def perform_destroy(self, instance):
        place_id = instance.place_id
        super().perform_destroy(instance)
        delete_place_if_empty(place_id)


def parse_featured_date(raw_date: str | None) -> date:
    if raw_date:
        try:
            return date.fromisoformat(raw_date)
        except ValueError:
            pass
    return timezone.localdate()


def parse_featured_limit(raw_limit: str | None) -> int:
    if not raw_limit:
        return 3
    try:
        return min(max(int(raw_limit), 1), 10)
    except ValueError:
        return 3


def parse_timezone_offset(raw_offset: str | None) -> int:
    if raw_offset is None:
        return 0
    try:
        return min(max(int(raw_offset), -840), 840)
    except ValueError:
        return 0


def get_on_this_day_memories(
    memories: list[Memory],
    featured_date: date,
    timezone_offset: int,
    limit: int,
) -> list[Memory]:
    timezone_delta = timedelta(minutes=timezone_offset)
    matches = [
        memory
        for memory in memories
        if (memory.happened_at - timezone_delta).month == featured_date.month
        and (memory.happened_at - timezone_delta).day == featured_date.day
    ]

    return sorted(
        matches,
        key=lambda memory: (
            not memory.is_favorite,
            -(memory.happened_at - timezone_delta).year,
            memory.primary_media_id is None,
            -memory.happened_at.timestamp(),
        ),
    )[:limit]
