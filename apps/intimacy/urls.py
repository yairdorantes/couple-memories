from django.urls import include, path
from rest_framework.routers import DefaultRouter

from .views import IntimacyRecordViewSet

router = DefaultRouter()
router.register("intimacy-records", IntimacyRecordViewSet, basename="intimacy-record")

urlpatterns = [
    path("", include(router.urls)),
]

