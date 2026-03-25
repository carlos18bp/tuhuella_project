import random
from decimal import Decimal

from faker import Faker
from django.core.management.base import BaseCommand
from django.utils import timezone
from base_feature_app.models import Campaign, Shelter

fake_es = Faker('es_CO')
fake_en = Faker('en_US')

CAMPAIGN_TITLES = [
    ('Esterilización masiva', 'Mass Sterilization Campaign'),
    ('Vacunación comunitaria', 'Community Vaccination Drive'),
    ('Alimentos para el refugio', 'Food for the Shelter'),
    ('Tratamiento veterinario urgente', 'Urgent Veterinary Treatment'),
    ('Nuevo espacio de recuperación', 'New Recovery Space'),
    ('Campaña de adopción responsable', 'Responsible Adoption Campaign'),
    ('Operación de rescate', 'Rescue Operation'),
    ('Kit de bienvenida para adoptantes', 'Welcome Kit for Adopters'),
]

CAMPAIGN_DESCRIPTIONS_ES = [
    'Esta campaña busca recaudar fondos para cubrir los costos de esterilización de animales callejeros en nuestra comunidad. Cada esterilización ayuda a reducir la sobrepoblación.',
    'Necesitamos tu ayuda para vacunar a los animales del refugio contra enfermedades comunes. Las vacunas son esenciales para mantener la salud de nuestros rescatados.',
    'Los alimentos para nuestros animales se están agotando. Con tu donación podemos garantizar que ningún animal pase hambre en nuestro refugio.',
    'Uno de nuestros rescatados necesita una cirugía urgente. Ayúdanos a cubrir los costos veterinarios para salvar su vida.',
    'Estamos construyendo un nuevo espacio de recuperación para animales que necesitan rehabilitación. Tu aporte nos acerca a la meta.',
]

CAMPAIGN_DESCRIPTIONS_EN = [
    'This campaign seeks to raise funds to cover the costs of sterilizing stray animals in our community. Each sterilization helps reduce overpopulation.',
    'We need your help to vaccinate shelter animals against common diseases. Vaccines are essential to maintain the health of our rescues.',
    'Food for our animals is running low. With your donation, we can ensure that no animal goes hungry in our shelter.',
    'One of our rescues needs urgent surgery. Help us cover the veterinary costs to save their life.',
    'We are building a new recovery space for animals that need rehabilitation. Your contribution brings us closer to the goal.',
]


class Command(BaseCommand):
    help = 'Create Campaign records for Tu Huella'

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
            title_es, title_en = random.choice(CAMPAIGN_TITLES)
            desc_idx = i % len(CAMPAIGN_DESCRIPTIONS_ES)

            # Make ~30% of campaigns completed
            if i % 3 == 2:
                status = Campaign.Status.COMPLETED
                raised = goal  # completed campaigns reached their goal
                starts_at = timezone.now() - timezone.timedelta(days=random.randint(60, 120))
                ends_at = timezone.now() - timezone.timedelta(days=random.randint(1, 30))
            else:
                status = random.choice([Campaign.Status.ACTIVE, Campaign.Status.ACTIVE, Campaign.Status.DRAFT])
                raised = Decimal(random.randint(0, int(goal)))
                starts_at = timezone.now()
                ends_at = timezone.now() + timezone.timedelta(days=random.randint(30, 90))

            Campaign.objects.create(
                shelter=random.choice(shelters),
                title_es=title_es,
                title_en=title_en,
                description_es=CAMPAIGN_DESCRIPTIONS_ES[desc_idx],
                description_en=CAMPAIGN_DESCRIPTIONS_EN[desc_idx],
                goal_amount=goal,
                raised_amount=raised,
                status=status,
                starts_at=starts_at,
                ends_at=ends_at,
            )
            created += 1

        self.stdout.write(self.style.SUCCESS(f'Created {created} campaigns'))
