from datetime import timedelta

import pytest
from django.utils import timezone

from base_feature_app.tests.factories import (
    AdoptionApplicationEventFactory,
    AdoptionApplicationFactory,
)


@pytest.mark.django_db
def test_event_orders_by_event_date_desc():
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


@pytest.mark.django_db
def test_event_soft_delete_is_filtered_by_archived_at():
    event = AdoptionApplicationEventFactory()
    event.archived_at = timezone.now()
    event.save(update_fields=['archived_at'])

    visible = event.application.events.filter(archived_at__isnull=True)

    assert event not in list(visible)
