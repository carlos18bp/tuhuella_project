import pytest
from django.core.files.uploadedfile import SimpleUploadedFile

from base_feature_app.serializers.shelter_create_update import (
    ShelterCreateUpdateSerializer,
)
from base_feature_app.serializers.shelter_detail import ShelterDetailSerializer
from base_feature_app.serializers.shelter_list import ShelterListSerializer


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
        'description_es': 'New shelter',
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


@pytest.mark.django_db
def test_shelter_detail_serializer_video_url_empty_when_no_video(shelter):
    """video_url is an empty string when the shelter has no uploaded video."""
    data = ShelterDetailSerializer(shelter).data

    assert 'video_url' in data
    assert data['video_url'] == ''


@pytest.mark.django_db
def test_shelter_detail_serializer_video_url_populated_when_video_set(
    shelter, settings, tmp_path
):
    """video_url returns the uploaded file URL under /media/shelters/videos/."""
    settings.MEDIA_ROOT = str(tmp_path)

    shelter.video = SimpleUploadedFile(
        'demo.mp4', b'\x00\x00\x00\x18ftypmp42', content_type='video/mp4'
    )
    shelter.save()

    data = ShelterDetailSerializer(shelter).data

    assert data['video_url'].startswith('/media/shelters/videos/')
    assert data['video_url'].endswith('.mp4')


@pytest.mark.django_db
def test_shelter_create_update_serializer_accepts_blank_website():
    """Website is optional; empty string is valid."""
    serializer = ShelterCreateUpdateSerializer(data={
        'name': 'No Web Shelter',
        'city': 'Medellín',
        'description_es': 'Sin sitio web',
        'phone': '3001112233',
        'website': '',
    })

    assert serializer.is_valid(), serializer.errors
