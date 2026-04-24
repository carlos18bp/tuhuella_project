import pytest
from django.db import IntegrityError
from django.utils import timezone
from freezegun import freeze_time

from base_feature_app.models import Animal, AnimalDiseaseScreening
from base_feature_app.serializers.animal_create_update import AnimalCreateUpdateSerializer
from base_feature_app.serializers.animal_detail import AnimalDetailSerializer


@pytest.mark.django_db
def test_screening_unique_together_rejects_duplicates(animal):
    screening = AnimalDiseaseScreening.objects.create(
        animal=animal,
        disease_key='parvovirus',
        result=AnimalDiseaseScreening.Result.NEGATIVE,
    )
    assert screening.pk is not None
    with pytest.raises(IntegrityError):
        AnimalDiseaseScreening.objects.create(
            animal=animal,
            disease_key='parvovirus',
            result=AnimalDiseaseScreening.Result.POSITIVE,
        )


@pytest.mark.django_db
def test_screening_default_result_is_not_tested(animal):
    s = AnimalDiseaseScreening.objects.create(animal=animal, disease_key='fiv')
    assert s.result == AnimalDiseaseScreening.Result.NOT_TESTED


@pytest.mark.django_db
@freeze_time('2026-01-15')
def test_detail_serializer_exposes_disease_screenings(animal):
    AnimalDiseaseScreening.objects.create(
        animal=animal,
        disease_key='distemper',
        result=AnimalDiseaseScreening.Result.NEGATIVE,
        tested_on=timezone.now().date(),
        notes='PCR test',
    )
    data = AnimalDetailSerializer(animal).data
    screenings = data['disease_screenings']
    assert len(screenings) == 1
    assert screenings[0]['disease_key'] == 'distemper'
    assert screenings[0]['result'] == 'negative'
    assert screenings[0]['notes'] == 'PCR test'


@pytest.mark.django_db
def test_create_update_serializer_persists_health_fields(shelter, shelter_admin_user):
    """AnimalCreateUpdateSerializer saves deworming flag and bilingual medical notes correctly."""
    class _Request:
        def __init__(self, u):
            self.user = u

    payload = {
        'shelter': shelter.id,
        'name': 'Rocky',
        'species': Animal.Species.DOG,
        'is_dewormed': True,
        'medical_notes_es': 'Sin alergias conocidas',
        'medical_notes_en': 'No known allergies',
    }
    serializer = AnimalCreateUpdateSerializer(
        data=payload,
        context={'request': _Request(shelter_admin_user)},
    )
    assert serializer.is_valid(), serializer.errors
    instance = serializer.save()
    assert instance.is_dewormed is True
    assert instance.medical_notes_es == 'Sin alergias conocidas'
    assert instance.medical_notes_en == 'No known allergies'
