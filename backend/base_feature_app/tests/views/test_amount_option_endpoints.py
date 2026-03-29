import pytest
from django.urls import reverse

from base_feature_app.tests.factories import DonationAmountOptionFactory, SponsorshipAmountOptionFactory


@pytest.mark.django_db
def test_donation_amounts_returns_active_only(api_client):
    """Only active donation amount options are returned."""
    DonationAmountOptionFactory(amount=10000, is_active=True)
    DonationAmountOptionFactory(amount=25000, is_active=True)
    DonationAmountOptionFactory(amount=50000, is_active=False)
    url = reverse('donation-amount-list')
    response = api_client.get(url)
    assert response.status_code == 200
    assert len(response.json()) == 2


@pytest.mark.django_db
def test_donation_amounts_accessible_without_auth(api_client):
    """Donation amounts are public (no auth required)."""
    url = reverse('donation-amount-list')
    response = api_client.get(url)
    assert response.status_code == 200


@pytest.mark.django_db
def test_sponsorship_amounts_returns_active_only(api_client):
    """Only active sponsorship amount options are returned."""
    SponsorshipAmountOptionFactory(amount=15000, is_active=True)
    SponsorshipAmountOptionFactory(amount=30000, is_active=True)
    SponsorshipAmountOptionFactory(amount=50000, is_active=False)
    url = reverse('sponsorship-amount-list')
    response = api_client.get(url)
    assert response.status_code == 200
    assert len(response.json()) == 2


@pytest.mark.django_db
def test_sponsorship_amounts_accessible_without_auth(api_client):
    """Sponsorship amounts are public (no auth required)."""
    url = reverse('sponsorship-amount-list')
    response = api_client.get(url)
    assert response.status_code == 200
