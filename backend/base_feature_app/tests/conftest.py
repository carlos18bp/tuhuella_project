from decimal import Decimal

import pytest
from django.contrib.auth import get_user_model
from django.utils import timezone
from rest_framework.test import APIClient

from base_feature_app.models import (
    AdopterIntent,
    Animal,
    AdoptionApplication,
    BlogPost,
    Campaign,
    Donation,
    Favorite,
    NotificationLog,
    NotificationPreference,
    Payment,
    Shelter,
    ShelterInvite,
    Sponsorship,
    Subscription,
    UpdatePost,
)


@pytest.fixture
def api_client():
    return APIClient()


@pytest.fixture
def existing_user(db):
    """Regular authenticated user for use in tests requiring a logged-in customer."""
    User = get_user_model()
    return User.objects.create_user(
        email='user@example.com',
        password='existingpassword',
        first_name='Test',
        last_name='User',
    )


@pytest.fixture
def admin_user(db):
    """Staff/admin user for use in tests requiring elevated permissions."""
    User = get_user_model()
    user = User.objects.create_user(
        email='admin@example.com',
        password='adminpassword',
        first_name='Admin',
        last_name='User',
    )
    user.is_staff = True
    user.is_superuser = True
    user.save(update_fields=['is_staff', 'is_superuser'])
    return user


@pytest.fixture
def shelter_admin_user(db):
    """User with shelter_admin role."""
    User = get_user_model()
    return User.objects.create_user(
        email='shelteradmin@example.com',
        password='shelterpass',
        first_name='Shelter',
        last_name='Admin',
        role='shelter_admin',
    )


@pytest.fixture
def other_user(db):
    """A second regular user for permission tests."""
    User = get_user_model()
    return User.objects.create_user(
        email='other@example.com',
        password='otherpassword',
        first_name='Other',
        last_name='Person',
    )


@pytest.fixture
def authenticated_client(api_client, existing_user):
    """APIClient pre-authenticated as a regular user."""
    api_client.force_authenticate(user=existing_user)
    return api_client


@pytest.fixture
def admin_client(api_client, admin_user):
    """APIClient pre-authenticated as a staff/admin user."""
    api_client.force_authenticate(user=admin_user)
    return api_client


@pytest.fixture
def shelter_admin_client(api_client, shelter_admin_user):
    """APIClient pre-authenticated as a shelter admin."""
    api_client.force_authenticate(user=shelter_admin_user)
    return api_client


@pytest.fixture
def shelter(shelter_admin_user):
    """Verified shelter owned by shelter_admin_user."""
    return Shelter.objects.create(
        name='Happy Paws',
        legal_name='Happy Paws Foundation',
        description='A great shelter',
        city='Bogotá',
        address='Calle 123',
        phone='3001234567',
        email='info@happypaws.org',
        verification_status=Shelter.VerificationStatus.VERIFIED,
        owner=shelter_admin_user,
    )


@pytest.fixture
def animal(shelter):
    """Published animal belonging to the test shelter."""
    return Animal.objects.create(
        shelter=shelter,
        name='Luna',
        species=Animal.Species.DOG,
        breed='Labrador',
        age_range=Animal.AgeRange.YOUNG,
        gender=Animal.Gender.FEMALE,
        size=Animal.Size.MEDIUM,
        description='Friendly dog',
        status=Animal.Status.PUBLISHED,
        is_vaccinated=True,
        is_sterilized=False,
    )


@pytest.fixture
def campaign(shelter):
    """Active campaign for the test shelter."""
    now = timezone.now()
    return Campaign.objects.create(
        shelter=shelter,
        title='Medical Fund',
        description='Help us cover medical costs',
        goal_amount=Decimal('500000.00'),
        status=Campaign.Status.ACTIVE,
        starts_at=now,
        ends_at=now + timezone.timedelta(days=30),
    )


@pytest.fixture
def donation(existing_user, shelter, campaign):
    """Donation from existing_user to shelter/campaign."""
    return Donation.objects.create(
        user=existing_user,
        shelter=shelter,
        campaign=campaign,
        amount=Decimal('50000.00'),
        status=Donation.Status.PENDING,
    )


@pytest.fixture
def sponsorship(existing_user, animal):
    """Sponsorship from existing_user for an animal."""
    return Sponsorship.objects.create(
        user=existing_user,
        animal=animal,
        amount=Decimal('30000.00'),
        frequency=Sponsorship.Frequency.MONTHLY,
        status=Sponsorship.Status.ACTIVE,
    )


@pytest.fixture
def adoption_application(existing_user, animal):
    """Adoption application from existing_user for an animal."""
    return AdoptionApplication.objects.create(
        animal=animal,
        user=existing_user,
        form_answers={'reason': 'I love dogs'},
        notes='Please consider me',
    )


@pytest.fixture
def favorite(existing_user, animal):
    """Favorite linking existing_user to an animal."""
    return Favorite.objects.create(user=existing_user, animal=animal)


@pytest.fixture
def update_post(shelter, campaign, animal):
    """Update post for the test shelter."""
    return UpdatePost.objects.create(
        shelter=shelter,
        campaign=campaign,
        animal=animal,
        title='Luna recovered!',
        content='Luna is doing great after surgery.',
    )


@pytest.fixture
def adopter_intent(existing_user):
    """Adopter intent for existing_user."""
    return AdopterIntent.objects.create(
        user=existing_user,
        preferences={'species': 'dog', 'size': 'medium'},
        description='Looking for a friendly dog',
        status=AdopterIntent.Status.ACTIVE,
        visibility=AdopterIntent.Visibility.PUBLIC,
    )


@pytest.fixture
def shelter_invite(shelter, adopter_intent):
    """Shelter invite from shelter to adopter_intent."""
    return ShelterInvite.objects.create(
        shelter=shelter,
        adopter_intent=adopter_intent,
        message='We have the perfect match for you!',
    )


@pytest.fixture
def subscription(sponsorship):
    """Subscription for the test sponsorship."""
    return Subscription.objects.create(
        sponsorship=sponsorship,
        provider='wompi',
        provider_reference='SUB-TEST-001',
        interval=Subscription.Interval.MONTHLY,
        status=Subscription.Status.ACTIVE,
    )


@pytest.fixture
def payment(donation):
    """Payment for the test donation."""
    return Payment.objects.create(
        donation=donation,
        provider='wompi',
        provider_reference='PAY-TEST-001',
        amount=donation.amount,
        status=Payment.Status.PENDING,
        metadata={'type': 'donation'},
    )


@pytest.fixture
def notification_preference(existing_user):
    """Notification preference for existing_user."""
    return NotificationPreference.objects.create(
        user=existing_user,
        event_key='adoption_status_change',
        channel=NotificationPreference.Channel.EMAIL,
        enabled=True,
    )


@pytest.fixture
def notification_log(existing_user):
    """Notification log for existing_user."""
    return NotificationLog.objects.create(
        recipient=existing_user,
        event_key='adoption_status_change',
        channel=NotificationPreference.Channel.EMAIL,
        status=NotificationLog.Status.SENT,
        metadata={'application_id': 1},
    )


@pytest.fixture
def blog_post(db):
    """Published blog post for testing."""
    return BlogPost.objects.create(
        title_es='Guía de adopción responsable',
        title_en='Responsible Adoption Guide',
        excerpt_es='Todo lo que necesitas saber.',
        excerpt_en='Everything you need to know.',
        category='adopcion',
        author='tuhuella-team',
        read_time_minutes=5,
        is_published=True,
        published_at=timezone.now(),
        content_json_es={'intro': 'Test intro', 'sections': []},
        content_json_en={'intro': 'Test intro EN', 'sections': []},
    )


@pytest.fixture
def draft_blog_post(db):
    """Unpublished (draft) blog post for testing."""
    return BlogPost.objects.create(
        title_es='Borrador de artículo',
        title_en='Draft article',
        excerpt_es='Aún no publicado.',
        excerpt_en='Not yet published.',
        category='consejos',
        author='laura-blanco',
        is_published=False,
    )
