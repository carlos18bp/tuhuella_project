"""
Test helper utilities shared across multiple test modules.

These are utility functions (not fixtures) that provide common
data-building or response-parsing operations reused in tests.
"""
from decimal import Decimal

from django.contrib.auth import get_user_model
from django_attachments.models import Library

from base_feature_app.models import (
    Animal,
    Campaign,
    Donation,
    Shelter,
    Sponsorship,
)

User = get_user_model()


def get_paginated_results(response_data):
    """
    Extract results list from a DRF PageNumberPagination response.

    Args:
        response_data: The parsed JSON body of a paginated API response.

    Returns:
        list: The 'results' array, or the original data if not paginated.
    """
    if isinstance(response_data, dict) and 'results' in response_data:
        return response_data['results']
    return response_data


def make_library(title='Test Library'):
    """
    Create and return a Library instance for gallery fields.

    Args:
        title: Human-readable label for the library.

    Returns:
        Library: The created Library instance.
    """
    return Library.objects.create(title=title)


def make_user(email='adopter@example.com', password='testpass123', role='adopter', **kwargs):
    """
    Create and return a User instance.

    Args:
        email: User email address.
        password: Plain text password.
        role: User role (adopter, shelter_admin, admin).

    Returns:
        User: The created User instance.
    """
    defaults = {
        'first_name': 'Test',
        'last_name': 'User',
        'city': 'Bogotá',
    }
    defaults.update(kwargs)
    return User.objects.create_user(email=email, password=password, role=role, **defaults)


def make_shelter(owner=None, name='Refugio Test', city='Bogotá', verification_status='verified'):
    """
    Create and return a Shelter instance.

    Args:
        owner: User who owns the shelter. Created if not provided.
        name: Shelter display name.
        city: Shelter city.
        verification_status: pending, verified, or rejected.

    Returns:
        Shelter: The created Shelter instance.
    """
    if owner is None:
        owner = make_user(email=f'shelter-owner-{name}@example.com', role='shelter_admin')
    return Shelter.objects.create(
        owner=owner,
        name=name,
        city=city,
        verification_status=verification_status,
    )


def make_animal(shelter=None, name='Luna', species='dog', status='published'):
    """
    Create and return an Animal instance.

    Args:
        shelter: Shelter FK. Created if not provided.
        name: Animal name.
        species: dog, cat, or other.
        status: draft, published, in_process, adopted, archived.

    Returns:
        Animal: The created Animal instance.
    """
    if shelter is None:
        shelter = make_shelter()
    return Animal.objects.create(
        shelter=shelter,
        name=name,
        species=species,
        breed='Mestizo',
        age_range='adult',
        gender='female',
        size='medium',
        description_es=f'{name} is a friendly animal.',
        status=status,
        is_vaccinated=True,
        is_sterilized=True,
    )


def make_campaign(shelter=None, title='Campaña de emergencia', goal_amount=500000):
    """
    Create and return a Campaign instance.

    Args:
        shelter: Shelter FK. Created if not provided.
        title: Campaign title.
        goal_amount: Fundraising goal.

    Returns:
        Campaign: The created Campaign instance.
    """
    if shelter is None:
        shelter = make_shelter(name='Refugio Campaña')
    return Campaign.objects.create(
        shelter=shelter,
        title_es=title,
        description_es='Help us care for more animals.',
        goal_amount=Decimal(str(goal_amount)),
        raised_amount=Decimal('0'),
        status='active',
    )


def make_donation(user=None, shelter=None, campaign=None, amount=50000):
    """
    Create and return a Donation instance.

    Args:
        user: User FK. Created if not provided.
        shelter: Optional Shelter FK.
        campaign: Optional Campaign FK.
        amount: Donation amount.

    Returns:
        Donation: The created Donation instance.
    """
    if user is None:
        user = make_user(email='donor@example.com')
    return Donation.objects.create(
        user=user,
        shelter=shelter,
        campaign=campaign,
        amount=Decimal(str(amount)),
        status='pending',
    )


def make_sponsorship(user=None, animal=None, amount=30000, frequency='monthly'):
    """
    Create and return a Sponsorship instance.

    Args:
        user: User FK. Created if not provided.
        animal: Animal FK. Created if not provided.
        amount: Sponsorship amount.
        frequency: monthly or one_time.

    Returns:
        Sponsorship: The created Sponsorship instance.
    """
    if user is None:
        user = make_user(email='sponsor@example.com')
    if animal is None:
        animal = make_animal()
    return Sponsorship.objects.create(
        user=user,
        animal=animal,
        amount=Decimal(str(amount)),
        frequency=frequency,
        status='active',
    )
