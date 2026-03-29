from decimal import Decimal

import pytest

from base_feature_app.models import Payment


@pytest.mark.django_db
def test_payment_str_with_provider_reference(payment):
    """__str__ includes provider reference and status display."""
    result = str(payment)
    assert 'PAY-TEST-001' in result
    assert 'Pending' in result


@pytest.mark.django_db
def test_payment_str_without_provider_reference(donation):
    """__str__ falls back to pk when no provider reference."""
    p = Payment.objects.create(
        donation=donation,
        amount=Decimal('10000.00'),
    )
    result = str(p)
    assert str(p.pk) in result


@pytest.mark.django_db
def test_payment_default_provider(donation):
    """New payment defaults to wompi provider."""
    p = Payment.objects.create(
        donation=donation,
        amount=Decimal('10000.00'),
    )
    assert p.provider == 'wompi'


@pytest.mark.django_db
def test_payment_default_status(donation):
    """New payment defaults to pending status."""
    p = Payment.objects.create(
        donation=donation,
        amount=Decimal('10000.00'),
    )
    assert p.status == Payment.Status.PENDING


@pytest.mark.django_db
def test_payment_donation_relationship(payment, donation):
    """Payment is linked to its donation."""
    assert payment.donation == donation
    assert payment in donation.payments.all()


@pytest.mark.django_db
def test_payment_nullable_sponsorship(donation):
    """Sponsorship FK is optional."""
    p = Payment.objects.create(
        donation=donation,
        amount=Decimal('10000.00'),
    )
    assert p.sponsorship is None


@pytest.mark.django_db
def test_payment_metadata_json(payment):
    """Metadata field stores JSON data correctly."""
    assert payment.metadata == {'type': 'donation'}


@pytest.mark.django_db
def test_payment_status_choices():
    """Status contains expected choices."""
    values = {c.value for c in Payment.Status}
    assert values == {'pending', 'approved', 'declined', 'voided', 'error'}
