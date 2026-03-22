import pytest

from base_feature_app.serializers.shelter_list import ShelterListSerializer
from base_feature_app.serializers.shelter_detail import ShelterDetailSerializer
from base_feature_app.serializers.shelter_create_update import ShelterCreateUpdateSerializer


@pytest.mark.django_db
def test_shelter_list_serializer_fields(shelter):
    """List serializer returns expected fields."""
    data = ShelterListSerializer(shelter).data

    assert data['id'] == shelter.pk
    assert data['name'] == 'Happy Paws'
    assert data['city'] == 'Bogotá'
    assert data['verification_status'] == 'verified'
    assert data['owner_email'] == 'shelteradmin@example.com'
    assert 'created_at' in data


@pytest.mark.django_db
def test_shelter_detail_serializer_fields(shelter):
    """Detail serializer returns all expected fields including computed ones."""
    data = ShelterDetailSerializer(shelter).data

    assert data['name'] == 'Happy Paws'
    assert data['legal_name'] == 'Happy Paws Foundation'
    assert data['description'] == 'A great shelter'
    assert data['phone'] == '3001234567'
    assert data['email'] == 'info@happypaws.org'
    assert data['is_verified'] is True
    assert 'updated_at' in data


@pytest.mark.django_db
def test_shelter_create_update_serializer_valid(shelter_admin_user):
    """Create serializer accepts valid data."""
    serializer = ShelterCreateUpdateSerializer(data={
        'name': 'Test Shelter',
        'city': 'Cali',
        'description': 'New shelter',
        'phone': '3009999999',
        'email': 'test@shelter.org',
    })

    assert serializer.is_valid(), serializer.errors


@pytest.mark.django_db
def test_shelter_create_update_serializer_rejects_missing_name():
    """Create serializer rejects missing name."""
    serializer = ShelterCreateUpdateSerializer(data={
        'city': 'Cali',
    })

    assert not serializer.is_valid()
    assert 'name' in serializer.errors
