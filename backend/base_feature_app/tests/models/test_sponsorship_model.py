from decimal import Decimal

import pytest

from base_feature_app.models import Sponsorship


@pytest.mark.django_db
def test_sponsorship_str_representation(sponsorship):
    """__str__ contains user email and animal name."""
    result = str(sponsorship)
    assert 'user@example.com' in result
    assert 'Luna' in result


@pytest.mark.django_db
def test_sponsorship_default_status_is_pending(existing_user, animal):
    """New sponsorship defaults to pending status."""
    s = Sponsorship.objects.create(
        user=existing_user,
        animal=animal,
        amount=Decimal('15000.00'),
        frequency=Sponsorship.Frequency.ONE_TIME,
    )

    assert s.status == Sponsorship.Status.PENDING


@pytest.mark.django_db
def test_sponsorship_frequency_choices():
    """Frequency contains expected values."""
    values = {c.value for c in Sponsorship.Frequency}
    assert 'monthly' in values
    assert 'one_time' in values


@pytest.mark.django_db
def test_sponsorship_user_relationship(sponsorship, existing_user):
    """Sponsorship is linked to its user."""
    assert sponsorship.user == existing_user
    assert sponsorship in existing_user.sponsorships.all()
