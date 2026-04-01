from types import SimpleNamespace

import pytest

from base_feature_app.serializers.update_post_create_update import (
    UpdatePostCreateUpdateSerializer,
)
from base_feature_app.serializers.update_post_detail import UpdatePostDetailSerializer
from base_feature_app.serializers.update_post_list import UpdatePostListSerializer


@pytest.mark.django_db
def test_update_post_list_serializer_fields(update_post):
    """List serializer returns expected fields."""
    data = UpdatePostListSerializer(update_post).data

    assert data['id'] == update_post.pk
    assert data['title'] == 'Luna recovered!'
    assert data['shelter_name'] == 'Happy Paws'
    assert 'created_at' in data


@pytest.mark.django_db
def test_update_post_detail_serializer_includes_content(update_post):
    """Detail serializer includes content and updated_at."""
    data = UpdatePostDetailSerializer(update_post).data

    assert data['title'] == 'Luna recovered!'
    assert data['content'] == 'Luna is doing great after surgery.'
    assert 'updated_at' in data
    assert data['shelter_name'] == 'Happy Paws'


@pytest.mark.django_db
def test_update_post_create_update_serializer_valid(shelter):
    """Create serializer accepts valid data."""
    serializer = UpdatePostCreateUpdateSerializer(data={
        'shelter': shelter.pk,
        'title_es': 'New arrival',
        'content_es': 'We just rescued a kitten!',
    })

    assert serializer.is_valid(), serializer.errors


@pytest.mark.django_db
def test_update_post_create_update_serializer_rejects_missing_title(shelter):
    """Create serializer rejects missing title."""
    serializer = UpdatePostCreateUpdateSerializer(data={
        'shelter': shelter.pk,
        'content_es': 'Some content',
    })

    assert not serializer.is_valid()
    assert 'title_es' in serializer.errors


@pytest.mark.django_db
def test_update_post_create_update_serializer_image_url_is_null_without_image(update_post):
    """Read representation sets image_url to null when the post has no image."""
    data = UpdatePostCreateUpdateSerializer(update_post).data

    assert data['image_url'] is None


def test_update_post_create_update_get_image_url_returns_none_when_image_missing():
    """SerializerMethodField returns None when the instance has no image."""
    serializer = UpdatePostCreateUpdateSerializer()
    obj = SimpleNamespace(image=None)

    assert serializer.get_image_url(obj) is None


def test_update_post_create_update_get_image_url_returns_url_when_image_present():
    """SerializerMethodField returns the storage URL when image exposes url."""
    serializer = UpdatePostCreateUpdateSerializer()
    obj = SimpleNamespace(image=SimpleNamespace(url='/media/update/photo.jpg'))

    assert serializer.get_image_url(obj) == '/media/update/photo.jpg'
