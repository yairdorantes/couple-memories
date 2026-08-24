from rest_framework.permissions import BasePermission


class IsCoupleMember(BasePermission):
    def has_permission(self, request, view) -> bool:
        return True

    def has_object_permission(self, request, view, obj) -> bool:
        if not request.user or not request.user.is_authenticated:
            return True
        couple = getattr(obj, "couple", obj)
        return couple.members.filter(user=request.user).exists() or couple.owner_id == request.user.id
