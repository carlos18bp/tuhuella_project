import pytest
from django.db import IntegrityError

from base_feature_app.models import NotificationLog, NotificationPreference


@pytest.mark.django_db
def test_notification_preference_str_enabled(notification_preference):
    """__str__ shows ON when enabled."""
    result = str(notification_preference)
    assert 'user@example.com' in result
    assert 'adoption_status_change' in result
    assert '[ON]' in result


@pytest.mark.django_db
def test_notification_preference_str_disabled(existing_user):
    """__str__ shows OFF when disabled."""
    pref = NotificationPreference.objects.create(
        user=existing_user,
        event_key='donation_received',
        channel=NotificationPreference.Channel.PUSH,
        enabled=False,
    )
    result = str(pref)
    assert '[OFF]' in result


@pytest.mark.django_db
def test_notification_preference_default_enabled(existing_user):
    """New preference defaults to enabled."""
    pref = NotificationPreference.objects.create(
        user=existing_user,
        event_key='new_animal',
        channel=NotificationPreference.Channel.IN_APP,
    )
    assert pref.enabled is True


@pytest.mark.django_db
def test_notification_preference_unique_together(notification_preference, existing_user):
    """Cannot create duplicate preferences for the same user + event_key + channel."""
    with pytest.raises(IntegrityError):
        NotificationPreference.objects.create(
            user=existing_user,
            event_key='adoption_status_change',
            channel=NotificationPreference.Channel.EMAIL,
        )


@pytest.mark.django_db
def test_notification_preference_user_relationship(notification_preference, existing_user):
    """Preference is linked to its user."""
    assert notification_preference.user == existing_user
    assert notification_preference in existing_user.notification_preferences.all()


@pytest.mark.django_db
def test_notification_preference_channel_choices():
    """Channel contains expected choices."""
    values = {c.value for c in NotificationPreference.Channel}
    assert values == {'email', 'push', 'in_app'}


@pytest.mark.django_db
def test_notification_log_str_representation(notification_log):
    """__str__ contains event key, recipient email, and status."""
    result = str(notification_log)
    assert 'adoption_status_change' in result
    assert 'user@example.com' in result
    assert 'Sent' in result


@pytest.mark.django_db
def test_notification_log_default_status(existing_user):
    """New log defaults to queued status."""
    log = NotificationLog.objects.create(
        recipient=existing_user,
        event_key='new_event',
        channel=NotificationPreference.Channel.EMAIL,
    )
    assert log.status == NotificationLog.Status.QUEUED


@pytest.mark.django_db
def test_notification_log_recipient_relationship(notification_log, existing_user):
    """Log is linked to its recipient user."""
    assert notification_log.recipient == existing_user
    assert notification_log in existing_user.notification_logs.all()


@pytest.mark.django_db
def test_notification_log_metadata_json(notification_log):
    """Metadata field stores JSON data correctly."""
    assert notification_log.metadata == {'application_id': 1}


@pytest.mark.django_db
def test_notification_log_status_choices():
    """Status contains expected choices."""
    values = {c.value for c in NotificationLog.Status}
    assert values == {'queued', 'sent', 'failed'}
