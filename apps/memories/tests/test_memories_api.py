from datetime import datetime

from django.contrib.auth import get_user_model
from django.test import TestCase
from django.utils import timezone
from rest_framework.authtoken.models import Token
from rest_framework.test import APIClient

from apps.couples.models import Couple, CoupleMember
from apps.mediafiles.models import MediaAsset
from apps.memories.models import Memory, Place


def aware_datetime(year, month, day, hour=12, minute=0):
    return timezone.make_aware(
        datetime(year, month, day, hour, minute),
        timezone.get_current_timezone(),
    )


class MemoriesApiTests(TestCase):
    def setUp(self):
        self.user = get_user_model().objects.create_user(
            username="lesli",
            email="lesli@example.com",
            password="secret-pass",
        )
        self.other_user = get_user_model().objects.create_user(
            username="other",
            email="other@example.com",
            password="secret-pass",
        )
        self.token = Token.objects.create(user=self.user)
        self.client = APIClient()
        self.client.credentials(HTTP_AUTHORIZATION=f"Token {self.token.key}")
        self.couple = Couple.objects.create(name="Lesli & Yair", owner=self.user)
        CoupleMember.objects.create(
            couple=self.couple,
            user=self.user,
            role=CoupleMember.Role.HER,
            name="Lesli",
        )
        other_couple = Couple.objects.create(name="Other", owner=self.other_user)
        CoupleMember.objects.create(
            couple=other_couple,
            user=self.other_user,
            role=CoupleMember.Role.HIM,
            name="Other",
        )
        self.memory = Memory.objects.create(
            couple=self.couple,
            title="Cafe despues de la lluvia",
            caption="Nos quedamos hablando",
            location_name="Puebla",
            category="coffee",
            happened_at=timezone.now(),
        )
        Memory.objects.create(
            couple=other_couple,
            title="Hidden",
            category="travel",
            happened_at=timezone.now(),
        )

    def test_authenticated_list_returns_all_memories_when_auth_is_disabled(self):
        response = self.client.get("/api/memories/")

        self.assertEqual(response.status_code, 200)
        titles = [item["title"] for item in response.data["results"]]
        self.assertEqual(titles, ["Hidden", "Cafe despues de la lluvia"])

    def test_anonymous_list_request_returns_memories(self):
        self.client.credentials()

        response = self.client.get("/api/memories/")

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["count"], 2)

    def test_search_and_category_filters_apply(self):
        response = self.client.get("/api/memories/?category=coffee&search=lluvia")

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["count"], 1)

    def test_favorite_endpoint_updates_memory(self):
        response = self.client.patch(
            f"/api/memories/{self.memory.id}/favorite/",
            {"is_favorite": True},
            format="json",
        )

        self.assertEqual(response.status_code, 200)
        self.memory.refresh_from_db()
        self.assertTrue(self.memory.is_favorite)

    def test_featured_memories_prioritize_same_month_and_day(self):
        older_favorite = Memory.objects.create(
            couple=self.couple,
            title="Anniversary coffee",
            category="coffee",
            happened_at=aware_datetime(2025, 9, 24),
            is_favorite=True,
        )
        newer_regular = Memory.objects.create(
            couple=self.couple,
            title="Regular same day",
            category="travel",
            happened_at=aware_datetime(2026, 9, 24),
            is_favorite=False,
        )
        Memory.objects.create(
            couple=self.couple,
            title="Other day favorite",
            category="movie",
            happened_at=aware_datetime(2026, 9, 25),
            is_favorite=True,
        )

        response = self.client.get("/api/memories/featured/?date=2026-09-24")

        self.assertEqual(response.status_code, 200)
        ids = [item["id"] for item in response.data]
        self.assertEqual(ids[:2], [older_favorite.id, newer_regular.id])

    def test_featured_memories_fallback_prioritizes_favorites_when_no_same_day(self):
        favorite = Memory.objects.create(
            couple=self.couple,
            title="Favorite fallback",
            category="coffee",
            happened_at=aware_datetime(2026, 7, 10),
            is_favorite=True,
        )
        Memory.objects.create(
            couple=self.couple,
            title="Regular fallback",
            category="travel",
            happened_at=aware_datetime(2026, 7, 11),
            is_favorite=False,
        )

        response = self.client.get("/api/memories/featured/?date=2026-09-24&limit=2")

        self.assertEqual(response.status_code, 200)
        ids = [item["id"] for item in response.data]
        self.assertIn(favorite.id, ids)
        self.assertEqual(ids[0], favorite.id)

    def test_featured_memories_fill_remaining_slots_with_fallback(self):
        same_day = Memory.objects.create(
            couple=self.couple,
            title="Picnic",
            category="travel",
            happened_at=aware_datetime(2026, 9, 24),
            is_favorite=False,
        )
        fallback_favorite = Memory.objects.create(
            couple=self.couple,
            title="Favorite fallback",
            category="coffee",
            happened_at=aware_datetime(2026, 8, 20),
            is_favorite=True,
        )

        response = self.client.get("/api/memories/featured/?date=2026-09-24&limit=3")

        self.assertEqual(response.status_code, 200)
        ids = [item["id"] for item in response.data]
        self.assertEqual(ids[0], same_day.id)
        self.assertIn(fallback_favorite.id, ids)
        self.assertGreater(len(ids), 1)

    def test_featured_memories_match_client_local_date(self):
        local_evening_memory = Memory.objects.create(
            couple=self.couple,
            title="Late local night",
            category="travel",
            happened_at=aware_datetime(2026, 8, 15, 2, 30),
            is_favorite=True,
        )

        response = self.client.get(
            "/api/memories/featured/?date=2026-08-14&timezone_offset=360",
        )

        self.assertEqual(response.status_code, 200)
        ids = [item["id"] for item in response.data]
        self.assertIn(local_evening_memory.id, ids)

    def test_create_memory_without_coordinates_does_not_create_place(self):
        response = self.client.post(
            "/api/memories/",
            {
                "couple": self.couple.id,
                "title": "Sin mapa",
                "caption": "Solo texto",
                "location_name": "Lugar sin coordenadas",
                "category": "travel",
                "happened_at": timezone.now().isoformat(),
            },
            format="json",
        )

        self.assertEqual(response.status_code, 201)
        self.assertIsNone(response.data["place"])
        self.assertFalse(Place.objects.filter(name="Lugar sin coordenadas").exists())

    def test_create_memory_with_coordinates_creates_and_links_place(self):
        response = self.client.post(
            "/api/memories/",
            {
                "couple": self.couple.id,
                "title": "Cholula",
                "caption": "Un dia perfecto explorando juntos",
                "location_name": "Cholula",
                "category": "travel",
                "happened_at": timezone.now().isoformat(),
                "latitude": "19.064100",
                "longitude": "-98.303500",
            },
            format="json",
        )

        self.assertEqual(response.status_code, 201)
        self.assertIsNotNone(response.data["place"])
        place = Place.objects.get(pk=response.data["place"])
        self.assertEqual(place.name, "Cholula")
        self.assertEqual(str(place.latitude), "19.064100")
        self.assertEqual(str(place.longitude), "-98.303500")

    def test_memory_photo_with_coordinates_creates_a_place(self):
        media = MediaAsset.objects.create(
            owner=self.user,
            original_filename="picnic.jpg",
            secure_url="https://example.com/picnic.jpg",
        )

        response = self.client.post(
            "/api/memory-media/",
            {
                "memory": self.memory.id,
                "media": media.id,
                "caption": "The blanket spot",
                "location_name": "Parque Metropolitano",
                "latitude": "19.032800",
                "longitude": "-98.201400",
            },
            format="json",
        )

        self.assertEqual(response.status_code, 201)
        self.assertIsNotNone(response.data["place"])
        self.assertEqual(response.data["place_detail"]["name"], "Parque Metropolitano")

    def test_deleting_the_last_photo_at_a_place_removes_the_place(self):
        media = MediaAsset.objects.create(
            owner=self.user,
            original_filename="walk.jpg",
            secure_url="https://example.com/walk.jpg",
        )
        created_response = self.client.post(
            "/api/memory-media/",
            {
                "memory": self.memory.id,
                "media": media.id,
                "location_name": "Parque Metropolitano",
                "latitude": "19.032800",
                "longitude": "-98.201400",
            },
            format="json",
        )
        place_id = created_response.data["place"]

        response = self.client.delete(
            f"/api/memory-media/{created_response.data['id']}/",
        )

        self.assertEqual(response.status_code, 204)
        self.assertFalse(Place.objects.filter(pk=place_id).exists())

    def test_updating_photo_metadata_relinks_its_place(self):
        media = MediaAsset.objects.create(
            owner=self.user,
            original_filename="walk.jpg",
            secure_url="https://example.com/walk.jpg",
        )
        created_response = self.client.post(
            "/api/memory-media/",
            {
                "memory": self.memory.id,
                "media": media.id,
                "caption": "Original caption",
                "location_name": "Parque Metropolitano",
                "latitude": "19.032800",
                "longitude": "-98.201400",
            },
            format="json",
        )
        original_place_id = created_response.data["place"]

        response = self.client.patch(
            f"/api/memory-media/{created_response.data['id']}/",
            {
                "caption": "Sunset at the new spot",
                "location_name": "Cerro de Amalucan",
                "latitude": "19.060500",
                "longitude": "-98.169200",
            },
            format="json",
        )

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["caption"], "Sunset at the new spot")
        self.assertEqual(response.data["place_detail"]["name"], "Cerro de Amalucan")
        self.assertFalse(Place.objects.filter(pk=original_place_id).exists())

    def test_updating_memory_to_clear_coordinates_unlinks_place(self):
        place = Place.objects.create(
            couple=self.couple,
            name="Cholula",
            latitude="19.064100",
            longitude="-98.303500",
        )
        memory = Memory.objects.create(
            couple=self.couple,
            title="Cholula",
            category="travel",
            happened_at=timezone.now(),
            latitude="19.064100",
            longitude="-98.303500",
            place=place,
        )

        response = self.client.patch(
            f"/api/memories/{memory.id}/",
            {
                "latitude": None,
                "longitude": None,
            },
            format="json",
        )

        self.assertEqual(response.status_code, 200)
        memory.refresh_from_db()
        self.assertIsNone(memory.latitude)
        self.assertIsNone(memory.longitude)
        self.assertIsNone(memory.place)
        self.assertFalse(Place.objects.filter(pk=place.pk).exists())

    def test_deleting_memory_deletes_empty_generated_place(self):
        place = Place.objects.create(
            couple=self.couple,
            name="Cholula",
            latitude="19.064100",
            longitude="-98.303500",
        )
        memory = Memory.objects.create(
            couple=self.couple,
            title="Cholula",
            category="travel",
            happened_at=timezone.now(),
            latitude="19.064100",
            longitude="-98.303500",
            place=place,
        )

        with self.captureOnCommitCallbacks(execute=True):
            response = self.client.delete(f"/api/memories/{memory.id}/")

        self.assertEqual(response.status_code, 204)
        self.assertFalse(Place.objects.filter(pk=place.pk).exists())

    def test_deleting_memory_keeps_place_when_other_memories_use_it(self):
        place = Place.objects.create(
            couple=self.couple,
            name="Cholula",
            latitude="19.064100",
            longitude="-98.303500",
        )
        memory = Memory.objects.create(
            couple=self.couple,
            title="Cholula uno",
            category="travel",
            happened_at=timezone.now(),
            latitude="19.064100",
            longitude="-98.303500",
            place=place,
        )
        Memory.objects.create(
            couple=self.couple,
            title="Cholula dos",
            category="travel",
            happened_at=timezone.now(),
            latitude="19.064100",
            longitude="-98.303500",
            place=place,
        )

        with self.captureOnCommitCallbacks(execute=True):
            response = self.client.delete(f"/api/memories/{memory.id}/")

        self.assertEqual(response.status_code, 204)
        self.assertTrue(Place.objects.filter(pk=place.pk).exists())
