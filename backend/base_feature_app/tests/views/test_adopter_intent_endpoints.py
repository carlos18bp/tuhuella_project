import pytest
from django.urls import reverse
from rest_framework import status

from base_feature_app.models import AdopterIntent


@pytest.mark.django_db
def test_adopter_intent_list_public(api_client, adopter_intent):
    """Public list returns only active+public intents."""
    response = api_client.get(reverse('adopter-intent-list'))

    assert response.status_code == status.HTTP_200_OK
    assert len(response.json()) == 1
    assert response.json()[0]['status'] == 'active'


@pytest.mark.django_db
def test_adopter_intent_me_requires_auth(api_client):
    """Me endpoint requires authentication."""
    response = api_client.get(reverse('adopter-intent-me'))

    assert response.status_code == status.HTTP_401_UNAUTHORIZED


@pytest.mark.django_db
def test_adopter_intent_me_returns_own(authenticated_client, adopter_intent):
    """Authenticated user sees their own intent."""
    response = authenticated_client.get(reverse('adopter-intent-me'))

    assert response.status_code == status.HTTP_200_OK
    assert response.json()['description'] == 'Looking for a friendly dog'


@pytest.mark.django_db
def test_adopter_intent_me_404_when_none(authenticated_client):
    """Returns 404 when user has no intent."""
    response = authenticated_client.get(reverse('adopter-intent-me'))

    assert response.status_code == status.HTTP_404_NOT_FOUND


@pytest.mark.django_db
def test_adopter_intent_me_update_partial(authenticated_client, adopter_intent):
    """PATCH updates intent partially."""
    response = authenticated_client.patch(
        reverse('adopter-intent-me'),
        {'description': 'Updated description'},
        format='json',
    )

    assert response.status_code == status.HTTP_200_OK
    adopter_intent.refresh_from_db()
    assert adopter_intent.description == 'Updated description'


@pytest.mark.django_db
def test_adopter_intent_create_requires_auth(api_client):
    """Create endpoint requires authentication."""
    response = api_client.post(
        reverse('adopter-intent-create'),
        {'preferences': {}, 'description': 'test'},
        format='json',
    )

    assert response.status_code == status.HTTP_401_UNAUTHORIZED


@pytest.mark.django_db
def test_adopter_intent_create_success(authenticated_client):
    """Authenticated user can create an adopter intent."""
    response = authenticated_client.post(
        reverse('adopter-intent-create'),
        {
            'preferences': {'species': 'cat', 'size': 'small'},
            'description': 'Want a kitten',
            'status': 'active',
            'visibility': 'public',
        },
        format='json',
    )

    assert response.status_code == status.HTTP_201_CREATED
    assert AdopterIntent.objects.filter(user__email='user@example.com').exists()


@pytest.mark.django_db
def test_adopter_intent_create_duplicate_rejected(authenticated_client, adopter_intent):
    """User cannot create a second intent."""
    response = authenticated_client.post(
        reverse('adopter-intent-create'),
        {
            'preferences': {'species': 'dog'},
            'description': 'Another intent',
            'status': 'active',
            'visibility': 'public',
        },
        format='json',
    )

    assert response.status_code == status.HTTP_400_BAD_REQUEST
    assert AdopterIntent.objects.filter(user__email='user@example.com').count() == 1
