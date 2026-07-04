import pytest

from base_feature_app.models import VolunteerPosition
from base_feature_app.tests.factories import VolunteerPositionFactory


@pytest.mark.django_db
def test_position_persists_and_str_returns_title():
    position = VolunteerPositionFactory(title_es='Paseador de perros')
    assert VolunteerPosition.objects.filter(pk=position.pk).exists()
    assert str(position) == 'Paseador de perros'


@pytest.mark.django_db
def test_category_choice_is_stored():
    position = VolunteerPositionFactory(category=VolunteerPosition.Category.DRIVER)
    position.refresh_from_db()
    assert position.category == 'driver'


@pytest.mark.django_db
def test_defaults_to_active_with_zero_order():
    position = VolunteerPosition.objects.create(
        title_es='Fotógrafo', description_es='Toma fotos de los animales.',
        category=VolunteerPosition.Category.PHOTOGRAPHER,
    )
    assert position.is_active is True
    assert position.order == 0


@pytest.mark.django_db
def test_positions_ordered_by_order_then_recency():
    VolunteerPositionFactory(title_es='segundo', order=2)
    VolunteerPositionFactory(title_es='primero', order=1)
    titles = list(VolunteerPosition.objects.values_list('title_es', flat=True))
    assert titles == ['primero', 'segundo']
