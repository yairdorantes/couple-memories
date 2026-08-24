from django.db import transaction
from django.db.models.signals import post_delete, post_save, pre_delete, pre_save
from django.dispatch import receiver

from apps.couples.models import CoupleHeroImage, CoupleMember
from apps.memories.models import Memory, MemoryMedia, Place
from apps.memories.services import delete_place_if_empty

from .models import MediaAsset
from .services import delete_cloudinary_asset, delete_media_asset_if_unreferenced


def _schedule_orphan_cleanup(media_ids) -> None:
    ids = tuple({media_id for media_id in media_ids if media_id})
    if not ids:
        return

    transaction.on_commit(lambda: _cleanup_media_assets(ids))


def _cleanup_media_assets(media_ids: tuple[int, ...]) -> None:
    for media_id in media_ids:
        delete_media_asset_if_unreferenced(media_id)


def _remember_previous_media_id(instance, field_name: str) -> None:
    if not instance.pk:
        return

    previous_media_id = (
        instance.__class__.objects.filter(pk=instance.pk)
        .values_list(f"{field_name}_id", flat=True)
        .first()
    )
    current_media_id = getattr(instance, f"{field_name}_id", None)
    if previous_media_id and previous_media_id != current_media_id:
        replacement_ids = getattr(instance, "_replaced_media_asset_ids_for_cleanup", set())
        replacement_ids.add(previous_media_id)
        instance._replaced_media_asset_ids_for_cleanup = replacement_ids


def _cleanup_replaced_media(instance) -> None:
    _schedule_orphan_cleanup(getattr(instance, "_replaced_media_asset_ids_for_cleanup", ()))


@receiver(pre_save, sender=Memory)
def remember_replaced_memory_primary_media(sender, instance: Memory, **kwargs) -> None:
    _remember_previous_media_id(instance, "primary_media")


@receiver(post_save, sender=Memory)
def cleanup_replaced_memory_primary_media(sender, instance: Memory, **kwargs) -> None:
    _cleanup_replaced_media(instance)


@receiver(pre_delete, sender=Memory)
def remember_memory_media_assets(sender, instance: Memory, **kwargs) -> None:
    instance._media_asset_ids_for_cleanup = {
        instance.primary_media_id,
        *instance.media_links.values_list("media_id", flat=True),
    }
    instance._place_id_for_cleanup = instance.place_id


@receiver(post_delete, sender=Memory)
def cleanup_memory_media_assets(sender, instance: Memory, **kwargs) -> None:
    _schedule_orphan_cleanup(getattr(instance, "_media_asset_ids_for_cleanup", ()))
    place_id = getattr(instance, "_place_id_for_cleanup", None)
    if place_id:
        transaction.on_commit(lambda: delete_place_if_empty(place_id))


@receiver(pre_delete, sender=MemoryMedia)
def remember_memory_media_asset(sender, instance: MemoryMedia, **kwargs) -> None:
    instance._media_asset_ids_for_cleanup = {instance.media_id}


@receiver(post_delete, sender=MemoryMedia)
def cleanup_memory_media_asset(sender, instance: MemoryMedia, **kwargs) -> None:
    _schedule_orphan_cleanup(getattr(instance, "_media_asset_ids_for_cleanup", ()))


@receiver(pre_save, sender=MemoryMedia)
def remember_replaced_memory_media_asset(sender, instance: MemoryMedia, **kwargs) -> None:
    _remember_previous_media_id(instance, "media")


@receiver(post_save, sender=MemoryMedia)
def cleanup_replaced_memory_media_asset(sender, instance: MemoryMedia, **kwargs) -> None:
    _cleanup_replaced_media(instance)


@receiver(pre_save, sender=Place)
def remember_replaced_place_cover_media(sender, instance: Place, **kwargs) -> None:
    _remember_previous_media_id(instance, "cover_media")


@receiver(post_save, sender=Place)
def cleanup_replaced_place_cover_media(sender, instance: Place, **kwargs) -> None:
    _cleanup_replaced_media(instance)


@receiver(pre_delete, sender=Place)
def remember_place_cover_media(sender, instance: Place, **kwargs) -> None:
    instance._media_asset_ids_for_cleanup = {instance.cover_media_id}


@receiver(post_delete, sender=Place)
def cleanup_place_cover_media(sender, instance: Place, **kwargs) -> None:
    _schedule_orphan_cleanup(getattr(instance, "_media_asset_ids_for_cleanup", ()))


@receiver(pre_delete, sender=CoupleMember)
def remember_member_avatar(sender, instance: CoupleMember, **kwargs) -> None:
    instance._media_asset_ids_for_cleanup = {instance.avatar_id}


@receiver(post_delete, sender=CoupleMember)
def cleanup_member_avatar(sender, instance: CoupleMember, **kwargs) -> None:
    _schedule_orphan_cleanup(getattr(instance, "_media_asset_ids_for_cleanup", ()))


@receiver(pre_save, sender=CoupleMember)
def remember_replaced_member_avatar(sender, instance: CoupleMember, **kwargs) -> None:
    _remember_previous_media_id(instance, "avatar")


@receiver(post_save, sender=CoupleMember)
def cleanup_replaced_member_avatar(sender, instance: CoupleMember, **kwargs) -> None:
    _cleanup_replaced_media(instance)


@receiver(pre_delete, sender=CoupleHeroImage)
def remember_couple_hero_image_media(sender, instance: CoupleHeroImage, **kwargs) -> None:
    instance._media_asset_ids_for_cleanup = {instance.media_id}


@receiver(post_delete, sender=CoupleHeroImage)
def cleanup_couple_hero_image_media(sender, instance: CoupleHeroImage, **kwargs) -> None:
    _schedule_orphan_cleanup(getattr(instance, "_media_asset_ids_for_cleanup", ()))


@receiver(pre_save, sender=CoupleHeroImage)
def remember_replaced_couple_hero_image_media(
    sender,
    instance: CoupleHeroImage,
    **kwargs,
) -> None:
    _remember_previous_media_id(instance, "media")


@receiver(post_save, sender=CoupleHeroImage)
def cleanup_replaced_couple_hero_image_media(
    sender,
    instance: CoupleHeroImage,
    **kwargs,
) -> None:
    _cleanup_replaced_media(instance)


@receiver(post_delete, sender=MediaAsset)
def cleanup_cloudinary_asset(sender, instance: MediaAsset, **kwargs) -> None:
    transaction.on_commit(lambda: delete_cloudinary_asset(instance.cloudinary_public_id))
