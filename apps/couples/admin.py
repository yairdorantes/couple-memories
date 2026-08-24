from django.contrib import admin

from .models import Couple, CoupleHeroImage, CoupleMember


class CoupleMemberInline(admin.TabularInline):
    model = CoupleMember
    extra = 0


class CoupleHeroImageInline(admin.TabularInline):
    model = CoupleHeroImage
    extra = 0


@admin.register(Couple)
class CoupleAdmin(admin.ModelAdmin):
    list_display = ("name", "owner", "anniversary_date", "created_at")
    search_fields = ("name", "owner__email")
    inlines = [CoupleMemberInline, CoupleHeroImageInline]


@admin.register(CoupleMember)
class CoupleMemberAdmin(admin.ModelAdmin):
    list_display = ("name", "role", "couple", "user", "updated_at")
    list_filter = ("role",)
    search_fields = ("name", "couple__name", "user__email")


@admin.register(CoupleHeroImage)
class CoupleHeroImageAdmin(admin.ModelAdmin):
    list_display = ("couple", "media", "sort_order", "updated_at")
    search_fields = ("couple__name", "media__original_filename")
