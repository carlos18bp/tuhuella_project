import pytest

from base_feature_app.models import Donation
from base_feature_app.serializers.donation_create_update import (
    DonationCreateUpdateSerializer,
)
from base_feature_app.serializers.donation_detail import DonationDetailSerializer
from base_feature_app.serializers.donation_list import DonationListSerializer
from base_feature_app.tests.factories import CampaignFactory, DonationFactory


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


@pytest.mark.django_db
def test_donation_create_update_platform_destination_clears_shelter_and_campaign(shelter):
    """PLATFORM destination nullifies shelter and campaign in validated data."""
    campaign = CampaignFactory(shelter=shelter)
    serializer = DonationCreateUpdateSerializer(data={
        'destination': Donation.Destination.PLATFORM,
        'shelter': shelter.pk,
        'campaign': campaign.pk,
        'amount': '10000.00',
    })

    assert serializer.is_valid(), serializer.errors
    assert serializer.validated_data['shelter'] is None
    assert serializer.validated_data['campaign'] is None


@pytest.mark.django_db
def test_donation_create_update_shelter_destination_requires_shelter():
    """SHELTER destination without a shelter field fails validation."""
    serializer = DonationCreateUpdateSerializer(data={
        'destination': Donation.Destination.SHELTER,
        'amount': '10000.00',
    })

    assert not serializer.is_valid()
    assert 'shelter' in serializer.errors


@pytest.mark.django_db
def test_donation_create_update_campaign_destination_requires_campaign(shelter):
    """CAMPAIGN destination without a campaign field fails validation."""
    serializer = DonationCreateUpdateSerializer(data={
        'destination': Donation.Destination.CAMPAIGN,
        'amount': '10000.00',
    })

    assert not serializer.is_valid()
    assert 'campaign' in serializer.errors


@pytest.mark.django_db
def test_donation_create_update_campaign_destination_sets_shelter_from_campaign(shelter):
    """CAMPAIGN destination copies shelter from the campaign onto the donation."""
    campaign = CampaignFactory(shelter=shelter)
    serializer = DonationCreateUpdateSerializer(data={
        'destination': Donation.Destination.CAMPAIGN,
        'campaign': campaign.pk,
        'amount': '10000.00',
    })

    assert serializer.is_valid(), serializer.errors
    assert serializer.validated_data['shelter'] == shelter


@pytest.mark.django_db
def test_donation_create_update_serializer_create_saves_to_database(shelter):
    """create() persists a new Donation row."""
    serializer = DonationCreateUpdateSerializer(data={
        'shelter': shelter.pk,
        'amount': '20000.00',
    })
    assert serializer.is_valid(), serializer.errors

    serializer.save(user=shelter.owner)

    assert Donation.objects.filter(shelter=shelter, amount='20000.00').exists()


@pytest.mark.django_db
def test_donation_create_update_serializer_update_modifies_instance(shelter):
    """update() changes the amount on an existing shelter Donation."""
    existing = DonationFactory(shelter=shelter, destination=Donation.Destination.SHELTER, amount='10000.00')
    serializer = DonationCreateUpdateSerializer(
        instance=existing,
        data={
            'destination': Donation.Destination.SHELTER,
            'shelter': shelter.pk,
            'amount': '50000.00',
        },
    )
    assert serializer.is_valid(), serializer.errors

    updated = serializer.save()

    assert str(updated.amount) == '50000.00'
