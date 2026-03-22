from faker import Faker
from django.core.management.base import BaseCommand
from base_feature_app.models import User, Shelter

fake = Faker()


class Command(BaseCommand):
    help = 'Create Shelter records for Mi Huella'

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
            Shelter.objects.create(
                owner=owner,
                name=f'Refugio {fake.company()}',
                legal_name=fake.company(),
                description=fake.paragraph(nb_sentences=4),
                city=fake.city(),
                address=fake.address(),
                phone=fake.phone_number()[:20],
                email=fake.company_email(),
                website=fake.url(),
                verification_status=status,
            )
            created += 1

        self.stdout.write(self.style.SUCCESS(f'Created {created} shelters'))
