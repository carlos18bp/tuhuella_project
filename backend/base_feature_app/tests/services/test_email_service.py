from unittest.mock import patch

import pytest

from base_feature_app.services import EmailService


@pytest.mark.django_db
@patch('base_feature_app.utils.auth_utils.send_mail', return_value=1)
def test_send_password_reset_code_returns_true_on_success(mock_send_mail, existing_user):
    """EmailService.send_password_reset_code returns True when send_mail succeeds."""
    result = EmailService.send_password_reset_code(existing_user, '123456')

    assert result is True
    mock_send_mail.assert_called_once()
    call_args = mock_send_mail.call_args
    assert existing_user.email in call_args[0][3]


@pytest.mark.django_db
@patch('base_feature_app.utils.auth_utils.send_mail', side_effect=Exception('SMTP error'))
def test_send_password_reset_code_returns_false_on_failure(mock_send_mail, existing_user):
    """EmailService.send_password_reset_code returns False when send_mail raises."""
    result = EmailService.send_password_reset_code(existing_user, '123456')

    assert result is False
    mock_send_mail.assert_called_once()


@pytest.mark.django_db
@patch('base_feature_app.utils.auth_utils.send_mail', return_value=1)
def test_send_verification_code_returns_true_on_success(mock_send_mail):
    """EmailService.send_verification_code returns True when send_mail succeeds."""
    result = EmailService.send_verification_code('new@example.com', 'ABC123')

    assert result is True
    mock_send_mail.assert_called_once()
    call_args = mock_send_mail.call_args
    assert 'new@example.com' in call_args[0][3]


@pytest.mark.django_db
@patch('base_feature_app.utils.auth_utils.send_mail', side_effect=Exception('SMTP error'))
def test_send_verification_code_returns_false_on_failure(mock_send_mail):
    """EmailService.send_verification_code returns False when send_mail raises."""
    result = EmailService.send_verification_code('new@example.com', 'ABC123')

    assert result is False
    mock_send_mail.assert_called_once()
