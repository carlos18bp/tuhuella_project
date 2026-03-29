import pytest

from base_feature_app.serializers.favorite import FavoriteSerializer


@pytest.mark.django_db
def test_favorite_serializer_fields(favorite):
    """Serializer returns animal_name, animal_species, and shelter_name."""
    data = FavoriteSerializer(favorite).data

    assert data['id'] == favorite.pk
    assert data['animal'] == favorite.animal.pk
    assert data['animal_name'] == 'Luna'
    assert data['animal_species'] == 'dog'
    assert data['shelter_name'] == 'Happy Paws'
    assert 'created_at' in data


@pytest.mark.django_db
def test_favorite_serializer_excludes_user(favorite):
    """Serializer does not expose user field."""
    data = FavoriteSerializer(favorite).data

    assert 'user' not in data
