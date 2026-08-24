from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.response import Response

from apps.common.api import get_request_couple_member_role

from .models import IntimacyRecord
from .permissions import IsIntimacyCoupleMember
from .serializers import IntimacyFavoriteSerializer, IntimacyRecordSerializer


class IntimacyRecordViewSet(viewsets.ModelViewSet):
    serializer_class = IntimacyRecordSerializer
    permission_classes = [IsIntimacyCoupleMember]

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context["current_member_role"] = get_request_couple_member_role(self.request)
        return context

    def get_queryset(self):
        queryset = IntimacyRecord.objects.select_related("couple")
        if self.request.user.is_authenticated:
            queryset = queryset.for_user(self.request.user)

        couple_id = self.request.query_params.get("couple")
        mood = self.request.query_params.get("mood")
        favorite = self.request.query_params.get("favorite")
        role = self.request.query_params.get("role")
        query = self.request.query_params.get("search", "").strip()

        if couple_id:
            queryset = queryset.filter(couple_id=couple_id)
        if mood:
            queryset = queryset.filter(mood=mood)
        if favorite in {"true", "1"}:
            queryset = queryset.filter(is_favorite=True)
        if role in {"her", "him"}:
            queryset = queryset.filter(created_by_role=role)

        return queryset.search(query)

    @action(detail=True, methods=["patch"])
    def favorite(self, request, pk=None):
        record = self.get_object()
        serializer = IntimacyFavoriteSerializer(record, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(IntimacyRecordSerializer(record, context=self.get_serializer_context()).data)

