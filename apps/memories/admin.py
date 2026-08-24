from django.contrib import admin

from .models import Memory, MemoryMedia, Place


class MemoryMediaInline(admin.TabularInline):
    model = MemoryMedia
    extra = 0


@admin.register(Memory)
class MemoryAdmin(admin.ModelAdmin):
    list_display = ("title", "couple", "category", "happened_at", "is_favorite")
    list_filter = ("category", "is_favorite")
    search_fields = ("title", "caption", "location_name", "place__name")
    inlines = [MemoryMediaInline]


@admin.register(Place)
class PlaceAdmin(admin.ModelAdmin):
    list_display = ("name", "couple", "category", "latitude", "longitude")
    list_filter = ("category",)
    search_fields = ("name", "description")


@admin.register(MemoryMedia)
class MemoryMediaAdmin(admin.ModelAdmin):
    list_display = ("memory", "media", "sort_order", "created_at")
