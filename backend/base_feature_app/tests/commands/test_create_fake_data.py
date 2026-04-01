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
    Sponsorship,
    UpdatePost,
    User,
)


@pytest.mark.django_db
def test_create_users_creates_admin():
    """create_users command creates the admin@mihuella.com superuser."""
    call_command('create_users', '--count', '2')

    assert User.objects.filter(email='admin@mihuella.com', is_superuser=True).exists()


@pytest.mark.django_db
def test_create_users_creates_specified_count():
    """create_users command creates the requested number of regular users."""
    call_command('create_users', '--count', '3')

    non_admin_count = User.objects.filter(is_superuser=False).count()
    assert non_admin_count == 3


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
