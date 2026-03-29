from decimal import Decimal
from unittest.mock import patch

import pytest

from base_feature_app.tests.factories import (
    AdoptionApplicationFactory,
    CampaignFactory,
    DonationFactory,
    SponsorshipFactory,
)


@pytest.mark.django_db
@patch('base_feature_app.signals._dispatch')
def test_adoption_created_dispatches_to_shelter_owner(mock_dispatch):
    """New adoption application dispatches adoption_submitted to shelter owner."""
    app = AdoptionApplicationFactory()
    assert mock_dispatch.call_count >= 1
    mock_dispatch.assert_any_call(
        'adoption_submitted',
        app.animal.shelter.owner,
        pytest.approx({
            'user_name': app.animal.shelter.owner.first_name or app.animal.shelter.owner.email,
            'animal_name': app.animal.name,
            'shelter_name': app.animal.shelter.name,
            'link': '/shelter/applications',
        }),
    )


@pytest.mark.django_db
@patch('base_feature_app.signals._dispatch')
def test_adoption_status_change_dispatches_to_user(mock_dispatch):
    """Changing adoption status dispatches adoption_status_changed to applicant."""
    app = AdoptionApplicationFactory(status='submitted')
    mock_dispatch.reset_mock()
    app.status = 'approved'
    app.save()
    mock_dispatch.assert_called()
    call_args = [c[0] for c in mock_dispatch.call_args_list]
    assert any(event == 'adoption_status_changed' for event, _, _ in call_args)


@pytest.mark.django_db
@patch('base_feature_app.signals._dispatch')
def test_donation_paid_dispatches_to_user_and_shelter(mock_dispatch):
    """Donation changing to paid dispatches to both donor and shelter owner."""
    donation = DonationFactory(status='pending')
    mock_dispatch.reset_mock()
    donation.status = 'paid'
    donation.save()
    events = [c[0][0] for c in mock_dispatch.call_args_list]
    assert events.count('donation_paid') == 2


@pytest.mark.django_db
@patch('base_feature_app.signals._dispatch')
def test_sponsorship_active_dispatches_to_user(mock_dispatch):
    """Sponsorship becoming active dispatches sponsorship_paid to user."""
    sp = SponsorshipFactory(status='pending')
    mock_dispatch.reset_mock()
    sp.status = 'active'
    sp.save()
    events = [c[0][0] for c in mock_dispatch.call_args_list]
    assert 'sponsorship_paid' in events


@pytest.mark.django_db
@patch('base_feature_app.signals._dispatch')
def test_campaign_goal_reached_dispatches(mock_dispatch):
    """Campaign reaching its goal dispatches campaign_goal_reached."""
    campaign = CampaignFactory(goal_amount=Decimal('100000'), raised_amount=Decimal('0'))
    DonationFactory(campaign=campaign, shelter=campaign.shelter, status='paid')
    mock_dispatch.reset_mock()
    campaign.raised_amount = Decimal('100000')
    campaign.save()
    events = [c[0][0] for c in mock_dispatch.call_args_list]
    assert 'campaign_goal_reached' in events


@pytest.mark.django_db
@patch('base_feature_app.services.notification_service.dispatch_notification', side_effect=Exception('boom'))
def test_dispatch_exception_logged_not_raised(mock_dispatch_notif):
    """Exception in dispatch_notification is caught by _dispatch — no propagation."""
    app = AdoptionApplicationFactory()
    assert app.pk is not None
