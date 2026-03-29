from decimal import Decimal
from unittest.mock import PropertyMock, patch

import pytest

from base_feature_app.models import Campaign


@pytest.mark.django_db
def test_campaign_str_returns_title(campaign):
    """__str__ returns the campaign title."""
    assert str(campaign) == 'Medical Fund'


@pytest.mark.django_db
def test_campaign_progress_percentage_zero_when_no_raised(campaign):
    """Progress is 0% when nothing has been raised."""
    assert campaign.progress_percentage == 0


@pytest.mark.django_db
def test_campaign_progress_percentage_correct(campaign):
    """Progress is calculated correctly from raised_amount / goal_amount."""
    campaign.raised_amount = Decimal('250000.00')
    campaign.save()
    campaign.refresh_from_db()

    assert campaign.progress_percentage == 50


@pytest.mark.django_db
def test_campaign_status_choices():
    """Status contains expected values."""
    values = {c.value for c in Campaign.Status}
    assert 'active' in values
    assert 'completed' in values
    assert 'archived' in values


@pytest.mark.django_db
def test_campaign_shelter_relationship(campaign, shelter):
    """Campaign is linked to its shelter."""
    assert campaign.shelter == shelter
    assert campaign in shelter.campaigns.all()


@pytest.mark.django_db
def test_campaign_progress_percentage_zero_when_goal_is_zero(campaign):
    """Progress returns 0 when goal_amount is 0."""
    campaign.goal_amount = Decimal('0.00')
    campaign.save()
    campaign.refresh_from_db()

    assert campaign.progress_percentage == 0


@pytest.mark.django_db
def test_campaign_delete_with_cover_image(campaign):
    """delete() removes cover_image library before deleting the campaign."""
    mock_library = type('FakeLibrary', (), {'delete': lambda self: None})()
    with patch.object(type(campaign), 'cover_image', new_callable=PropertyMock, return_value=mock_library):
        campaign.delete()

    assert not Campaign.objects.filter(pk=campaign.pk).exists()


@pytest.mark.django_db
def test_campaign_delete_handles_missing_cover_image_library(campaign):
    """delete() handles Library.DoesNotExist gracefully when cover_image library is missing."""
    from django_attachments.models import Library

    with patch.object(
        type(campaign), 'cover_image',
        new_callable=PropertyMock,
        side_effect=Library.DoesNotExist,
    ):
        campaign.delete()

    assert not Campaign.objects.filter(pk=campaign.pk).exists()
