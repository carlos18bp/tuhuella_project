from unittest.mock import patch

import pytest
from django.urls import reverse

VALID_CONTACT = {
    'captcha_token': 'valid-token',
    'name': 'Maria Garcia',
    'email': 'maria@example.com',
    'subject': 'Pregunta sobre adopcion',
    'message': 'Hola, me gustaria saber mas sobre el proceso.',
}


@pytest.mark.django_db
@patch('base_feature_app.views.contact.EmailService.send_contact_form_email', return_value=True)
@patch('base_feature_app.views.contact.verify_recaptcha', return_value=True)
def test_contact_form_submit_returns_201(mock_captcha, mock_send, api_client):
    """Valid payload with passing captcha returns 201."""
    url = reverse('contact-form-submit')
    response = api_client.post(url, VALID_CONTACT, format='json')
    assert response.status_code == 201
    assert 'sent successfully' in response.json()['message'].lower()
    mock_send.assert_called_once_with(
        name='Maria Garcia',
        email='maria@example.com',
        subject='Pregunta sobre adopcion',
        message='Hola, me gustaria saber mas sobre el proceso.',
    )


@pytest.mark.django_db
@patch('base_feature_app.views.contact.verify_recaptcha', return_value=False)
def test_contact_form_submit_fails_captcha(mock_captcha, api_client):
    """Failed reCAPTCHA returns 400."""
    url = reverse('contact-form-submit')
    response = api_client.post(url, {**VALID_CONTACT, 'captcha_token': 'bad'}, format='json')
    assert response.status_code == 400
    assert 'reCAPTCHA' in response.json()['error']


@pytest.mark.django_db
@patch('base_feature_app.views.contact.verify_recaptcha', return_value=True)
def test_contact_form_submit_rejects_invalid_payload(mock_captcha, api_client):
    """Missing required fields returns 400."""
    url = reverse('contact-form-submit')
    response = api_client.post(url, {'captcha_token': 'x', 'name': 'X'}, format='json')
    assert response.status_code == 400


@pytest.mark.django_db
@patch('base_feature_app.views.contact.EmailService.send_contact_form_email', return_value=False)
@patch('base_feature_app.views.contact.verify_recaptcha', return_value=True)
def test_contact_form_submit_returns_503_when_email_fails(mock_captcha, mock_send, api_client):
    """When email delivery fails the API returns 503."""
    url = reverse('contact-form-submit')
    response = api_client.post(url, VALID_CONTACT, format='json')
    assert response.status_code == 503
