from rest_framework import permissions


class IsOrganizerOrAdmin(permissions.BasePermission):
    def has_permission(self, request, view):
        if request.user.is_staff:
            return True
        profile = getattr(request.user, "userprofile", None)
        if not profile:
            return False
        # finance_manager can view events (GET) but not create/edit/delete
        if profile.role == "finance_manager" and request.method in ("GET", "HEAD", "OPTIONS"):
            return True
        return profile.role in {"organizer", "admin"}

    def has_object_permission(self, request, view, obj):
        if request.user.is_staff:
            return True
        profile = getattr(request.user, "userprofile", None)
        if not profile:
            return False
        # finance_manager can view any event
        if profile.role == "finance_manager" and request.method in ("GET", "HEAD", "OPTIONS"):
            return True
        return getattr(obj, "organizer", None) == request.user


class IsFinanceManagerOrAdmin(permissions.BasePermission):
    def has_permission(self, request, view):
        if request.user.is_staff:
            return True
        profile = getattr(request.user, "userprofile", None)
        return profile and profile.role == "finance_manager"


class IsOrganizerFinanceOrAdmin(permissions.BasePermission):
    def has_permission(self, request, view):
        if request.user.is_staff:
            return True
        profile = getattr(request.user, "userprofile", None)
        return profile and profile.role in {"organizer", "finance_manager"}

    def has_object_permission(self, request, view, obj):
        if request.user.is_staff:
            return True
        profile = getattr(request.user, "userprofile", None)
        if not profile:
            return False

        if profile.role == "organizer":
            return getattr(obj, "organizer", None) == request.user
        return profile.role == "finance_manager"
