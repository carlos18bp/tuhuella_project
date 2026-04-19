import pytest
from django.utils import timezone

from base_feature_app.models import PostAdoptionFollowUp
from base_feature_app.tests.factories import (
    AdoptionApplicationFactory, AnimalFactory, UserFactory,
)


def _make_follow_up(**kwargs):
    application = AdoptionApplicationFactory()
    defaults = dict(
        adoption_application=application,
        animal=application.animal,
        adopter=application.user,
        scheduled_date=timezone.now().date(),
    )
    defaults.update(kwargs)
    return PostAdoptionFollowUp.objects.create(**defaults)


@pytest.mark.django_db
def test_post_adoption_follow_up_str_shows_pk_and_status():
    follow_up = _make_follow_up()
    result = str(follow_up)
    assert str(follow_up.pk) in result
    assert follow_up.status in result


@pytest.mark.django_db
def test_post_adoption_follow_up_status_defaults_to_pending():
    follow_up = _make_follow_up()
    assert follow_up.status == PostAdoptionFollowUp.Status.PENDING


@pytest.mark.django_db
def test_post_adoption_follow_up_is_archived_false_by_default():
    follow_up = _make_follow_up()
    assert follow_up.is_archived is False


@pytest.mark.django_db
def test_post_adoption_follow_up_assigned_vet_is_optional():
    follow_up = _make_follow_up(assigned_veterinarian=None)
    assert follow_up.assigned_veterinarian is None


@pytest.mark.django_db
def test_post_adoption_follow_up_completed_date_is_optional():
    follow_up = _make_follow_up()
    assert follow_up.completed_date is None


@pytest.mark.django_db
def test_post_adoption_follow_up_ordering_is_newest_first():
    f1 = _make_follow_up()
    f2 = _make_follow_up()
    qs = list(PostAdoptionFollowUp.objects.all())
    assert qs[0] == f2
    assert qs[1] == f1
