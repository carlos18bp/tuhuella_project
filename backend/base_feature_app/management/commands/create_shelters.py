from faker import Faker
from django.core.management.base import BaseCommand
from base_feature_app.models import User, Shelter

fake_es = Faker('es_CO')
fake_en = Faker('en_US')

DESCRIPTIONS_ES = [
    'Somos un refugio dedicado al rescate y rehabilitación de animales en situación de abandono. Trabajamos con amor y compromiso para encontrarles un hogar.',
    'Nuestra misión es proteger a los animales más vulnerables de la ciudad. Ofrecemos atención veterinaria, alimentación y un espacio seguro mientras encuentran una familia.',
    'Llevamos más de 5 años rescatando animales de las calles. Creemos que cada vida importa y trabajamos incansablemente por su bienestar.',
    'Somos una organización sin ánimo de lucro que brinda refugio temporal a perros y gatos abandonados. Promovemos la adopción responsable y la esterilización.',
    'Nos dedicamos a darle una segunda oportunidad a los animales que han sido maltratados o abandonados. Contamos con un equipo de voluntarios comprometidos.',
]

DESCRIPTIONS_EN = [
    'We are a shelter dedicated to the rescue and rehabilitation of abandoned animals. We work with love and commitment to find them a home.',
    'Our mission is to protect the most vulnerable animals in the city. We offer veterinary care, food, and a safe space while they find a family.',
    'We have been rescuing animals from the streets for over 5 years. We believe every life matters and work tirelessly for their well-being.',
    'We are a non-profit organization that provides temporary shelter for abandoned dogs and cats. We promote responsible adoption and sterilization.',
    'We are dedicated to giving a second chance to animals that have been mistreated or abandoned. We have a team of committed volunteers.',
]


class Command(BaseCommand):
    help = 'Create Shelter records for Tu Huella'

    def add_arguments(self, parser):
        parser.add_argument('--count', type=int, default=5)

    def handle(self, *args, **options):
        count = options['count']
        shelter_admins = list(User.objects.filter(role=User.Role.SHELTER_ADMIN))

        if not shelter_admins:
            self.stdout.write(self.style.WARNING('No shelter_admin users found. Run create_users first.'))
            return

        statuses = [
            Shelter.VerificationStatus.VERIFIED,
            Shelter.VerificationStatus.VERIFIED,
            Shelter.VerificationStatus.VERIFIED,
            Shelter.VerificationStatus.PENDING,
            Shelter.VerificationStatus.REJECTED,
        ]

        created = 0
        for i in range(count):
            owner = shelter_admins[i % len(shelter_admins)]
            status = statuses[i % len(statuses)]
            desc_idx = i % len(DESCRIPTIONS_ES)
            Shelter.objects.create(
                owner=owner,
                name=f'Refugio {fake_es.company()}',
                legal_name=fake_es.company(),
                description_es=DESCRIPTIONS_ES[desc_idx],
                description_en=DESCRIPTIONS_EN[desc_idx],
                city=fake_es.city(),
                address=fake_es.address(),
                phone=fake_es.phone_number()[:20],
                email=fake_en.company_email(),
                website=fake_en.url(),
                verification_status=status,
            )
            created += 1

        self.stdout.write(self.style.SUCCESS(f'Created {created} shelters'))
