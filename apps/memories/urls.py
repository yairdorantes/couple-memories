from django.urls import include, path
from rest_framework.routers import DefaultRouter

from .views import MemoryMediaViewSet, MemoryViewSet, PlaceViewSet

router = DefaultRouter()
router.register("memories", MemoryViewSet, basename="memory")
router.register("memory-media", MemoryMediaViewSet, basename="memory-media")
router.register("places", PlaceViewSet, basename="place")

urlpatterns = [
    path("", include(router.urls)),
]
