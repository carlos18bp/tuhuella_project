from datetime import timedelta
from unittest.mock import patch

import pytest
from django.test import override_settings
from django.utils import timezone
from freezegun import freeze_time

from base_feature_app.models import AdoptionApplication, NotificationLog
from base_feature_app.services.adoption_follow_up import dispatch_due_follow_ups
from base_feature_app.tests.factories import (
    AdoptionApplicationFactory,
    WebManagerUserFactory,
)


@pytest.mark.django_db
def test_dispatch_skips_when_no_due_applications():
    AdoptionApplicationFactory(status=AdoptionApplication.Status.INTERVIEW)
    WebManagerUserFactory()

    dispatched = dispatch_due_follow_ups()

    assert dispatched == 0


@freeze_time('2026-01-15 12:00:00')
@pytest.mark.django_db
def test_dispatch_only_processes_interview_status():
    """Only applications in INTERVIEW status trigger follow-up notifications."""
    WebManagerUserFactory()
    past = timezone.now() - timedelta(hours=1)
    AdoptionApplicationFactory(
        status=AdoptionApplication.Status.SUBMITTED,
        next_follow_up_due_at=past,
    )
    AdoptionApplicationFactory(
        status=AdoptionApplication.Status.APPROVED,
        next_follow_up_due_at=past,
    )

    with patch(
        'base_feature_app.services.adoption_follow_up.dispatch_notification'
    ) as mock_dispatch:
        dispatch_due_follow_ups()

    assert mock_dispatch.call_count == 0


@freeze_time('2026-01-15 12:00:00')
@pytest.mark.django_db
def test_dispatch_sends_to_each_web_manager_and_resets_due_at():
    """Dispatch notifies every web manager and advances next_follow_up_due_at by 5 days."""
    WebManagerUserFactory(email='wm1@example.com')
    WebManagerUserFactory(email='wm2@example.com')
    application = AdoptionApplicationFactory(
        status=AdoptionApplication.Status.INTERVIEW,
        next_follow_up_due_at=timezone.now() - timedelta(hours=2),
    )

    with patch(
        'base_feature_app.services.adoption_follow_up.dispatch_notification'
    ) as mock_dispatch:
        dispatched = dispatch_due_follow_ups()

    assert dispatched == 2
    assert mock_dispatch.call_count == 2
    application.refresh_from_db()
    assert application.next_follow_up_due_at > timezone.now() + timedelta(days=4, hours=23)


@freeze_time('2026-01-15 12:00:00')
@pytest.mark.django_db
def test_dispatch_skips_archived_applications():
    WebManagerUserFactory()
    AdoptionApplicationFactory(
        status=AdoptionApplication.Status.INTERVIEW,
        next_follow_up_due_at=timezone.now() - timedelta(hours=1),
        archived_at=timezone.now(),
    )

    with patch(
        'base_feature_app.services.adoption_follow_up.dispatch_notification'
    ) as mock_dispatch:
        dispatch_due_follow_ups()

    assert mock_dispatch.call_count == 0


@freeze_time('2026-01-15 12:00:00')
@pytest.mark.django_db
def test_dispatch_creates_notification_log_via_real_dispatch():
    web_manager = WebManagerUserFactory()
    AdoptionApplicationFactory(
        status=AdoptionApplication.Status.INTERVIEW,
        next_follow_up_due_at=timezone.now() - timedelta(hours=1),
    )

    with patch('base_feature_app.tasks.send_email_notification'):
        dispatch_due_follow_ups()

    assert NotificationLog.objects.filter(
        recipient=web_manager,
        event_key='adoption_interview_follow_up_due',
    ).exists()


@pytest.mark.django_db
def test_huey_task_respects_feature_flag():
    from base_feature_project.tasks import adoption_interview_follow_ups

    with override_settings(ADOPTION_FOLLOW_UPS_ENABLED=False):
        with patch(
            'base_feature_app.services.adoption_follow_up.dispatch_due_follow_ups'
        ) as mock_dispatch:
            adoption_interview_follow_ups.call_local()

    assert mock_dispatch.call_count == 0
