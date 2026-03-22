import pytest
from django.urls import reverse
from rest_framework import status


@pytest.mark.django_db
def test_admin_dashboard_requires_auth(api_client):
    """Unauthenticated users cannot access admin dashboard."""
    response = api_client.get(reverse('admin-dashboard'))

    assert response.status_code == status.HTTP_401_UNAUTHORIZED


@pytest.mark.django_db
def test_admin_dashboard_denied_for_regular_user(authenticated_client):
    """Non-admin users are denied access."""
    response = authenticated_client.get(reverse('admin-dashboard'))

    assert response.status_code == status.HTTP_403_FORBIDDEN


@pytest.mark.django_db
def test_admin_dashboard_returns_stats(admin_client, shelter, animal):
    """Admin user gets dashboard statistics."""
    response = admin_client.get(reverse('admin-dashboard'))

    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert 'total_users' in data
    assert 'total_shelters' in data
    assert 'total_animals' in data
    assert 'verified_shelters' in data


@pytest.mark.django_db
def test_approve_shelter_approves(admin_client, shelter):
    """Admin can approve a pending shelter."""
    shelter.verification_status = 'pending'
    shelter.save()

    response = admin_client.post(
        reverse('admin-approve-shelter', args=[shelter.pk]),
        {'action': 'approve'},
        format='json',
    )

    assert response.status_code == status.HTTP_200_OK
    shelter.refresh_from_db()
    assert shelter.verification_status == 'verified'
    assert shelter.verified_at is not None


@pytest.mark.django_db
def test_approve_shelter_rejects(admin_client, shelter):
    """Admin can reject a shelter."""
    shelter.verification_status = 'pending'
    shelter.save()

    response = admin_client.post(
        reverse('admin-approve-shelter', args=[shelter.pk]),
        {'action': 'reject'},
        format='json',
    )

    assert response.status_code == status.HTTP_200_OK
    shelter.refresh_from_db()
    assert shelter.verification_status == 'rejected'


@pytest.mark.django_db
def test_approve_shelter_invalid_action(admin_client, shelter):
    """Invalid action returns 400."""
    response = admin_client.post(
        reverse('admin-approve-shelter', args=[shelter.pk]),
        {'action': 'suspend'},
        format='json',
    )

    assert response.status_code == status.HTTP_400_BAD_REQUEST


@pytest.mark.django_db
def test_approve_shelter_not_found(admin_client):
    """Nonexistent shelter returns 404."""
    response = admin_client.post(
        reverse('admin-approve-shelter', args=[99999]),
        {'action': 'approve'},
        format='json',
    )

    assert response.status_code == status.HTTP_404_NOT_FOUND


@pytest.mark.django_db
def test_approve_shelter_denied_for_regular_user(authenticated_client, shelter):
    """Non-admin cannot approve shelters."""
    response = authenticated_client.post(
        reverse('admin-approve-shelter', args=[shelter.pk]),
        {'action': 'approve'},
        format='json',
    )

    assert response.status_code == status.HTTP_403_FORBIDDEN


@pytest.mark.django_db
def test_pending_shelters_returns_only_pending(admin_client, shelter):
    """Pending shelters endpoint returns only pending shelters."""
    shelter.verification_status = 'pending'
    shelter.save()

    response = admin_client.get(reverse('admin-pending-shelters'))

    assert response.status_code == status.HTTP_200_OK
    assert len(response.json()) == 1
    assert response.json()[0]['name'] == 'Happy Paws'


@pytest.mark.django_db
def test_admin_metrics_returns_aggregates(admin_client, donation, sponsorship):
    """Metrics endpoint returns donation and sponsorship aggregates."""
    response = admin_client.get(reverse('admin-metrics'))

    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert 'donations' in data
    assert 'sponsorships' in data
    assert 'adoption_rate' in data


@pytest.mark.django_db
def test_admin_metrics_denied_for_regular_user(authenticated_client):
    """Non-admin cannot access metrics."""
    response = authenticated_client.get(reverse('admin-metrics'))

    assert response.status_code == status.HTTP_403_FORBIDDEN
