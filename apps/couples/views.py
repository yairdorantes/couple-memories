from rest_framework import mixins, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response

from apps.common.api import get_request_couple_member_role, get_request_user_or_default

from .models import Couple, CoupleHeroImage, CoupleMember
from .permissions import IsCoupleMember
from .serializers import (
    CoupleHeroImageSerializer,
    CoupleMemberSerializer,
    CoupleSerializer,
)


class CoupleViewSet(viewsets.ModelViewSet):
    serializer_class = CoupleSerializer

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context["current_member_role"] = get_request_couple_member_role(self.request)
        return context

    def get_queryset(self):
        user = self.request.user
        if not user.is_authenticated:
            return Couple.objects.select_related("owner").prefetch_related("members", "members__avatar")
        return (
            Couple.objects.filter(members__user=user)
            .select_related("owner")
            .prefetch_related("members", "members__avatar")
            .distinct()
        )

    def perform_create(self, serializer):
        owner = get_request_user_or_default(self.request)
        couple = serializer.save(owner=owner)
        CoupleMember.objects.get_or_create(
            couple=couple,
            user=owner,
            role=CoupleMember.Role.HIM,
            defaults={"name": owner.get_full_name() or owner.username} if owner else {"name": "Him"},
        )
        CoupleMember.objects.get_or_create(
            couple=couple,
            role=CoupleMember.Role.HER,
            defaults={
                "name": "Lesli",
                "accent_color": "#ed93b1",
                "description": "Loves sunset walks, coffee dates, and tiny details.",
                "status_note": "Hoy quiero ir por un cafecito ☕",
            },
        )

    @action(detail=True, methods=["get", "patch"], permission_classes=[IsCoupleMember])
    def profile(self, request, pk=None):
        couple = self.get_object()

        if request.method == "GET":
            return Response(CoupleSerializer(couple, context={"request": request}).data)

        members_payload = request.data.get("members", [])
        updated_members = []
        for member_payload in members_payload:
            role = member_payload.get("role")
            member = couple.members.filter(role=role).first()
            if not member:
                continue
            serializer = CoupleMemberSerializer(member, data=member_payload, partial=True)
            serializer.is_valid(raise_exception=True)
            updated_members.append(serializer.save())

        return Response(CoupleMemberSerializer(updated_members, many=True).data)


class CoupleMemberViewSet(
    mixins.CreateModelMixin,
    mixins.ListModelMixin,
    mixins.UpdateModelMixin,
    mixins.RetrieveModelMixin,
    viewsets.GenericViewSet,
):
    serializer_class = CoupleMemberSerializer
    permission_classes = [IsCoupleMember]

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context["current_member_role"] = get_request_couple_member_role(self.request)
        return context

    def get_queryset(self):
        queryset = CoupleMember.objects.select_related(
            "couple",
            "avatar",
        )
        if self.request.user.is_authenticated:
            queryset = queryset.filter(couple__members__user=self.request.user)
        return queryset


class CoupleHeroImageViewSet(viewsets.ModelViewSet):
    serializer_class = CoupleHeroImageSerializer
    permission_classes = [IsCoupleMember]

    def get_queryset(self):
        queryset = CoupleHeroImage.objects.select_related(
            "couple",
            "media",
        )
        if self.request.user.is_authenticated:
            queryset = queryset.filter(couple__members__user=self.request.user)

        couple_id = self.request.query_params.get("couple")
        if couple_id:
            queryset = queryset.filter(couple_id=couple_id)

        return queryset
