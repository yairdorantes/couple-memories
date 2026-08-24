from django.contrib import admin
from django.urls import include, path
from rest_framework.authtoken.views import obtain_auth_token

urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/auth/token/", obtain_auth_token, name="api-token"),
    path("api/", include("apps.couples.urls")),
    path("api/", include("apps.intimacy.urls")),
    path("api/", include("apps.memories.urls")),
    path("api/", include("apps.mediafiles.urls")),
]
