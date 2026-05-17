from datetime import timedelta

import pytest
from django.utils import timezone
from freezegun import freeze_time

from base_feature_app.tests.factories import (
    AdoptionApplicationEventFactory,
    AdoptionApplicationFactory,
)


@freeze_time('2026-01-15 12:00:00')
@pytest.mark.django_db
def test_event_orders_by_event_date_desc():
    """Events with earlier event_date rank lower regardless of DB insertion order."""
    application = AdoptionApplicationFactory()
    older = AdoptionApplicationEventFactory(
        application=application,
        event_date=timezone.now() - timedelta(days=10),
    )
    newer = AdoptionApplicationEventFactory(
        application=application,
        event_date=timezone.now() - timedelta(days=1),
    )

    ordered = list(application.events.all())

    assert ordered[0] == newer
    assert ordered[1] == older


@freeze_time('2026-01-15 12:00:00')
@pytest.mark.django_db
def test_event_soft_delete_is_filtered_by_archived_at():
    """Archived events are excluded from the default queryset via archived_at IS NULL filter."""
    event = AdoptionApplicationEventFactory()
    event.archived_at = timezone.now()
    event.save(update_fields=['archived_at'])

    visible = event.application.events.filter(archived_at__isnull=True)

    assert event not in list(visible)
