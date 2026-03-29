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
    names = [a['name'] for a in response.json()['results']]
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
    names = [a['name'] for a in response.json()['results']]
    assert 'Michi' in names
    assert 'Luna' not in names


@pytest.mark.django_db
def test_animal_list_filters_by_size(api_client, animal):
    """Size query param filters the animal list."""
    response = api_client.get(reverse('animal-list'), {'size': 'medium'})

    assert response.status_code == status.HTTP_200_OK
    results = response.json()['results']
    assert len(results) == 1
    assert results[0]['name'] == 'Luna'


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


@pytest.mark.django_db
def test_animal_list_filters_by_age_range(api_client, animal):
    """age_range query param filters the animal list."""
    response = api_client.get(reverse('animal-list'), {'age_range': 'young'})

    assert response.status_code == status.HTTP_200_OK
    results = response.json()['results']
    assert len(results) == 1
    assert results[0]['name'] == 'Luna'


@pytest.mark.django_db
def test_animal_list_filters_by_shelter(api_client, animal, shelter):
    """shelter query param filters the animal list."""
    response = api_client.get(reverse('animal-list'), {'shelter': shelter.pk})

    assert response.status_code == status.HTTP_200_OK
    results = response.json()['results']
    assert len(results) == 1
    assert results[0]['name'] == 'Luna'


@pytest.mark.django_db
def test_animal_list_filters_by_gender(api_client, animal):
    """gender query param filters the animal list."""
    response = api_client.get(reverse('animal-list'), {'gender': 'female'})

    assert response.status_code == status.HTTP_200_OK
    results = response.json()['results']
    assert len(results) == 1
    assert results[0]['name'] == 'Luna'


@pytest.mark.django_db
def test_animal_create_returns_400_for_invalid_data(shelter_admin_client):
    """Invalid payload returns 400 with serializer errors."""
    response = shelter_admin_client.post(
        reverse('animal-create'),
        {},
        format='json',
    )

    assert response.status_code == status.HTTP_400_BAD_REQUEST


@pytest.mark.django_db
def test_animal_update_returns_404_for_missing(shelter_admin_client):
    """Updating a non-existent animal returns 404."""
    response = shelter_admin_client.patch(
        reverse('animal-update', args=[99999]),
        {'name': 'Ghost'},
        format='json',
    )

    assert response.status_code == status.HTTP_404_NOT_FOUND


@pytest.mark.django_db
def test_animal_update_returns_400_for_invalid_data(shelter_admin_client, animal):
    """Invalid update payload returns 400."""
    response = shelter_admin_client.patch(
        reverse('animal-update', args=[animal.pk]),
        {'species': 'invalid_species'},
        format='json',
    )

    assert response.status_code == status.HTTP_400_BAD_REQUEST


@pytest.mark.django_db
def test_animal_delete_returns_404_for_missing(shelter_admin_client):
    """Deleting a non-existent animal returns 404."""
    response = shelter_admin_client.delete(reverse('animal-delete', args=[99999]))

    assert response.status_code == status.HTTP_404_NOT_FOUND


# ── Similar endpoint ─────────────────────────────────────────────────────────


@pytest.fixture(autouse=False)
def clear_cache():
    """Clear Django cache before and after similar endpoint tests."""
    from django.core.cache import cache
    cache.clear()
    yield
    cache.clear()


@pytest.mark.django_db
def test_animal_similar_returns_same_species_and_size(clear_cache, api_client, shelter, animal):
    """Similar endpoint returns animals with same species and size."""
    Animal.objects.create(
        shelter=shelter, name='Similar', species='dog', size='medium',
        status=Animal.Status.PUBLISHED,
    )
    Animal.objects.create(
        shelter=shelter, name='DiffSpecies', species='cat', size='medium',
        status=Animal.Status.PUBLISHED,
    )
    Animal.objects.create(
        shelter=shelter, name='DiffSize', species='dog', size='large',
        status=Animal.Status.PUBLISHED,
    )
    response = api_client.get(reverse('animal-similar', args=[animal.pk]))

    assert response.status_code == status.HTTP_200_OK
    names = [a['name'] for a in response.json()]
    assert 'Similar' in names
    assert 'DiffSpecies' not in names
    assert 'DiffSize' not in names


@pytest.mark.django_db
def test_animal_similar_excludes_self(clear_cache, api_client, shelter, animal):
    """Similar endpoint does not include the animal itself."""
    response = api_client.get(reverse('animal-similar', args=[animal.pk]))

    assert response.status_code == status.HTTP_200_OK
    ids = [a['id'] for a in response.json()]
    assert animal.pk not in ids


@pytest.mark.django_db
def test_animal_similar_returns_max_four(clear_cache, api_client, shelter, animal):
    """Similar endpoint returns at most 4 animals."""
    for i in range(6):
        Animal.objects.create(
            shelter=shelter, name=f'Sim{i}', species='dog', size='medium',
            status=Animal.Status.PUBLISHED,
        )
    response = api_client.get(reverse('animal-similar', args=[animal.pk]))

    assert response.status_code == status.HTTP_200_OK
    assert len(response.json()) <= 4


@pytest.mark.django_db
def test_animal_similar_excludes_unpublished(clear_cache, api_client, shelter, animal):
    """Similar endpoint excludes draft/archived animals."""
    Animal.objects.create(
        shelter=shelter, name='DraftSim', species='dog', size='medium',
        status=Animal.Status.DRAFT,
    )
    response = api_client.get(reverse('animal-similar', args=[animal.pk]))

    assert response.status_code == status.HTTP_200_OK
    names = [a['name'] for a in response.json()]
    assert 'DraftSim' not in names


@pytest.mark.django_db
def test_animal_similar_returns_404_for_missing(clear_cache, api_client):
    """Similar endpoint returns 404 for non-existent animal."""
    response = api_client.get(reverse('animal-similar', args=[99999]))

    assert response.status_code == status.HTTP_404_NOT_FOUND


@pytest.mark.django_db
def test_animal_similar_prioritizes_same_shelter(clear_cache, api_client, shelter, animal, shelter_admin_user):
    """Similar endpoint prioritizes animals from the same shelter."""
    from base_feature_app.tests.factories import ShelterFactory

    other_shelter = ShelterFactory(owner=shelter_admin_user, name='Other Shelter')
    Animal.objects.create(
        shelter=other_shelter, name='OtherShelter', species='dog', size='medium',
        status=Animal.Status.PUBLISHED,
    )
    Animal.objects.create(
        shelter=shelter, name='SameShelter', species='dog', size='medium',
        status=Animal.Status.PUBLISHED,
    )
    response = api_client.get(reverse('animal-similar', args=[animal.pk]))

    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert data[0]['name'] == 'SameShelter'
