import pytest
from django.urls import reverse

from base_feature_app.tests.factories import StrategicAllyFactory


@pytest.mark.django_db
def test_strategic_ally_list_returns_active_only(api_client):
    """Only active strategic allies are returned."""
    StrategicAllyFactory(is_active=True)
    StrategicAllyFactory(is_active=True)
    StrategicAllyFactory(is_active=False)
    url = reverse('strategic-ally-list')
    response = api_client.get(url)
    assert response.status_code == 200
    assert len(response.json()) == 2


@pytest.mark.django_db
def test_strategic_ally_list_accessible_without_auth(api_client):
    """Strategic allies list is public (no auth required)."""
    url = reverse('strategic-ally-list')
    response = api_client.get(url)
    assert response.status_code == 200


@pytest.mark.django_db
def test_strategic_ally_list_empty_when_none(api_client):
    """Empty list when no active allies exist."""
    url = reverse('strategic-ally-list')
    response = api_client.get(url)
    assert response.status_code == 200
    assert len(response.json()) == 0
