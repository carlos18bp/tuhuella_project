import pytest
from django.urls import reverse
from rest_framework import status

from base_feature_app.models import AdoptionApplication, Favorite

# ---------------------------------------------------------------------------
# profile-stats
# ---------------------------------------------------------------------------

@pytest.mark.django_db
def test_profile_stats_requires_auth(api_client):
    response = api_client.get(reverse('profile-stats'))
    assert response.status_code == status.HTTP_401_UNAUTHORIZED


@pytest.mark.django_db
def test_profile_stats_returns_structure(authenticated_client):
    response = authenticated_client.get(reverse('profile-stats'))
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert 'applications' in data
    assert 'sponsorships' in data
    assert 'donations' in data
    assert 'favorites' in data
    assert 'adopter_intent' in data
    assert 'shelter_invites' in data


@pytest.mark.django_db
def test_profile_stats_counts_applications(authenticated_client, existing_user, animal):
    AdoptionApplication.objects.create(user=existing_user, animal=animal, status='submitted', form_answers={})

    response = authenticated_client.get(reverse('profile-stats'))
    data = response.json()
    assert data['applications']['total'] == 1
    assert data['applications']['by_status']['submitted'] == 1


@pytest.mark.django_db
def test_profile_stats_favorites_preview(authenticated_client, favorite):
    response = authenticated_client.get(reverse('profile-stats'))
    data = response.json()
    assert data['favorites']['count'] == 1
    assert len(data['favorites']['preview']) == 1
    assert data['favorites']['preview'][0]['name'] == favorite.animal.name


@pytest.mark.django_db
def test_profile_stats_intent_null_when_absent(authenticated_client):
    response = authenticated_client.get(reverse('profile-stats'))
    data = response.json()
    assert data['adopter_intent'] is None


# ---------------------------------------------------------------------------
# user-activity
# ---------------------------------------------------------------------------

@pytest.mark.django_db
def test_user_activity_requires_auth(api_client):
    response = api_client.get(reverse('user-activity'))
    assert response.status_code == status.HTTP_401_UNAUTHORIZED


@pytest.mark.django_db
def test_user_activity_returns_list(authenticated_client):
    response = authenticated_client.get(reverse('user-activity'))
    assert response.status_code == status.HTTP_200_OK
    assert isinstance(response.json(), list)


@pytest.mark.django_db
def test_user_activity_includes_favorites(authenticated_client, favorite):
    response = authenticated_client.get(reverse('user-activity'))
    data = response.json()
    types = [e['type'] for e in data]
    assert 'favorite' in types


@pytest.mark.django_db
def test_user_activity_max_10(authenticated_client, existing_user, animal):
    # Create 12 favorites — only 10 should appear in timeline
    from base_feature_app.tests.factories import AnimalFactory
    animals = [AnimalFactory(shelter=animal.shelter) for _ in range(12)]
    for a in animals:
        Favorite.objects.create(user=existing_user, animal=a)

    response = authenticated_client.get(reverse('user-activity'))
    assert len(response.json()) == 10


# ---------------------------------------------------------------------------
# update-profile
# ---------------------------------------------------------------------------

@pytest.mark.django_db
def test_update_profile_requires_auth(api_client):
    response = api_client.patch(
        reverse('update-profile'),
        {'first_name': 'Hacker'},
        format='json',
    )
    assert response.status_code == status.HTTP_401_UNAUTHORIZED


@pytest.mark.django_db
def test_update_profile_updates_fields(authenticated_client, existing_user):
    response = authenticated_client.patch(
        reverse('update-profile'),
        {'first_name': 'Carlos', 'city': 'Medellín'},
        format='json',
    )
    assert response.status_code == status.HTTP_200_OK
    assert response.json()['first_name'] == 'Carlos'
    assert response.json()['city'] == 'Medellín'
    existing_user.refresh_from_db()
    assert existing_user.first_name == 'Carlos'


@pytest.mark.django_db
def test_update_profile_returns_400_with_no_fields(authenticated_client):
    response = authenticated_client.patch(
        reverse('update-profile'),
        {},
        format='json',
    )
    assert response.status_code == status.HTTP_400_BAD_REQUEST


@pytest.mark.django_db
def test_update_profile_ignores_non_editable_fields(authenticated_client, existing_user):
    response = authenticated_client.patch(
        reverse('update-profile'),
        {'email': 'hacker@evil.com', 'first_name': 'Safe'},
        format='json',
    )
    assert response.status_code == status.HTTP_200_OK
    existing_user.refresh_from_db()
    assert existing_user.email != 'hacker@evil.com'
    assert existing_user.first_name == 'Safe'


@pytest.mark.django_db
def test_update_profile_returns_date_joined(authenticated_client):
    response = authenticated_client.patch(
        reverse('update-profile'),
        {'first_name': 'Updated'},
        format='json',
    )
    assert response.status_code == status.HTTP_200_OK
    assert 'date_joined' in response.json()
