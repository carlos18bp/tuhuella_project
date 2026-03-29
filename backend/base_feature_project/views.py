from rest_framework import status
from rest_framework.response import Response
from rest_framework_simplejwt.views import TokenRefreshView


class SafeTokenRefreshView(TokenRefreshView):
    """Gracefully handle refresh tokens referencing deleted users."""

    def post(self, request, *args, **kwargs):
        try:
            return super().post(request, *args, **kwargs)
        except Exception:
            return Response(
                {'detail': 'Token is invalid or expired', 'code': 'token_not_valid'},
                status=status.HTTP_401_UNAUTHORIZED,
            )
