from decimal import Decimal

import pytest
from django.urls import reverse
from django.utils import timezone
from rest_framework import status

from base_feature_app.tests.factories import (
    AdoptionApplicationFactory,
    AnimalFactory,
    DonationFactory,
    ShelterAdminUserFactory,
    ShelterFactory,
)


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


# ── Shelter Metrics ──────────────────────────────────────────────────────────


@pytest.mark.django_db
def test_shelter_metrics_requires_auth(api_client):
    """Unauthenticated request returns 401."""
    response = api_client.get(reverse('shelter-metrics'))
    assert response.status_code == status.HTTP_401_UNAUTHORIZED


@pytest.mark.django_db
def test_shelter_metrics_denied_for_adopter(authenticated_client):
    """Adopter role cannot access shelter metrics."""
    response = authenticated_client.get(reverse('shelter-metrics'))
    assert response.status_code == status.HTTP_403_FORBIDDEN


@pytest.mark.django_db
def test_shelter_metrics_returns_data_for_shelter_admin(shelter_admin_client, shelter, animal):
    """Shelter admin receives dashboard metrics for their shelter."""
    response = shelter_admin_client.get(reverse('shelter-metrics'))
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert data['total_animals'] >= 1
    assert data['published_animals'] >= 1
    assert 'donations' in data
    assert 'sponsorships' in data


@pytest.mark.django_db
def test_shelter_metrics_no_shelter_returns_404(api_client):
    """Shelter admin without any shelter gets 404."""
    orphan_admin = ShelterAdminUserFactory()
    api_client.force_authenticate(user=orphan_admin)
    response = api_client.get(reverse('shelter-metrics'))
    assert response.status_code == status.HTTP_404_NOT_FOUND


@pytest.mark.django_db
def test_shelter_metrics_includes_donation_stats(shelter_admin_client, shelter):
    """Paid donation appears in shelter donation stats."""
    DonationFactory(shelter=shelter, status='paid', amount=Decimal('100000.00'))
    response = shelter_admin_client.get(reverse('shelter-metrics'))
    data = response.json()
    assert data['donations']['total_count'] >= 1


@pytest.mark.django_db
def test_shelter_metrics_includes_application_count(shelter_admin_client, animal):
    """Adoption application appears in shelter application count."""
    AdoptionApplicationFactory(animal=animal)
    response = shelter_admin_client.get(reverse('shelter-metrics'))
    assert response.json()['total_applications'] >= 1


@pytest.mark.django_db
def test_shelter_metrics_includes_avg_adoption_time(shelter_admin_client, animal):
    """Approved application with reviewed_at produces avg adoption time."""
    AdoptionApplicationFactory(
        animal=animal,
        status='approved',
        reviewed_at=timezone.now(),
    )
    response = shelter_admin_client.get(reverse('shelter-metrics'))
    assert response.json()['avg_adoption_time_days'] is not None
