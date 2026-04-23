import pytest
from django.urls import reverse
from django.utils import timezone
from freezegun import freeze_time
from rest_framework import status

from base_feature_app.models import AdoptionApplication, Campaign, Donation, Favorite, PostAdoptionFollowUp, Shelter
from base_feature_app.tests.factories import CampaignFactory, DonationFactory, SponsorshipFactory

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


@pytest.mark.django_db
def test_user_activity_shelter_admin_sees_animal_added(
    shelter_admin_client, shelter, animal,
):
    response = shelter_admin_client.get(reverse('user-activity'))
    types = [e['type'] for e in response.json()]
    assert 'animal_added' in types


@pytest.mark.django_db
@freeze_time('2026-01-15')
def test_user_activity_shelter_admin_sees_application_reviewed(
    api_client, shelter_admin_user, shelter, existing_user, animal,
):
    AdoptionApplication.objects.create(
        user=existing_user, animal=animal,
        status='approved', form_answers={},
        reviewed_at=timezone.now(),
    )
    api_client.force_authenticate(user=shelter_admin_user)
    response = api_client.get(reverse('user-activity'))
    types = [e['type'] for e in response.json()]
    assert 'application_reviewed' in types


@pytest.mark.django_db
def test_user_activity_veterinarian_sees_clinical_entry(api_client, animal):
    from base_feature_app.tests.factories import ClinicalHistoryEntryFactory, VeterinarianUserFactory
    vet = VeterinarianUserFactory()
    ClinicalHistoryEntryFactory(author=vet, animal=animal)
    api_client.force_authenticate(user=vet)
    response = api_client.get(reverse('user-activity'))
    types = [e['type'] for e in response.json()]
    assert 'clinical_entry' in types


@pytest.mark.django_db
@freeze_time('2026-01-15')
def test_user_activity_veterinarian_sees_followup_completed(api_client):
    from base_feature_app.tests.factories import (
        AdoptionApplicationFactory, PostAdoptionFollowUpFactory, VeterinarianUserFactory,
    )
    vet = VeterinarianUserFactory()
    app = AdoptionApplicationFactory()
    PostAdoptionFollowUpFactory(
        adoption_application=app,
        animal=app.animal,
        adopter=app.user,
        assigned_veterinarian=vet,
        status=PostAdoptionFollowUp.Status.COMPLETED,
        completed_date=timezone.now().date(),
    )
    api_client.force_authenticate(user=vet)
    response = api_client.get(reverse('user-activity'))
    types = [e['type'] for e in response.json()]
    assert 'followup_completed' in types


@pytest.mark.django_db
@freeze_time('2026-01-15')
def test_user_activity_web_manager_sees_campaign_reviewed(api_client, shelter):
    from base_feature_app.tests.factories import CampaignFactory, WebManagerUserFactory
    wm = WebManagerUserFactory()
    CampaignFactory(
        shelter=shelter,
        reviewed_by=wm,
        reviewed_at=timezone.now(),
        approval_status=Campaign.ApprovalStatus.APPROVED,
    )
    api_client.force_authenticate(user=wm)
    response = api_client.get(reverse('user-activity'))
    types = [e['type'] for e in response.json()]
    assert 'campaign_reviewed' in types


@pytest.mark.django_db
@freeze_time('2026-01-15')
def test_user_activity_admin_sees_shelter_verified(api_client, admin_user, shelter):
    admin_user.role = 'admin'
    admin_user.save(update_fields=['role'])
    shelter.verified_at = timezone.now()
    shelter.save(update_fields=['verified_at'])
    api_client.force_authenticate(user=admin_user)
    response = api_client.get(reverse('user-activity'))
    types = [e['type'] for e in response.json()]
    assert 'shelter_verified' in types


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


# ---------------------------------------------------------------------------
# profile — role-specific data
# ---------------------------------------------------------------------------


@pytest.mark.django_db
def test_get_profile_returns_admin_stats(api_client, admin_user, shelter, animal):
    """Admin user's profile includes admin_stats with counts."""
    admin_user.role = 'admin'
    admin_user.save(update_fields=['role'])
    api_client.force_authenticate(user=admin_user)
    response = api_client.get(reverse('update-profile'))
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert 'admin_stats' in data
    assert data['admin_stats']['total_users'] >= 1
    assert data['admin_stats']['total_shelters'] >= 1
    assert data['admin_stats']['total_animals'] >= 1


@pytest.mark.django_db
def test_get_profile_returns_shelter_data_for_shelter_admin(shelter_admin_client, shelter):
    """Shelter admin's profile includes shelter details."""
    response = shelter_admin_client.get(reverse('update-profile'))
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert 'shelter' in data
    assert data['shelter']['name'] == 'Happy Paws'


@pytest.mark.django_db
def test_get_profile_no_shelter_key_for_adopter(authenticated_client):
    """Regular adopter profile does not include shelter data."""
    response = authenticated_client.get(reverse('update-profile'))
    assert response.status_code == status.HTTP_200_OK
    assert 'shelter' not in response.json()


@pytest.mark.django_db
def test_profile_stats_with_adopter_intent(authenticated_client, adopter_intent):
    """Profile stats include adopter intent status."""
    response = authenticated_client.get(reverse('profile-stats'))
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert data['adopter_intent']['status'] == 'active'


@pytest.mark.django_db
def test_profile_stats_pending_invites_counted(authenticated_client, shelter_invite):
    """Profile stats count pending shelter invites for public intent users."""
    response = authenticated_client.get(reverse('profile-stats'))
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert data['shelter_invites']['pending_count'] == 1


# ---------------------------------------------------------------------------
# profile — shelter_stats (SHELTER_ADMIN / WEB_MANAGER) and pending_verifications
# ---------------------------------------------------------------------------


@pytest.mark.django_db
def test_get_profile_shelter_admin_stats_counts_owned_shelter_only(
    shelter_admin_client, shelter, animal, existing_user,
):
    """Shelter admin stats count only their own shelter's records."""
    AdoptionApplication.objects.create(
        user=existing_user, animal=animal,
        status=AdoptionApplication.Status.SUBMITTED, form_answers={},
    )
    Campaign.objects.create(
        shelter=shelter, title_es='Urgente', title_en='Urgent',
        status=Campaign.Status.ACTIVE,
        approval_status=Campaign.ApprovalStatus.APPROVED,
    )

    response = shelter_admin_client.get(reverse('update-profile'))

    data = response.json()
    assert data['shelter_stats']['animals_count'] == 1
    assert data['shelter_stats']['pending_applications'] == 1
    assert data['shelter_stats']['active_campaigns'] == 1


@pytest.mark.django_db
@freeze_time('2026-01-15')
def test_get_profile_shelter_admin_stats_excludes_archived_animals(
    shelter_admin_client, shelter, animal,
):
    """Archived animals do not inflate the shelter_admin animals_count."""
    from django.utils import timezone
    from base_feature_app.tests.factories import AnimalFactory

    AnimalFactory(shelter=shelter, archived_at=timezone.now())

    response = shelter_admin_client.get(reverse('update-profile'))

    assert response.json()['shelter_stats']['animals_count'] == 1


@pytest.mark.django_db
def test_get_profile_web_manager_stats_returns_global_counts(
    api_client, existing_user, shelter, animal,
):
    """Web manager role sees platform-wide shelter stats, not per-shelter."""
    existing_user.role = 'web_manager'
    existing_user.save(update_fields=['role'])
    api_client.force_authenticate(user=existing_user)
    AdoptionApplication.objects.create(
        user=existing_user, animal=animal,
        status=AdoptionApplication.Status.SUBMITTED, form_answers={},
    )

    response = api_client.get(reverse('update-profile'))

    data = response.json()
    assert data['shelter_stats']['animals_count'] >= 1
    assert data['shelter_stats']['pending_applications'] >= 1


@pytest.mark.django_db
def test_get_profile_admin_stats_counts_pending_verifications(
    api_client, admin_user, shelter,
):
    """Admin's pending_verifications counts shelters awaiting verification."""
    admin_user.role = 'admin'
    admin_user.save(update_fields=['role'])
    shelter.verification_status = Shelter.VerificationStatus.PENDING
    shelter.save(update_fields=['verification_status'])
    api_client.force_authenticate(user=admin_user)

    response = api_client.get(reverse('update-profile'))

    assert response.json()['admin_stats']['pending_verifications'] == 1


# ---------------------------------------------------------------------------
# user-activity — shelter_admin campaign_created and donation_received
# ---------------------------------------------------------------------------


@pytest.mark.django_db
def test_user_activity_shelter_admin_sees_campaign_created(shelter_admin_client, shelter):
    """Shelter admin activity includes campaign_created events for campaigns in their shelter."""
    CampaignFactory(shelter=shelter)

    response = shelter_admin_client.get(reverse('user-activity'))

    types = [e['type'] for e in response.json()]
    assert 'campaign_created' in types


@pytest.mark.django_db
def test_user_activity_shelter_admin_sees_donation_received(shelter_admin_client, shelter):
    """Shelter admin activity includes donation_received events for paid donations to their shelter."""
    DonationFactory(shelter=shelter, status=Donation.Status.PAID)

    response = shelter_admin_client.get(reverse('user-activity'))

    types = [e['type'] for e in response.json()]
    assert 'donation_received' in types


# ---------------------------------------------------------------------------
# profile-stats — donations and sponsorships aggregation
# ---------------------------------------------------------------------------


@pytest.mark.django_db
def test_profile_stats_counts_paid_donations(authenticated_client, existing_user):
    """profile_stats donations count reflects only paid donations for the user."""
    DonationFactory(user=existing_user, status=Donation.Status.PAID)

    response = authenticated_client.get(reverse('profile-stats'))

    data = response.json()
    assert data['donations']['count'] == 1
    assert data['donations']['total_amount'] != '0.00'


@pytest.mark.django_db
def test_profile_stats_counts_active_sponsorships(authenticated_client, existing_user):
    """profile_stats sponsorships active_count reflects active sponsorships for the user."""
    SponsorshipFactory(user=existing_user, status='active')

    response = authenticated_client.get(reverse('profile-stats'))

    data = response.json()
    assert data['sponsorships']['active_count'] == 1
