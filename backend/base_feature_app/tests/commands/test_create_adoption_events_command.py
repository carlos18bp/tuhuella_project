import pytest
from django.core.management import call_command
from django.utils import timezone
from freezegun import freeze_time

from base_feature_app.models import (
    AdoptionApplication,
    AdoptionApplicationEvent,
)
from base_feature_app.tests.factories import (
    AdoptionApplicationEventFactory,
    AdoptionApplicationFactory,
    AnimalFactory,
    ShelterAdminUserFactory,
    ShelterFactory,
    UserFactory,
    WebManagerUserFactory,
)


@pytest.mark.django_db
def test_create_adoption_events_only_for_interview_and_approved():
    """create_adoption_events skips submitted/reviewing/rejected applications."""
    WebManagerUserFactory()
    shelter_owner = ShelterAdminUserFactory()
    shelter = ShelterFactory(owner=shelter_owner)
    animal = AnimalFactory(shelter=shelter)

    interview_app = AdoptionApplicationFactory(
        animal=animal,
        user=UserFactory(),
        status=AdoptionApplication.Status.INTERVIEW,
    )
    approved_app = AdoptionApplicationFactory(
        animal=AnimalFactory(shelter=shelter),
        user=UserFactory(),
        status=AdoptionApplication.Status.APPROVED,
    )
    submitted_app = AdoptionApplicationFactory(
        animal=AnimalFactory(shelter=shelter),
        user=UserFactory(),
        status=AdoptionApplication.Status.SUBMITTED,
    )
    rejected_app = AdoptionApplicationFactory(
        animal=AnimalFactory(shelter=shelter),
        user=UserFactory(),
        status=AdoptionApplication.Status.REJECTED,
    )

    call_command('create_adoption_events')

    assert AdoptionApplicationEvent.objects.filter(application=interview_app).exists()
    assert AdoptionApplicationEvent.objects.filter(application=approved_app).exists()
    assert not AdoptionApplicationEvent.objects.filter(application=submitted_app).exists()
    assert not AdoptionApplicationEvent.objects.filter(application=rejected_app).exists()


@freeze_time('2026-01-15 12:00:00')
@pytest.mark.django_db
def test_create_adoption_events_event_date_not_in_future():
    """All generated events have event_date <= now (serializer validator rejects future dates)."""
    WebManagerUserFactory()
    shelter = ShelterFactory(owner=ShelterAdminUserFactory())
    AdoptionApplicationFactory(
        animal=AnimalFactory(shelter=shelter),
        user=UserFactory(),
        status=AdoptionApplication.Status.INTERVIEW,
    )

    call_command('create_adoption_events')

    now = timezone.now()
    events = AdoptionApplicationEvent.objects.all()
    assert events.exists()
    for event in events:
        assert event.event_date <= now


@pytest.mark.django_db
def test_create_adoption_events_clear_archives_existing():
    """--clear archives existing events instead of deleting them."""
    WebManagerUserFactory()
    shelter = ShelterFactory(owner=ShelterAdminUserFactory())
    application = AdoptionApplicationFactory(
        animal=AnimalFactory(shelter=shelter),
        user=UserFactory(),
        status=AdoptionApplication.Status.INTERVIEW,
    )
    legacy_event = AdoptionApplicationEventFactory(application=application)
    legacy_pk = legacy_event.pk

    call_command('create_adoption_events', '--clear')

    legacy_event.refresh_from_db()
    assert legacy_event.archived_at is not None
    assert AdoptionApplicationEvent.objects.filter(pk=legacy_pk).exists()
    # New events were created (not archived).
    assert AdoptionApplicationEvent.objects.filter(
        application=application, archived_at__isnull=True,
    ).exists()
