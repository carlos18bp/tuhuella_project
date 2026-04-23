import pytest
from django.utils import timezone
from freezegun import freeze_time

from base_feature_app.models import VolunteerApplication
from base_feature_app.tests.factories import UserFactory, VolunteerPositionFactory


def _make_volunteer_application():
    user = UserFactory()
    position = VolunteerPositionFactory()
    return VolunteerApplication.objects.create(
        user=user, position=position, motivation='Testing mixins',
    )


@pytest.mark.django_db
def test_archivable_model_is_archived_false_when_no_archived_at():
    instance = _make_volunteer_application()
    assert instance.archived_at is None
    assert instance.is_archived is False


@pytest.mark.django_db
@freeze_time('2026-01-15')
def test_archivable_model_is_archived_true_when_archived_at_set():
    instance = _make_volunteer_application()
    instance.archived_at = timezone.now()
    assert instance.is_archived is True


@pytest.mark.django_db
def test_archivable_model_archived_at_field_nullable():
    instance = _make_volunteer_application()
    instance.archived_at = None
    instance.save(update_fields=['archived_at'])
    instance.refresh_from_db()
    assert instance.archived_at is None
