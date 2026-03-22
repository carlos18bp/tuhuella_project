import pytest

from base_feature_app.serializers.notification import (
    NotificationPreferenceSerializer,
    NotificationLogSerializer,
)


@pytest.mark.django_db
def test_notification_preference_serializer_fields(notification_preference):
    """Preference serializer returns expected fields."""
    data = NotificationPreferenceSerializer(notification_preference).data

    assert data['id'] == notification_preference.pk
    assert data['event_key'] == 'adoption_status_change'
    assert data['channel'] == 'email'
    assert data['enabled'] is True


@pytest.mark.django_db
def test_notification_log_serializer_fields(notification_log):
    """Log serializer returns expected fields."""
    data = NotificationLogSerializer(notification_log).data

    assert data['id'] == notification_log.pk
    assert data['event_key'] == 'adoption_status_change'
    assert data['channel'] == 'email'
    assert data['status'] == 'sent'
    assert 'created_at' in data
