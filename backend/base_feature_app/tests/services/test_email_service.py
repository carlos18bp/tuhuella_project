from unittest.mock import MagicMock, patch

import pytest

from base_feature_app.models import VolunteerApplication
from base_feature_app.services import EmailService
from base_feature_app.tests.factories import VolunteerPositionFactory


@pytest.mark.django_db
@patch('base_feature_app.utils.email_utils.send_mail', return_value=1)
def test_send_password_reset_code_returns_true_on_success(mock_send_mail, existing_user):
    """EmailService.send_password_reset_code returns True when send_mail succeeds."""
    result = EmailService.send_password_reset_code(existing_user, '123456')

    assert result is True
    mock_send_mail.assert_called_once()
    call_args = mock_send_mail.call_args
    assert existing_user.email in call_args[0][3]


@pytest.mark.django_db
@patch('base_feature_app.utils.email_utils.send_mail', side_effect=Exception('SMTP error'))
def test_send_password_reset_code_returns_false_on_failure(mock_send_mail, existing_user):
    """EmailService.send_password_reset_code returns False when send_mail raises."""
    result = EmailService.send_password_reset_code(existing_user, '123456')

    assert result is False
    mock_send_mail.assert_called_once()


@pytest.mark.django_db
@patch('base_feature_app.utils.email_utils.send_mail', return_value=1)
def test_send_verification_code_returns_true_on_success(mock_send_mail):
    """EmailService.send_verification_code returns True when send_mail succeeds."""
    result = EmailService.send_verification_code('new@example.com', 'ABC123')

    assert result is True
    mock_send_mail.assert_called_once()
    call_args = mock_send_mail.call_args
    assert 'new@example.com' in call_args[0][3]


@pytest.mark.django_db
@patch('base_feature_app.utils.email_utils.send_mail', side_effect=Exception('SMTP error'))
def test_send_verification_code_returns_false_on_failure(mock_send_mail):
    """EmailService.send_verification_code returns False when send_mail raises."""
    result = EmailService.send_verification_code('new@example.com', 'ABC123')

    assert result is False
    mock_send_mail.assert_called_once()


@pytest.mark.django_db
@patch('base_feature_app.utils.email_utils.send_mail', return_value=1)
def test_send_volunteer_application_notification_returns_true_on_success(
    mock_send_mail,
    existing_user,
):
    """EmailService.send_volunteer_application_notification returns True when send_mail succeeds."""
    position = VolunteerPositionFactory(title_es='Cuidador de perros')
    application = VolunteerApplication.objects.create(
        position=position,
        user=existing_user,
        motivation='Quiero ayudar los fines de semana.',
    )

    result = EmailService.send_volunteer_application_notification(application)

    assert result is True
    mock_send_mail.assert_called_once()


@pytest.mark.django_db
@patch('base_feature_app.utils.email_utils.send_mail', side_effect=Exception('SMTP down'))
def test_send_volunteer_application_notification_returns_false_on_failure(
    mock_send_mail,
    existing_user,
):
    """EmailService.send_volunteer_application_notification returns False when send_mail raises."""
    position = VolunteerPositionFactory(title_es='Apoyo administrativo')
    application = VolunteerApplication.objects.create(
        position=position,
        user=existing_user,
        motivation='Tengo experiencia en ofimatica.',
    )

    result = EmailService.send_volunteer_application_notification(application)

    assert result is False
    mock_send_mail.assert_called_once()


@pytest.mark.django_db
@patch('base_feature_app.utils.email_utils.EmailMultiAlternatives')
def test_send_contact_form_email_returns_true_on_success(mock_em_class):
    """EmailService.send_contact_form_email returns True when the message sends."""
    mock_msg = MagicMock()
    mock_em_class.return_value = mock_msg

    result = EmailService.send_contact_form_email(
        name='Visitante',
        email='visitante@example.com',
        subject='Consulta general',
        message='Hola, quisiera informacion sobre adopciones.',
    )

    assert result is True
    mock_msg.attach_alternative.assert_called_once()
    mock_msg.send.assert_called_once_with(fail_silently=False)


@pytest.mark.django_db
@patch(
    'base_feature_app.utils.email_utils.EmailMultiAlternatives',
    side_effect=Exception('SMTP rejected'),
)
def test_send_contact_form_email_returns_false_on_failure(mock_em_class):
    """EmailService.send_contact_form_email returns False when sending raises."""
    result = EmailService.send_contact_form_email(
        name='Visitante',
        email='visitante@example.com',
        subject='Otro asunto',
        message='Cuerpo del mensaje.',
    )

    assert result is False
