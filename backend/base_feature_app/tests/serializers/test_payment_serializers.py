import pytest

from base_feature_app.serializers.payment_detail import PaymentDetailSerializer
from base_feature_app.serializers.payment_list import PaymentListSerializer


@pytest.mark.django_db
def test_payment_list_serializer_returns_identity_and_modality(payment):
    """List serializer returns id, relations and modality."""
    data = PaymentListSerializer(payment).data

    assert data['id'] == payment.pk
    assert data['donation'] == payment.donation.pk
    assert data['sponsorship'] is None
    assert data['modality'] == 'donation'


@pytest.mark.django_db
def test_payment_list_serializer_returns_provider_and_status(payment):
    """List serializer returns provider fields and timestamps."""
    data = PaymentListSerializer(payment).data

    assert data['provider'] == 'wompi'
    assert data['provider_reference'] == 'PAY-TEST-001'
    assert data['status'] == 'pending'
    assert 'created_at' in data


@pytest.mark.django_db
def test_payment_detail_serializer_includes_metadata(payment):
    """Detail serializer includes donation, sponsorship, metadata, modality and history."""
    data = PaymentDetailSerializer(payment).data

    assert data['donation'] == payment.donation.pk
    assert data['sponsorship'] is None
    assert data['modality'] == 'donation'
    assert data['metadata'] == {'type': 'donation'}
    assert len(data['status_history']) >= 1
    assert 'updated_at' in data
