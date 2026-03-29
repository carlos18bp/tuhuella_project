import pytest
from django.urls import reverse
from rest_framework import status

from base_feature_app.models import AdoptionApplication


@pytest.mark.django_db
def test_application_list_requires_auth(api_client):
    """Unauthenticated users cannot list applications."""
    response = api_client.get(reverse('adoption-list'))

    assert response.status_code == status.HTTP_401_UNAUTHORIZED


@pytest.mark.django_db
def test_application_list_returns_own(authenticated_client, adoption_application):
    """Regular user sees only their own applications."""
    response = authenticated_client.get(reverse('adoption-list'))

    assert response.status_code == status.HTTP_200_OK
    assert len(response.json()) == 1
    assert response.json()[0]['id'] == adoption_application.pk


@pytest.mark.django_db
def test_application_list_shelter_admin_sees_shelter_apps(
    shelter_admin_client, adoption_application
):
    """Shelter admin sees applications for their shelter's animals."""
    response = shelter_admin_client.get(reverse('adoption-list'))

    assert response.status_code == status.HTTP_200_OK
    assert len(response.json()) == 1


@pytest.mark.django_db
def test_application_detail_returns_own(authenticated_client, adoption_application):
    """User can view detail of their own application."""
    response = authenticated_client.get(
        reverse('adoption-detail', args=[adoption_application.pk])
    )

    assert response.status_code == status.HTTP_200_OK
    assert response.json()['id'] == adoption_application.pk


@pytest.mark.django_db
def test_application_detail_denied_for_unrelated_user(
    api_client, other_user, adoption_application
):
    """Unrelated user cannot view someone else's application."""
    api_client.force_authenticate(user=other_user)
    response = api_client.get(
        reverse('adoption-detail', args=[adoption_application.pk])
    )

    assert response.status_code == status.HTTP_403_FORBIDDEN


@pytest.mark.django_db
def test_application_create_requires_auth(api_client):
    """Unauthenticated users cannot create applications."""
    response = api_client.post(
        reverse('adoption-create'),
        {'animal': 1},
        format='json',
    )

    assert response.status_code == status.HTTP_401_UNAUTHORIZED


@pytest.mark.django_db
def test_application_create_success(authenticated_client, shelter, animal):
    """Authenticated user can submit an adoption application."""
    # Delete the existing application fixture to avoid unique_together conflict
    AdoptionApplication.objects.filter(user__email='user@example.com', animal=animal).delete()

    response = authenticated_client.post(
        reverse('adoption-create'),
        {
            'animal': animal.pk,
            'form_answers': {'reason': 'I want a companion'},
            'notes': 'I have a big garden',
        },
        format='json',
    )

    assert response.status_code == status.HTTP_201_CREATED
    assert AdoptionApplication.objects.filter(animal=animal, notes='I have a big garden').exists()


@pytest.mark.django_db
def test_application_update_status_by_shelter_owner(
    shelter_admin_client, adoption_application
):
    """Shelter owner can update the status of an application."""
    response = shelter_admin_client.patch(
        reverse('adoption-update-status', args=[adoption_application.pk]),
        {'status': 'approved'},
        format='json',
    )

    assert response.status_code == status.HTTP_200_OK
    adoption_application.refresh_from_db()
    assert adoption_application.status == 'approved'
    assert adoption_application.reviewed_at is not None


@pytest.mark.django_db
def test_application_update_status_denied_for_non_owner(
    authenticated_client, adoption_application
):
    """Non-owner (applicant) cannot change the application status."""
    response = authenticated_client.patch(
        reverse('adoption-update-status', args=[adoption_application.pk]),
        {'status': 'approved'},
        format='json',
    )

    assert response.status_code == status.HTTP_403_FORBIDDEN
    adoption_application.refresh_from_db()
    assert adoption_application.status == 'submitted'


@pytest.mark.django_db
def test_application_update_status_rejects_invalid(
    shelter_admin_client, adoption_application
):
    """Invalid status value is rejected."""
    response = shelter_admin_client.patch(
        reverse('adoption-update-status', args=[adoption_application.pk]),
        {'status': 'nonexistent'},
        format='json',
    )

    assert response.status_code == status.HTTP_400_BAD_REQUEST
    adoption_application.refresh_from_db()
    assert adoption_application.status == 'submitted'


@pytest.mark.django_db
def test_application_detail_returns_404_for_missing(authenticated_client):
    """Detail endpoint returns 404 for non-existent application."""
    response = authenticated_client.get(
        reverse('adoption-detail', args=[99999])
    )

    assert response.status_code == status.HTTP_404_NOT_FOUND


@pytest.mark.django_db
def test_application_create_returns_400_for_invalid_data(authenticated_client):
    """Invalid payload returns 400 with serializer errors."""
    response = authenticated_client.post(
        reverse('adoption-create'),
        {},
        format='json',
    )

    assert response.status_code == status.HTTP_400_BAD_REQUEST


@pytest.mark.django_db
def test_application_update_status_returns_404_for_missing(shelter_admin_client):
    """Updating status of a non-existent application returns 404."""
    response = shelter_admin_client.patch(
        reverse('adoption-update-status', args=[99999]),
        {'status': 'approved'},
        format='json',
    )

    assert response.status_code == status.HTTP_404_NOT_FOUND
