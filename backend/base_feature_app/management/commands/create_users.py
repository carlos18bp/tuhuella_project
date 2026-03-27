from faker import Faker
from django.core.management.base import BaseCommand
from base_feature_app.models import User

fake = Faker()


class Command(BaseCommand):
    help = 'Create User records for Mi Huella'

    def add_arguments(self, parser):
        parser.add_argument('--count', type=int, default=10)

    def handle(self, *args, **options):
        count = options['count']
        roles = [User.Role.ADOPTER, User.Role.SHELTER_ADMIN]

        # Create admin user
        if not User.objects.filter(email='admin@mihuella.com').exists():
            User.objects.create_superuser(
                email='admin@mihuella.com',
                password='admin123456',
                first_name='Admin',
                last_name='Mi Huella',
            )
            self.stdout.write(self.style.SUCCESS('Created admin user: admin@mihuella.com'))

        created = 0
        for i in range(count):
            email = fake.unique.email()
            # ~2:1 ratio of adopters to shelter_admins
            role = roles[0] if i % 3 != 0 else roles[1]
            User.objects.create_user(
                email=email,
                password='testpass123',
                first_name=fake.first_name(),
                last_name=fake.last_name(),
                phone=fake.phone_number()[:20],
                city=fake.city(),
                role=role,
            )
            created += 1

        self.stdout.write(self.style.SUCCESS(f'Created {created} users'))
