"""
Async notification tasks using Huey.
"""

import logging

from django.core.mail import send_mail
from django.conf import settings
from django.utils import timezone
from huey.contrib.djhuey import db_task

logger = logging.getLogger(__name__)


@db_task()
def send_email_notification(log_id: int):
    """
    Send an email notification for a NotificationLog entry.

    Loads the log, renders the template, sends the email,
    and updates the log status.
    """
    from base_feature_app.models import NotificationLog
    from base_feature_app.services.notification_templates import render_template

    try:
        log = NotificationLog.objects.select_related('recipient').get(pk=log_id)
    except NotificationLog.DoesNotExist:
        logger.error('NotificationLog %s not found', log_id)
        return

    try:
        # Determine locale from user preferences or default to 'es'
        locale = log.metadata.get('locale', 'es')
        subject, body = render_template(log.event_key, locale, log.metadata)

        send_mail(
            subject=subject,
            message=body,
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[log.recipient.email],
            fail_silently=False,
        )

        log.status = NotificationLog.Status.SENT
        log.sent_at = timezone.now()
        log.save(update_fields=['status', 'sent_at'])

        logger.info('Email sent for log %s (%s)', log_id, log.event_key)

    except Exception:
        log.status = NotificationLog.Status.FAILED
        log.save(update_fields=['status'])
        logger.exception('Failed to send email for log %s', log_id)
