import pytest

from base_feature_app.serializers.animal_disease import DiseaseScreeningSerializer
from base_feature_app.tests.factories import AnimalDiseaseScreeningFactory


@pytest.mark.django_db
def test_screening_serializer_exposes_disease_fields():
    """Screening serializer surfaces disease key, result, notes."""
    screening = AnimalDiseaseScreeningFactory(
        disease_key='parvovirus', result='negative', notes='Sin hallazgos.',
    )
    data = DiseaseScreeningSerializer(screening).data
    assert data['disease_key'] == 'parvovirus'
    assert data['result'] == 'negative'
    assert data['notes'] == 'Sin hallazgos.'


def test_screening_serializer_accepts_valid_payload():
    """Screening serializer validates a well-formed payload."""
    ser = DiseaseScreeningSerializer(data={'disease_key': 'parvovirus', 'result': 'negative'})
    assert ser.is_valid() is True
