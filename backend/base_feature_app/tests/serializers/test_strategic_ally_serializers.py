import pytest

from base_feature_app.serializers.strategic_ally import StrategicAllySerializer
from base_feature_app.tests.factories import StrategicAllyFactory


@pytest.mark.django_db
def test_get_description_returns_es_by_default():
    """Description defaults to Spanish when no lang context."""
    ally = StrategicAllyFactory(description_es='Clinica veterinaria', description_en='Vet clinic')
    data = StrategicAllySerializer(ally).data
    assert data['description'] == 'Clinica veterinaria'


@pytest.mark.django_db
def test_get_description_falls_back_to_es_when_en_empty():
    """Empty English description falls back to Spanish."""
    ally = StrategicAllyFactory(description_es='Aliado local', description_en='')
    data = StrategicAllySerializer(ally, context={'lang': 'en'}).data
    assert data['description'] == 'Aliado local'


@pytest.mark.django_db
def test_get_logo_url_returns_empty_when_no_logo():
    """Ally without logo returns empty string for logo_url."""
    ally = StrategicAllyFactory()
    data = StrategicAllySerializer(ally).data
    assert data['logo_url'] == ''
