import pytest
from django.db import IntegrityError

from base_feature_app.models import Subscription


@pytest.mark.django_db
def test_subscription_str_representation(subscription):
    """__str__ includes sponsorship info and status."""
    result = str(subscription)
    assert 'Active' in result


@pytest.mark.django_db
def test_subscription_default_provider(sponsorship):
    """New subscription defaults to wompi provider."""
    sub = Subscription.objects.create(
        sponsorship=sponsorship,
        provider_reference='SUB-NEW-001',
    )
    assert sub.provider == 'wompi'


@pytest.mark.django_db
def test_subscription_default_interval(sponsorship):
    """New subscription defaults to monthly interval."""
    sub = Subscription.objects.create(
        sponsorship=sponsorship,
        provider_reference='SUB-NEW-001',
    )
    assert sub.interval == Subscription.Interval.MONTHLY


@pytest.mark.django_db
def test_subscription_default_status(sponsorship):
    """New subscription defaults to active status."""
    sub = Subscription.objects.create(
        sponsorship=sponsorship,
        provider_reference='SUB-NEW-001',
    )
    assert sub.status == Subscription.Status.ACTIVE


@pytest.mark.django_db
def test_subscription_one_to_one_constraint(subscription, sponsorship):
    """Cannot create two subscriptions for the same sponsorship."""
    with pytest.raises(IntegrityError):
        Subscription.objects.create(
            sponsorship=sponsorship,
            provider_reference='SUB-DUP-001',
        )


@pytest.mark.django_db
def test_subscription_sponsorship_relationship(subscription, sponsorship):
    """Subscription is linked to its sponsorship via OneToOne."""
    assert subscription.sponsorship == sponsorship
    assert sponsorship.subscription == subscription


@pytest.mark.django_db
def test_subscription_interval_choices():
    """Interval contains expected choices."""
    values = {c.value for c in Subscription.Interval}
    assert values == {'monthly', 'quarterly', 'yearly'}


@pytest.mark.django_db
def test_subscription_status_choices():
    """Status contains expected choices."""
    values = {c.value for c in Subscription.Status}
    assert values == {'active', 'paused', 'canceled', 'expired'}
