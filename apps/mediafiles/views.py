from rest_framework import mixins, status, viewsets
from rest_framework.parsers import FormParser, MultiPartParser
from rest_framework.response import Response

from apps.common.api import get_request_couple_member_role

from .models import MediaAsset
from .serializers import MediaAssetSerializer, MediaUploadSerializer


class MediaAssetViewSet(
    mixins.CreateModelMixin,
    mixins.DestroyModelMixin,
    mixins.ListModelMixin,
    mixins.RetrieveModelMixin,
    viewsets.GenericViewSet,
):
    parser_classes = [MultiPartParser, FormParser]

    def get_queryset(self):
        queryset = MediaAsset.objects.all()
        if self.request.user.is_authenticated:
            queryset = queryset.filter(owner=self.request.user)
        return queryset.order_by("-created_at")

    def get_serializer_class(self):
        if self.action == "create":
            return MediaUploadSerializer
        return MediaAssetSerializer

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context["current_member_role"] = get_request_couple_member_role(self.request)
        return context

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        asset = serializer.save()
        return Response(MediaAssetSerializer(asset).data, status=status.HTTP_201_CREATED)
