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


@pytest.mark.django_db
def test_donation_create_platform_succeeds_without_shelter(authenticated_client):
    """Authenticated user can create a platform donation with no shelter or campaign."""
    response = authenticated_client.post(
        reverse('donation-create'),
        {
            'destination': 'platform',
            'amount': '15000.00',
        },
        format='json',
    )

    assert response.status_code == status.HTTP_201_CREATED


@pytest.mark.django_db
def test_donation_create_platform_stores_correct_destination(authenticated_client):
    """Platform donation is persisted with destination=platform and no shelter."""
    authenticated_client.post(
        reverse('donation-create'),
        {
            'destination': 'platform',
            'amount': '20000.00',
        },
        format='json',
    )

    assert Donation.objects.filter(
        destination=Donation.Destination.PLATFORM,
        shelter=None,
        campaign=None,
    ).exists()


@pytest.mark.django_db
def test_donation_create_rejects_negative_amount(authenticated_client, shelter):
    """Negative amount must 400 and never reach the DB.

    Bug this catches: DonationCreateUpdateSerializer.validate() only checks
    destination/shelter/campaign consistency and never validates the sign of
    amount, so a payload like amount="-15000.00" was silently accepted and
    persisted as a negative donation.
    """
    response = authenticated_client.post(
        reverse('donation-create'),
        {
            'shelter': shelter.pk,
            'amount': '-15000.00',
            'message': 'negative amount probe',
        },
        format='json',
    )

    assert response.status_code == status.HTTP_400_BAD_REQUEST
    assert Donation.objects.filter(amount__lt=0).exists() is False
