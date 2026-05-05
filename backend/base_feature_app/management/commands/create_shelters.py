import tempfile
import urllib.request
from pathlib import Path

from faker import Faker
from django.core.files.base import ContentFile
from django.core.management.base import BaseCommand
from django.utils import timezone
from base_feature_app.models import User, Shelter, ShelterMembership

from .create_users import FIXED_SHELTER_ADMINS

fake_es = Faker('es_CO')
fake_en = Faker('en_US')

SAMPLE_VIDEO_URL = 'https://www.w3schools.com/html/mov_bbb.mp4'
SAMPLE_VIDEO_CACHE = Path(tempfile.gettempdir()) / 'tuhuella_sample_shelter_video.mp4'

FIXED_SHELTER_ADMIN_EMAILS = [entry['email'] for entry in FIXED_SHELTER_ADMINS]

FIXED_SHELTERS = [
    {
        'name': 'Refugio Patitas Felices',
        'legal_name': 'Fundación Patitas Felices',
        'city': 'Bogotá',
        'description_es': 'Refugio dedicado al rescate de perros callejeros en Bogotá. Brindamos atención veterinaria, esterilización y adopción responsable.',
        'description_en': 'Shelter dedicated to rescuing stray dogs in Bogotá. We provide veterinary care, sterilization, and responsible adoption.',
        'verification_status': Shelter.VerificationStatus.VERIFIED,
    },
    {
        'name': 'Hogar Animal Medellín',
        'legal_name': 'Asociación Hogar Animal',
        'city': 'Medellín',
        'description_es': 'Organización sin ánimo de lucro que rescata, rehabilita y reubica perros y gatos en situación de vulnerabilidad.',
        'description_en': 'Non-profit organization that rescues, rehabilitates, and relocates vulnerable dogs and cats.',
        'verification_status': Shelter.VerificationStatus.VERIFIED,
    },
    {
        'name': 'Refugio Cali Animal',
        'legal_name': 'Fundación Cali Animal',
        'city': 'Cali',
        'description_es': 'Nos dedicamos al bienestar animal desde hace más de 8 años. Promovemos adopción, tenencia responsable y jornadas de esterilización.',
        'description_en': 'We have been dedicated to animal welfare for over 8 years. We promote adoption, responsible ownership, and sterilization drives.',
        'verification_status': Shelter.VerificationStatus.VERIFIED,
    },
]

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
    help = 'Create Shelter records for Tuhuella (fixed seed shelters + Faker batch)'

    def add_arguments(self, parser):
        parser.add_argument('--count', type=int, default=5,
                            help='Total number of shelters to create (fixed seeds count toward the total)')

    def _load_sample_video_bytes(self):
        if SAMPLE_VIDEO_CACHE.exists() and SAMPLE_VIDEO_CACHE.stat().st_size > 0:
            return SAMPLE_VIDEO_CACHE.read_bytes()
        try:
            with urllib.request.urlopen(SAMPLE_VIDEO_URL, timeout=30) as response:
                data = response.read()
        except OSError as exc:
            self.stdout.write(self.style.WARNING(
                f'Could not download sample shelter video ({exc}); shelters will be created without video.'
            ))
            return None
        SAMPLE_VIDEO_CACHE.write_bytes(data)
        return data

    def _attach_sample_video(self, shelter, video_bytes):
        if not video_bytes:
            return
        shelter.video.save(f'shelter_{shelter.id}_sample.mp4', ContentFile(video_bytes), save=True)

    def handle(self, *args, **options):
        count = options['count']
        shelter_admins = list(User.objects.filter(role=User.Role.SHELTER_ADMIN))

        if not shelter_admins:
            self.stdout.write(self.style.WARNING('No shelter_admin users found. Run create_users first.'))
            return

        fixed_owners_by_email = User.objects.filter(
            email__in=FIXED_SHELTER_ADMIN_EMAILS,
            role=User.Role.SHELTER_ADMIN,
        ).in_bulk(field_name='email')

        used_owner_ids = set()
        created = 0
        memberships_created = 0
        video_bytes = self._load_sample_video_bytes()

        for idx, fixed in enumerate(FIXED_SHELTERS[:count]):
            admin_email = FIXED_SHELTER_ADMIN_EMAILS[idx]
            owner = fixed_owners_by_email[admin_email]

            v_status = fixed['verification_status']
            shelter, was_created = Shelter.objects.get_or_create(
                name=fixed['name'],
                defaults={
                    'owner': owner,
                    'legal_name': fixed['legal_name'],
                    'description_es': fixed['description_es'],
                    'description_en': fixed['description_en'],
                    'city': fixed['city'],
                    'address': fake_es.address(),
                    'phone': fake_es.phone_number()[:20],
                    'email': f"contacto+{fixed['name'].lower().replace(' ', '')}@tuhuella.com",
                    'website': fake_en.url(),
                    'verification_status': v_status,
                    'verified_at': timezone.now() if v_status == Shelter.VerificationStatus.VERIFIED else None,
                },
            )
            if was_created:
                created += 1
            if was_created or not shelter.video:
                self._attach_sample_video(shelter, video_bytes)
            used_owner_ids.add(owner.id)

            _, m_created = ShelterMembership.objects.get_or_create(
                shelter=shelter,
                user=owner,
                defaults={'role': ShelterMembership.Role.OWNER},
            )
            if m_created:
                memberships_created += 1

        # 2) Remaining Faker shelters with distinct owners where possible
        statuses = [
            Shelter.VerificationStatus.VERIFIED,
            Shelter.VerificationStatus.PENDING,
            Shelter.VerificationStatus.REJECTED,
        ]
        remaining = max(0, count - len(FIXED_SHELTERS))
        available_owners = [u for u in shelter_admins if u.id not in used_owner_ids] or shelter_admins

        for i in range(remaining):
            owner = available_owners[i % len(available_owners)]
            status = statuses[i % len(statuses)]
            desc_idx = i % len(DESCRIPTIONS_ES)
            shelter = Shelter.objects.create(
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
                verified_at=timezone.now() if status == Shelter.VerificationStatus.VERIFIED else None,
            )
            created += 1
            self._attach_sample_video(shelter, video_bytes)
            used_owner_ids.add(owner.id)

            _, m_created = ShelterMembership.objects.get_or_create(
                shelter=shelter,
                user=owner,
                defaults={'role': ShelterMembership.Role.OWNER},
            )
            if m_created:
                memberships_created += 1

        self.stdout.write(self.style.SUCCESS(
            f'Created {created} shelters and {memberships_created} owner memberships'
        ))
