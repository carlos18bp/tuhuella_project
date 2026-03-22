import pytest

from base_feature_app.serializers.donation_list import DonationListSerializer
from base_feature_app.serializers.donation_detail import DonationDetailSerializer
from base_feature_app.serializers.donation_create_update import DonationCreateUpdateSerializer


@pytest.mark.django_db
def test_donation_list_serializer_fields(donation):
    """List serializer returns expected fields."""
    data = DonationListSerializer(donation).data

    assert data['id'] == donation.pk
    assert data['status'] == 'pending'
    assert 'created_at' in data


@pytest.mark.django_db
def test_donation_detail_serializer_fields(donation):
    """Detail serializer returns all fields."""
    data = DonationDetailSerializer(donation).data

    assert data['id'] == donation.pk
    assert 'amount' in data


@pytest.mark.django_db
def test_donation_create_update_serializer_valid(shelter):
    """Create serializer accepts valid data."""
    serializer = DonationCreateUpdateSerializer(data={
        'shelter': shelter.pk,
        'amount': '25000.00',
        'message': 'Thanks',
    })

    assert serializer.is_valid(), serializer.errors


@pytest.mark.django_db
def test_donation_create_update_serializer_rejects_missing_amount(shelter):
    """Create serializer rejects missing amount."""
    serializer = DonationCreateUpdateSerializer(data={
        'shelter': shelter.pk,
    })

    assert not serializer.is_valid()
    assert 'amount' in serializer.errors
