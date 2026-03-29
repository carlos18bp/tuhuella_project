"""
Email templates for notification events.

Each event_key maps to bilingual subject + body templates.
Variables use {variable_name} format for .format() substitution.
"""

TEMPLATES = {
    'adoption_submitted': {
        'subject_es': 'Nueva solicitud de adopción para {animal_name}',
        'subject_en': 'New adoption application for {animal_name}',
        'body_es': (
            'Hola {user_name},\n\n'
            'Se ha recibido una nueva solicitud de adopción para {animal_name} '
            'en el refugio {shelter_name}.\n\n'
            'Revisa la solicitud aquí: {link}\n\n'
            '— Mi Huella'
        ),
        'body_en': (
            'Hi {user_name},\n\n'
            'A new adoption application has been submitted for {animal_name} '
            'at {shelter_name}.\n\n'
            'Review the application here: {link}\n\n'
            '— Mi Huella'
        ),
    },
    'adoption_status_changed': {
        'subject_es': 'Actualización de tu solicitud de adopción',
        'subject_en': 'Update on your adoption application',
        'body_es': (
            'Hola {user_name},\n\n'
            'Tu solicitud de adopción para {animal_name} ha sido actualizada.\n'
            'Nuevo estado: {status}\n\n'
            'Más detalles aquí: {link}\n\n'
            '— Mi Huella'
        ),
        'body_en': (
            'Hi {user_name},\n\n'
            'Your adoption application for {animal_name} has been updated.\n'
            'New status: {status}\n\n'
            'More details here: {link}\n\n'
            '— Mi Huella'
        ),
    },
    'adoption_info_requested': {
        'subject_es': 'Se necesita información adicional para tu solicitud',
        'subject_en': 'Additional information needed for your application',
        'body_es': (
            'Hola {user_name},\n\n'
            'El refugio {shelter_name} ha solicitado información adicional '
            'para tu solicitud de adopción de {animal_name}.\n\n'
            'Responde aquí: {link}\n\n'
            '— Mi Huella'
        ),
        'body_en': (
            'Hi {user_name},\n\n'
            '{shelter_name} has requested additional information '
            'for your adoption application for {animal_name}.\n\n'
            'Respond here: {link}\n\n'
            '— Mi Huella'
        ),
    },
    'adoption_interview_scheduled': {
        'subject_es': 'Entrevista agendada para adopción de {animal_name}',
        'subject_en': 'Interview scheduled for {animal_name} adoption',
        'body_es': (
            'Hola {user_name},\n\n'
            'Se ha agendado una entrevista/visita para tu solicitud de adopción '
            'de {animal_name} con {shelter_name}.\n\n'
            'Detalles: {link}\n\n'
            '— Mi Huella'
        ),
        'body_en': (
            'Hi {user_name},\n\n'
            'An interview/visit has been scheduled for your adoption application '
            'for {animal_name} at {shelter_name}.\n\n'
            'Details: {link}\n\n'
            '— Mi Huella'
        ),
    },
    'shelter_invite_sent': {
        'subject_es': 'Un refugio te ha invitado a adoptar',
        'subject_en': 'A shelter has invited you to adopt',
        'body_es': (
            'Hola {user_name},\n\n'
            '{shelter_name} te ha enviado una invitación para conocer '
            'animales disponibles para adopción.\n\n'
            'Ver invitación: {link}\n\n'
            '— Mi Huella'
        ),
        'body_en': (
            'Hi {user_name},\n\n'
            '{shelter_name} has sent you an invitation to meet '
            'available animals for adoption.\n\n'
            'View invitation: {link}\n\n'
            '— Mi Huella'
        ),
    },
    'shelter_invite_responded': {
        'subject_es': 'Respuesta a tu invitación de adopción',
        'subject_en': 'Response to your adoption invitation',
        'body_es': (
            'Hola {user_name},\n\n'
            'Has recibido una respuesta a la invitación de adopción que enviaste.\n\n'
            'Ver detalles: {link}\n\n'
            '— Mi Huella'
        ),
        'body_en': (
            'Hi {user_name},\n\n'
            'You have received a response to the adoption invitation you sent.\n\n'
            'View details: {link}\n\n'
            '— Mi Huella'
        ),
    },
    'donation_paid': {
        'subject_es': 'Gracias por tu donación de ${amount}',
        'subject_en': 'Thank you for your ${amount} donation',
        'body_es': (
            'Hola {user_name},\n\n'
            'Tu donación de ${amount} ha sido confirmada.\n'
            '{campaign_title}\n\n'
            'Gracias por tu generosidad. Tu apoyo hace la diferencia.\n\n'
            'Ver recibo: {link}\n\n'
            '— Mi Huella'
        ),
        'body_en': (
            'Hi {user_name},\n\n'
            'Your donation of ${amount} has been confirmed.\n'
            '{campaign_title}\n\n'
            'Thank you for your generosity. Your support makes a difference.\n\n'
            'View receipt: {link}\n\n'
            '— Mi Huella'
        ),
    },
    'donation_failed': {
        'subject_es': 'Problema con tu donación',
        'subject_en': 'Issue with your donation',
        'body_es': (
            'Hola {user_name},\n\n'
            'No se pudo procesar tu donación de ${amount}.\n'
            'Por favor intenta nuevamente.\n\n'
            'Reintentar: {link}\n\n'
            '— Mi Huella'
        ),
        'body_en': (
            'Hi {user_name},\n\n'
            'Your donation of ${amount} could not be processed.\n'
            'Please try again.\n\n'
            'Retry: {link}\n\n'
            '— Mi Huella'
        ),
    },
    'sponsorship_paid': {
        'subject_es': 'Apadrinamiento confirmado para {animal_name}',
        'subject_en': 'Sponsorship confirmed for {animal_name}',
        'body_es': (
            'Hola {user_name},\n\n'
            'Tu apadrinamiento de ${amount} para {animal_name} ha sido confirmado.\n\n'
            'Ver detalles: {link}\n\n'
            '— Mi Huella'
        ),
        'body_en': (
            'Hi {user_name},\n\n'
            'Your ${amount} sponsorship for {animal_name} has been confirmed.\n\n'
            'View details: {link}\n\n'
            '— Mi Huella'
        ),
    },
    'sponsorship_failed': {
        'subject_es': 'Problema con tu apadrinamiento',
        'subject_en': 'Issue with your sponsorship',
        'body_es': (
            'Hola {user_name},\n\n'
            'No se pudo procesar tu apadrinamiento de ${amount} para {animal_name}.\n'
            'Por favor verifica tu método de pago.\n\n'
            'Reintentar: {link}\n\n'
            '— Mi Huella'
        ),
        'body_en': (
            'Hi {user_name},\n\n'
            'Your ${amount} sponsorship for {animal_name} could not be processed.\n'
            'Please verify your payment method.\n\n'
            'Retry: {link}\n\n'
            '— Mi Huella'
        ),
    },
    'campaign_update_published': {
        'subject_es': 'Nueva actualización de {campaign_title}',
        'subject_en': 'New update from {campaign_title}',
        'body_es': (
            'Hola {user_name},\n\n'
            'Se ha publicado una nueva actualización en la campaña "{campaign_title}" '
            'de {shelter_name}.\n\n'
            'Ver actualización: {link}\n\n'
            '— Mi Huella'
        ),
        'body_en': (
            'Hi {user_name},\n\n'
            'A new update has been published for the campaign "{campaign_title}" '
            'by {shelter_name}.\n\n'
            'View update: {link}\n\n'
            '— Mi Huella'
        ),
    },
    'campaign_goal_reached': {
        'subject_es': '¡Meta alcanzada en {campaign_title}!',
        'subject_en': 'Goal reached for {campaign_title}!',
        'body_es': (
            'Hola {user_name},\n\n'
            '¡La campaña "{campaign_title}" de {shelter_name} ha alcanzado su meta!\n'
            'Gracias a todos los que contribuyeron.\n\n'
            'Ver campaña: {link}\n\n'
            '— Mi Huella'
        ),
        'body_en': (
            'Hi {user_name},\n\n'
            'The campaign "{campaign_title}" by {shelter_name} has reached its goal!\n'
            'Thanks to everyone who contributed.\n\n'
            'View campaign: {link}\n\n'
            '— Mi Huella'
        ),
    },
}


def render_template(event_key: str, locale: str, context: dict) -> tuple[str, str]:
    """
    Render email template for the given event and locale.

    Returns:
        (subject, body) tuple with variables substituted.
    """
    template = TEMPLATES.get(event_key)
    if not template:
        return (f'Notification: {event_key}', f'Event: {event_key}')

    lang = locale if locale in ('es', 'en') else 'es'

    # Fill defaults for missing context keys
    safe_context = {
        'user_name': '',
        'shelter_name': '',
        'animal_name': '',
        'campaign_title': '',
        'amount': '0',
        'link': '',
        'status': '',
    }
    safe_context.update(context)

    subject = template[f'subject_{lang}'].format(**safe_context)
    body = template[f'body_{lang}'].format(**safe_context)
    return subject, body
