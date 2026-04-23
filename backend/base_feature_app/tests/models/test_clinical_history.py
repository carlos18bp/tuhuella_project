import pytest
from django.utils import timezone
from freezegun import freeze_time

from base_feature_app.models import ClinicalHistoryEntry
from base_feature_app.tests.factories import AnimalFactory, UserFactory


def _make_entry(animal, **kwargs):
    defaults = dict(
        entry_type=ClinicalHistoryEntry.EntryType.CHECKUP,
        title='Routine checkup',
        occurred_at=timezone.now(),
    )
    defaults.update(kwargs)
    return ClinicalHistoryEntry.objects.create(animal=animal, **defaults)


@pytest.mark.django_db
def test_clinical_history_entry_str_shows_type_and_title():
    animal = AnimalFactory()
    entry = _make_entry(animal, title='Rabies shot')
    result = str(entry)
    assert 'Rabies shot' in result


@pytest.mark.django_db
def test_clinical_history_entry_ordering_is_newest_first():
    animal = AnimalFactory()
    with freeze_time('2026-01-15 09:00:00'):
        e1 = _make_entry(animal, occurred_at=timezone.now())
    with freeze_time('2026-01-15 10:00:00'):
        e2 = _make_entry(animal, occurred_at=timezone.now())
    qs = list(ClinicalHistoryEntry.objects.filter(animal=animal))
    assert qs[0] == e2
    assert qs[1] == e1


@pytest.mark.django_db
def test_clinical_history_entry_follow_up_is_optional():
    animal = AnimalFactory()
    entry = _make_entry(animal, follow_up=None)
    assert entry.follow_up is None


@pytest.mark.django_db
def test_clinical_history_entry_author_can_be_null():
    animal = AnimalFactory()
    entry = _make_entry(animal, author=None)
    assert entry.author is None


@pytest.mark.django_db
def test_clinical_history_entry_attachment_urls_defaults_to_list():
    animal = AnimalFactory()
    entry = _make_entry(animal)
    assert entry.attachment_urls == []
