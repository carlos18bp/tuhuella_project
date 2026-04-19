import pytest

from base_feature_app.tests.factories import (
    AdoptionApplicationFactory,
    ShelterFactory,
    UserFactory,
)


@pytest.fixture
def web_manager(db):
    return UserFactory(email='manager@example.com', role='web_manager')


@pytest.fixture
def web_manager_client(api_client, web_manager):
    api_client.force_authenticate(user=web_manager)
    return api_client


@pytest.mark.django_db
def test_web_manager_sees_all_applications(web_manager_client):
    AdoptionApplicationFactory.create_batch(3)

    response = web_manager_client.get('/api/admin/applications/')

    assert response.status_code == 200
    assert response.data['count'] == 3


@pytest.mark.django_db
def test_adopter_is_forbidden_from_global_applications(authenticated_client):
    AdoptionApplicationFactory()

    response = authenticated_client.get('/api/admin/applications/')

    assert response.status_code == 403


@pytest.mark.django_db
def test_shelter_applications_filter_scopes_to_shelter(web_manager_client):
    shelter_a = ShelterFactory()
    shelter_b = ShelterFactory()
    AdoptionApplicationFactory(animal__shelter=shelter_a)
    AdoptionApplicationFactory(animal__shelter=shelter_a)
    AdoptionApplicationFactory(animal__shelter=shelter_b)

    response = web_manager_client.get(f'/api/admin/shelters/{shelter_a.id}/applications/')

    assert response.status_code == 200
    assert response.data['count'] == 2
    for app in response.data['results']:
        assert app['shelter_name'] == shelter_a.name


@pytest.mark.django_db
def test_shelter_admin_cannot_call_shelter_applications(shelter_admin_client):
    other = ShelterFactory()
    AdoptionApplicationFactory(animal__shelter=other)

    response = shelter_admin_client.get(f'/api/admin/shelters/{other.id}/applications/')

    assert response.status_code == 403
