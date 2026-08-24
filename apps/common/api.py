from django.contrib.auth import get_user_model


VALID_COUPLE_MEMBER_ROLES = {"her", "him"}
COUPLE_MEMBER_ROLE_HEADER = "HTTP_X_COUPLE_MEMBER_ROLE"


def get_request_user_or_default(request):
    user = getattr(request, "user", None)
    if user and user.is_authenticated:
        return user
    user_model = get_user_model()
    existing_user = user_model.objects.order_by("id").first()
    if existing_user:
        return existing_user
    return user_model.objects.create_user(
        username="local-couple",
        email="local-couple@example.com",
        password=None,
    )


def get_request_couple_member_role(request) -> str | None:
    role = request.META.get(COUPLE_MEMBER_ROLE_HEADER, "").strip().lower()
    return role if role in VALID_COUPLE_MEMBER_ROLES else None
