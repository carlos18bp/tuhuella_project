import random
from datetime import timedelta

from django.core.management.base import BaseCommand
from django.utils import timezone

from base_feature_app.models import (
    AdoptionApplication,
    AdoptionApplicationEvent,
    User,
)

EVENT_DESCRIPTIONS = [
    'Llamada inicial con el adoptante para coordinar la entrevista por WhatsApp.',
    'Entrevista realizada por WhatsApp; el adoptante respondió todas las preguntas del refugio.',
    'Visita al refugio agendada para conocer al animal en persona.',
    'Confirmación de visita al hogar del adoptante para evaluar el espacio.',
    'Mensaje enviado por WhatsApp solicitando documentos adicionales (cédula y comprobante de domicilio).',
    'Adoptante confirmó disponibilidad para retiro del animal en los próximos días.',
    'Refugio compartió guía de cuidados post-adopción y resolvió dudas del adoptante.',
    'Seguimiento post-entrevista: el adoptante envió fotos del espacio donde vivirá el animal.',
]


class Command(BaseCommand):
    help = 'Create AdoptionApplicationEvent records for applications in interview/approved status'

    def add_arguments(self, parser):
        parser.add_argument(
            '--clear',
            action='store_true',
            help='Archive existing events before creating new ones (idempotent reseed).',
        )

    def handle(self, *args, **options):
        if options['clear']:
            archived = AdoptionApplicationEvent.objects.filter(archived_at__isnull=True).update(
                archived_at=timezone.now(),
            )
            self.stdout.write(self.style.WARNING(f'Archived {archived} existing events'))

        applications = list(
            AdoptionApplication.objects.filter(
                status__in=[
                    AdoptionApplication.Status.INTERVIEW,
                    AdoptionApplication.Status.APPROVED,
                ],
                archived_at__isnull=True,
            ).select_related('animal__shelter__owner')
        )

        if not applications:
            self.stdout.write(self.style.WARNING(
                'No adoption applications in interview/approved status.'
            ))
            return

        web_managers = list(User.objects.filter(role=User.Role.WEB_MANAGER))
        fallback_author = web_managers[0] if web_managers else None

        events_created = 0
        applications_with_events = 0
        for app in applications:
            shelter_owner = getattr(app.animal.shelter, 'owner', None)
            author = shelter_owner or fallback_author
            if author is None:
                continue

            n_events = random.randint(1, 3)
            for _ in range(n_events):
                event_date = timezone.now() - timedelta(
                    days=random.randint(0, 9),
                    hours=random.randint(0, 23),
                )
                AdoptionApplicationEvent.objects.create(
                    application=app,
                    created_by=author,
                    event_date=event_date,
                    description=random.choice(EVENT_DESCRIPTIONS),
                )
                events_created += 1
            applications_with_events += 1

        self.stdout.write(self.style.SUCCESS(
            f'Created {events_created} events for {applications_with_events} applications'
        ))
