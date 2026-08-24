from django.contrib import admin

from .models import IntimacyRecord


@admin.register(IntimacyRecord)
class IntimacyRecordAdmin(admin.ModelAdmin):
    list_display = ("title", "couple", "mood", "happened_at", "is_favorite", "created_by_role")
    list_filter = ("mood", "is_favorite", "created_by_role")
    search_fields = ("title", "place", "note", "couple__name")

