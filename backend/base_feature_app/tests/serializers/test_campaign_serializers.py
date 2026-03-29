import pytest

from base_feature_app.serializers.campaign_create_update import (
    CampaignCreateUpdateSerializer,
)
from base_feature_app.serializers.campaign_detail import CampaignDetailSerializer
from base_feature_app.serializers.campaign_list import CampaignListSerializer


@pytest.mark.django_db
def test_campaign_list_serializer_fields(campaign):
    """List serializer returns expected fields."""
    data = CampaignListSerializer(campaign).data

    assert data['id'] == campaign.pk
    assert data['title'] == 'Medical Fund'
    assert data['status'] == 'active'
    assert 'created_at' in data


@pytest.mark.django_db
def test_campaign_detail_serializer_fields(campaign):
    """Detail serializer returns all fields including progress."""
    data = CampaignDetailSerializer(campaign).data

    assert data['title'] == 'Medical Fund'
    assert data['description'] == 'Help us cover medical costs'
    assert 'updated_at' in data


@pytest.mark.django_db
def test_campaign_create_update_serializer_valid(shelter):
    """Create serializer accepts valid data."""
    serializer = CampaignCreateUpdateSerializer(data={
        'shelter': shelter.pk,
        'title_es': 'New Campaign',
        'description_es': 'Help us',
        'goal_amount': '200000.00',
    })

    assert serializer.is_valid(), serializer.errors


@pytest.mark.django_db
def test_campaign_create_update_serializer_rejects_missing_title(shelter):
    """Create serializer rejects missing title."""
    serializer = CampaignCreateUpdateSerializer(data={
        'shelter': shelter.pk,
        'goal_amount': '200000.00',
    })

    assert not serializer.is_valid()
    assert 'title_es' in serializer.errors
