from unittest.mock import patch

import pytest
from django.urls import reverse

from base_feature_app.models import VolunteerApplication
from base_feature_app.tests.factories import VolunteerPositionFactory


@pytest.mark.django_db
def test_volunteer_create_requires_auth(api_client):
    """Unauthenticated request returns 401."""
    url = reverse('volunteer-application-create')
    response = api_client.post(url, {}, format='json')
    assert response.status_code == 401


@pytest.mark.django_db
@patch('base_feature_app.views.volunteer_application.send_volunteer_application_notification')
@patch('base_feature_app.views.volunteer_application.verify_recaptcha', return_value=True)
def test_volunteer_create_succeeds_with_valid_data(mock_captcha, mock_email, authenticated_client):
    """Valid application with passing captcha returns 201."""
    position = VolunteerPositionFactory(is_active=True)
    url = reverse('volunteer-application-create')
    response = authenticated_client.post(url, {
        'captcha_token': 'valid-token',
        'position': position.pk,
        'first_name': 'Maria',
        'last_name': 'Garcia',
        'email': 'maria@example.com',
        'phone': '3001234567',
        'city': 'Bogota',
        'country': 'Colombia',
        'motivation': 'I want to help animals in shelters and make a difference.',
    }, format='json')
    assert response.status_code == 201
    assert VolunteerApplication.objects.count() == 1
    mock_email.assert_called_once()


@pytest.mark.django_db
@patch('base_feature_app.views.volunteer_application.verify_recaptcha', return_value=False)
def test_volunteer_create_fails_captcha(mock_captcha, authenticated_client):
    """Failed reCAPTCHA verification returns 400."""
    url = reverse('volunteer-application-create')
    response = authenticated_client.post(url, {
        'captcha_token': 'invalid',
    }, format='json')
    assert response.status_code == 400
    assert 'reCAPTCHA' in response.json()['error']


@pytest.mark.django_db
@patch('base_feature_app.views.volunteer_application.verify_recaptcha', return_value=True)
def test_volunteer_create_rejects_invalid_data(mock_captcha, authenticated_client):
    """Missing required fields returns 400."""
    url = reverse('volunteer-application-create')
    response = authenticated_client.post(url, {
        'captcha_token': 'valid',
        'first_name': 'Maria',
    }, format='json')
    assert response.status_code == 400


@pytest.mark.django_db
@patch('base_feature_app.views.volunteer_application.verify_recaptcha', return_value=True)
def test_volunteer_create_rejects_short_motivation(mock_captcha, authenticated_client):
    """Motivation under 20 characters returns validation error."""
    position = VolunteerPositionFactory(is_active=True)
    url = reverse('volunteer-application-create')
    response = authenticated_client.post(url, {
        'captcha_token': 'valid',
        'position': position.pk,
        'first_name': 'Maria',
        'last_name': 'Garcia',
        'email': 'maria@example.com',
        'phone': '3001234567',
        'city': 'Bogota',
        'country': 'Colombia',
        'motivation': 'Short text',
    }, format='json')
    assert response.status_code == 400
    assert 'motivation' in response.json()
