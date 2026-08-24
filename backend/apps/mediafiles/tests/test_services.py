from unittest.mock import patch

from django.contrib.auth import get_user_model
from django.contrib.auth.models import AnonymousUser
from django.core.files.uploadedfile import SimpleUploadedFile
from django.test import RequestFactory, SimpleTestCase, TestCase, override_settings
from django.utils import timezone

from apps.couples.models import Couple, CoupleHeroImage, CoupleMember
from apps.memories.models import Memory, MemoryMedia, Place
from apps.memories.serializers import MemorySerializer
from apps.mediafiles.models import MediaAsset
from apps.mediafiles.services import validate_upload


class UploadValidationTests(SimpleTestCase):
    @override_settings(MAX_UPLOAD_SIZE_BYTES=10, ALLOWED_UPLOAD_MIME_TYPES={"image/png"})
    def test_rejects_files_larger_than_limit(self):
        upload = SimpleUploadedFile("large.png", b"too-large-content", content_type="image/png")

        with self.assertRaisesMessage(Exception, "File exceeds"):
            validate_upload(upload)

    @override_settings(MAX_UPLOAD_SIZE_BYTES=1024, ALLOWED_UPLOAD_MIME_TYPES={"image/png"})
    def test_rejects_unsupported_mime_type(self):
        upload = SimpleUploadedFile("note.txt", b"hello", content_type="text/plain")

        with self.assertRaisesMessage(Exception, "Unsupported file type"):
            validate_upload(upload)


class MediaCleanupTests(TestCase):
    def setUp(self):
        self.request_factory = RequestFactory()
        self.user = get_user_model().objects.create_user(
            username="lesli",
            email="lesli@example.com",
            password="secret-pass",
        )
        self.couple = Couple.objects.create(name="Lesli & Yair", owner=self.user)
        CoupleMember.objects.create(
            couple=self.couple,
            user=self.user,
            role=CoupleMember.Role.HER,
            name="Lesli",
        )

    def anonymous_request(self):
        request = self.request_factory.patch("/")
        request.user = AnonymousUser()
        return request

    def create_asset(self, public_id="couple-memories/test-image"):
        return MediaAsset.objects.create(
            owner=self.user,
            kind=MediaAsset.Kind.IMAGE,
            original_filename="test.png",
            mime_type="image/png",
            file_size=128,
            cloudinary_public_id=public_id,
            secure_url="https://res.cloudinary.com/demo/image/upload/test.png",
            optimized_url="https://res.cloudinary.com/demo/image/upload/q_auto/test.png",
        )

    @patch("apps.mediafiles.services.cloudinary.uploader.destroy")
    def test_deleting_media_asset_deletes_cloudinary_resource(self, destroy):
        asset = self.create_asset()

        with self.captureOnCommitCallbacks(execute=True):
            asset.delete()

        destroy.assert_called_once_with("couple-memories/test-image", resource_type="image")

    @patch("apps.mediafiles.services.cloudinary.uploader.destroy")
    def test_deleting_memory_deletes_unreferenced_primary_media(self, destroy):
        asset = self.create_asset()
        memory = Memory.objects.create(
            couple=self.couple,
            title="Cafe",
            category="coffee",
            happened_at=timezone.now(),
            primary_media=asset,
        )

        with self.captureOnCommitCallbacks(execute=True):
            memory.delete()

        self.assertFalse(MediaAsset.objects.filter(pk=asset.pk).exists())
        destroy.assert_called_once_with("couple-memories/test-image", resource_type="image")

    @patch("apps.mediafiles.services.cloudinary.uploader.destroy")
    def test_deleting_memory_keeps_media_when_another_memory_uses_it(self, destroy):
        asset = self.create_asset()
        memory = Memory.objects.create(
            couple=self.couple,
            title="Cafe",
            category="coffee",
            happened_at=timezone.now(),
            primary_media=asset,
        )
        Memory.objects.create(
            couple=self.couple,
            title="Movie",
            category="movie",
            happened_at=timezone.now(),
            primary_media=asset,
        )

        with self.captureOnCommitCallbacks(execute=True):
            memory.delete()

        self.assertTrue(MediaAsset.objects.filter(pk=asset.pk).exists())
        destroy.assert_not_called()

    @patch("apps.mediafiles.services.cloudinary.uploader.destroy")
    def test_replacing_memory_primary_media_deletes_old_unreferenced_resource(self, destroy):
        old_asset = self.create_asset("couple-memories/old-memory")
        new_asset = self.create_asset("couple-memories/new-memory")
        memory = Memory.objects.create(
            couple=self.couple,
            title="Cafe",
            category="coffee",
            happened_at=timezone.now(),
            primary_media=old_asset,
        )

        memory.primary_media = new_asset
        with self.captureOnCommitCallbacks(execute=True):
            memory.save(update_fields=["primary_media", "updated_at"])

        self.assertFalse(MediaAsset.objects.filter(pk=old_asset.pk).exists())
        self.assertTrue(MediaAsset.objects.filter(pk=new_asset.pk).exists())
        destroy.assert_called_once_with("couple-memories/old-memory", resource_type="image")

    @patch("apps.mediafiles.services.cloudinary.uploader.destroy")
    def test_replacing_member_avatar_deletes_old_unreferenced_resource(self, destroy):
        old_asset = self.create_asset("couple-memories/old-avatar")
        new_asset = self.create_asset("couple-memories/new-avatar")
        member = self.couple.members.get(role=CoupleMember.Role.HER)
        member.avatar = old_asset
        member.save(update_fields=["avatar", "updated_at"])

        member.avatar = new_asset
        with self.captureOnCommitCallbacks(execute=True):
            member.save(update_fields=["avatar", "updated_at"])

        self.assertFalse(MediaAsset.objects.filter(pk=old_asset.pk).exists())
        self.assertTrue(MediaAsset.objects.filter(pk=new_asset.pk).exists())
        destroy.assert_called_once_with("couple-memories/old-avatar", resource_type="image")

    @patch("apps.mediafiles.services.cloudinary.uploader.destroy")
    def test_deleting_hero_image_deletes_unreferenced_resource(self, destroy):
        asset = self.create_asset("couple-memories/hero")
        hero_image = CoupleHeroImage.objects.create(
            couple=self.couple,
            media=asset,
            crop={"x": 50, "y": 50, "zoom": 1, "fit": "cover"},
        )

        with self.captureOnCommitCallbacks(execute=True):
            hero_image.delete()

        self.assertFalse(MediaAsset.objects.filter(pk=asset.pk).exists())
        destroy.assert_called_once_with("couple-memories/hero", resource_type="image")

    @patch("apps.mediafiles.services.cloudinary.uploader.destroy")
    def test_deleting_hero_image_keeps_media_when_memory_uses_it(self, destroy):
        asset = self.create_asset("couple-memories/shared-hero")
        hero_image = CoupleHeroImage.objects.create(
            couple=self.couple,
            media=asset,
            crop={"x": 50, "y": 50, "zoom": 1, "fit": "cover"},
        )
        Memory.objects.create(
            couple=self.couple,
            title="Shared",
            category="travel",
            happened_at=timezone.now(),
            primary_media=asset,
        )

        with self.captureOnCommitCallbacks(execute=True):
            hero_image.delete()

        self.assertTrue(MediaAsset.objects.filter(pk=asset.pk).exists())
        destroy.assert_not_called()

    @patch("apps.mediafiles.services.cloudinary.uploader.destroy")
    def test_replacing_place_cover_media_deletes_old_unreferenced_resource(self, destroy):
        old_asset = self.create_asset("couple-memories/old-place")
        new_asset = self.create_asset("couple-memories/new-place")
        place = Place.objects.create(
            couple=self.couple,
            name="Cholula",
            latitude=19.0648,
            longitude=-98.3035,
            cover_media=old_asset,
        )

        place.cover_media = new_asset
        with self.captureOnCommitCallbacks(execute=True):
            place.save(update_fields=["cover_media", "updated_at"])

        self.assertFalse(MediaAsset.objects.filter(pk=old_asset.pk).exists())
        self.assertTrue(MediaAsset.objects.filter(pk=new_asset.pk).exists())
        destroy.assert_called_once_with("couple-memories/old-place", resource_type="image")

    @patch("apps.mediafiles.services.cloudinary.uploader.destroy")
    def test_replacing_memory_media_link_deletes_old_unreferenced_resource(self, destroy):
        old_asset = self.create_asset("couple-memories/old-link")
        new_asset = self.create_asset("couple-memories/new-link")
        memory = Memory.objects.create(
            couple=self.couple,
            title="Cafe",
            category="coffee",
            happened_at=timezone.now(),
        )
        media_link = MemoryMedia.objects.create(memory=memory, media=old_asset)

        media_link.media = new_asset
        with self.captureOnCommitCallbacks(execute=True):
            media_link.save(update_fields=["media", "updated_at"])

        self.assertFalse(MediaAsset.objects.filter(pk=old_asset.pk).exists())
        self.assertTrue(MediaAsset.objects.filter(pk=new_asset.pk).exists())
        destroy.assert_called_once_with("couple-memories/old-link", resource_type="image")

    @patch("apps.mediafiles.services.cloudinary.uploader.destroy")
    def test_replacing_media_keeps_old_resource_when_still_referenced(self, destroy):
        old_asset = self.create_asset("couple-memories/shared-image")
        new_asset = self.create_asset("couple-memories/new-memory")
        first_memory = Memory.objects.create(
            couple=self.couple,
            title="Cafe",
            category="coffee",
            happened_at=timezone.now(),
            primary_media=old_asset,
        )
        Memory.objects.create(
            couple=self.couple,
            title="Movie",
            category="movie",
            happened_at=timezone.now(),
            primary_media=old_asset,
        )

        first_memory.primary_media = new_asset
        with self.captureOnCommitCallbacks(execute=True):
            first_memory.save(update_fields=["primary_media", "updated_at"])

        self.assertTrue(MediaAsset.objects.filter(pk=old_asset.pk).exists())
        destroy.assert_not_called()

    @patch("apps.mediafiles.services.cloudinary.uploader.destroy")
    def test_replacing_memory_primary_media_updates_place_cover_before_cleanup(self, destroy):
        old_asset = self.create_asset("couple-memories/old-place-cover")
        new_asset = self.create_asset("couple-memories/new-place-cover")
        memory = Memory.objects.create(
            couple=self.couple,
            title="Cholula",
            category="travel",
            happened_at=timezone.now(),
            location_name="Cholula",
            latitude=19.0648,
            longitude=-98.3035,
            primary_media=old_asset,
        )
        place = Place.objects.create(
            couple=self.couple,
            name="Cholula",
            latitude=19.0648,
            longitude=-98.3035,
            cover_media=old_asset,
        )
        memory.place = place
        memory.save(update_fields=["place", "updated_at"])

        serializer = MemorySerializer(
            instance=memory,
            data={"primary_media": new_asset.pk},
            partial=True,
            context={"request": self.anonymous_request()},
        )
        self.assertTrue(serializer.is_valid(), serializer.errors)
        with self.captureOnCommitCallbacks(execute=True):
            serializer.save()

        place.refresh_from_db()
        self.assertEqual(place.cover_media_id, new_asset.pk)
        self.assertFalse(MediaAsset.objects.filter(pk=old_asset.pk).exists())
        destroy.assert_called_once_with("couple-memories/old-place-cover", resource_type="image")
