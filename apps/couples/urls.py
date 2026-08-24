from django.urls import include, path
from rest_framework.routers import DefaultRouter

from .views import CoupleHeroImageViewSet, CoupleMemberViewSet, CoupleViewSet

router = DefaultRouter()
router.register("couples", CoupleViewSet, basename="couple")
router.register("couple-members", CoupleMemberViewSet, basename="couple-member")
router.register("couple-hero-images", CoupleHeroImageViewSet, basename="couple-hero-image")

urlpatterns = [
    path("", include(router.urls)),
]
