import pytest
from django.contrib.auth import get_user_model
from rest_framework import status
from rest_framework_simplejwt.tokens import RefreshToken


@pytest.mark.django_db
def test_token_refresh_returns_401_when_user_deleted(api_client):
    """Token refresh returns 401 instead of 500 when the referenced user no longer exists."""
    User = get_user_model()
    user = User.objects.create_user(email='deleted@example.com', password='pass1234')
    refresh = RefreshToken.for_user(user)
    refresh_str = str(refresh)

    user.delete()

    response = api_client.post('/api/token/refresh/', {'refresh': refresh_str}, format='json')

    assert response.status_code == status.HTTP_401_UNAUTHORIZED
    assert response.json()['code'] == 'token_not_valid'
    assert User.objects.filter(email='deleted@example.com').count() == 0


@pytest.mark.django_db
def test_token_refresh_returns_new_access_for_valid_token(api_client):
    """Token refresh returns a new access token when the refresh token is valid."""
    User = get_user_model()
    user = User.objects.create_user(email='valid@example.com', password='pass1234')
    refresh = RefreshToken.for_user(user)

    response = api_client.post('/api/token/refresh/', {'refresh': str(refresh)}, format='json')

    assert response.status_code == status.HTTP_200_OK
    assert 'access' in response.json()


@pytest.mark.django_db
def test_token_refresh_rejects_invalid_token(api_client):
    """Token refresh returns 401 for a completely invalid token string."""
    response = api_client.post('/api/token/refresh/', {'refresh': 'not-a-real-token'}, format='json')

    assert response.status_code == status.HTTP_401_UNAUTHORIZED
