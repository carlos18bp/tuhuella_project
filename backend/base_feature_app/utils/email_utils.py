"""
Centralized email utility functions for Mi Huella.

All outbound email logic lives here. Each function renders a branded HTML
template and sends both HTML and plain-text versions via Django's send_mail.
"""
from django.conf import settings
from django.core.mail import EmailMultiAlternatives, send_mail
from django.template.loader import render_to_string


TEAM_EMAIL = 'team@proyectapps.co'


def send_password_reset_code(user, code):
    """
    Send password reset code via email with branded HTML template.

    :param user: User instance
    :param code: 6-digit code
    """
    subject = 'Mi Huella - Codigo de restablecimiento'
    text_message = (
        f'Hola {user.first_name},\n\n'
        f'Tu codigo de restablecimiento es: {code}\n\n'
        f'Este codigo expira en 15 minutos.\n\n'
        f'Si no solicitaste esto, ignora este correo.\n\n'
        f'— Mi Huella'
    )

    try:
        html_message = render_to_string('emails/password_reset_code.html', {
            'user': user,
            'code': code,
        })
        send_mail(
            subject,
            text_message,
            settings.DEFAULT_FROM_EMAIL,
            [user.email],
            html_message=html_message,
            fail_silently=False,
        )
        return True
    except Exception as e:
        print(f"Error sending email: {e}")
        return False


def send_verification_code(email, code):
    """
    Send verification code for new user registration with branded HTML template.

    :param email: User email
    :param code: 6-digit code
    """
    subject = 'Mi Huella - Verificacion de email'
    text_message = (
        f'Bienvenido a Mi Huella!\n\n'
        f'Tu codigo de verificacion es: {code}\n\n'
        f'Este codigo expira en 15 minutos.\n\n'
        f'— Mi Huella'
    )

    try:
        html_message = render_to_string('emails/verification_code.html', {
            'code': code,
        })
        send_mail(
            subject,
            text_message,
            settings.DEFAULT_FROM_EMAIL,
            [email],
            html_message=html_message,
            fail_silently=False,
        )
        return True
    except Exception as e:
        print(f"Error sending email: {e}")
        return False


def send_volunteer_application_notification(application):
    """
    Send branded HTML notification email to team when a volunteer application is received.

    :param application: VolunteerApplication instance
    """
    subject = f'Mi Huella - Nueva postulacion: {application.first_name} {application.last_name}'
    text_message = (
        f'Nueva postulacion de voluntario recibida:\n\n'
        f'Nombre: {application.first_name} {application.last_name}\n'
        f'Email: {application.email}\n'
        f'Telefono: {application.phone}\n'
        f'Ciudad: {application.city}, {application.country}\n'
        f'Posicion: {application.position.title_es}\n\n'
        f'Motivacion:\n{application.motivation}\n\n'
        f'--- Mi Huella'
    )

    try:
        html_message = render_to_string('emails/volunteer_application_notification.html', {
            'application': application,
        })
        send_mail(
            subject,
            text_message,
            settings.DEFAULT_FROM_EMAIL,
            [TEAM_EMAIL],
            html_message=html_message,
            fail_silently=False,
        )
        return True
    except Exception as e:
        print(f"Error sending volunteer application notification: {e}")
        return False


def send_contact_form_email(*, name: str, email: str, subject: str, message: str) -> bool:
    """
    Notify team inbox of a public contact form submission.

    Uses EmailMultiAlternatives with reply_to set to the visitor's address.
    """
    recipient = getattr(settings, 'CONTACT_FORM_RECIPIENT_EMAIL', 'team@projectapp.co')
    mail_subject = f'Mi Huella - Contacto: {subject}'
    text_message = (
        f'Mensaje desde el formulario de contacto web.\n\n'
        f'Nombre: {name}\n'
        f'Email: {email}\n'
        f'Asunto: {subject}\n\n'
        f'Mensaje:\n{message}\n\n'
        f'— Mi Huella'
    )

    try:
        html_message = render_to_string('emails/contact_form_notification.html', {
            'name': name,
            'email': email,
            'subject_line': subject,
            'message': message,
        })
        msg = EmailMultiAlternatives(
            mail_subject,
            text_message,
            settings.DEFAULT_FROM_EMAIL,
            [recipient],
            reply_to=[email],
        )
        msg.attach_alternative(html_message, 'text/html')
        msg.send(fail_silently=False)
        return True
    except Exception as e:
        print(f"Error sending contact form email: {e}")
        return False
