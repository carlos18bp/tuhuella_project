import pytest
from django.urls import reverse
from rest_framework import status

from base_feature_app.models import UpdatePost


@pytest.mark.django_db
def test_update_post_list_public(api_client, update_post):
    """Update post list is publicly accessible."""
    response = api_client.get(reverse('update-post-list'))

    assert response.status_code == status.HTTP_200_OK
    assert len(response.json()) == 1
    assert response.json()[0]['title'] == 'Luna recovered!'


@pytest.mark.django_db
def test_update_post_list_filter_by_shelter(api_client, update_post):
    """List can be filtered by shelter."""
    response = api_client.get(
        reverse('update-post-list'),
        {'shelter': update_post.shelter.pk},
    )

    assert response.status_code == status.HTTP_200_OK
    assert len(response.json()) == 1


@pytest.mark.django_db
def test_update_post_detail_returns_content(api_client, update_post):
    """Detail endpoint returns full content."""
    response = api_client.get(reverse('update-post-detail', args=[update_post.pk]))

    assert response.status_code == status.HTTP_200_OK
    assert response.json()['content'] == 'Luna is doing great after surgery.'


@pytest.mark.django_db
def test_update_post_detail_not_found(api_client):
    """Detail endpoint returns 404 for nonexistent post."""
    response = api_client.get(reverse('update-post-detail', args=[99999]))

    assert response.status_code == status.HTTP_404_NOT_FOUND


@pytest.mark.django_db
def test_update_post_create_requires_auth(api_client):
    """Unauthenticated users cannot create posts."""
    response = api_client.post(
        reverse('update-post-create'),
        {'title_es': 'Test'},
        format='json',
    )

    assert response.status_code == status.HTTP_401_UNAUTHORIZED


@pytest.mark.django_db
def test_update_post_create_success(authenticated_client, shelter):
    """Authenticated user can create an update post."""
    response = authenticated_client.post(
        reverse('update-post-create'),
        {
            'shelter': shelter.pk,
            'title_es': 'Great news!',
            'content_es': 'We adopted 5 animals this week.',
        },
        format='json',
    )

    assert response.status_code == status.HTTP_201_CREATED
    assert UpdatePost.objects.filter(title_es='Great news!').exists()


@pytest.mark.django_db
def test_update_post_create_rejects_missing_title(authenticated_client, shelter):
    """Create endpoint rejects missing title."""
    response = authenticated_client.post(
        reverse('update-post-create'),
        {'shelter': shelter.pk, 'content_es': 'No title'},
        format='json',
    )

    assert response.status_code == status.HTTP_400_BAD_REQUEST
