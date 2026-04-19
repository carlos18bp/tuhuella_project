import pytest

from base_feature_app.models import PaymentHistory
from base_feature_app.tests.factories import PaymentFactory, UserFactory


@pytest.mark.django_db
def test_payment_history_str_shows_transition():
    payment = PaymentFactory()
    history = PaymentHistory.objects.create(
        payment=payment, previous_status='pending', new_status='paid',
    )
    assert '→' in str(history)


@pytest.mark.django_db
def test_payment_history_ordering_is_oldest_first():
    payment = PaymentFactory()
    h1 = PaymentHistory.objects.create(payment=payment, new_status='paid')
    h2 = PaymentHistory.objects.create(payment=payment, new_status='refunded')
    qs = list(PaymentHistory.objects.filter(payment=payment, pk__in=[h1.pk, h2.pk]))
    assert qs[0] == h1
    assert qs[1] == h2


@pytest.mark.django_db
def test_payment_history_source_defaults_to_system():
    payment = PaymentFactory()
    history = PaymentHistory.objects.create(payment=payment, new_status='paid')
    assert history.source == PaymentHistory.Source.SYSTEM


@pytest.mark.django_db
def test_payment_history_changed_by_can_be_null():
    payment = PaymentFactory()
    history = PaymentHistory.objects.create(
        payment=payment, new_status='paid', changed_by=None,
    )
    assert history.changed_by is None


@pytest.mark.django_db
def test_payment_history_fk_cascades_on_payment_delete():
    payment = PaymentFactory()
    PaymentHistory.objects.create(payment=payment, new_status='paid')
    payment.delete()
    assert PaymentHistory.objects.count() == 0
