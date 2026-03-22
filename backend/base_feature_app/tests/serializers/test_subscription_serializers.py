import pytest

from base_feature_app.serializers.subscription import SubscriptionSerializer


@pytest.mark.django_db
def test_subscription_serializer_identity_fields(subscription):
    """Serializer returns correct identity and relationship fields."""
    data = SubscriptionSerializer(subscription).data

    assert data['id'] == subscription.pk
    assert data['sponsorship'] == subscription.sponsorship.pk
    assert data['provider'] == 'wompi'
    assert data['provider_reference'] == 'SUB-TEST-001'


@pytest.mark.django_db
def test_subscription_serializer_state_and_timestamp_fields(subscription):
    """Serializer returns correct state fields and includes timestamps."""
    data = SubscriptionSerializer(subscription).data

    assert data['interval'] == 'monthly'
    assert data['status'] == 'active'
    assert 'created_at' in data
    assert 'updated_at' in data
