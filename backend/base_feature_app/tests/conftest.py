import pytest
from rest_framework.test import APIClient

from base_feature_app.tests.factories import (
    AdopterIntentFactory,
    AdminUserFactory,
    AnimalFactory,
    AdoptionApplicationFactory,
    BlogPostFactory,
    CampaignFactory,
    DonationFactory,
    FavoriteFactory,
    NotificationLogFactory,
    NotificationPreferenceFactory,
    PaymentFactory,
    ShelterAdminUserFactory,
    ShelterFactory,
    ShelterInviteFactory,
    SponsorshipFactory,
    SubscriptionFactory,
    UpdatePostFactory,
    UserFactory,
)


@pytest.fixture
def api_client():
    return APIClient()


@pytest.fixture
def existing_user(db):
    """Regular authenticated user for use in tests requiring a logged-in customer."""
    return UserFactory(
        email='user@example.com',
        password='existingpassword',
        first_name='Test',
        last_name='User',
    )


@pytest.fixture
def admin_user(db):
    """Staff/admin user for use in tests requiring elevated permissions."""
    return AdminUserFactory(
        email='admin@example.com',
        password='adminpassword',
        first_name='Admin',
        last_name='User',
    )


@pytest.fixture
def shelter_admin_user(db):
    """User with shelter_admin role."""
    return ShelterAdminUserFactory(
        email='shelteradmin@example.com',
        password='shelterpass',
        first_name='Shelter',
        last_name='Admin',
    )


@pytest.fixture
def other_user(db):
    """A second regular user for permission tests."""
    return UserFactory(
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
    return ShelterFactory(
        owner=shelter_admin_user,
        name='Happy Paws',
        legal_name='Happy Paws Foundation',
        description_es='A great shelter',
        email='info@happypaws.org',
    )


@pytest.fixture
def animal(shelter):
    """Published animal belonging to the test shelter."""
    return AnimalFactory(
        shelter=shelter,
        name='Luna',
        species='dog',
        breed='Labrador',
        age_range='young',
        description_es='Friendly dog',
        is_sterilized=False,
    )


@pytest.fixture
def campaign(shelter):
    """Active campaign for the test shelter."""
    return CampaignFactory(
        shelter=shelter,
        title_es='Medical Fund',
        description_es='Help us cover medical costs',
    )


@pytest.fixture
def donation(existing_user, shelter, campaign):
    """Donation from existing_user to a campaign (and its shelter)."""
    from base_feature_app.models import Donation

    return DonationFactory(
        user=existing_user,
        shelter=shelter,
        campaign=campaign,
        destination=Donation.Destination.CAMPAIGN,
    )


@pytest.fixture
def sponsorship(existing_user, animal):
    """Sponsorship from existing_user for an animal."""
    return SponsorshipFactory(
        user=existing_user,
        animal=animal,
    )


@pytest.fixture
def adoption_application(existing_user, animal):
    """Adoption application from existing_user for an animal."""
    return AdoptionApplicationFactory(
        animal=animal,
        user=existing_user,
    )


@pytest.fixture
def favorite(existing_user, animal):
    """Favorite linking existing_user to an animal."""
    return FavoriteFactory(user=existing_user, animal=animal)


@pytest.fixture
def update_post(shelter, campaign, animal):
    """Update post for the test shelter."""
    return UpdatePostFactory(
        shelter=shelter,
        campaign=campaign,
        animal=animal,
        title_es='Luna recovered!',
        content_es='Luna is doing great after surgery.',
    )


@pytest.fixture
def adopter_intent(existing_user):
    """Adopter intent for existing_user."""
    return AdopterIntentFactory(user=existing_user)


@pytest.fixture
def shelter_invite(shelter, adopter_intent):
    """Shelter invite from shelter to adopter_intent."""
    return ShelterInviteFactory(
        shelter=shelter,
        adopter_intent=adopter_intent,
    )


@pytest.fixture
def subscription(sponsorship):
    """Subscription for the test sponsorship."""
    return SubscriptionFactory(
        sponsorship=sponsorship,
        provider_reference='SUB-TEST-001',
    )


@pytest.fixture
def payment(donation):
    """Payment for the test donation."""
    return PaymentFactory(
        donation=donation,
        provider_reference='PAY-TEST-001',
        amount=donation.amount,
        metadata={'type': 'donation'},
    )


@pytest.fixture
def notification_preference(existing_user):
    """Notification preference for existing_user."""
    return NotificationPreferenceFactory(user=existing_user)


@pytest.fixture
def notification_log(existing_user):
    """Notification log for existing_user."""
    return NotificationLogFactory(recipient=existing_user)


@pytest.fixture
def blog_post(db):
    """Published blog post for testing."""
    return BlogPostFactory(
        title_es='Gu\u00eda de adopci\u00f3n responsable',
        title_en='Responsible Adoption Guide',
        excerpt_es='Todo lo que necesitas saber.',
        excerpt_en='Everything you need to know.',
    )


@pytest.fixture
def draft_blog_post(db):
    """Unpublished (draft) blog post for testing."""
    return BlogPostFactory(
        title_es='Borrador de art\u00edculo',
        title_en='Draft article',
        excerpt_es='A\u00fan no publicado.',
        excerpt_en='Not yet published.',
        category='consejos',
        author='laura-blanco',
        is_published=False,
        published_at=None,
    )
