import pytest
from django.urls import reverse
from rest_framework import status

from base_feature_app.models import Donation


@pytest.mark.django_db
def test_donation_list_requires_auth(api_client):
    """Unauthenticated users cannot list donations."""
    response = api_client.get(reverse('donation-list'))

    assert response.status_code == status.HTTP_401_UNAUTHORIZED


@pytest.mark.django_db
def test_donation_list_returns_own_donations(authenticated_client, donation):
    """Regular user sees only their own donations."""
    response = authenticated_client.get(reverse('donation-list'))

    assert response.status_code == status.HTTP_200_OK
    assert len(response.json()) == 1
    assert response.json()[0]['id'] == donation.pk


@pytest.mark.django_db
def test_donation_list_shelter_admin_sees_shelter_donations(
    shelter_admin_client, donation
):
    """Shelter admin sees donations directed to their shelters."""
    response = shelter_admin_client.get(reverse('donation-list'))

    assert response.status_code == status.HTTP_200_OK
    assert len(response.json()) == 1


@pytest.mark.django_db
def test_donation_create_requires_auth(api_client):
    """Unauthenticated users cannot create donations."""
    response = api_client.post(
        reverse('donation-create'),
        {'amount': '10000.00'},
        format='json',
    )

    assert response.status_code == status.HTTP_401_UNAUTHORIZED


@pytest.mark.django_db
def test_donation_create_success(authenticated_client, shelter):
    """Authenticated user can create a donation."""
    response = authenticated_client.post(
        reverse('donation-create'),
        {
            'shelter': shelter.pk,
            'amount': '25000.00',
            'message': 'Keep up the good work',
        },
        format='json',
    )

    assert response.status_code == status.HTTP_201_CREATED
    assert Donation.objects.filter(message='Keep up the good work').exists()


@pytest.mark.django_db
def test_donation_detail_returns_own(authenticated_client, donation):
    """User can view detail of their own donation."""
    response = authenticated_client.get(
        reverse('donation-detail', args=[donation.pk])
    )

    assert response.status_code == status.HTTP_200_OK
    assert response.json()['id'] == donation.pk


@pytest.mark.django_db
def test_donation_detail_denied_for_unrelated_user(
    api_client, other_user, donation
):
    """Unrelated user cannot view someone else's donation detail."""
    api_client.force_authenticate(user=other_user)
    response = api_client.get(reverse('donation-detail', args=[donation.pk]))

    assert response.status_code == status.HTTP_403_FORBIDDEN


@pytest.mark.django_db
def test_donation_detail_returns_404_for_missing(authenticated_client):
    """Detail endpoint returns 404 for non-existent pk."""
    response = authenticated_client.get(reverse('donation-detail', args=[99999]))

    assert response.status_code == status.HTTP_404_NOT_FOUND
