import pytest
from django.urls import reverse
from rest_framework import status

from base_feature_app.models import Animal


@pytest.mark.django_db
def test_animal_list_returns_only_published(api_client, shelter, animal):
    """Only published animals appear in the public list."""
    Animal.objects.create(
        shelter=shelter,
        name='Hidden',
        species=Animal.Species.CAT,
        status=Animal.Status.DRAFT,
    )
    response = api_client.get(reverse('animal-list'))

    assert response.status_code == status.HTTP_200_OK
    names = [a['name'] for a in response.json()]
    assert 'Luna' in names
    assert 'Hidden' not in names


@pytest.mark.django_db
def test_animal_list_filters_by_species(api_client, shelter, animal):
    """Species query param filters the animal list."""
    Animal.objects.create(
        shelter=shelter,
        name='Michi',
        species=Animal.Species.CAT,
        status=Animal.Status.PUBLISHED,
    )
    response = api_client.get(reverse('animal-list'), {'species': 'cat'})

    assert response.status_code == status.HTTP_200_OK
    names = [a['name'] for a in response.json()]
    assert 'Michi' in names
    assert 'Luna' not in names


@pytest.mark.django_db
def test_animal_list_filters_by_size(api_client, animal):
    """Size query param filters the animal list."""
    response = api_client.get(reverse('animal-list'), {'size': 'medium'})

    assert response.status_code == status.HTTP_200_OK
    assert len(response.json()) == 1
    assert response.json()[0]['name'] == 'Luna'


@pytest.mark.django_db
def test_animal_detail_returns_existing(api_client, animal):
    """Detail endpoint returns a specific animal by pk."""
    response = api_client.get(reverse('animal-detail', args=[animal.pk]))

    assert response.status_code == status.HTTP_200_OK
    assert response.json()['name'] == 'Luna'


@pytest.mark.django_db
def test_animal_detail_returns_404_for_missing(api_client):
    """Detail endpoint returns 404 for non-existent pk."""
    response = api_client.get(reverse('animal-detail', args=[99999]))

    assert response.status_code == status.HTTP_404_NOT_FOUND


@pytest.mark.django_db
def test_animal_create_requires_auth(api_client):
    """Unauthenticated users cannot create animals."""
    response = api_client.post(
        reverse('animal-create'),
        {'name': 'Ghost'},
        format='json',
    )

    assert response.status_code == status.HTTP_401_UNAUTHORIZED


@pytest.mark.django_db
def test_animal_create_success(shelter_admin_client, shelter):
    """Authenticated user can create an animal."""
    response = shelter_admin_client.post(
        reverse('animal-create'),
        {
            'shelter': shelter.pk,
            'name': 'Rocky',
            'species': 'dog',
            'age_range': 'puppy',
            'gender': 'male',
            'size': 'small',
            'description': 'A tiny pup',
        },
        format='json',
    )

    assert response.status_code == status.HTTP_201_CREATED
    assert Animal.objects.filter(name='Rocky').exists()


@pytest.mark.django_db
def test_animal_update_by_shelter_owner(shelter_admin_client, animal):
    """Shelter owner can update their animal."""
    response = shelter_admin_client.patch(
        reverse('animal-update', args=[animal.pk]),
        {'name': 'Luna Updated'},
        format='json',
    )

    assert response.status_code == status.HTTP_200_OK
    animal.refresh_from_db()
    assert animal.name == 'Luna Updated'


@pytest.mark.django_db
def test_animal_update_denied_for_non_owner(authenticated_client, animal):
    """Non-owner cannot update an animal."""
    response = authenticated_client.patch(
        reverse('animal-update', args=[animal.pk]),
        {'name': 'Hijacked'},
        format='json',
    )

    assert response.status_code == status.HTTP_403_FORBIDDEN
    animal.refresh_from_db()
    assert animal.name == 'Luna'


@pytest.mark.django_db
def test_animal_delete_by_shelter_owner(shelter_admin_client, animal):
    """Shelter owner can delete their animal."""
    pk = animal.pk
    response = shelter_admin_client.delete(reverse('animal-delete', args=[pk]))

    assert response.status_code == status.HTTP_204_NO_CONTENT
    assert not Animal.objects.filter(pk=pk).exists()


@pytest.mark.django_db
def test_animal_delete_denied_for_non_owner(authenticated_client, animal):
    """Non-owner cannot delete an animal."""
    response = authenticated_client.delete(reverse('animal-delete', args=[animal.pk]))

    assert response.status_code == status.HTTP_403_FORBIDDEN
    assert Animal.objects.filter(pk=animal.pk).exists()
