import pytest
from django.urls import reverse
from rest_framework import status

from base_feature_app.models import Sponsorship


@pytest.mark.django_db
def test_sponsorship_list_requires_auth(api_client):
    """Unauthenticated users cannot list sponsorships."""
    response = api_client.get(reverse('sponsorship-list'))

    assert response.status_code == status.HTTP_401_UNAUTHORIZED


@pytest.mark.django_db
def test_sponsorship_list_returns_own(authenticated_client, sponsorship):
    """User sees only their own sponsorships."""
    response = authenticated_client.get(reverse('sponsorship-list'))

    assert response.status_code == status.HTTP_200_OK
    assert len(response.json()) == 1
    assert response.json()[0]['id'] == sponsorship.pk


@pytest.mark.django_db
def test_sponsorship_create_requires_auth(api_client):
    """Unauthenticated users cannot create sponsorships."""
    response = api_client.post(
        reverse('sponsorship-create'),
        {'amount': '10000.00'},
        format='json',
    )

    assert response.status_code == status.HTTP_401_UNAUTHORIZED


@pytest.mark.django_db
def test_sponsorship_create_success(authenticated_client, animal):
    """Authenticated user can create a sponsorship."""
    response = authenticated_client.post(
        reverse('sponsorship-create'),
        {
            'animal': animal.pk,
            'amount': '20000.00',
            'frequency': 'monthly',
        },
        format='json',
    )

    assert response.status_code == status.HTTP_201_CREATED
    assert Sponsorship.objects.filter(animal=animal, amount=20000).exists()


@pytest.mark.django_db
def test_sponsorship_detail_returns_own(authenticated_client, sponsorship):
    """User can view detail of their own sponsorship."""
    response = authenticated_client.get(
        reverse('sponsorship-detail', args=[sponsorship.pk])
    )

    assert response.status_code == status.HTTP_200_OK
    assert response.json()['id'] == sponsorship.pk


@pytest.mark.django_db
def test_sponsorship_detail_denied_for_other_user(
    api_client, other_user, sponsorship
):
    """Other user cannot view someone else's sponsorship."""
    api_client.force_authenticate(user=other_user)
    response = api_client.get(
        reverse('sponsorship-detail', args=[sponsorship.pk])
    )

    assert response.status_code == status.HTTP_404_NOT_FOUND


@pytest.mark.django_db
def test_sponsorship_update_status_success(authenticated_client, sponsorship):
    """User can update their sponsorship status."""
    response = authenticated_client.patch(
        reverse('sponsorship-update-status', args=[sponsorship.pk]),
        {'status': 'paused'},
        format='json',
    )

    assert response.status_code == status.HTTP_200_OK
    sponsorship.refresh_from_db()
    assert sponsorship.status == 'paused'


@pytest.mark.django_db
def test_sponsorship_update_status_rejects_invalid(
    authenticated_client, sponsorship
):
    """Invalid status value is rejected."""
    response = authenticated_client.patch(
        reverse('sponsorship-update-status', args=[sponsorship.pk]),
        {'status': 'nonexistent'},
        format='json',
    )

    assert response.status_code == status.HTTP_400_BAD_REQUEST
    sponsorship.refresh_from_db()
    assert sponsorship.status == 'active'
