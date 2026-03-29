"""
Test helper utilities shared across multiple test modules.

These are thin wrappers around factory-boy factories that preserve
the original make_* API for backward compatibility.
"""
from base_feature_app.tests.factories import (
    AnimalFactory,
    CampaignFactory,
    DonationFactory,
    ShelterFactory,
    SponsorshipFactory,
    UserFactory,
)
from django_attachments.models import Library


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
    """Create and return a Library instance for gallery fields."""
    return Library.objects.create(title=title)


def make_user(email='adopter@example.com', password='testpass123', role='adopter', **kwargs):
    """Create and return a User instance."""
    return UserFactory(email=email, password=password, role=role, **kwargs)


def make_shelter(owner=None, name='Refugio Test', city='Bogota', verification_status='verified'):
    """Create and return a Shelter instance."""
    kwargs = {'name': name, 'city': city, 'verification_status': verification_status}
    if owner is not None:
        kwargs['owner'] = owner
    return ShelterFactory(**kwargs)


def make_animal(shelter=None, name='Luna', species='dog', status='published'):
    """Create and return an Animal instance."""
    kwargs = {'name': name, 'species': species, 'status': status}
    if shelter is not None:
        kwargs['shelter'] = shelter
    return AnimalFactory(**kwargs)


def make_campaign(shelter=None, title='Campana de emergencia', goal_amount=500000):
    """Create and return a Campaign instance."""
    from decimal import Decimal
    kwargs = {'title_es': title, 'goal_amount': Decimal(str(goal_amount))}
    if shelter is not None:
        kwargs['shelter'] = shelter
    return CampaignFactory(**kwargs)


def make_donation(user=None, shelter=None, campaign=None, amount=50000):
    """Create and return a Donation instance."""
    from decimal import Decimal
    kwargs = {'amount': Decimal(str(amount))}
    if user is not None:
        kwargs['user'] = user
    if shelter is not None:
        kwargs['shelter'] = shelter
    if campaign is not None:
        kwargs['campaign'] = campaign
    return DonationFactory(**kwargs)


def make_sponsorship(user=None, animal=None, amount=30000, frequency='monthly'):
    """Create and return a Sponsorship instance."""
    from decimal import Decimal
    kwargs = {'amount': Decimal(str(amount)), 'frequency': frequency}
    if user is not None:
        kwargs['user'] = user
    if animal is not None:
        kwargs['animal'] = animal
    return SponsorshipFactory(**kwargs)
