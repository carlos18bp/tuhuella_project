from decimal import Decimal

import pytest
from django.utils import timezone

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
