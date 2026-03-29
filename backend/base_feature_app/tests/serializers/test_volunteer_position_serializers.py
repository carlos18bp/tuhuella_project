import pytest

from base_feature_app.serializers.volunteer_position import VolunteerPositionSerializer
from base_feature_app.tests.factories import VolunteerPositionFactory


@pytest.mark.django_db
def test_get_title_returns_es_by_default():
    """Title defaults to Spanish when no lang context is provided."""
    position = VolunteerPositionFactory(title_es='Cuidador', title_en='Caretaker')
    data = VolunteerPositionSerializer(position).data
    assert data['title'] == 'Cuidador'


@pytest.mark.django_db
def test_get_title_returns_en_when_requested():
    """Title returns English when lang=en in context."""
    position = VolunteerPositionFactory(title_es='Cuidador', title_en='Caretaker')
    data = VolunteerPositionSerializer(position, context={'lang': 'en'}).data
    assert data['title'] == 'Caretaker'


@pytest.mark.django_db
def test_get_description_falls_back_to_es_when_en_empty():
    """Empty English description falls back to Spanish."""
    position = VolunteerPositionFactory(
        description_es='Ayudar en el refugio',
        description_en='',
    )
    data = VolunteerPositionSerializer(position, context={'lang': 'en'}).data
    assert data['description'] == 'Ayudar en el refugio'


@pytest.mark.django_db
def test_get_requirements_returns_lang_specific():
    """Requirements return the requested language version."""
    position = VolunteerPositionFactory(
        requirements_es='Ser mayor de edad',
        requirements_en='Must be 18+',
    )
    data = VolunteerPositionSerializer(position, context={'lang': 'en'}).data
    assert data['requirements'] == 'Must be 18+'
