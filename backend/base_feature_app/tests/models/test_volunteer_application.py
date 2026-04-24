import pytest
from django.utils import timezone
from freezegun import freeze_time

from base_feature_app.models import VolunteerApplication
from base_feature_app.tests.factories import UserFactory, VolunteerPositionFactory


@pytest.mark.django_db
def test_volunteer_application_str_shows_email_and_position():
    user = UserFactory(email='vol@example.com')
    position = VolunteerPositionFactory(title_es='Cuidador')
    app = VolunteerApplication.objects.create(
        user=user, position=position, motivation='I love animals',
    )
    result = str(app)
    assert 'vol@example.com' in result
    assert 'Cuidador' in result


@pytest.mark.django_db
def test_volunteer_application_status_defaults_to_pending():
    user = UserFactory()
    position = VolunteerPositionFactory()
    app = VolunteerApplication.objects.create(
        user=user, position=position, motivation='Motivated',
    )
    assert app.status == VolunteerApplication.Status.PENDING


@pytest.mark.django_db
def test_volunteer_application_is_archived_false_by_default():
    user = UserFactory()
    position = VolunteerPositionFactory()
    app = VolunteerApplication.objects.create(
        user=user, position=position, motivation='Motivated',
    )
    assert app.is_archived is False


@pytest.mark.django_db
@freeze_time('2026-01-15')
def test_volunteer_application_archive_sets_is_archived_true():
    user = UserFactory()
    position = VolunteerPositionFactory()
    app = VolunteerApplication.objects.create(
        user=user, position=position, motivation='Motivated',
    )
    app.archived_at = timezone.now()
    assert app.is_archived is True


@pytest.mark.django_db
def test_volunteer_application_cascades_on_user_delete():
    user = UserFactory()
    position = VolunteerPositionFactory()
    VolunteerApplication.objects.create(user=user, position=position, motivation='Test')
    user.delete()
    assert VolunteerApplication.objects.count() == 0


@pytest.mark.django_db
def test_volunteer_application_ordering_is_newest_first():
    user = UserFactory()
    position = VolunteerPositionFactory()
    a1 = VolunteerApplication.objects.create(user=user, position=position, motivation='First')
    a2 = VolunteerApplication.objects.create(user=user, position=position, motivation='Second')
    qs = list(VolunteerApplication.objects.filter(user=user))
    assert qs[0] == a2
    assert qs[1] == a1
