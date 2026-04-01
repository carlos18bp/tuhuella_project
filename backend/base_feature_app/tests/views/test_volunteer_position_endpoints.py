import pytest
from django.urls import reverse

from base_feature_app.tests.factories import VolunteerPositionFactory


@pytest.mark.django_db
def test_volunteer_position_list_returns_only_active_positions(api_client):
    """GET volunteer-positions excludes inactive rows."""
    VolunteerPositionFactory(is_active=True, title_es='Puesto activo')
    VolunteerPositionFactory(is_active=False, title_es='Puesto inactivo')

    response = api_client.get(reverse('volunteer-position-list'))

    assert response.status_code == 200
    assert len(response.data) == 1
    assert response.data[0]['title'] == 'Puesto activo'
