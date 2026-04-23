from datetime import date, datetime, timedelta, timezone as dt_timezone

import pytest
from django.utils import timezone
from freezegun import freeze_time

from base_feature_app.models import (
    AdoptionApplication,
    ClinicalHistoryEntry,
    PostAdoptionFollowUp,
)
from base_feature_app.tests.factories import (
    AdoptionApplicationFactory,
    AnimalFactory,
    UserFactory,
)


@pytest.fixture
def veterinarian(db):
    return UserFactory(email='vet@example.com', role='veterinarian')


@pytest.fixture
def vet_client(api_client, veterinarian):
    api_client.force_authenticate(user=veterinarian)
    return api_client


@pytest.fixture
def web_manager(db):
    return UserFactory(email='wm@example.com', role='web_manager')


@pytest.fixture
def web_manager_client(api_client, web_manager):
    api_client.force_authenticate(user=web_manager)
    return api_client


@pytest.fixture
def follow_up_of(existing_user):
    def _build(animal, adopter=None, **kwargs):
        adopter = adopter or existing_user
        app = AdoptionApplicationFactory(animal=animal, user=adopter)
        return PostAdoptionFollowUp.objects.create(
            adoption_application=app,
            animal=animal,
            adopter=adopter,
            scheduled_date=date.today(),
            **kwargs,
        )
    return _build


@pytest.mark.django_db
def test_approving_application_auto_creates_follow_up(existing_user):
    animal = AnimalFactory()
    app = AdoptionApplicationFactory(animal=animal, user=existing_user)
    app.status = AdoptionApplication.Status.APPROVED
    app.save()

    follow_up = PostAdoptionFollowUp.objects.get(adoption_application=app)
    assert follow_up.animal_id == animal.id
    assert follow_up.adopter_id == existing_user.id
    assert follow_up.status == PostAdoptionFollowUp.Status.PENDING
    assert follow_up.scheduled_date == date.today() + timedelta(days=30)


@pytest.mark.django_db
def test_vet_sees_only_assigned_follow_ups(vet_client, veterinarian, existing_user):
    mine_animal = AnimalFactory()
    other_animal = AnimalFactory()
    mine_app = AdoptionApplicationFactory(animal=mine_animal, user=existing_user)
    other_app = AdoptionApplicationFactory(animal=other_animal)
    mine_fu = PostAdoptionFollowUp.objects.create(
        adoption_application=mine_app,
        animal=mine_animal,
        adopter=existing_user,
        assigned_veterinarian=veterinarian,
        scheduled_date=date.today(),
    )
    PostAdoptionFollowUp.objects.create(
        adoption_application=other_app,
        animal=other_animal,
        adopter=other_app.user,
        scheduled_date=date.today(),
    )

    response = vet_client.get('/api/follow-ups/')

    assert response.status_code == 200
    returned_ids = {item['id'] for item in response.data}
    assert returned_ids == {mine_fu.id}


@pytest.mark.django_db
def test_assigning_non_vet_returns_400(api_client, admin_user, existing_user):
    api_client.force_authenticate(user=admin_user)
    animal = AnimalFactory()
    app = AdoptionApplicationFactory(animal=animal, user=existing_user)
    follow_up = PostAdoptionFollowUp.objects.create(
        adoption_application=app,
        animal=animal,
        adopter=existing_user,
        scheduled_date=date.today(),
    )
    non_vet = UserFactory(email='other@example.com', role='adopter')

    response = api_client.patch(
        f'/api/follow-ups/{follow_up.id}/assign/',
        {'veterinarian_id': non_vet.id},
        format='json',
    )

    assert response.status_code == 400


@pytest.mark.django_db
def test_adopter_sees_own_follow_up(api_client, existing_user):
    api_client.force_authenticate(user=existing_user)
    animal = AnimalFactory()
    app = AdoptionApplicationFactory(animal=animal, user=existing_user)
    fu = PostAdoptionFollowUp.objects.create(
        adoption_application=app,
        animal=animal,
        adopter=existing_user,
        scheduled_date=date.today(),
    )
    # Another user's follow-up (should not be visible)
    other = UserFactory()
    other_animal = AnimalFactory()
    other_app = AdoptionApplicationFactory(animal=other_animal, user=other)
    PostAdoptionFollowUp.objects.create(
        adoption_application=other_app,
        animal=other_animal,
        adopter=other,
        scheduled_date=date.today(),
    )

    response = api_client.get('/api/follow-ups/')

    assert response.status_code == 200
    ids = {item['id'] for item in response.data}
    assert ids == {fu.id}


@pytest.mark.django_db
@freeze_time('2026-01-15')
def test_archived_follow_up_hidden_from_vet(vet_client, veterinarian, existing_user):
    animal = AnimalFactory()
    app = AdoptionApplicationFactory(animal=animal, user=existing_user)
    archived = PostAdoptionFollowUp.objects.create(
        adoption_application=app,
        animal=animal,
        adopter=existing_user,
        assigned_veterinarian=veterinarian,
        scheduled_date=date.today(),
        archived_at=timezone.now(),
    )

    list_response = vet_client.get('/api/follow-ups/')
    assert list_response.status_code == 200
    assert archived.id not in {item['id'] for item in list_response.data}

    detail_response = vet_client.get(f'/api/follow-ups/{archived.id}/')
    assert detail_response.status_code == 404


# ---------------------------------------------------------------------------
# _scoped_followups: role branches
# ---------------------------------------------------------------------------


@pytest.mark.django_db
def test_web_manager_sees_all_follow_ups(web_manager_client, follow_up_of, animal):
    other_user = UserFactory(email='a@x.com')
    other_animal = AnimalFactory()
    follow_up_of(animal)
    follow_up_of(other_animal, adopter=other_user)

    response = web_manager_client.get('/api/follow-ups/')

    assert response.status_code == 200
    assert len(response.data) == 2


@pytest.mark.django_db
def test_shelter_admin_sees_only_own_shelter_follow_ups(
    shelter_admin_client, follow_up_of, animal,
):
    other_animal = AnimalFactory()
    mine = follow_up_of(animal)
    follow_up_of(other_animal, adopter=UserFactory())

    response = shelter_admin_client.get('/api/follow-ups/')

    assert response.status_code == 200
    assert {item['id'] for item in response.data} == {mine.id}


@pytest.mark.django_db
def test_list_filters_by_status_query_param(
    web_manager_client, follow_up_of, animal,
):
    pending = follow_up_of(animal)
    other_animal = AnimalFactory()
    fu_in_progress = follow_up_of(other_animal, adopter=UserFactory())
    fu_in_progress.status = PostAdoptionFollowUp.Status.IN_PROGRESS
    fu_in_progress.save(update_fields=['status'])

    response = web_manager_client.get('/api/follow-ups/?status=pending')

    assert response.status_code == 200
    assert {item['id'] for item in response.data} == {pending.id}


# ---------------------------------------------------------------------------
# follow_up_detail
# ---------------------------------------------------------------------------


@pytest.mark.django_db
def test_detail_returns_follow_up_for_adopter(
    authenticated_client, follow_up_of, animal,
):
    fu = follow_up_of(animal)

    response = authenticated_client.get(f'/api/follow-ups/{fu.id}/')

    assert response.status_code == 200
    assert response.data['id'] == fu.id
    assert 'clinical_entries' in response.data


@pytest.mark.django_db
def test_detail_returns_404_when_out_of_scope(
    authenticated_client, follow_up_of, animal,
):
    other_fu = follow_up_of(AnimalFactory(), adopter=UserFactory())

    response = authenticated_client.get(f'/api/follow-ups/{other_fu.id}/')

    assert response.status_code == 404


# ---------------------------------------------------------------------------
# follow_up_assign
# ---------------------------------------------------------------------------


@pytest.mark.django_db
def test_assign_returns_404_when_follow_up_missing(web_manager_client):
    response = web_manager_client.patch(
        '/api/follow-ups/99999/assign/',
        {'veterinarian_id': 1},
        format='json',
    )
    assert response.status_code == 404


@pytest.mark.django_db
def test_assign_returns_403_when_user_cannot_manage_shelter(
    authenticated_client, follow_up_of, animal, veterinarian,
):
    fu = follow_up_of(animal)

    response = authenticated_client.patch(
        f'/api/follow-ups/{fu.id}/assign/',
        {'veterinarian_id': veterinarian.id},
        format='json',
    )
    assert response.status_code == 403


@pytest.mark.django_db
def test_assign_returns_400_when_veterinarian_id_missing(
    web_manager_client, follow_up_of, animal,
):
    fu = follow_up_of(animal)

    response = web_manager_client.patch(
        f'/api/follow-ups/{fu.id}/assign/',
        {},
        format='json',
    )
    assert response.status_code == 400


@pytest.mark.django_db
def test_assign_returns_400_when_veterinarian_not_found(
    web_manager_client, follow_up_of, animal,
):
    fu = follow_up_of(animal)

    response = web_manager_client.patch(
        f'/api/follow-ups/{fu.id}/assign/',
        {'veterinarian_id': 99999},
        format='json',
    )
    assert response.status_code == 400


@pytest.mark.django_db
def test_assign_success_transitions_pending_to_in_progress(
    web_manager_client, follow_up_of, animal, veterinarian,
):
    fu = follow_up_of(animal)

    response = web_manager_client.patch(
        f'/api/follow-ups/{fu.id}/assign/',
        {'veterinarian_id': veterinarian.id},
        format='json',
    )

    assert response.status_code == 200
    fu.refresh_from_db()
    assert fu.assigned_veterinarian_id == veterinarian.id
    assert fu.status == PostAdoptionFollowUp.Status.IN_PROGRESS


# ---------------------------------------------------------------------------
# follow_up_complete
# ---------------------------------------------------------------------------


@pytest.mark.django_db
def test_complete_returns_404_when_follow_up_missing(vet_client):
    response = vet_client.patch('/api/follow-ups/99999/complete/', {}, format='json')
    assert response.status_code == 404


@pytest.mark.django_db
def test_complete_returns_403_when_user_cannot_complete(
    authenticated_client, follow_up_of, animal,
):
    fu = follow_up_of(animal)

    response = authenticated_client.patch(
        f'/api/follow-ups/{fu.id}/complete/', {}, format='json',
    )
    assert response.status_code == 403


@pytest.mark.django_db
def test_complete_by_assigned_vet_sets_status_completed(
    vet_client, veterinarian, follow_up_of, animal,
):
    fu = follow_up_of(animal, assigned_veterinarian=veterinarian)

    response = vet_client.patch(
        f'/api/follow-ups/{fu.id}/complete/', {}, format='json',
    )

    assert response.status_code == 200
    fu.refresh_from_db()
    assert fu.status == PostAdoptionFollowUp.Status.COMPLETED
    assert fu.completed_date == date.today()


# ---------------------------------------------------------------------------
# animal_clinical_history
# ---------------------------------------------------------------------------


@pytest.mark.django_db
def test_clinical_history_returns_404_for_missing_animal(authenticated_client):
    response = authenticated_client.get('/api/animals/99999/clinical-history/')
    assert response.status_code == 404


@pytest.mark.django_db
def test_clinical_history_returns_403_for_unauthorized_adopter(
    authenticated_client, animal,
):
    response = authenticated_client.get(f'/api/animals/{animal.id}/clinical-history/')
    assert response.status_code == 403


@pytest.mark.django_db
def test_clinical_history_lists_entries_for_adopter(
    api_client, existing_user, animal,
):
    animal.adopted_by = existing_user
    animal.save(update_fields=['adopted_by'])
    ClinicalHistoryEntry.objects.create(
        animal=animal,
        entry_type=ClinicalHistoryEntry.EntryType.CHECKUP,
        title='First checkup',
        occurred_at=datetime(2026, 1, 1, tzinfo=dt_timezone.utc),
    )
    api_client.force_authenticate(user=existing_user)

    response = api_client.get(f'/api/animals/{animal.id}/clinical-history/')

    assert response.status_code == 200
    assert len(response.data) == 1
    assert response.data[0]['title'] == 'First checkup'


@pytest.mark.django_db
def test_clinical_history_allows_assigned_vet(
    vet_client, veterinarian, animal, follow_up_of,
):
    follow_up_of(animal, assigned_veterinarian=veterinarian)

    response = vet_client.get(f'/api/animals/{animal.id}/clinical-history/')

    assert response.status_code == 200


# ---------------------------------------------------------------------------
# animal_clinical_history_create
# ---------------------------------------------------------------------------


@pytest.mark.django_db
def test_clinical_history_create_returns_404_for_missing_animal(vet_client):
    response = vet_client.post(
        '/api/animals/99999/clinical-history/create/',
        {'entry_type': 'checkup', 'title': 'x', 'occurred_at': '2026-01-01T00:00:00Z'},
        format='json',
    )
    assert response.status_code == 404


@pytest.mark.django_db
def test_clinical_history_create_returns_403_for_unauthorized(
    authenticated_client, animal,
):
    response = authenticated_client.post(
        f'/api/animals/{animal.id}/clinical-history/create/',
        {'entry_type': 'checkup', 'title': 'x', 'occurred_at': '2026-01-01T00:00:00Z'},
        format='json',
    )
    assert response.status_code == 403


@pytest.mark.django_db
def test_clinical_history_create_success_by_shelter_admin(
    shelter_admin_client, animal,
):
    payload = {
        'entry_type': 'checkup',
        'title': 'Yearly checkup',
        'body_es': 'Sano',
        'occurred_at': '2026-01-01T10:00:00Z',
    }
    response = shelter_admin_client.post(
        f'/api/animals/{animal.id}/clinical-history/create/',
        payload,
        format='json',
    )

    assert response.status_code == 201
    assert ClinicalHistoryEntry.objects.filter(animal=animal).count() == 1


@pytest.mark.django_db
def test_clinical_history_create_validation_error_returns_400(
    shelter_admin_client, animal,
):
    response = shelter_admin_client.post(
        f'/api/animals/{animal.id}/clinical-history/create/',
        {'entry_type': 'checkup'},
        format='json',
    )
    assert response.status_code == 400


# ---------------------------------------------------------------------------
# veterinarians_list
# ---------------------------------------------------------------------------


@pytest.mark.django_db
def test_clinical_history_viewable_by_web_manager(web_manager_client, animal):
    response = web_manager_client.get(f'/api/animals/{animal.id}/clinical-history/')
    assert response.status_code == 200


@pytest.mark.django_db
def test_clinical_history_viewable_by_shelter_admin_of_owning_shelter(
    shelter_admin_client, animal,
):
    response = shelter_admin_client.get(f'/api/animals/{animal.id}/clinical-history/')
    assert response.status_code == 200


@pytest.mark.django_db
def test_clinical_history_create_persists_entry_for_adopted_animal(
    shelter_admin_client, animal, existing_user,
):
    animal.adopted_by = existing_user
    animal.save(update_fields=['adopted_by'])

    response = shelter_admin_client.post(
        f'/api/animals/{animal.id}/clinical-history/create/',
        {
            'entry_type': 'vaccination',
            'title': 'Rabies vaccine',
            'occurred_at': '2026-03-01T10:00:00Z',
        },
        format='json',
    )

    assert response.status_code == 201
    entry = ClinicalHistoryEntry.objects.get(animal=animal)
    assert entry.title == 'Rabies vaccine'


@pytest.mark.django_db
def test_veterinarians_list_returns_403_for_adopter(authenticated_client):
    response = authenticated_client.get('/api/admin/users/veterinarians/')
    assert response.status_code == 403


@pytest.mark.django_db
def test_veterinarians_list_returns_active_vets_for_web_manager(
    web_manager_client, veterinarian,
):
    UserFactory(email='inactive-vet@example.com', role='veterinarian', is_active=False)

    response = web_manager_client.get('/api/admin/users/veterinarians/')

    assert response.status_code == 200
    emails = {u['email'] for u in response.data}
    assert veterinarian.email in emails
    assert 'inactive-vet@example.com' not in emails
