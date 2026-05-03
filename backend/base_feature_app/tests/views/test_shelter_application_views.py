import pytest

from base_feature_app.models import Shelter, ShelterApplication, User
from base_feature_app.tests.factories import UserFactory


VALID_PAYLOAD = {
    'shelter_name': 'Patitas Felices',
    'description_es': 'Refugio de prueba con misión clara',
    'city': 'Bogotá',
    'address': 'Calle 100 #15-20',
    'phone': '3001234567',
    'email': 'contacto@patitas.org',
    'website': 'https://patitas.org',
    'legal_name': 'Patitas Felices SAS',
    'tax_id': '900123456-7',
    'legal_representative_name': 'Juan Pérez',
    'legal_representative_id': '1020304050',
    'motivation': 'Llevamos 5 años rescatando perros',
    'previous_experience': 'Hemos rescatado 200 perros',
    'capacity_estimate': 25,
}


@pytest.fixture
def web_manager(db):
    return UserFactory(email='wm@example.com', role=User.Role.WEB_MANAGER)


@pytest.fixture
def web_manager_client(api_client, web_manager):
    api_client.force_authenticate(user=web_manager)
    return api_client


@pytest.fixture
def adopter_user(db):
    return UserFactory(email='adopter@example.com', role=User.Role.ADOPTER)


@pytest.fixture
def adopter_client(api_client, adopter_user):
    api_client.force_authenticate(user=adopter_user)
    return api_client


# ---------- create ----------

@pytest.mark.django_db
def test_adopter_can_submit_application(adopter_client, adopter_user):
    response = adopter_client.post('/api/shelter-applications/', VALID_PAYLOAD, format='json')
    assert response.status_code == 201, response.data
    assert response.data['status'] == 'submitted'
    assert response.data['shelter_name'] == VALID_PAYLOAD['shelter_name']
    assert ShelterApplication.objects.filter(applicant=adopter_user).count() == 1


@pytest.mark.django_db
def test_anonymous_cannot_submit_application(api_client):
    response = api_client.post('/api/shelter-applications/', VALID_PAYLOAD, format='json')
    assert response.status_code in (401, 403)


@pytest.mark.django_db
def test_cannot_submit_when_active_application_exists(adopter_client, adopter_user):
    ShelterApplication.objects.create(
        applicant=adopter_user,
        shelter_name='Existing',
        description_es='x',
        city='x',
        phone='x',
        legal_name='x',
        tax_id='x',
        legal_representative_name='x',
        legal_representative_id='x',
        motivation='x',
    )
    response = adopter_client.post('/api/shelter-applications/', VALID_PAYLOAD, format='json')
    assert response.status_code == 400


@pytest.mark.django_db
def test_shelter_admin_cannot_submit_application(api_client):
    user = UserFactory(role=User.Role.SHELTER_ADMIN)
    api_client.force_authenticate(user=user)
    response = api_client.post('/api/shelter-applications/', VALID_PAYLOAD, format='json')
    assert response.status_code == 400


# ---------- me ----------

@pytest.mark.django_db
def test_my_application_returns_404_when_none(adopter_client):
    response = adopter_client.get('/api/shelter-applications/me/')
    assert response.status_code == 404


@pytest.mark.django_db
def test_my_application_returns_latest(adopter_client, adopter_user):
    app = ShelterApplication.objects.create(
        applicant=adopter_user,
        shelter_name='Mine',
        description_es='x',
        city='x',
        phone='x',
        legal_name='x',
        tax_id='x',
        legal_representative_name='x',
        legal_representative_id='x',
        motivation='x',
    )
    response = adopter_client.get('/api/shelter-applications/me/')
    assert response.status_code == 200
    assert response.data['id'] == app.id


# ---------- approve ----------

@pytest.mark.django_db
def test_approve_creates_shelter_and_promotes_user(web_manager_client, adopter_user):
    application = ShelterApplication.objects.create(
        applicant=adopter_user,
        shelter_name='New Shelter',
        description_es='Mission text',
        city='Medellín',
        address='Calle X',
        phone='3001112222',
        email='hello@new.org',
        website='https://new.org',
        legal_name='New Shelter SAS',
        tax_id='900-1',
        legal_representative_name='Jane',
        legal_representative_id='999',
        motivation='Why',
    )
    response = web_manager_client.post(f'/api/shelter-applications/{application.pk}/approve/')
    assert response.status_code == 200, response.data
    assert response.data['status'] == 'approved'

    application.refresh_from_db()
    adopter_user.refresh_from_db()

    assert application.status == ShelterApplication.Status.APPROVED
    assert application.reviewed_at is not None
    assert application.created_shelter is not None
    assert adopter_user.role == User.Role.SHELTER_ADMIN

    shelter = Shelter.objects.get(pk=application.created_shelter_id)
    assert shelter.owner_id == adopter_user.id
    assert shelter.verification_status == Shelter.VerificationStatus.VERIFIED
    assert shelter.verified_at is not None
    assert shelter.name == 'New Shelter'


@pytest.mark.django_db
def test_adopter_cannot_approve(adopter_client, adopter_user):
    application = ShelterApplication.objects.create(
        applicant=adopter_user,
        shelter_name='X', description_es='x', city='x', phone='x',
        legal_name='x', tax_id='x', legal_representative_name='x',
        legal_representative_id='x', motivation='x',
    )
    response = adopter_client.post(f'/api/shelter-applications/{application.pk}/approve/')
    assert response.status_code == 403


@pytest.mark.django_db
def test_cannot_approve_already_approved(web_manager_client, adopter_user):
    application = ShelterApplication.objects.create(
        applicant=adopter_user,
        shelter_name='X', description_es='x', city='x', phone='x',
        legal_name='x', tax_id='x', legal_representative_name='x',
        legal_representative_id='x', motivation='x',
        status=ShelterApplication.Status.APPROVED,
    )
    response = web_manager_client.post(f'/api/shelter-applications/{application.pk}/approve/')
    assert response.status_code == 400


# ---------- reject ----------

@pytest.mark.django_db
def test_reject_requires_reason(web_manager_client, adopter_user):
    application = ShelterApplication.objects.create(
        applicant=adopter_user,
        shelter_name='X', description_es='x', city='x', phone='x',
        legal_name='x', tax_id='x', legal_representative_name='x',
        legal_representative_id='x', motivation='x',
    )
    response = web_manager_client.post(
        f'/api/shelter-applications/{application.pk}/reject/', {}, format='json',
    )
    assert response.status_code == 400


@pytest.mark.django_db
def test_reject_records_reason_and_does_not_change_role(web_manager_client, adopter_user):
    application = ShelterApplication.objects.create(
        applicant=adopter_user,
        shelter_name='X', description_es='x', city='x', phone='x',
        legal_name='x', tax_id='x', legal_representative_name='x',
        legal_representative_id='x', motivation='x',
    )
    response = web_manager_client.post(
        f'/api/shelter-applications/{application.pk}/reject/',
        {'reason': 'Documentos incompletos'},
        format='json',
    )
    assert response.status_code == 200, response.data

    application.refresh_from_db()
    adopter_user.refresh_from_db()

    assert application.status == ShelterApplication.Status.REJECTED
    assert application.rejection_reason == 'Documentos incompletos'
    assert adopter_user.role == User.Role.ADOPTER
    assert not Shelter.objects.filter(owner=adopter_user).exists()
