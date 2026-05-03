import pytest
from django.urls import reverse
from rest_framework import status

from base_feature_app.models import Shelter


@pytest.mark.django_db
def test_shelter_list_returns_only_verified(api_client, shelter):
    """Only verified shelters appear in the public list."""
    Shelter.objects.create(
        name='Unverified Place',
        city='Medellín',
        verification_status=Shelter.VerificationStatus.PENDING,
        owner=shelter.owner,
    )
    response = api_client.get(reverse('shelter-list'))

    assert response.status_code == status.HTTP_200_OK
    names = [s['name'] for s in response.json()]
    assert 'Happy Paws' in names
    assert 'Unverified Place' not in names


@pytest.mark.django_db
def test_shelter_detail_returns_existing(api_client, shelter):
    """Detail endpoint returns a specific shelter by pk."""
    response = api_client.get(reverse('shelter-detail', args=[shelter.pk]))

    assert response.status_code == status.HTTP_200_OK
    body = response.json()
    assert body['name'] == 'Happy Paws'
    assert 'video_url' in body
    assert body['video_url'] == ''


@pytest.mark.django_db
def test_shelter_detail_returns_404_for_missing(api_client):
    """Detail endpoint returns 404 for non-existent pk."""
    response = api_client.get(reverse('shelter-detail', args=[99999]))

    assert response.status_code == status.HTTP_404_NOT_FOUND


@pytest.mark.django_db
def test_shelter_create_requires_auth(api_client):
    """Unauthenticated users cannot create shelters."""
    response = api_client.post(
        reverse('shelter-create'),
        {'name': 'New Shelter', 'city': 'Cali'},
        format='json',
    )

    assert response.status_code == status.HTTP_401_UNAUTHORIZED
    assert Shelter.objects.filter(name='New Shelter').count() == 0


@pytest.mark.django_db
def test_shelter_create_blocks_adopter(authenticated_client):
    """Adopters cannot bypass the formal ShelterApplication flow via /api/shelters/create/."""
    response = authenticated_client.post(
        reverse('shelter-create'),
        {
            'name': 'Bypass Shelter',
            'city': 'Cali',
            'description_es': 'A new place',
            'phone': '3009876543',
            'email': 'bypass@shelter.org',
        },
        format='json',
    )

    assert response.status_code == status.HTTP_403_FORBIDDEN
    assert Shelter.objects.filter(name='Bypass Shelter').count() == 0


@pytest.mark.django_db
def test_shelter_create_blocks_shelter_admin(shelter_admin_client):
    """Even shelter_admin role cannot create new shelters directly — only admin/web_manager can."""
    response = shelter_admin_client.post(
        reverse('shelter-create'),
        {
            'name': 'Second Shelter',
            'city': 'Cali',
            'description_es': 'A new place',
            'phone': '3009876543',
            'email': 'second@shelter.org',
        },
        format='json',
    )

    assert response.status_code == status.HTTP_403_FORBIDDEN


@pytest.mark.django_db
def test_shelter_create_allows_web_manager(api_client, db):
    """Web managers can create shelters directly (e.g., bulk import or operational tasks)."""
    from base_feature_app.tests.factories import WebManagerUserFactory

    web_manager = WebManagerUserFactory()
    api_client.force_authenticate(user=web_manager)

    response = api_client.post(
        reverse('shelter-create'),
        {
            'name': 'Web Manager Shelter',
            'city': 'Cali',
            'description_es': 'Created by web manager',
            'phone': '3009876543',
            'email': 'wm@shelter.org',
        },
        format='json',
    )

    assert response.status_code == status.HTTP_201_CREATED
    assert Shelter.objects.filter(name='Web Manager Shelter', owner=web_manager).exists()


@pytest.mark.django_db
def test_shelter_update_by_owner(shelter_admin_client, shelter):
    """Owner can update their own shelter."""
    response = shelter_admin_client.patch(
        reverse('shelter-update', args=[shelter.pk]),
        {'name': 'Happy Paws Updated'},
        format='json',
    )

    assert response.status_code == status.HTTP_200_OK
    shelter.refresh_from_db()
    assert shelter.name == 'Happy Paws Updated'


@pytest.mark.django_db
def test_shelter_update_denied_for_non_owner(authenticated_client, shelter):
    """Non-owner cannot update a shelter they don't own."""
    response = authenticated_client.patch(
        reverse('shelter-update', args=[shelter.pk]),
        {'name': 'Hijacked'},
        format='json',
    )

    assert response.status_code == status.HTTP_404_NOT_FOUND
    shelter.refresh_from_db()
    assert shelter.name == 'Happy Paws'
