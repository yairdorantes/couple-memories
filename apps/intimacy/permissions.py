from rest_framework.permissions import BasePermission


class IsIntimacyCoupleMember(BasePermission):
    def has_permission(self, request, view) -> bool:
        return True

    def has_object_permission(self, request, view, obj) -> bool:
        if not request.user or not request.user.is_authenticated:
            return True
        return bool(obj.couple and obj.couple.members.filter(user=request.user).exists())

