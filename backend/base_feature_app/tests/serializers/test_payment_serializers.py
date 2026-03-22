import pytest

from base_feature_app.serializers.payment_list import PaymentListSerializer
from base_feature_app.serializers.payment_detail import PaymentDetailSerializer


@pytest.mark.django_db
def test_payment_list_serializer_fields(payment):
    """List serializer returns summary fields."""
    data = PaymentListSerializer(payment).data

    assert data['id'] == payment.pk
    assert data['provider'] == 'wompi'
    assert data['provider_reference'] == 'PAY-TEST-001'
    assert data['status'] == 'pending'
    assert 'created_at' in data


@pytest.mark.django_db
def test_payment_detail_serializer_includes_metadata(payment):
    """Detail serializer includes donation, sponsorship, and metadata."""
    data = PaymentDetailSerializer(payment).data

    assert data['donation'] == payment.donation.pk
    assert data['sponsorship'] is None
    assert data['metadata'] == {'type': 'donation'}
    assert 'updated_at' in data
