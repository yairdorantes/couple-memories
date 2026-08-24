from django.contrib import admin

from .models import MediaAsset


@admin.register(MediaAsset)
class MediaAssetAdmin(admin.ModelAdmin):
    list_display = ("original_filename", "owner", "kind", "file_size", "created_at")
    list_filter = ("kind", "mime_type")
    search_fields = ("original_filename", "owner__email", "cloudinary_public_id")
