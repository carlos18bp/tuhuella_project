import pytest

from base_feature_app.models import AnimalStatusHistory
from base_feature_app.tests.factories import AnimalFactory, UserFactory


@pytest.mark.django_db
def test_animal_status_history_str_shows_transition():
    animal = AnimalFactory()
    history = AnimalStatusHistory.objects.create(
        animal=animal, previous_status='draft', new_status='published',
    )
    assert '→' in str(history)


@pytest.mark.django_db
def test_animal_status_history_ordering_is_newest_first():
    animal = AnimalFactory()
    h1 = AnimalStatusHistory.objects.create(animal=animal, new_status='published')
    h2 = AnimalStatusHistory.objects.create(animal=animal, new_status='adopted')
    qs = list(AnimalStatusHistory.objects.filter(animal=animal))
    assert qs[0] == h2
    assert qs[1] == h1


@pytest.mark.django_db
def test_animal_status_history_changed_by_can_be_null():
    animal = AnimalFactory()
    history = AnimalStatusHistory.objects.create(
        animal=animal, new_status='published', changed_by=None,
    )
    assert history.changed_by is None


@pytest.mark.django_db
def test_animal_status_history_fk_cascades_on_animal_delete():
    animal = AnimalFactory()
    AnimalStatusHistory.objects.create(animal=animal, new_status='published')
    animal.delete()
    assert AnimalStatusHistory.objects.count() == 0


@pytest.mark.django_db
def test_animal_status_history_reason_defaults_to_empty():
    animal = AnimalFactory()
    history = AnimalStatusHistory.objects.create(animal=animal, new_status='published')
    assert history.reason == ''
