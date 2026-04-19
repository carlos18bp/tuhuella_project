import random
from datetime import timedelta

from django.core.management.base import BaseCommand
from django.utils import timezone

from base_feature_app.models import (
    AdoptionApplication,
    ClinicalHistoryEntry,
    PostAdoptionFollowUp,
    User,
)

CLINICAL_TITLES = [
    'Revisión general post-adopción',
    'Control de vacunas',
    'Examen físico de rutina',
    'Seguimiento de tratamiento',
    'Chequeo de adaptación al hogar',
]

CLINICAL_BODY = (
    'Animal en buen estado general. Se observa adaptación positiva al nuevo hogar. '
    'Se recomienda continuar con la dieta indicada y regresar en 30 días para control.'
)

STATUS_CYCLE = [
    PostAdoptionFollowUp.Status.PENDING,
    PostAdoptionFollowUp.Status.IN_PROGRESS,
    PostAdoptionFollowUp.Status.COMPLETED,
    PostAdoptionFollowUp.Status.OVERDUE,
]


class Command(BaseCommand):
    help = 'Create PostAdoptionFollowUp and ClinicalHistoryEntry records for approved adoptions'

    def handle(self, *args, **options):
        vets = list(User.objects.filter(role=User.Role.VETERINARIAN))
        approved_apps = list(
            AdoptionApplication.objects.filter(status=AdoptionApplication.Status.APPROVED)
            .select_related('user', 'animal')
            .exclude(follow_up__isnull=False)
        )

        if not approved_apps:
            self.stdout.write(self.style.WARNING('No approved applications without follow-ups.'))
            return

        today = timezone.now().date()
        follow_ups_created = 0
        entries_created = 0

        for i, app in enumerate(approved_apps):
            status = STATUS_CYCLE[i % len(STATUS_CYCLE)]

            if status == PostAdoptionFollowUp.Status.PENDING:
                scheduled_date = today + timedelta(days=random.randint(14, 28))
                completed_date = None
                assigned_vet = None
                notes = ''
            elif status == PostAdoptionFollowUp.Status.IN_PROGRESS:
                scheduled_date = today + timedelta(days=random.randint(3, 10))
                completed_date = None
                assigned_vet = random.choice(vets) if vets else None
                notes = 'Seguimiento iniciado. Esperando resultados del chequeo.'
            elif status == PostAdoptionFollowUp.Status.COMPLETED:
                scheduled_date = today - timedelta(days=random.randint(10, 30))
                completed_date = today - timedelta(days=random.randint(1, 9))
                assigned_vet = random.choice(vets) if vets else None
                notes = 'Seguimiento completado satisfactoriamente. Animal en buen estado.'
            else:
                scheduled_date = today - timedelta(days=random.randint(5, 20))
                completed_date = None
                assigned_vet = None
                notes = ''

            follow_up = PostAdoptionFollowUp.objects.create(
                adoption_application=app,
                animal=app.animal,
                adopter=app.user,
                assigned_veterinarian=assigned_vet,
                status=status,
                scheduled_date=scheduled_date,
                completed_date=completed_date,
                notes=notes,
            )
            follow_ups_created += 1

            if status in (PostAdoptionFollowUp.Status.IN_PROGRESS, PostAdoptionFollowUp.Status.COMPLETED):
                for _ in range(random.randint(1, 2)):
                    entry_type = random.choice([
                        ClinicalHistoryEntry.EntryType.CHECKUP,
                        ClinicalHistoryEntry.EntryType.VACCINATION,
                        ClinicalHistoryEntry.EntryType.OBSERVATION,
                    ])
                    ClinicalHistoryEntry.objects.create(
                        animal=app.animal,
                        follow_up=follow_up,
                        author=assigned_vet,
                        entry_type=entry_type,
                        title=random.choice(CLINICAL_TITLES),
                        body_es=CLINICAL_BODY,
                        body_en=CLINICAL_BODY,
                        occurred_at=timezone.now() - timedelta(days=random.randint(1, 15)),
                    )
                    entries_created += 1

        self.stdout.write(self.style.SUCCESS(
            f'Created {follow_ups_created} follow-ups and {entries_created} clinical entries'
        ))
