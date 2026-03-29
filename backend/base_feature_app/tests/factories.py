"""
Factory-boy factories for all Mi Huella models.

Usage in tests:
    from base_feature_app.tests.factories import UserFactory, ShelterFactory, AnimalFactory

    user = UserFactory()                          # creates with defaults
    user = UserFactory(role='admin')              # override any field
    shelter = ShelterFactory()                    # auto-creates owner
    animal = AnimalFactory(name='Max')            # auto-creates shelter chain
    users = UserFactory.create_batch(5)           # bulk creation
    user_data = UserFactory.build()               # in-memory only (no DB)
"""
from decimal import Decimal

import factory
from django.contrib.auth import get_user_model
from django.utils import timezone

from base_feature_app.models import (
    AdopterIntent,
    AdoptionApplication,
    Animal,
    BlogPost,
    Campaign,
    Donation,
    DonationAmountOption,
    FAQItem,
    FAQTopic,
    Favorite,
    NotificationLog,
    NotificationPreference,
    Payment,
    Shelter,
    ShelterInvite,
    Sponsorship,
    SponsorshipAmountOption,
    Subscription,
    StrategicAlly,
    UpdatePost,
    VolunteerPosition,
)

User = get_user_model()


# ── User Factories ────────────────────────────────────────────────────────────


class UserFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = User
        skip_postgeneration_save = True

    email = factory.Sequence(lambda n: f'user{n}@example.com')
    first_name = factory.Faker('first_name')
    last_name = factory.Faker('last_name')
    city = 'Bogot\u00e1'
    role = 'adopter'

    @classmethod
    def _create(cls, model_class, *args, **kwargs):
        password = kwargs.pop('password', 'testpass123')
        user = model_class(*args, **kwargs)
        user.set_password(password)
        user.save()
        return user


class ShelterAdminUserFactory(UserFactory):
    email = factory.Sequence(lambda n: f'shelteradmin{n}@example.com')
    role = 'shelter_admin'


class AdminUserFactory(UserFactory):
    email = factory.Sequence(lambda n: f'admin{n}@example.com')
    is_staff = True
    is_superuser = True


# ── Shelter & Animal ──────────────────────────────────────────────────────────


class ShelterFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = Shelter

    owner = factory.SubFactory(ShelterAdminUserFactory)
    name = factory.Sequence(lambda n: f'Refugio Test {n}')
    legal_name = factory.LazyAttribute(lambda o: f'{o.name} Foundation')
    description_es = 'Un gran refugio para animales.'
    city = 'Bogot\u00e1'
    address = 'Calle 123'
    phone = '3001234567'
    email = factory.LazyAttribute(lambda o: f'info@{o.name.lower().replace(" ", "")}.org')
    verification_status = Shelter.VerificationStatus.VERIFIED


class AnimalFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = Animal

    shelter = factory.SubFactory(ShelterFactory)
    name = factory.Sequence(lambda n: f'Animal {n}')
    species = Animal.Species.DOG
    breed = 'Mestizo'
    age_range = Animal.AgeRange.ADULT
    gender = Animal.Gender.FEMALE
    size = Animal.Size.MEDIUM
    description_es = factory.LazyAttribute(lambda o: f'{o.name} es un animal amigable.')
    status = Animal.Status.PUBLISHED
    is_vaccinated = True
    is_sterilized = True


# ── Campaigns ─────────────────────────────────────────────────────────────────


class CampaignFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = Campaign

    shelter = factory.SubFactory(ShelterFactory)
    title_es = factory.Sequence(lambda n: f'Campana de emergencia {n}')
    description_es = 'Ayudanos a cuidar mas animales.'
    goal_amount = Decimal('500000.00')
    raised_amount = Decimal('0.00')
    status = Campaign.Status.ACTIVE
    starts_at = factory.LazyFunction(timezone.now)
    ends_at = factory.LazyFunction(lambda: timezone.now() + timezone.timedelta(days=30))


# ── Financial Models ──────────────────────────────────────────────────────────


class DonationFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = Donation

    user = factory.SubFactory(UserFactory)
    shelter = factory.SubFactory(ShelterFactory)
    campaign = None
    amount = Decimal('50000.00')
    status = Donation.Status.PENDING


class SponsorshipFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = Sponsorship

    user = factory.SubFactory(UserFactory)
    animal = factory.SubFactory(AnimalFactory)
    amount = Decimal('30000.00')
    frequency = Sponsorship.Frequency.MONTHLY
    status = Sponsorship.Status.ACTIVE


class PaymentFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = Payment

    donation = factory.SubFactory(DonationFactory)
    sponsorship = None
    provider = 'wompi'
    provider_reference = factory.Sequence(lambda n: f'PAY-TEST-{n:04d}')
    amount = factory.LazyAttribute(lambda o: o.donation.amount if o.donation else Decimal('50000.00'))
    status = Payment.Status.PENDING
    metadata = factory.LazyFunction(dict)


class SubscriptionFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = Subscription

    sponsorship = factory.SubFactory(SponsorshipFactory)
    provider = 'wompi'
    provider_reference = factory.Sequence(lambda n: f'SUB-TEST-{n:04d}')
    interval = Subscription.Interval.MONTHLY
    status = Subscription.Status.ACTIVE


# ── Adoption ──────────────────────────────────────────────────────────────────


class AdoptionApplicationFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = AdoptionApplication

    animal = factory.SubFactory(AnimalFactory)
    user = factory.SubFactory(UserFactory)
    status = AdoptionApplication.Status.SUBMITTED
    form_answers = factory.LazyFunction(lambda: {'reason': 'I love dogs'})
    notes = 'Please consider me'


# ── Community ─────────────────────────────────────────────────────────────────


class FavoriteFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = Favorite

    user = factory.SubFactory(UserFactory)
    animal = factory.SubFactory(AnimalFactory)


class AdopterIntentFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = AdopterIntent

    user = factory.SubFactory(UserFactory)
    preferences = factory.LazyFunction(lambda: {'species': 'dog', 'size': 'medium'})
    description = 'Looking for a friendly dog'
    status = AdopterIntent.Status.ACTIVE
    visibility = AdopterIntent.Visibility.PUBLIC


class ShelterInviteFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = ShelterInvite

    shelter = factory.SubFactory(ShelterFactory)
    adopter_intent = factory.SubFactory(AdopterIntentFactory)
    message = 'We have the perfect match for you!'
    status = ShelterInvite.Status.PENDING


# ── Content ───────────────────────────────────────────────────────────────────


class UpdatePostFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = UpdatePost

    shelter = factory.SubFactory(ShelterFactory)
    campaign = None
    animal = None
    title_es = factory.Sequence(lambda n: f'Actualizacion {n}')
    content_es = 'Todo va bien con nuestros animales.'


class BlogPostFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = BlogPost

    title_es = factory.Sequence(lambda n: f'Articulo de blog {n}')
    title_en = factory.Sequence(lambda n: f'Blog article {n}')
    excerpt_es = 'Todo lo que necesitas saber.'
    excerpt_en = 'Everything you need to know.'
    category = 'adopcion'
    author = 'tuhuella-team'
    read_time_minutes = 5
    is_published = True
    published_at = factory.LazyFunction(timezone.now)
    content_json_es = factory.LazyFunction(lambda: {'intro': 'Test intro', 'sections': []})
    content_json_en = factory.LazyFunction(lambda: {'intro': 'Test intro EN', 'sections': []})


# ── Notifications ─────────────────────────────────────────────────────────────


class NotificationPreferenceFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = NotificationPreference

    user = factory.SubFactory(UserFactory)
    event_key = 'adoption_status_change'
    channel = NotificationPreference.Channel.EMAIL
    enabled = True


class NotificationLogFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = NotificationLog

    recipient = factory.SubFactory(UserFactory)
    event_key = 'adoption_status_change'
    channel = NotificationPreference.Channel.EMAIL
    status = NotificationLog.Status.SENT
    metadata = factory.LazyFunction(lambda: {'application_id': 1})


# ── Reference Data ────────────────────────────────────────────────────────────


class FAQTopicFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = FAQTopic

    slug = factory.Sequence(lambda n: f'topic-{n}')
    display_name_es = factory.Sequence(lambda n: f'Tema {n}')
    display_name_en = factory.Sequence(lambda n: f'Topic {n}')
    is_active = True
    order = factory.Sequence(lambda n: n)


class FAQItemFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = FAQItem

    topic = factory.SubFactory(FAQTopicFactory)
    question_es = factory.Sequence(lambda n: f'Pregunta {n}?')
    question_en = factory.Sequence(lambda n: f'Question {n}?')
    answer_es = 'Respuesta de ejemplo.'
    answer_en = 'Example answer.'
    order = factory.Sequence(lambda n: n)
    is_active = True


class DonationAmountOptionFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = DonationAmountOption

    amount = factory.Iterator([10000, 25000, 50000, 100000])
    label = factory.LazyAttribute(lambda o: f'${o.amount:,}')
    is_active = True
    order = factory.Sequence(lambda n: n)


class SponsorshipAmountOptionFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = SponsorshipAmountOption

    amount = factory.Iterator([15000, 30000, 50000, 80000])
    label = factory.LazyAttribute(lambda o: f'${o.amount:,}')
    is_active = True
    order = factory.Sequence(lambda n: n)


class VolunteerPositionFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = VolunteerPosition

    title_es = factory.Sequence(lambda n: f'Posicion voluntaria {n}')
    title_en = factory.Sequence(lambda n: f'Volunteer position {n}')
    description_es = 'Descripcion del puesto.'
    description_en = 'Position description.'
    category = VolunteerPosition.Category.SHELTER_HELPER
    is_active = True
    order = factory.Sequence(lambda n: n)


class StrategicAllyFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = StrategicAlly

    name = factory.Sequence(lambda n: f'Aliado {n}')
    description_es = 'Descripcion del aliado.'
    ally_type = StrategicAlly.AllyType.COMPANY
    is_active = True
    order = factory.Sequence(lambda n: n)
