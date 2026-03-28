import pytest

from base_feature_app.serializers.animal_create_update import (
    AnimalCreateUpdateSerializer,
)
from base_feature_app.serializers.animal_detail import AnimalDetailSerializer
from base_feature_app.serializers.animal_list import AnimalListSerializer


@pytest.mark.django_db
def test_animal_list_serializer_fields(animal):
    """List serializer returns expected fields."""
    data = AnimalListSerializer(animal).data

    assert data['id'] == animal.pk
    assert data['name'] == 'Luna'
    assert data['species'] == 'dog'
    assert data['shelter_name'] == 'Happy Paws'
    assert data['is_vaccinated'] is True
    assert 'created_at' in data


@pytest.mark.django_db
def test_animal_list_serializer_includes_new_filter_fields(animal):
    """List serializer includes energy_level and compatibility fields."""
    data = AnimalListSerializer(animal).data

    assert 'energy_level' in data
    assert 'good_with_kids' in data
    assert 'good_with_dogs' in data
    assert 'good_with_cats' in data


@pytest.mark.django_db
def test_animal_detail_serializer_fields(animal):
    """Detail serializer returns all fields including shelter info."""
    data = AnimalDetailSerializer(animal).data

    assert data['name'] == 'Luna'
    assert data['description'] == 'Friendly dog'
    assert data['shelter_name'] == 'Happy Paws'
    assert data['shelter_city'] == 'Bogotá'
    assert 'updated_at' in data


@pytest.mark.django_db
def test_animal_detail_serializer_includes_new_fields(animal):
    """Detail serializer returns all new animal fields."""
    data = AnimalDetailSerializer(animal).data

    for field in [
        'weight', 'is_house_trained', 'good_with_kids', 'good_with_dogs',
        'good_with_cats', 'energy_level', 'coat_color', 'intake_date', 'microchip_id',
    ]:
        assert field in data, f'Missing field: {field}'


@pytest.mark.django_db
def test_animal_create_update_serializer_valid(shelter):
    """Create serializer accepts valid data."""
    serializer = AnimalCreateUpdateSerializer(data={
        'shelter': shelter.pk,
        'name': 'Rocky',
        'species': 'dog',
        'age_range': 'puppy',
        'gender': 'male',
        'size': 'small',
        'description': 'A pup',
    })

    assert serializer.is_valid(), serializer.errors


@pytest.mark.django_db
def test_animal_create_update_serializer_rejects_invalid_species(shelter):
    """Create serializer rejects invalid species value."""
    serializer = AnimalCreateUpdateSerializer(data={
        'shelter': shelter.pk,
        'name': 'Ghost',
        'species': 'dragon',
    })

    assert not serializer.is_valid()
    assert 'species' in serializer.errors
