import random
from decimal import Decimal

from django.core.management.base import BaseCommand
from django.utils import timezone
from base_feature_app.models import Sponsorship, Animal, User


class Command(BaseCommand):
    help = 'Create Sponsorship records for Mi Huella'

    def add_arguments(self, parser):
        parser.add_argument('--count', type=int, default=10)

    def handle(self, *args, **options):
        count = options['count']
        adopters = list(User.objects.filter(role=User.Role.ADOPTER))
        animals = list(Animal.objects.filter(status='published'))

        if not adopters or not animals:
            self.stdout.write(self.style.WARNING('Need adopter users and published animals.'))
            return

        created = 0
        for i in range(count):
            Sponsorship.objects.create(
                user=random.choice(adopters),
                animal=random.choice(animals),
                amount=Decimal(random.choice([20000, 50000, 100000])),
                frequency=random.choice([
                    Sponsorship.Frequency.MONTHLY,
                    Sponsorship.Frequency.ONE_TIME,
                ]),
                status=random.choice([
                    Sponsorship.Status.ACTIVE,
                    Sponsorship.Status.ACTIVE,
                    Sponsorship.Status.PENDING,
                ]),
                started_at=timezone.now() if random.random() < 0.7 else None,
            )
            created += 1

        self.stdout.write(self.style.SUCCESS(f'Created {created} sponsorships'))
