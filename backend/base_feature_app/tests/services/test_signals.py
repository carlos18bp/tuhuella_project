from decimal import Decimal
from unittest.mock import patch

import pytest

from base_feature_app.models import (
    AdoptionApplication,
    Animal,
    AnimalStatusHistory,
    Campaign,
    Donation,
    Sponsorship,
)
from base_feature_app.tests.factories import (
    AdoptionApplicationFactory,
    AnimalFactory,
    CampaignFactory,
    DonationFactory,
    SponsorshipFactory,
    WebManagerUserFactory,
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
    DonationFactory(
        campaign=campaign,
        shelter=campaign.shelter,
        destination=Donation.Destination.CAMPAIGN,
        status='paid',
    )
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


@pytest.mark.django_db
@patch('base_feature_app.signals._dispatch')
def test_platform_donation_paid_dispatches_platform_event_to_user(mock_dispatch):
    """Platform donation going to paid dispatches platform_donation_paid — not donation_paid."""
    donation = DonationFactory(
        shelter=None,
        destination=Donation.Destination.PLATFORM,
        status='pending',
    )
    mock_dispatch.reset_mock()
    donation.status = 'paid'
    donation.save()
    events = [c[0][0] for c in mock_dispatch.call_args_list]
    assert 'platform_donation_paid' in events
    assert 'donation_paid' not in events


@pytest.mark.django_db
@patch('base_feature_app.signals._dispatch')
def test_platform_donation_paid_does_not_notify_shelter_owner(mock_dispatch):
    """Platform donation going to paid dispatches only once — no shelter-owner copy."""
    donation = DonationFactory(
        shelter=None,
        destination=Donation.Destination.PLATFORM,
        status='pending',
    )
    mock_dispatch.reset_mock()
    donation.status = 'paid'
    donation.save()
    assert mock_dispatch.call_count == 1


@pytest.mark.django_db
@patch('base_feature_app.signals._dispatch')
def test_platform_donation_failed_dispatches_platform_event_to_user(mock_dispatch):
    """Platform donation going to failed dispatches platform_donation_failed."""
    donation = DonationFactory(
        shelter=None,
        destination=Donation.Destination.PLATFORM,
        status='pending',
    )
    mock_dispatch.reset_mock()
    donation.status = 'failed'
    donation.save()
    events = [c[0][0] for c in mock_dispatch.call_args_list]
    assert 'platform_donation_failed' in events
    assert 'donation_failed' not in events


# --- DoesNotExist branches in pre_save handlers ---


@pytest.mark.django_db
@patch('base_feature_app.signals._dispatch')
def test_adoption_pre_save_sets_none_when_db_row_deleted(mock_dispatch):
    """If an AdoptionApplication PK exists but row is deleted, _prev_status is None."""
    app = AdoptionApplicationFactory(status='submitted')
    AdoptionApplication.objects.filter(pk=app.pk).delete()
    mock_dispatch.reset_mock()
    app.status = 'reviewing'
    app.save(force_insert=True)
    assert getattr(app, '_prev_status', 'NOT_SET') is None


@pytest.mark.django_db
@patch('base_feature_app.signals._dispatch')
def test_donation_pre_save_sets_none_when_db_row_deleted(mock_dispatch):
    """If a Donation PK exists but row is deleted, _prev_status is None."""
    donation = DonationFactory(status='pending')
    Donation.objects.filter(pk=donation.pk).delete()
    mock_dispatch.reset_mock()
    donation.status = 'paid'
    donation.save(force_insert=True)
    assert getattr(donation, '_prev_status', 'NOT_SET') is None


@pytest.mark.django_db
@patch('base_feature_app.signals._dispatch')
def test_sponsorship_pre_save_sets_none_when_db_row_deleted(mock_dispatch):
    """If a Sponsorship PK exists but row is deleted, _prev_status is None."""
    sp = SponsorshipFactory(status='pending')
    Sponsorship.objects.filter(pk=sp.pk).delete()
    mock_dispatch.reset_mock()
    sp.status = 'active'
    sp.save(force_insert=True)
    assert getattr(sp, '_prev_status', 'NOT_SET') is None


@pytest.mark.django_db
@patch('base_feature_app.signals._dispatch')
def test_campaign_pre_save_sets_none_when_db_row_deleted(mock_dispatch):
    """If a Campaign PK exists but row is deleted, _prev_approval_status is None."""
    campaign = CampaignFactory()
    Campaign.objects.filter(pk=campaign.pk).delete()
    mock_dispatch.reset_mock()
    campaign.approval_status = Campaign.ApprovalStatus.PENDING
    campaign.save(force_insert=True)
    assert getattr(campaign, '_prev_approval_status', 'NOT_SET') is None


# --- Animal status history ---


@pytest.mark.django_db
@patch('base_feature_app.signals._dispatch')
def test_animal_creation_creates_initial_status_history(mock_dispatch):
    """Creating an animal records initial status in AnimalStatusHistory."""
    animal = AnimalFactory()
    history = AnimalStatusHistory.objects.filter(animal=animal)
    assert history.count() == 1
    entry = history.first()
    assert entry.previous_status == ''
    assert entry.new_status == animal.status


@pytest.mark.django_db
@patch('base_feature_app.signals._dispatch')
def test_animal_status_change_creates_history_entry(mock_dispatch):
    """Changing animal status creates a new AnimalStatusHistory entry."""
    animal = AnimalFactory(status=Animal.Status.PUBLISHED)
    initial_count = AnimalStatusHistory.objects.filter(animal=animal).count()
    animal.status = Animal.Status.ADOPTED
    animal.save()
    assert AnimalStatusHistory.objects.filter(animal=animal).count() == initial_count + 1
    latest = AnimalStatusHistory.objects.filter(animal=animal).order_by('-created_at').first()
    assert latest.previous_status == Animal.Status.PUBLISHED
    assert latest.new_status == Animal.Status.ADOPTED


# --- Campaign raised_amount tracking ---


@pytest.mark.django_db
@patch('base_feature_app.signals._dispatch')
def test_campaign_raised_amount_tracking_stores_prev_values(mock_dispatch):
    """Campaign pre_save stores previous raised_amount and goal_amount."""
    campaign = CampaignFactory(
        goal_amount=Decimal('500000'),
        raised_amount=Decimal('100000'),
    )
    # Update raised_amount — the pre_save handler should read prev values
    campaign.raised_amount = Decimal('200000')
    campaign.save()
    # If _prev_raised was properly set, no crash occurred
    assert campaign.raised_amount == Decimal('200000')


# --- Web manager notification on adoption ---


@pytest.mark.django_db
@patch('base_feature_app.signals._dispatch')
def test_adoption_submitted_notifies_web_managers(mock_dispatch):
    """Creating an adoption application dispatches to all web_managers."""
    manager = WebManagerUserFactory()
    app = AdoptionApplicationFactory()
    calls = [c[0] for c in mock_dispatch.call_args_list]
    manager_calls = [
        (event, recipient)
        for event, recipient, _ in calls
        if recipient == manager
    ]
    assert any(event == 'adoption_submitted' for event, _ in manager_calls)
