from decimal import Decimal

import pytest

from base_feature_app.models import Donation


@pytest.mark.django_db
def test_donation_str_representation(donation):
    """__str__ contains user email and amount."""
    result = str(donation)
    assert 'user@example.com' in result
    assert '50000' in result


@pytest.mark.django_db
def test_donation_default_status_is_pending(existing_user, shelter):
    """New donation defaults to pending status."""
    d = Donation.objects.create(
        user=existing_user,
        shelter=shelter,
        amount=Decimal('10000.00'),
    )

    assert d.status == Donation.Status.PENDING


@pytest.mark.django_db
def test_donation_nullable_campaign(existing_user, shelter):
    """Donation can be created without a campaign."""
    d = Donation.objects.create(
        user=existing_user,
        shelter=shelter,
        amount=Decimal('5000.00'),
    )

    assert d.campaign is None


@pytest.mark.django_db
def test_donation_status_choices():
    """Status contains expected values."""
    values = {c.value for c in Donation.Status}
    assert 'pending' in values
    assert 'paid' in values
