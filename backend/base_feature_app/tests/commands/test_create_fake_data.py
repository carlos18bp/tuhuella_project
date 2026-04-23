from unittest.mock import patch

import pytest
from django.core.management import call_command

from base_feature_app.models import (
    AdopterIntent,
    AdoptionApplication,
    Animal,
    Campaign,
    Donation,
    Favorite,
    Shelter,
    ShelterMembership,
    Sponsorship,
    UpdatePost,
    User,
)


@pytest.mark.django_db
def test_create_users_creates_admin():
    """create_users command creates the admin@tuhuella.com superuser."""
    call_command('create_users', '--count', '2')

    assert User.objects.filter(email='admin@tuhuella.com', is_superuser=True).exists()


@pytest.mark.django_db
def test_create_users_creates_specified_count():
    """create_users --count creates that many Faker users on top of the fixed seed set."""
    call_command('create_users', '--count', '3')

    # Faker emails are the ones NOT in the fixed seed list. The fixed admin/shelter_admin/
    # adopter/web_manager/vet accounts all use @tuhuella.com.
    from base_feature_app.management.commands.create_users import (
        FIXED_ADMIN,
        FIXED_ADOPTERS,
        FIXED_SHELTER_ADMINS,
        FIXED_VETERINARIANS,
        FIXED_WEB_MANAGERS,
    )

    fixed_emails = {FIXED_ADMIN['email']}
    for group in (FIXED_SHELTER_ADMINS, FIXED_ADOPTERS, FIXED_WEB_MANAGERS, FIXED_VETERINARIANS):
        fixed_emails.update(entry['email'] for entry in group)

    faker_count = User.objects.exclude(email__in=fixed_emails).count()
    assert faker_count == 3


@pytest.mark.django_db
def test_create_shelters_creates_records():
    """create_shelters command creates shelter records."""
    call_command('create_users', '--count', '4')
    call_command('create_shelters', '--count', '2')

    assert Shelter.objects.count() == 2


@pytest.mark.django_db
def test_create_animals_creates_records():
    """create_animals command creates animal records."""
    call_command('create_users', '--count', '4')
    call_command('create_shelters', '--count', '2')
    call_command('create_animals', '--count', '5')

    assert Animal.objects.count() == 5


@pytest.mark.django_db
def test_create_campaigns_creates_records():
    """create_campaigns command creates campaign records."""
    call_command('create_users', '--count', '4')
    call_command('create_shelters', '--count', '2')
    call_command('create_campaigns', '--count', '3')

    assert Campaign.objects.count() == 3


@pytest.mark.django_db
def test_create_donations_creates_records():
    """create_donations command creates donation records."""
    call_command('create_users', '--count', '4')
    call_command('create_shelters', '--count', '2')
    call_command('create_campaigns', '--count', '2')
    call_command('create_donations', '--count', '3')

    assert Donation.objects.count() == 3


@pytest.mark.django_db
def test_create_sponsorships_creates_records():
    """create_sponsorships command creates sponsorship records."""
    call_command('create_users', '--count', '4')
    call_command('create_shelters', '--count', '2')
    call_command('create_animals', '--count', '5')
    call_command('create_sponsorships', '--count', '2')

    assert Sponsorship.objects.count() == 2


@pytest.mark.django_db
def test_create_adoptions_creates_records():
    """create_adoptions command creates adoption application records."""
    call_command('create_users', '--count', '4')
    call_command('create_shelters', '--count', '2')
    call_command('create_animals', '--count', '5')
    call_command('create_adoptions', '--count', '2')

    assert AdoptionApplication.objects.count() >= 1


@pytest.mark.django_db
def test_create_update_posts_creates_records():
    """create_update_posts command creates update post records."""
    call_command('create_users', '--count', '4')
    call_command('create_shelters', '--count', '2')
    call_command('create_animals', '--count', '3')
    call_command('create_campaigns', '--count', '2')
    call_command('create_update_posts', '--count', '3')

    assert UpdatePost.objects.count() == 3


@pytest.mark.django_db
def test_create_adopter_intents_creates_records():
    """create_adopter_intents command creates adopter intent records."""
    call_command('create_users', '--count', '4')
    call_command('create_adopter_intents', '--count', '2')

    assert AdopterIntent.objects.count() == 2


@pytest.mark.django_db
def test_create_favorites_creates_records():
    """create_favorites command creates favorite records."""
    call_command('create_users', '--count', '4')
    call_command('create_shelters', '--count', '2')
    call_command('create_animals', '--count', '5')
    call_command('create_favorites', '--count', '3')

    assert Favorite.objects.count() >= 1


@pytest.mark.django_db
def test_delete_fake_data_clears_records():
    """delete_fake_data --confirm removes all non-superuser fake data."""
    call_command('create_users', '--count', '4')
    call_command('create_shelters', '--count', '2')
    call_command('create_animals', '--count', '5')

    call_command('delete_fake_data', '--confirm')

    assert Animal.objects.count() == 0
    assert Shelter.objects.count() == 0
    assert User.objects.filter(is_superuser=False).count() == 0


@pytest.mark.django_db
def test_delete_fake_data_preserves_superusers():
    """delete_fake_data command preserves superuser accounts."""
    call_command('create_users', '--count', '2')

    superuser_count_before = User.objects.filter(is_superuser=True).count()
    call_command('delete_fake_data', '--confirm')
    superuser_count_after = User.objects.filter(is_superuser=True).count()

    assert superuser_count_after == superuser_count_before


# --- create_shelters extra coverage ---

@pytest.mark.django_db
def test_create_shelters_skips_when_no_shelter_admins():
    """create_shelters returns early and creates no shelters when no shelter_admin users exist."""
    call_command('create_shelters', '--count', '2')

    assert Shelter.objects.count() == 0


@pytest.mark.django_db
def test_create_shelters_creates_owner_membership_for_each_shelter():
    """create_shelters creates a ShelterMembership with role='owner' for each shelter."""
    call_command('create_users', '--count', '4')
    call_command('create_shelters', '--count', '2')

    assert ShelterMembership.objects.filter(role=ShelterMembership.Role.OWNER).count() >= 2


@pytest.mark.django_db
def test_create_shelters_generates_faker_shelters_when_count_exceeds_fixed():
    """create_shelters creates faker-generated shelters beyond the fixed seed count."""
    call_command('create_users', '--count', '4')
    call_command('create_shelters', '--count', '5')

    assert Shelter.objects.count() == 5


@pytest.mark.django_db
def test_create_shelters_is_idempotent_for_fixed_shelters():
    """Running create_shelters twice does not duplicate fixed seed shelters."""
    call_command('create_users', '--count', '4')
    call_command('create_shelters', '--count', '2')
    first_count = Shelter.objects.count()

    call_command('create_shelters', '--count', '2')

    assert Shelter.objects.count() == first_count


# --- create_campaigns extra coverage ---

@pytest.mark.django_db
def test_create_campaigns_skips_when_no_verified_shelters():
    """create_campaigns returns early when no verified shelters exist."""
    call_command('create_campaigns', '--count', '3')

    assert Campaign.objects.count() == 0


@pytest.mark.django_db
def test_create_campaigns_creates_pending_campaign():
    """create_campaigns produces at least one PENDING campaign when count is large enough."""
    call_command('create_users', '--count', '4')
    call_command('create_shelters', '--count', '2')
    call_command('create_campaigns', '--count', '4')

    assert Campaign.objects.filter(approval_status=Campaign.ApprovalStatus.PENDING).count() >= 1


@pytest.mark.django_db
def test_create_campaigns_creates_rejected_campaign():
    """create_campaigns produces at least one REJECTED campaign when count is large enough."""
    call_command('create_users', '--count', '4')
    call_command('create_shelters', '--count', '2')
    call_command('create_campaigns', '--count', '5')

    assert Campaign.objects.filter(approval_status=Campaign.ApprovalStatus.REJECTED).count() >= 1


@pytest.mark.django_db
def test_create_campaigns_creates_completed_campaign():
    """create_campaigns produces at least one COMPLETED campaign when count is large enough."""
    call_command('create_users', '--count', '4')
    call_command('create_shelters', '--count', '2')
    call_command('create_campaigns', '--count', '3')

    assert Campaign.objects.filter(status=Campaign.Status.COMPLETED).count() >= 1


@pytest.mark.django_db
@patch('base_feature_app.management.commands.create_campaigns.urllib.request.urlopen',
       side_effect=Exception('Network error'))
def test_create_campaigns_evidence_images_skipped_on_network_failure(mock_urlopen):
    """Network failures in _add_evidence_images are silently skipped; campaigns still created."""
    call_command('create_users', '--count', '4')
    call_command('create_shelters', '--count', '2')
    call_command('create_campaigns', '--count', '3')

    assert Campaign.objects.count() >= 1
