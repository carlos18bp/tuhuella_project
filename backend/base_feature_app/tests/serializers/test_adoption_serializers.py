import pytest

from base_feature_app.serializers.adoption_create_update import (
    AdoptionCreateUpdateSerializer,
)
from base_feature_app.serializers.adoption_detail import AdoptionDetailSerializer
from base_feature_app.serializers.adoption_list import AdoptionListSerializer


@pytest.mark.django_db
def test_adoption_list_serializer_fields(adoption_application):
    """List serializer returns expected fields."""
    data = AdoptionListSerializer(adoption_application).data

    assert data['id'] == adoption_application.pk
    assert data['status'] == 'submitted'
    assert 'created_at' in data


@pytest.mark.django_db
def test_adoption_detail_serializer_fields(adoption_application):
    """Detail serializer returns all fields."""
    data = AdoptionDetailSerializer(adoption_application).data

    assert data['id'] == adoption_application.pk
    assert 'form_answers' in data
    assert 'notes' in data


@pytest.mark.django_db
def test_adoption_create_update_serializer_valid(animal):
    """Create serializer accepts valid data."""
    serializer = AdoptionCreateUpdateSerializer(data={
        'animal': animal.pk,
        'form_answers': {'reason': 'Love animals'},
        'notes': 'Please',
    })

    assert serializer.is_valid(), serializer.errors


@pytest.mark.django_db
def test_adoption_create_update_serializer_rejects_missing_animal():
    """Create serializer rejects missing animal."""
    serializer = AdoptionCreateUpdateSerializer(data={
        'form_answers': {'reason': 'Love animals'},
    })

    assert not serializer.is_valid()
    assert 'animal' in serializer.errors
