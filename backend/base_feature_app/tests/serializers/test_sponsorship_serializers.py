import pytest

from base_feature_app.serializers.sponsorship_list import SponsorshipListSerializer
from base_feature_app.serializers.sponsorship_detail import SponsorshipDetailSerializer
from base_feature_app.serializers.sponsorship_create_update import SponsorshipCreateUpdateSerializer


@pytest.mark.django_db
def test_sponsorship_list_serializer_fields(sponsorship):
    """List serializer returns expected fields."""
    data = SponsorshipListSerializer(sponsorship).data

    assert data['id'] == sponsorship.pk
    assert 'created_at' in data


@pytest.mark.django_db
def test_sponsorship_detail_serializer_fields(sponsorship):
    """Detail serializer returns all fields."""
    data = SponsorshipDetailSerializer(sponsorship).data

    assert data['id'] == sponsorship.pk
    assert 'amount' in data
    assert 'frequency' in data


@pytest.mark.django_db
def test_sponsorship_create_update_serializer_valid(animal):
    """Create serializer accepts valid data."""
    serializer = SponsorshipCreateUpdateSerializer(data={
        'animal': animal.pk,
        'amount': '20000.00',
        'frequency': 'monthly',
    })

    assert serializer.is_valid(), serializer.errors


@pytest.mark.django_db
def test_sponsorship_create_update_serializer_rejects_invalid_frequency(animal):
    """Create serializer rejects invalid frequency value."""
    serializer = SponsorshipCreateUpdateSerializer(data={
        'animal': animal.pk,
        'amount': '20000.00',
        'frequency': 'weekly',
    })

    assert not serializer.is_valid()
    assert 'frequency' in serializer.errors
