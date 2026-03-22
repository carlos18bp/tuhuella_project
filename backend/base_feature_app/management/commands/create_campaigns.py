import random
from decimal import Decimal

from faker import Faker
from django.core.management.base import BaseCommand
from django.utils import timezone
from base_feature_app.models import Campaign, Shelter

fake = Faker()

CAMPAIGN_TITLES = [
    'Esterilización masiva',
    'Vacunación comunitaria',
    'Alimentos para el refugio',
    'Tratamiento veterinario urgente',
    'Nuevo espacio de recuperación',
    'Campaña de adopción responsable',
    'Operación de rescate',
    'Kit de bienvenida para adoptantes',
]


class Command(BaseCommand):
    help = 'Create Campaign records for Mi Huella'

    def add_arguments(self, parser):
        parser.add_argument('--count', type=int, default=6)

    def handle(self, *args, **options):
        count = options['count']
        shelters = list(Shelter.objects.filter(verification_status='verified'))

        if not shelters:
            self.stdout.write(self.style.WARNING('No verified shelters found. Run create_shelters first.'))
            return

        created = 0
        for i in range(count):
            goal = Decimal(random.randint(500, 5000)) * 1000
            raised = Decimal(random.randint(0, int(goal)))
            Campaign.objects.create(
                shelter=random.choice(shelters),
                title=random.choice(CAMPAIGN_TITLES),
                description=fake.paragraph(nb_sentences=5),
                goal_amount=goal,
                raised_amount=raised,
                status=random.choice([Campaign.Status.ACTIVE, Campaign.Status.ACTIVE, Campaign.Status.DRAFT]),
                starts_at=timezone.now(),
                ends_at=timezone.now() + timezone.timedelta(days=random.randint(30, 90)),
            )
            created += 1

        self.stdout.write(self.style.SUCCESS(f'Created {created} campaigns'))
