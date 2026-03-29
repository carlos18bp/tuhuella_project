import pytest
from django.urls import reverse
from rest_framework import status

from base_feature_app.models import Payment


@pytest.mark.django_db
def test_create_payment_intent_requires_auth(api_client):
    """Unauthenticated users cannot create payment intents."""
    response = api_client.post(
        reverse('payment-create-intent'),
        {'amount': '50000', 'type': 'donation', 'reference_id': 1},
        format='json',
    )

    assert response.status_code == status.HTTP_401_UNAUTHORIZED


@pytest.mark.django_db
def test_create_payment_intent_success(authenticated_client, donation):
    """Authenticated user can create a payment intent."""
    response = authenticated_client.post(
        reverse('payment-create-intent'),
        {
            'amount': '50000',
            'type': 'donation',
            'reference_id': donation.pk,
        },
        format='json',
    )

    assert response.status_code == status.HTTP_201_CREATED
    data = response.json()
    assert data['provider'] == 'wompi'
    assert data['status'] == 'pending'
    assert Payment.objects.filter(pk=data['payment_id']).exists()


@pytest.mark.django_db
def test_create_payment_intent_missing_fields(authenticated_client):
    """Missing required fields returns 400."""
    response = authenticated_client.post(
        reverse('payment-create-intent'),
        {'amount': '50000'},
        format='json',
    )

    assert response.status_code == status.HTTP_400_BAD_REQUEST


@pytest.mark.django_db
def test_payment_webhook_receives(api_client):
    """Webhook endpoint receives and acknowledges."""
    response = api_client.post(
        reverse('payment-webhook'),
        {'event': 'transaction.updated'},
        format='json',
    )

    assert response.status_code == status.HTTP_200_OK
    assert response.json()['received'] is True


@pytest.mark.django_db
def test_payment_status_requires_auth(api_client, payment):
    """Payment status requires authentication."""
    response = api_client.get(reverse('payment-status', args=[payment.pk]))

    assert response.status_code == status.HTTP_401_UNAUTHORIZED


@pytest.mark.django_db
def test_payment_status_returns_detail(authenticated_client, payment):
    """Payment status returns payment detail."""
    response = authenticated_client.get(
        reverse('payment-status', args=[payment.pk])
    )

    assert response.status_code == status.HTTP_200_OK
    assert response.json()['provider'] == 'wompi'
    assert response.json()['status'] == 'pending'


@pytest.mark.django_db
def test_payment_status_not_found(authenticated_client):
    """Nonexistent payment returns 404."""
    response = authenticated_client.get(reverse('payment-status', args=[99999]))

    assert response.status_code == status.HTTP_404_NOT_FOUND
