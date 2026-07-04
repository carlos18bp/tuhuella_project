import pytest

from base_feature_app.serializers.amount_option import (
    DonationAmountOptionSerializer,
    SponsorshipAmountOptionSerializer,
)
from base_feature_app.tests.factories import (
    DonationAmountOptionFactory,
    SponsorshipAmountOptionFactory,
)


@pytest.mark.django_db
def test_donation_amount_option_serializes_configured_values():
    """Donation amount option surfaces its amount plus label."""
    option = DonationAmountOptionFactory(amount=25000, label='$25.000')
    data = DonationAmountOptionSerializer(option).data
    assert data['amount'] == 25000
    assert data['label'] == '$25.000'


@pytest.mark.django_db
def test_sponsorship_amount_option_serializes_configured_values():
    """Sponsorship amount option surfaces its amount plus label."""
    option = SponsorshipAmountOptionFactory(amount=30000, label='$30.000')
    data = SponsorshipAmountOptionSerializer(option).data
    assert data['amount'] == 30000
    assert data['label'] == '$30.000'
