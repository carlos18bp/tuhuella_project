import random
import urllib.request
from decimal import Decimal
from io import BytesIO

from faker import Faker
from django.core.files.base import ContentFile
from django.core.management.base import BaseCommand
from django.utils import timezone

from base_feature_app.models import Campaign, Shelter, User
from django_attachments.models import Library, Attachment

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
        reviewer = User.objects.filter(role__in=['web_manager', 'admin']).first()

        if not shelters:
            self.stdout.write(self.style.WARNING('No verified shelters found. Run create_shelters first.'))
            return

        # Guarantee at least 1 campaign per verified shelter, then round-robin the rest
        assignments = list(shelters)
        if count > len(assignments):
            assignments += [shelters[i % len(shelters)] for i in range(count - len(assignments))]
        else:
            assignments = assignments[:count]

        created = 0
        for i in range(len(assignments)):
            goal = Decimal(random.randint(500, 5000)) * 1000
            title_es, title_en = random.choice(CAMPAIGN_TITLES)
            desc_idx = i % len(CAMPAIGN_DESCRIPTIONS_ES)

            now = timezone.now()

            if i % 3 == 2:
                status = Campaign.Status.COMPLETED
                raised = goal
                starts_at = now - timezone.timedelta(days=random.randint(60, 120))
                ends_at = now - timezone.timedelta(days=random.randint(1, 30))
                approval_status = Campaign.ApprovalStatus.APPROVED
                reviewed_by = reviewer
                reviewed_at = now - timezone.timedelta(days=random.randint(5, 10))
                submitted_at = now - timezone.timedelta(days=random.randint(10, 15))
            else:
                slot = i % 5
                if slot in (0, 1, 2):
                    approval_status = Campaign.ApprovalStatus.APPROVED
                    status = random.choice([Campaign.Status.ACTIVE, Campaign.Status.ACTIVE, Campaign.Status.DRAFT])
                    reviewed_by = reviewer
                    reviewed_at = now - timezone.timedelta(days=random.randint(0, 4))
                    submitted_at = now - timezone.timedelta(days=random.randint(1, 5))
                elif slot == 3:
                    approval_status = Campaign.ApprovalStatus.PENDING
                    status = Campaign.Status.DRAFT
                    reviewed_by = None
                    reviewed_at = None
                    submitted_at = now - timezone.timedelta(days=random.randint(1, 3))
                else:
                    approval_status = Campaign.ApprovalStatus.REJECTED
                    status = Campaign.Status.DRAFT
                    reviewed_by = reviewer
                    reviewed_at = now - timezone.timedelta(days=random.randint(0, 2))
                    submitted_at = now - timezone.timedelta(days=random.randint(3, 7))

                raised = Decimal(random.randint(0, int(goal))) if approval_status == Campaign.ApprovalStatus.APPROVED else Decimal(0)
                starts_at = now
                ends_at = now + timezone.timedelta(days=random.randint(30, 90))

            campaign = Campaign.objects.create(
                shelter=assignments[i],
                title_es=title_es,
                title_en=title_en,
                description_es=CAMPAIGN_DESCRIPTIONS_ES[desc_idx],
                description_en=CAMPAIGN_DESCRIPTIONS_EN[desc_idx],
                goal_amount=goal,
                raised_amount=raised,
                status=status,
                starts_at=starts_at,
                ends_at=ends_at,
                approval_status=approval_status,
                submitted_at=submitted_at,
                reviewed_by=reviewed_by,
                reviewed_at=reviewed_at,
            )

            # Add evidence images for completed campaigns
            if status == Campaign.Status.COMPLETED:
                self._add_evidence_images(campaign, random.randint(3, 6))

            created += 1

        self.stdout.write(self.style.SUCCESS(f'Created {created} campaigns'))

    def _add_evidence_images(self, campaign, count):
        """Download placeholder images and attach them as campaign evidence."""
        library = Library.objects.create(title=f'Evidence: {campaign.title_es}')
        campaign.evidence_gallery = library
        campaign.save(update_fields=['evidence_gallery'])

        for rank in range(count):
            try:
                # Use picsum.photos for realistic placeholder images
                image_id = random.randint(1, 800)
                url = f'https://picsum.photos/id/{image_id}/800/600'
                req = urllib.request.Request(url, headers={'User-Agent': 'Mi Huella Seed Script'})
                response = urllib.request.urlopen(req, timeout=10)
                image_data = response.read()

                attachment = Attachment(
                    library=library,
                    rank=rank,
                    original_name=f'evidence_{rank + 1}.jpg',
                    filesize=len(image_data),
                    image_width=800,
                    image_height=600,
                )
                attachment.file.save(
                    f'evidence_{campaign.id}_{rank + 1}.jpg',
                    ContentFile(image_data),
                    save=False,
                )
                attachment.save()
            except Exception:
                # If download fails, skip this image silently
                continue

        # Update primary attachment
        first = Attachment.objects.filter(library=library).order_by('rank').first()
        if first:
            library.primary_attachment = first
            library.save(update_fields=['primary_attachment'])
