import pytest
from django.db import IntegrityError

from base_feature_app.models import Favorite


@pytest.mark.django_db
def test_favorite_str_representation(favorite):
    """__str__ contains user email and animal name."""
    result = str(favorite)
    assert 'user@example.com' in result
    assert 'Luna' in result


@pytest.mark.django_db
def test_favorite_unique_together(favorite, existing_user, animal):
    """Cannot create duplicate favorites for the same user + animal."""
    with pytest.raises(IntegrityError):
        Favorite.objects.create(user=existing_user, animal=animal)


@pytest.mark.django_db
def test_favorite_user_relationship(favorite, existing_user):
    """Favorite is linked to its user."""
    assert favorite.user == existing_user
    assert favorite in existing_user.favorites.all()
