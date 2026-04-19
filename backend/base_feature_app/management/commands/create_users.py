from faker import Faker
from django.core.management.base import BaseCommand
from base_feature_app.models import User

fake = Faker()

SEED_PASSWORD = 'Tuhuella2024!'

FIXED_ADMIN = {
    'email': 'admin@tuhuella.com',
    'password': SEED_PASSWORD,
    'first_name': 'Admin',
    'last_name': 'Tuhuella',
}

FIXED_SHELTER_ADMINS = [
    {
        'email': 'refugio1@tuhuella.com',
        'first_name': 'Laura',
        'last_name': 'Gómez',
        'phone': '+57 300 100 0001',
        'city': 'Bogotá',
    },
    {
        'email': 'refugio2@tuhuella.com',
        'first_name': 'Carlos',
        'last_name': 'Pérez',
        'phone': '+57 300 100 0002',
        'city': 'Medellín',
    },
    {
        'email': 'refugio3@tuhuella.com',
        'first_name': 'Diana',
        'last_name': 'Rodríguez',
        'phone': '+57 300 100 0003',
        'city': 'Cali',
    },
]

FIXED_ADOPTERS = [
    {
        'email': 'adoptante1@tuhuella.com',
        'first_name': 'Sofía',
        'last_name': 'Martínez',
        'phone': '+57 301 200 0001',
        'city': 'Bogotá',
    },
    {
        'email': 'adoptante2@tuhuella.com',
        'first_name': 'Andrés',
        'last_name': 'López',
        'phone': '+57 301 200 0002',
        'city': 'Barranquilla',
    },
]


class Command(BaseCommand):
    help = 'Create User records for Tuhuella (fixed seed accounts + Faker batch)'

    def add_arguments(self, parser):
        parser.add_argument('--count', type=int, default=10,
                            help='Extra Faker users to create on top of the fixed seed accounts')
        parser.add_argument('--shelters-count', type=int, default=5,
                            help='Number of shelters that will be created; ensures ≥ this many shelter_admins exist')

    def handle(self, *args, **options):
        count = options['count']
        shelters_count = options['shelters_count']

        # 1) Admin superuser (fixed)
        admin, admin_created = User.objects.get_or_create(
            email=FIXED_ADMIN['email'],
            defaults={
                'first_name': FIXED_ADMIN['first_name'],
                'last_name': FIXED_ADMIN['last_name'],
                'role': User.Role.ADMIN,
                'is_staff': True,
                'is_superuser': True,
            },
        )
        if admin_created:
            admin.set_password(FIXED_ADMIN['password'])
            admin.save()
            self.stdout.write(self.style.SUCCESS(f'Created admin: {admin.email}'))

        # 2) Fixed shelter_admin accounts
        fixed_shelter_admins = 0
        for data in FIXED_SHELTER_ADMINS:
            user, was_created = User.objects.get_or_create(
                email=data['email'],
                defaults={
                    'first_name': data['first_name'],
                    'last_name': data['last_name'],
                    'phone': data['phone'],
                    'city': data['city'],
                    'role': User.Role.SHELTER_ADMIN,
                },
            )
            if was_created:
                user.set_password(SEED_PASSWORD)
                user.save()
                fixed_shelter_admins += 1

        # 3) Fixed adopter accounts
        fixed_adopters = 0
        for data in FIXED_ADOPTERS:
            user, was_created = User.objects.get_or_create(
                email=data['email'],
                defaults={
                    'first_name': data['first_name'],
                    'last_name': data['last_name'],
                    'phone': data['phone'],
                    'city': data['city'],
                    'role': User.Role.ADOPTER,
                },
            )
            if was_created:
                user.set_password(SEED_PASSWORD)
                user.save()
                fixed_adopters += 1

        # 4) Faker batch — ensure we end up with at least shelters_count total shelter_admins
        existing_shelter_admins = User.objects.filter(role=User.Role.SHELTER_ADMIN).count()
        needed_shelter_admins = max(0, shelters_count - existing_shelter_admins)

        created = 0
        for i in range(count):
            # Alternate so we always meet the minimum shelter_admin quota first
            if i < needed_shelter_admins:
                role = User.Role.SHELTER_ADMIN
            else:
                role = User.Role.ADOPTER if i % 3 != 0 else User.Role.SHELTER_ADMIN

            email = fake.unique.email()
            user = User.objects.create_user(
                email=email,
                password=SEED_PASSWORD,
                first_name=fake.first_name(),
                last_name=fake.last_name(),
                phone=fake.phone_number()[:20],
                city=fake.city(),
                role=role,
            )
            created += 1

        self.stdout.write(self.style.SUCCESS(
            f'Fixed accounts: +{fixed_shelter_admins} shelter_admins, +{fixed_adopters} adopters. '
            f'Faker batch: {created} users. Seed password: {SEED_PASSWORD}'
        ))
