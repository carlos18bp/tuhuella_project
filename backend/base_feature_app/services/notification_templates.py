"""
Email templates for notification events.

Each event_key maps to bilingual subject + body templates.
Variables use {variable_name} format for .format() substitution.
"""

TEMPLATES = {
    'follow_up_assigned_to_vet': {
        'subject_es': 'Te asignaron un seguimiento pos-adopción para {animal_name}',
        'subject_en': 'You have been assigned a post-adoption follow-up for {animal_name}',
        'body_es': (
            'Hola {user_name},\n\n'
            'Se te asignó el seguimiento de {animal_name} con fecha programada {scheduled_date}.\n'
            'Ver detalles: {link}\n\n— Mi Huella'
        ),
        'body_en': (
            'Hi {user_name},\n\n'
            'You have been assigned the follow-up for {animal_name}, scheduled on {scheduled_date}.\n'
            'Details: {link}\n\n— Mi Huella'
        ),
    },
    'follow_up_due_soon': {
        'subject_es': 'Próximo seguimiento para {animal_name}',
        'subject_en': 'Upcoming follow-up for {animal_name}',
        'body_es': (
            'Hola {user_name},\n\n'
            'El seguimiento de {animal_name} está programado para {scheduled_date}.\n'
            'Ver: {link}\n\n— Mi Huella'
        ),
        'body_en': (
            'Hi {user_name},\n\n'
            'The follow-up for {animal_name} is scheduled for {scheduled_date}.\n'
            'View: {link}\n\n— Mi Huella'
        ),
    },
    'follow_up_overdue': {
        'subject_es': 'Seguimiento vencido para {animal_name}',
        'subject_en': 'Overdue follow-up for {animal_name}',
        'body_es': (
            'Hola {user_name},\n\n'
            'El seguimiento de {animal_name} programado para {scheduled_date} está vencido.\n'
            'Por favor realízalo lo antes posible: {link}\n\n— Mi Huella'
        ),
        'body_en': (
            'Hi {user_name},\n\n'
            'The follow-up for {animal_name} scheduled on {scheduled_date} is overdue.\n'
            'Please complete it soon: {link}\n\n— Mi Huella'
        ),
    },
    'clinical_entry_added': {
        'subject_es': 'Nueva entrada clínica para {animal_name}',
        'subject_en': 'New clinical entry for {animal_name}',
        'body_es': (
            'Hola {user_name},\n\n'
            'Se registró una nueva entrada en la historia clínica de {animal_name}: {entry_title}.\n'
            'Ver: {link}\n\n— Mi Huella'
        ),
        'body_en': (
            'Hi {user_name},\n\n'
            'A new clinical entry was added for {animal_name}: {entry_title}.\n'
            'View: {link}\n\n— Mi Huella'
        ),
    },
    'adoption_requires_attention': {
        'subject_es': 'Solicitud de adopción pendiente hace {days_open} días',
        'subject_en': 'Adoption application pending for {days_open} days',
        'body_es': (
            'Hola {user_name},\n\n'
            'La solicitud para {animal_name} en {shelter_name} lleva {days_open} días '
            'sin respuesta. Por favor revísala aquí: {link}\n\n'
            '— Mi Huella'
        ),
        'body_en': (
            'Hi {user_name},\n\n'
            'The application for {animal_name} at {shelter_name} has been pending for '
            '{days_open} days. Please review it here: {link}\n\n'
            '— Mi Huella'
        ),
    },
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
    'adoption_interview_follow_up_due': {
        'subject_es': 'Solicitud en entrevista: pendiente revisar estado de {animal_name}',
        'subject_en': 'Interview-stage application needs check-in: {animal_name}',
        'body_es': (
            'Hola {user_name},\n\n'
            'La solicitud de adopción para {animal_name} en el refugio {shelter_name} '
            'lleva {days_since_last_update} días sin actualización en la etapa de entrevista.\n'
            'Adoptante: {applicant_email}\n\n'
            'Por favor consulta cómo va el proceso y registra un evento aquí: {link}\n\n'
            '— Mi Huella'
        ),
        'body_en': (
            'Hi {user_name},\n\n'
            'The adoption application for {animal_name} at {shelter_name} has been '
            'in the interview stage without updates for {days_since_last_update} days.\n'
            'Applicant: {applicant_email}\n\n'
            'Please check on the process and log an event here: {link}\n\n'
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
    'platform_donation_paid': {
        'subject_es': 'Gracias por apoyar el sostenimiento de Tuhuella',
        'subject_en': 'Thank you for supporting Tuhuella',
        'body_es': (
            'Hola {user_name},\n\n'
            'Recibimos tu aporte de ${amount} al sostenimiento de la plataforma.\n'
            'Con esta contribución nos ayudas a cubrir los costos de infraestructura, '
            'correo, dominio y el desarrollo continuo de Tuhuella.\n\n'
            'Gracias por creer en la iniciativa y hacerla posible.\n\n'
            'Ver recibo: {link}\n\n'
            '— Mi Huella'
        ),
        'body_en': (
            'Hi {user_name},\n\n'
            'We received your ${amount} contribution to keep the platform running.\n'
            'This helps cover infrastructure, email, domain, and the ongoing '
            'development of Tuhuella.\n\n'
            'Thank you for believing in the initiative and keeping it alive.\n\n'
            'View receipt: {link}\n\n'
            '— Mi Huella'
        ),
    },
    'platform_donation_failed': {
        'subject_es': 'No pudimos procesar tu apoyo a la plataforma',
        'subject_en': 'We could not process your platform contribution',
        'body_es': (
            'Hola {user_name},\n\n'
            'No pudimos procesar tu aporte de ${amount} al sostenimiento de Tuhuella.\n'
            'Si quieres intentarlo de nuevo, puedes hacerlo desde el siguiente enlace.\n\n'
            'Reintentar: {link}\n\n'
            '— Mi Huella'
        ),
        'body_en': (
            'Hi {user_name},\n\n'
            'We could not process your ${amount} contribution to support Tuhuella.\n'
            'You can try again from the link below.\n\n'
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
    'campaign_request_submitted': {
        'subject_es': 'Nueva solicitud de campaña: {campaign_title}',
        'subject_en': 'New campaign request: {campaign_title}',
        'body_es': (
            'Hola,\n\n'
            'El refugio {shelter_name} solicitó la aprobación de la campaña "{campaign_title}".\n'
            'Revisa la solicitud en el panel de web manager.\n\n'
            '— Mi Huella'
        ),
        'body_en': (
            'Hi,\n\n'
            'Shelter {shelter_name} submitted the campaign "{campaign_title}" for approval.\n'
            'Review it in the web manager dashboard.\n\n'
            '— Mi Huella'
        ),
    },
    'campaign_approved': {
        'subject_es': 'Tu solicitud de campaña fue aprobada',
        'subject_en': 'Your campaign request was approved',
        'body_es': (
            'Hola,\n\n'
            'La campaña "{campaign_title}" de {shelter_name} fue aprobada.\n'
            'Ya puedes activarla desde tu panel.\n\n'
            '— Mi Huella'
        ),
        'body_en': (
            'Hi,\n\n'
            'The campaign "{campaign_title}" by {shelter_name} was approved.\n'
            'You can now activate it from your dashboard.\n\n'
            '— Mi Huella'
        ),
    },
    'campaign_rejected': {
        'subject_es': 'Tu solicitud de campaña fue rechazada',
        'subject_en': 'Your campaign request was rejected',
        'body_es': (
            'Hola,\n\n'
            'La campaña "{campaign_title}" de {shelter_name} fue rechazada.\n'
            'Motivo: {reason}\n\n'
            'Edita la campaña y reenvíala para una nueva revisión.\n\n'
            '— Mi Huella'
        ),
        'body_en': (
            'Hi,\n\n'
            'The campaign "{campaign_title}" by {shelter_name} was rejected.\n'
            'Reason: {reason}\n\n'
            'Edit the campaign and resubmit for review.\n\n'
            '— Mi Huella'
        ),
    },
    'shelter_application_submitted': {
        'subject_es': 'Nueva postulación de refugio: {shelter_name}',
        'subject_en': 'New shelter application: {shelter_name}',
        'body_es': (
            'Hola,\n\n'
            '{user_name} ha enviado una postulación para registrar el refugio "{shelter_name}".\n'
            'Revísala en el panel de administración.\n\n'
            '— Mi Huella'
        ),
        'body_en': (
            'Hi,\n\n'
            '{user_name} has submitted an application to register the shelter "{shelter_name}".\n'
            'Review it in the admin panel.\n\n'
            '— Mi Huella'
        ),
    },
    'shelter_application_approved': {
        'subject_es': '¡Tu postulación de refugio fue aprobada!',
        'subject_en': 'Your shelter application was approved!',
        'body_es': (
            'Hola {user_name},\n\n'
            'Tu postulación para registrar el refugio "{shelter_name}" ha sido aprobada.\n'
            'Ahora eres administrador de refugio en Tuhuella y puedes acceder a tu panel.\n\n'
            'Acceder al panel: {link}\n\n'
            '— Mi Huella'
        ),
        'body_en': (
            'Hi {user_name},\n\n'
            'Your application to register the shelter "{shelter_name}" has been approved.\n'
            'You are now a shelter admin on Tuhuella and can access your dashboard.\n\n'
            'Open dashboard: {link}\n\n'
            '— Mi Huella'
        ),
    },
    'shelter_application_rejected': {
        'subject_es': 'Tu postulación de refugio no fue aprobada',
        'subject_en': 'Your shelter application was not approved',
        'body_es': (
            'Hola {user_name},\n\n'
            'Tu postulación para registrar el refugio "{shelter_name}" no fue aprobada.\n'
            'Motivo: {reason}\n\n'
            'Puedes revisar el detalle y volver a postular más adelante.\n\n'
            '— Mi Huella'
        ),
        'body_en': (
            'Hi {user_name},\n\n'
            'Your application to register the shelter "{shelter_name}" was not approved.\n'
            'Reason: {reason}\n\n'
            'You can review the details and apply again later.\n\n'
            '— Mi Huella'
        ),
    },
    'campaign_new_message': {
        'subject_es': 'Nuevo mensaje en la campaña {campaign_title}',
        'subject_en': 'New message on campaign {campaign_title}',
        'body_es': (
            'Hola,\n\n'
            '{author_name} escribió en la campaña "{campaign_title}":\n\n'
            '"{body_preview}"\n\n'
            'Responde desde el panel de la campaña.\n\n'
            '— Mi Huella'
        ),
        'body_en': (
            'Hi,\n\n'
            '{author_name} wrote on campaign "{campaign_title}":\n\n'
            '"{body_preview}"\n\n'
            'Reply from the campaign panel.\n\n'
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
        'reason': '',
        'author_name': '',
        'body_preview': '',
    }
    safe_context.update(context)

    subject = template[f'subject_{lang}'].format(**safe_context)
    body = template[f'body_{lang}'].format(**safe_context)
    return subject, body
