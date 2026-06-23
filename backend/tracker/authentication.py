from rest_framework.authentication import SessionAuthentication


class CsrfExemptSessionAuthentication(SessionAuthentication):
    """Session authentication without CSRF enforcement.
    Safe for SPA use because CORS already restricts which origins can call the API.
    """
    def enforce_csrf(self, request):
        return
