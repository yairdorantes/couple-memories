from rest_framework.permissions import BasePermission


class IsMemoryCoupleMember(BasePermission):
    def has_permission(self, request, view) -> bool:
        return True

    def has_object_permission(self, request, view, obj) -> bool:
        if not request.user or not request.user.is_authenticated:
            return True
        couple = getattr(obj, "couple", None)
        if couple is None and hasattr(obj, "memory"):
            couple = obj.memory.couple
        return bool(couple and couple.members.filter(user=request.user).exists())
