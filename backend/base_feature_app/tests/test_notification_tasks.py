from unittest.mock import patch

import pytest

from base_feature_app.models import NotificationLog
from base_feature_app.tasks import send_email_notification
from base_feature_app.tests.factories import NotificationLogFactory


@pytest.mark.django_db
@patch('base_feature_app.services.notification_templates.render_template', return_value=('Subject', 'Body text'))
@patch('base_feature_app.tasks.send_mail')
def test_send_email_notification_sends_mail(mock_send_mail, mock_render):
    """Successful send updates log status to SENT with sent_at."""
    log = NotificationLogFactory(status=NotificationLog.Status.QUEUED, channel='email')
    send_email_notification(log.pk)
    mock_send_mail.assert_called_once()
    log.refresh_from_db()
    assert log.status == NotificationLog.Status.SENT
    assert log.sent_at is not None


@pytest.mark.django_db
def test_send_email_notification_log_not_found():
    """Nonexistent log ID logs error without crashing."""
    send_email_notification(99999)


@pytest.mark.django_db
@patch('base_feature_app.services.notification_templates.render_template', return_value=('Subject', 'Body'))
@patch('base_feature_app.tasks.send_mail', side_effect=Exception('SMTP error'))
def test_send_email_notification_mail_failure_marks_failed(mock_send_mail, mock_render):
    """Mail failure updates log status to FAILED."""
    log = NotificationLogFactory(status=NotificationLog.Status.QUEUED, channel='email')
    send_email_notification(log.pk)
    log.refresh_from_db()
    assert log.status == NotificationLog.Status.FAILED


@pytest.mark.django_db
@patch('base_feature_app.services.notification_templates.render_template', return_value=('Subject', 'Body'))
@patch('base_feature_app.tasks.send_mail')
def test_send_email_notification_uses_locale_from_metadata(mock_send_mail, mock_render):
    """Locale from metadata is passed to render_template."""
    log = NotificationLogFactory(
        status=NotificationLog.Status.QUEUED,
        channel='email',
        metadata={'locale': 'en', 'application_id': 1},
    )
    send_email_notification(log.pk)
    mock_render.assert_called_once()
    assert mock_render.call_args[0][1] == 'en'


@pytest.mark.django_db
@patch('base_feature_app.services.notification_templates.render_template', return_value=('Subject', 'Body'))
@patch('base_feature_app.tasks.send_mail')
def test_send_email_notification_defaults_to_es(mock_send_mail, mock_render):
    """Missing locale in metadata defaults to 'es'."""
    log = NotificationLogFactory(
        status=NotificationLog.Status.QUEUED,
        channel='email',
        metadata={'application_id': 1},
    )
    send_email_notification(log.pk)
    assert mock_render.call_args[0][1] == 'es'
