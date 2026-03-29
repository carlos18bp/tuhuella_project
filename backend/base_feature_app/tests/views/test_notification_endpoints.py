import pytest
from django.urls import reverse

from base_feature_app.models import NotificationLog, NotificationPreference
from base_feature_app.tests.factories import NotificationLogFactory, NotificationPreferenceFactory


# ── Preferences: list ────────────────────────────────────────────────────────


@pytest.mark.django_db
def test_preferences_list_requires_auth(api_client):
    """Unauthenticated request to list preferences returns 401."""
    url = reverse('notification-preferences-list')
    response = api_client.get(url)
    assert response.status_code == 401


@pytest.mark.django_db
def test_preferences_list_returns_user_prefs(authenticated_client, notification_preference):
    """Authenticated user receives their notification preferences."""
    url = reverse('notification-preferences-list')
    response = authenticated_client.get(url)
    assert response.status_code == 200
    data = response.json()
    assert len(data) >= 1
    assert data[0]['event_key'] == notification_preference.event_key


# ── Preferences: init ────────────────────────────────────────────────────────


@pytest.mark.django_db
def test_preferences_init_creates_defaults(authenticated_client, existing_user):
    """Init creates 24 default preferences (12 events x 2 channels)."""
    url = reverse('notification-preferences-init')
    response = authenticated_client.post(url)
    assert response.status_code == 201
    data = response.json()
    assert data['created'] == 24
    assert NotificationPreference.objects.filter(user=existing_user).count() == 24


@pytest.mark.django_db
def test_preferences_init_idempotent(authenticated_client):
    """Second init call creates no new preferences."""
    url = reverse('notification-preferences-init')
    authenticated_client.post(url)
    response = authenticated_client.post(url)
    assert response.status_code == 200
    assert response.json()['created'] == 0


@pytest.mark.django_db
def test_preferences_init_requires_auth(api_client):
    """Unauthenticated request to init preferences returns 401."""
    url = reverse('notification-preferences-init')
    response = api_client.post(url)
    assert response.status_code == 401


# ── Preferences: update ──────────────────────────────────────────────────────


@pytest.mark.django_db
def test_preferences_update_disables_preference(authenticated_client, notification_preference):
    """Bulk update can disable a preference."""
    url = reverse('notification-preferences-update')
    response = authenticated_client.patch(
        url,
        [{'id': notification_preference.pk, 'enabled': False}],
        format='json',
    )
    assert response.status_code == 200
    assert response.json()['updated'] == 1
    notification_preference.refresh_from_db()
    assert notification_preference.enabled is False


@pytest.mark.django_db
def test_preferences_update_rejects_non_list(authenticated_client):
    """Non-list payload returns 400."""
    url = reverse('notification-preferences-update')
    response = authenticated_client.patch(url, {'id': 1, 'enabled': False}, format='json')
    assert response.status_code == 400
    assert 'list' in response.json()['error'].lower()


@pytest.mark.django_db
def test_preferences_update_skips_missing_fields(authenticated_client, notification_preference):
    """Items without both id and enabled are skipped."""
    url = reverse('notification-preferences-update')
    response = authenticated_client.patch(url, [{'id': notification_preference.pk}], format='json')
    assert response.status_code == 200
    assert response.json()['updated'] == 0


@pytest.mark.django_db
def test_preferences_update_requires_auth(api_client):
    """Unauthenticated request to update preferences returns 401."""
    url = reverse('notification-preferences-update')
    response = api_client.patch(url, [], format='json')
    assert response.status_code == 401


# ── Logs: list ───────────────────────────────────────────────────────────────


@pytest.mark.django_db
def test_log_list_returns_user_logs(authenticated_client, existing_user):
    """Authenticated user receives their notification logs."""
    NotificationLogFactory(recipient=existing_user, channel='in_app')
    url = reverse('notification-log-list')
    response = authenticated_client.get(url)
    assert response.status_code == 200
    data = response.json()
    assert data['total'] == 1
    assert len(data['results']) == 1


@pytest.mark.django_db
def test_log_list_filters_by_channel(authenticated_client, existing_user):
    """Channel query parameter filters logs."""
    NotificationLogFactory(recipient=existing_user, channel='email')
    NotificationLogFactory(recipient=existing_user, channel='in_app')
    url = reverse('notification-log-list')
    response = authenticated_client.get(url, {'channel': 'email'})
    assert response.status_code == 200
    assert response.json()['total'] == 1


@pytest.mark.django_db
def test_log_list_paginates(authenticated_client, existing_user):
    """Page size is 20; 25 logs show 20 on page 1."""
    NotificationLogFactory.create_batch(25, recipient=existing_user, channel='in_app')
    url = reverse('notification-log-list')
    response = authenticated_client.get(url)
    data = response.json()
    assert len(data['results']) == 20
    assert data['total'] == 25


@pytest.mark.django_db
def test_log_list_requires_auth(api_client):
    """Unauthenticated request to list logs returns 401."""
    url = reverse('notification-log-list')
    response = api_client.get(url)
    assert response.status_code == 401


# ── Logs: mark read ──────────────────────────────────────────────────────────


@pytest.mark.django_db
def test_log_mark_read_marks_single(authenticated_client, existing_user):
    """Marking a single log as read updates the DB."""
    log = NotificationLogFactory(recipient=existing_user, channel='in_app', is_read=False)
    url = reverse('notification-log-mark-read', kwargs={'pk': log.pk})
    response = authenticated_client.patch(url)
    assert response.status_code == 200
    assert response.json()['is_read'] is True
    log.refresh_from_db()
    assert log.is_read is True


@pytest.mark.django_db
def test_log_mark_read_not_found(authenticated_client):
    """Nonexistent log returns 404."""
    url = reverse('notification-log-mark-read', kwargs={'pk': 99999})
    response = authenticated_client.patch(url)
    assert response.status_code == 404


@pytest.mark.django_db
def test_log_mark_read_requires_auth(api_client):
    """Unauthenticated request returns 401."""
    url = reverse('notification-log-mark-read', kwargs={'pk': 1})
    response = api_client.patch(url)
    assert response.status_code == 401


# ── Logs: mark all read ──────────────────────────────────────────────────────


@pytest.mark.django_db
def test_mark_all_read_marks_in_app_only(authenticated_client, existing_user):
    """Mark-all-read only affects in_app channel logs."""
    NotificationLogFactory(recipient=existing_user, channel='in_app', is_read=False)
    NotificationLogFactory(recipient=existing_user, channel='in_app', is_read=False)
    NotificationLogFactory(recipient=existing_user, channel='email', is_read=False)
    url = reverse('notification-log-mark-all-read')
    response = authenticated_client.post(url)
    assert response.status_code == 200
    assert response.json()['marked_read'] == 2


@pytest.mark.django_db
def test_mark_all_read_ignores_email_channel(authenticated_client, existing_user):
    """Email-channel logs remain unread after mark-all-read."""
    email_log = NotificationLogFactory(recipient=existing_user, channel='email', is_read=False)
    url = reverse('notification-log-mark-all-read')
    authenticated_client.post(url)
    email_log.refresh_from_db()
    assert email_log.is_read is False


# ── Unread count ─────────────────────────────────────────────────────────────


@pytest.mark.django_db
def test_unread_count_returns_correct_count(authenticated_client, existing_user):
    """Unread count reflects only unread in_app logs."""
    NotificationLogFactory(recipient=existing_user, channel='in_app', is_read=False)
    NotificationLogFactory(recipient=existing_user, channel='in_app', is_read=False)
    NotificationLogFactory(recipient=existing_user, channel='in_app', is_read=True)
    url = reverse('notification-unread-count')
    response = authenticated_client.get(url)
    assert response.status_code == 200
    assert response.json()['unread_count'] == 2


@pytest.mark.django_db
def test_unread_count_requires_auth(api_client):
    """Unauthenticated request to unread count returns 401."""
    url = reverse('notification-unread-count')
    response = api_client.get(url)
    assert response.status_code == 401
