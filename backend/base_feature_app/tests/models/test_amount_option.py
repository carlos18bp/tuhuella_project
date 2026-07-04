import pytest

from base_feature_app.models import DonationAmountOption, SponsorshipAmountOption
from base_feature_app.tests.factories import (
    DonationAmountOptionFactory,
    SponsorshipAmountOptionFactory,
)


@pytest.mark.django_db
def test_donation_option_persists():
    option = DonationAmountOptionFactory(amount=25000, label='$25,000')
    assert DonationAmountOption.objects.filter(pk=option.pk).exists()
    assert option.amount == 25000


@pytest.mark.django_db
def test_sponsorship_option_persists():
    option = SponsorshipAmountOptionFactory(amount=30000, label='$30,000')
    assert SponsorshipAmountOption.objects.filter(pk=option.pk).exists()
    assert option.amount == 30000


@pytest.mark.django_db
@pytest.mark.parametrize('factory', [DonationAmountOptionFactory, SponsorshipAmountOptionFactory])
def test_str_returns_label_when_present(factory):
    option = factory(label='Aporte grande', amount=50000)
    assert str(option) == 'Aporte grande'


@pytest.mark.django_db
@pytest.mark.parametrize('factory', [DonationAmountOptionFactory, SponsorshipAmountOptionFactory])
def test_str_falls_back_to_formatted_amount(factory):
    option = factory(label='', amount=50000)
    assert str(option) == '$50,000'


@pytest.mark.django_db
def test_donation_options_ordered_by_order_then_amount():
    DonationAmountOptionFactory(order=2, amount=10000, label='segundo')
    DonationAmountOptionFactory(order=1, amount=99000, label='primero')
    labels = list(DonationAmountOption.objects.values_list('label', flat=True))
    assert labels == ['primero', 'segundo']
