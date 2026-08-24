from django.contrib.auth import get_user_model
from django.test import TestCase
from django.utils import timezone
from rest_framework.authtoken.models import Token
from rest_framework.test import APIClient

from apps.couples.models import Couple, CoupleMember
from apps.intimacy.models import IntimacyRecord


class IntimacyApiTests(TestCase):
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
        self.record = IntimacyRecord.objects.create(
            couple=self.couple,
            title="Noche tranquila",
            happened_at=timezone.now(),
            place="Casa",
            mood="tender",
            note="Nos quedamos abrazados.",
            created_by_role="her",
            updated_by_role="her",
        )
        IntimacyRecord.objects.create(
            couple=other_couple,
            title="Hidden",
            happened_at=timezone.now(),
            mood="quiet",
        )

    def test_list_returns_records_with_current_auth_settings(self):
        response = self.client.get("/api/intimacy-records/")

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["count"], 2)

    def test_anonymous_create_records_current_member_role_from_header(self):
        self.client.credentials()

        response = self.client.post(
            "/api/intimacy-records/",
            {
                "couple": self.couple.id,
                "title": "Sábado especial",
                "happened_at": timezone.now().isoformat(),
                "place": "Hotel",
                "mood": "special",
                "note": "Escapada corta.",
                "is_favorite": True,
            },
            format="json",
            HTTP_X_COUPLE_MEMBER_ROLE="him",
        )

        self.assertEqual(response.status_code, 201)
        self.assertEqual(response.data["created_by_role"], "him")
        self.assertEqual(response.data["updated_by_role"], "him")
        self.assertTrue(response.data["is_favorite"])

    def test_filters_apply(self):
        response = self.client.get("/api/intimacy-records/?mood=tender&search=tranquila&role=her")

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["count"], 1)
        self.assertEqual(response.data["results"][0]["title"], "Noche tranquila")

    def test_favorite_endpoint_updates_record(self):
        response = self.client.patch(
            f"/api/intimacy-records/{self.record.id}/favorite/",
            {"is_favorite": True},
            format="json",
        )

        self.assertEqual(response.status_code, 200)
        self.record.refresh_from_db()
        self.assertTrue(self.record.is_favorite)

    def test_invalid_mood_is_rejected(self):
        response = self.client.post(
            "/api/intimacy-records/",
            {
                "couple": self.couple.id,
                "title": "Invalid",
                "happened_at": timezone.now().isoformat(),
                "mood": "bad",
            },
            format="json",
        )

        self.assertEqual(response.status_code, 400)

