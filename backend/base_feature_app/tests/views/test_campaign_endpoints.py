import pytest
from django.urls import reverse
from rest_framework import status

from base_feature_app.models import Campaign


@pytest.mark.django_db
def test_campaign_list_returns_only_active(api_client, shelter, campaign):
    """Only active campaigns appear in the public list."""
    Campaign.objects.create(
        shelter=shelter,
        title='Finished Campaign',
        description='Done',
        goal_amount=100000,
        status=Campaign.Status.COMPLETED,
    )
    response = api_client.get(reverse('campaign-list'))

    assert response.status_code == status.HTTP_200_OK
    titles = [c['title'] for c in response.json()]
    assert 'Medical Fund' in titles
    assert 'Finished Campaign' not in titles


@pytest.mark.django_db
def test_campaign_detail_returns_existing(api_client, campaign):
    """Detail endpoint returns a specific campaign."""
    response = api_client.get(reverse('campaign-detail', args=[campaign.pk]))

    assert response.status_code == status.HTTP_200_OK
    assert response.json()['title'] == 'Medical Fund'


@pytest.mark.django_db
def test_campaign_detail_returns_404_for_missing(api_client):
    """Detail endpoint returns 404 for non-existent pk."""
    response = api_client.get(reverse('campaign-detail', args=[99999]))

    assert response.status_code == status.HTTP_404_NOT_FOUND


@pytest.mark.django_db
def test_campaign_create_requires_auth(api_client):
    """Unauthenticated users cannot create campaigns."""
    response = api_client.post(
        reverse('campaign-create'),
        {'title': 'Sneak Campaign'},
        format='json',
    )

    assert response.status_code == status.HTTP_401_UNAUTHORIZED


@pytest.mark.django_db
def test_campaign_create_success(shelter_admin_client, shelter):
    """Authenticated user can create a campaign."""
    response = shelter_admin_client.post(
        reverse('campaign-create'),
        {
            'shelter': shelter.pk,
            'title': 'New Campaign',
            'description': 'Help us',
            'goal_amount': '200000.00',
        },
        format='json',
    )

    assert response.status_code == status.HTTP_201_CREATED
    assert Campaign.objects.filter(title='New Campaign').exists()


@pytest.mark.django_db
def test_campaign_update_by_shelter_owner(shelter_admin_client, campaign):
    """Shelter owner can update their campaign."""
    response = shelter_admin_client.patch(
        reverse('campaign-update', args=[campaign.pk]),
        {'title': 'Updated Fund'},
        format='json',
    )

    assert response.status_code == status.HTTP_200_OK
    campaign.refresh_from_db()
    assert campaign.title == 'Updated Fund'


@pytest.mark.django_db
def test_campaign_update_denied_for_non_owner(authenticated_client, campaign):
    """Non-owner cannot update a campaign."""
    response = authenticated_client.patch(
        reverse('campaign-update', args=[campaign.pk]),
        {'title': 'Hijacked'},
        format='json',
    )

    assert response.status_code == status.HTTP_403_FORBIDDEN
    campaign.refresh_from_db()
    assert campaign.title == 'Medical Fund'
