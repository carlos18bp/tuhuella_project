import random
from decimal import Decimal

from faker import Faker
from django.core.management.base import BaseCommand
from django.utils import timezone
from base_feature_app.models import Donation, Campaign, Shelter, User

fake = Faker()


class Command(BaseCommand):
    help = 'Create Donation records for Mi Huella'

    def add_arguments(self, parser):
        parser.add_argument('--count', type=int, default=15)

    def handle(self, *args, **options):
        count = options['count']
        adopters = list(User.objects.filter(role=User.Role.ADOPTER))
        campaigns = list(Campaign.objects.filter(status='active'))
        shelters = list(Shelter.objects.filter(verification_status='verified'))

        if not adopters:
            self.stdout.write(self.style.WARNING('No adopter users found.'))
            return

        created = 0
        for i in range(count):
            campaign = random.choice(campaigns) if campaigns and random.random() < 0.6 else None
            shelter = campaign.shelter if campaign else (random.choice(shelters) if shelters else None)
            if campaign:
                destination = Donation.Destination.CAMPAIGN
            elif shelter:
                destination = Donation.Destination.SHELTER
            else:
                destination = Donation.Destination.PLATFORM

            Donation.objects.create(
                user=random.choice(adopters),
                shelter=shelter,
                campaign=campaign,
                destination=destination,
                amount=Decimal(random.randint(10, 500)) * 1000,
                status=random.choice([
                    Donation.Status.PAID, Donation.Status.PAID,
                    Donation.Status.PENDING, Donation.Status.FAILED,
                ]),
                message=fake.sentence() if random.random() < 0.5 else '',
                paid_at=timezone.now() if random.random() < 0.7 else None,
            )
            created += 1

        self.stdout.write(self.style.SUCCESS(f'Created {created} donations'))
