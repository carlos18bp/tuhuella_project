import pytest
from django.urls import reverse
from rest_framework import status

from base_feature_app.models import Favorite


@pytest.mark.django_db
def test_favorite_list_requires_auth(api_client):
    """Unauthenticated users cannot list favorites."""
    response = api_client.get(reverse('favorite-list'))

    assert response.status_code == status.HTTP_401_UNAUTHORIZED


@pytest.mark.django_db
def test_favorite_list_returns_own(authenticated_client, favorite):
    """User sees only their own favorites."""
    response = authenticated_client.get(reverse('favorite-list'))

    assert response.status_code == status.HTTP_200_OK
    assert len(response.json()) == 1


@pytest.mark.django_db
def test_favorite_toggle_requires_auth(api_client):
    """Unauthenticated users cannot toggle favorites."""
    response = api_client.post(
        reverse('favorite-toggle'),
        {'animal_id': 1},
        format='json',
    )

    assert response.status_code == status.HTTP_401_UNAUTHORIZED


@pytest.mark.django_db
def test_favorite_toggle_adds_favorite(authenticated_client, animal):
    """Toggling a non-favorited animal adds it."""
    response = authenticated_client.post(
        reverse('favorite-toggle'),
        {'animal_id': animal.pk},
        format='json',
    )

    assert response.status_code == status.HTTP_201_CREATED
    assert response.json()['status'] == 'added'
    assert Favorite.objects.filter(user__email='user@example.com', animal=animal).exists()


@pytest.mark.django_db
def test_favorite_toggle_removes_existing(authenticated_client, favorite, animal):
    """Toggling an already-favorited animal removes it."""
    response = authenticated_client.post(
        reverse('favorite-toggle'),
        {'animal_id': animal.pk},
        format='json',
    )

    assert response.status_code == status.HTTP_200_OK
    assert response.json()['status'] == 'removed'
    assert not Favorite.objects.filter(user__email='user@example.com', animal=animal).exists()


@pytest.mark.django_db
def test_favorite_toggle_requires_animal_id(authenticated_client):
    """Missing animal_id returns 400."""
    response = authenticated_client.post(
        reverse('favorite-toggle'),
        {},
        format='json',
    )

    assert response.status_code == status.HTTP_400_BAD_REQUEST


@pytest.mark.django_db
def test_favorite_toggle_returns_404_for_missing_animal(authenticated_client):
    """Non-existent animal_id returns 404."""
    response = authenticated_client.post(
        reverse('favorite-toggle'),
        {'animal_id': 99999},
        format='json',
    )

    assert response.status_code == status.HTTP_404_NOT_FOUND


@pytest.mark.django_db
def test_favorite_list_returns_enriched_fields(authenticated_client, favorite):
    """Enriched serializer returns breed, size, status, shelter_city, etc."""
    response = authenticated_client.get(reverse('favorite-list'))

    assert response.status_code == status.HTTP_200_OK
    data = response.json()[0]
    assert 'breed' in data
    assert 'age_range' in data
    assert 'size' in data
    assert 'gender' in data
    assert 'is_vaccinated' in data
    assert 'is_sterilized' in data
    assert 'status' in data
    assert 'shelter_city' in data
    assert 'thumbnail_url' in data
    assert 'note' in data


@pytest.mark.django_db
def test_favorite_toggle_add_returns_full_favorite(authenticated_client, animal):
    """Toggle add returns the full serialized favorite object."""
    response = authenticated_client.post(
        reverse('favorite-toggle'),
        {'animal_id': animal.pk},
        format='json',
    )

    assert response.status_code == status.HTTP_201_CREATED
    data = response.json()
    assert data['status'] == 'added'
    assert 'favorite' in data
    assert data['favorite']['animal_name'] == animal.name
    assert data['favorite']['breed'] == animal.breed


@pytest.mark.django_db
def test_favorite_update_note(authenticated_client, favorite):
    """PATCH endpoint updates the note field."""
    response = authenticated_client.patch(
        reverse('favorite-update', args=[favorite.pk]),
        {'note': 'Me encanta este animal'},
        format='json',
    )

    assert response.status_code == status.HTTP_200_OK
    assert response.json()['note'] == 'Me encanta este animal'
    favorite.refresh_from_db()
    assert favorite.note == 'Me encanta este animal'


@pytest.mark.django_db
def test_favorite_update_requires_auth(api_client, favorite):
    """Unauthenticated users cannot update favorites."""
    response = api_client.patch(
        reverse('favorite-update', args=[favorite.pk]),
        {'note': 'Hacker'},
        format='json',
    )

    assert response.status_code == status.HTTP_401_UNAUTHORIZED


@pytest.mark.django_db
def test_favorite_update_other_user_returns_404(authenticated_client, other_user, animal):
    """Users cannot update another user's favorite."""
    other_fav = Favorite.objects.create(user=other_user, animal=animal)

    response = authenticated_client.patch(
        reverse('favorite-update', args=[other_fav.pk]),
        {'note': 'Not mine'},
        format='json',
    )

    assert response.status_code == status.HTTP_404_NOT_FOUND
