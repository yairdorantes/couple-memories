from django.contrib.auth import get_user_model
from django.test import TestCase
from rest_framework.authtoken.models import Token
from rest_framework.test import APIClient

from apps.couples.models import Couple, CoupleHeroImage, CoupleMember
from apps.mediafiles.models import MediaAsset


class CoupleProfileApiTests(TestCase):
    def setUp(self):
        self.user = get_user_model().objects.create_user(
            username="yair",
            email="yair@example.com",
            password="secret-pass",
        )
        self.token = Token.objects.create(user=self.user)
        self.client = APIClient()
        self.client.credentials(HTTP_AUTHORIZATION=f"Token {self.token.key}")
        self.couple = Couple.objects.create(name="Lesli & Yair", owner=self.user)
        self.member = CoupleMember.objects.create(
            couple=self.couple,
            user=self.user,
            role=CoupleMember.Role.HIM,
            name="Yair",
        )

    def test_member_status_note_can_be_updated(self):
        response = self.client.patch(
            f"/api/couple-members/{self.member.id}/",
            {"status_note": "Dia de bici"},
            format="json",
        )

        self.assertEqual(response.status_code, 200)
        self.member.refresh_from_db()
        self.assertEqual(self.member.status_note, "Dia de bici")

    def test_hero_image_can_be_created_and_listed(self):
        asset = MediaAsset.objects.create(
            owner=self.user,
            kind=MediaAsset.Kind.IMAGE,
            original_filename="hero.jpg",
            mime_type="image/jpeg",
            file_size=128,
            secure_url="https://res.cloudinary.com/demo/image/upload/hero.jpg",
            optimized_url="https://res.cloudinary.com/demo/image/upload/q_auto/hero.jpg",
        )

        create_response = self.client.post(
            "/api/couple-hero-images/",
            {
                "couple": self.couple.id,
                "media": asset.id,
                "crop": {"x": 120, "y": "bad", "zoom": 9, "fit": "contain"},
                "sort_order": 2,
            },
            format="json",
        )

        self.assertEqual(create_response.status_code, 201)
        self.assertEqual(create_response.data["crop"], {"x": 100, "y": 50, "zoom": 3, "fit": "contain"})
        self.assertEqual(create_response.data["media_detail"]["url"], asset.optimized_url)

        list_response = self.client.get(f"/api/couple-hero-images/?couple={self.couple.id}")

        self.assertEqual(list_response.status_code, 200)
        self.assertEqual(list_response.data["count"], 1)
        self.assertEqual(list_response.data["results"][0]["id"], create_response.data["id"])

    def test_hero_image_crop_can_be_updated(self):
        asset = MediaAsset.objects.create(
            owner=self.user,
            kind=MediaAsset.Kind.IMAGE,
            original_filename="hero.jpg",
            mime_type="image/jpeg",
            file_size=128,
        )
        hero_image = CoupleHeroImage.objects.create(
            couple=self.couple,
            media=asset,
            crop={"x": 50, "y": 50, "zoom": 1, "fit": "cover"},
        )

        response = self.client.patch(
            f"/api/couple-hero-images/{hero_image.id}/",
            {"crop": {"x": 42, "y": 58, "zoom": 1.4, "fit": "cover"}},
            format="json",
        )

        self.assertEqual(response.status_code, 200)
        hero_image.refresh_from_db()
        self.assertEqual(hero_image.crop, {"x": 42, "y": 58, "zoom": 1.4, "fit": "cover"})
