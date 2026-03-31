"""
Email service for handling all outbound email notifications.

Centralizes email logic following the service layer pattern.
Delegates to utility functions in email_utils that wrap Django's send_mail.
"""
from base_feature_app.utils.email_utils import (
    send_contact_form_email as _deliver_contact_form_email,
    send_password_reset_code,
    send_verification_code,
    send_volunteer_application_notification,
)


class EmailService:
    """
    Service class for sending email notifications.

    Provides static methods for all transactional emails sent
    by the application, abstracting the underlying mail backend.
    """

    @staticmethod
    def send_password_reset_code(user, code: str) -> bool:
        """
        Send a password reset verification code to the user.

        Args:
            user: User instance with email and first_name attributes.
            code: 6-digit alphanumeric verification code.

        Returns:
            bool: True if the email was sent successfully, False otherwise.
        """
        return send_password_reset_code(user, code)

    @staticmethod
    def send_verification_code(email: str, code: str) -> bool:
        """
        Send an email verification code to a new user.

        Args:
            email: Recipient email address.
            code: 6-digit alphanumeric verification code.

        Returns:
            bool: True if the email was sent successfully, False otherwise.
        """
        return send_verification_code(email, code)

    @staticmethod
    def send_volunteer_application_notification(application) -> bool:
        """
        Send notification to team when a volunteer application is received.

        Args:
            application: VolunteerApplication instance.

        Returns:
            bool: True if the email was sent successfully, False otherwise.
        """
        return send_volunteer_application_notification(application)

    @staticmethod
    def send_contact_form_email(*, name: str, email: str, subject: str, message: str) -> bool:
        """
        Send notification to team when the public contact form is submitted.

        Returns:
            bool: True if the email was sent successfully, False otherwise.
        """
        return _deliver_contact_form_email(name=name, email=email, subject=subject, message=message)
