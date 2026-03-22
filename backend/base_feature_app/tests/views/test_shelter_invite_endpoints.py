import pytest
from django.urls import reverse
from rest_framework import status


@pytest.mark.django_db
def test_shelter_invite_list_requires_auth(api_client):
    """Unauthenticated users cannot list invites."""
    response = api_client.get(reverse('shelter-invite-list'))

    assert response.status_code == status.HTTP_401_UNAUTHORIZED


@pytest.mark.django_db
def test_shelter_invite_list_shelter_admin_sees_own(
    shelter_admin_client, shelter_invite
):
    """Shelter admin sees invites for their shelters."""
    response = shelter_admin_client.get(reverse('shelter-invite-list'))

    assert response.status_code == status.HTTP_200_OK
    assert len(response.json()) == 1
    assert response.json()[0]['shelter_name'] == 'Happy Paws'


@pytest.mark.django_db
def test_shelter_invite_list_adopter_sees_own(
    authenticated_client, shelter_invite
):
    """Adopter sees invites directed at their intent."""
    response = authenticated_client.get(reverse('shelter-invite-list'))

    assert response.status_code == status.HTTP_200_OK
    assert len(response.json()) == 1


@pytest.mark.django_db
def test_shelter_invite_create_requires_auth(api_client):
    """Unauthenticated users cannot create invites."""
    response = api_client.post(
        reverse('shelter-invite-create'),
        {'shelter': 1, 'adopter_intent': 1},
        format='json',
    )

    assert response.status_code == status.HTTP_401_UNAUTHORIZED


@pytest.mark.django_db
def test_shelter_invite_create_success(
    shelter_admin_client, shelter, adopter_intent
):
    """Shelter admin can create an invite."""
    response = shelter_admin_client.post(
        reverse('shelter-invite-create'),
        {
            'shelter': shelter.pk,
            'adopter_intent': adopter_intent.pk,
            'message': 'We have a dog for you!',
        },
        format='json',
    )

    assert response.status_code == status.HTTP_201_CREATED


@pytest.mark.django_db
def test_shelter_invite_respond_accept(authenticated_client, shelter_invite):
    """Adopter can accept an invite."""
    response = authenticated_client.patch(
        reverse('shelter-invite-respond', args=[shelter_invite.pk]),
        {'status': 'accepted'},
        format='json',
    )

    assert response.status_code == status.HTTP_200_OK
    shelter_invite.refresh_from_db()
    assert shelter_invite.status == 'accepted'


@pytest.mark.django_db
def test_shelter_invite_respond_reject(authenticated_client, shelter_invite):
    """Adopter can reject an invite."""
    response = authenticated_client.patch(
        reverse('shelter-invite-respond', args=[shelter_invite.pk]),
        {'status': 'rejected'},
        format='json',
    )

    assert response.status_code == status.HTTP_200_OK
    shelter_invite.refresh_from_db()
    assert shelter_invite.status == 'rejected'


@pytest.mark.django_db
def test_shelter_invite_respond_rejects_invalid_status(
    authenticated_client, shelter_invite
):
    """Invalid status value is rejected."""
    response = authenticated_client.patch(
        reverse('shelter-invite-respond', args=[shelter_invite.pk]),
        {'status': 'maybe'},
        format='json',
    )

    assert response.status_code == status.HTTP_400_BAD_REQUEST
    shelter_invite.refresh_from_db()
    assert shelter_invite.status == 'pending'
