import pytest

from base_feature_app.serializers.update_post_list import UpdatePostListSerializer
from base_feature_app.serializers.update_post_detail import UpdatePostDetailSerializer
from base_feature_app.serializers.update_post_create_update import UpdatePostCreateUpdateSerializer


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
        'title': 'New arrival',
        'content': 'We just rescued a kitten!',
    })

    assert serializer.is_valid(), serializer.errors


@pytest.mark.django_db
def test_update_post_create_update_serializer_rejects_missing_title(shelter):
    """Create serializer rejects missing title."""
    serializer = UpdatePostCreateUpdateSerializer(data={
        'shelter': shelter.pk,
        'content': 'Some content',
    })

    assert not serializer.is_valid()
    assert 'title' in serializer.errors
