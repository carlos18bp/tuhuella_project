"""
Adoption interview follow-up dispatcher.

When an AdoptionApplication is in the 'interview' state, the platform reminds
the web_manager(s) every 5 days to follow up. The timer resets whenever an
event is logged on the application.
"""

import logging
from datetime import timedelta

from django.conf import settings
from django.db.models import Max, Q
from django.utils import timezone

from base_feature_app.models import AdoptionApplication, User
from base_feature_app.models.adoption import FOLLOW_UP_INTERVAL_DAYS
from base_feature_app.services.notification_service import dispatch_notification

logger = logging.getLogger(__name__)


def _build_context(application, locale: str) -> dict:
    reference_date = application.last_event_date or application.updated_at
    days_since = (timezone.now() - reference_date).days if reference_date else 0
    frontend_url = getattr(settings, 'FRONTEND_URL', '').rstrip('/')
    link = f'{frontend_url}/{locale}/web-manager/applications/{application.pk}'
    return {
        'animal_name': application.animal.name,
        'shelter_name': application.animal.shelter.name,
        'applicant_email': application.user.email,
        'days_since_last_update': days_since,
        'link': link,
        'locale': locale,
    }


def dispatch_due_follow_ups():
    """Notify all web_managers about adoption applications whose follow-up is due."""
    now = timezone.now()
    due_apps = list(
        AdoptionApplication.objects.filter(
            status=AdoptionApplication.Status.INTERVIEW,
            archived_at__isnull=True,
            next_follow_up_due_at__isnull=False,
            next_follow_up_due_at__lte=now,
        )
        .select_related('animal__shelter', 'user')
        .annotate(last_event_date=Max(
            'events__event_date',
            filter=Q(events__archived_at__isnull=True),
        ))
    )

    web_managers = list(
        User.objects.filter(
            role=User.Role.WEB_MANAGER, is_active=True, archived_at__isnull=True,
        )
    )
    if not web_managers:
        logger.info('adoption_interview_follow_ups: no active web managers, skipping.')
        return 0

    locale = getattr(settings, 'FRONTEND_DEFAULT_LOCALE', 'es')
    next_due = now + timedelta(days=FOLLOW_UP_INTERVAL_DAYS)
    dispatched = 0
    for application in due_apps:
        context = _build_context(application, locale)
        for manager in web_managers:
            dispatch_notification('adoption_interview_follow_up_due', manager, context)
            dispatched += 1

        application.next_follow_up_due_at = next_due
        application.save(update_fields=['next_follow_up_due_at', 'updated_at'])

    if dispatched:
        logger.info(
            'adoption_interview_follow_ups: dispatched %s notifications across %s applications.',
            dispatched, len(due_apps),
        )
    return dispatched
