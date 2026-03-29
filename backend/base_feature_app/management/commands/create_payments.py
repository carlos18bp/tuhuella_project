import random
from decimal import Decimal

from django.core.management.base import BaseCommand
from django.utils import timezone
from base_feature_app.models import Payment, Donation, Sponsorship


class Command(BaseCommand):
    help = 'Create Payment records for Mi Huella'

    def add_arguments(self, parser):
        parser.add_argument('--count', type=int, default=10)

    def handle(self, *args, **options):
        count = options['count']
        donations = list(Donation.objects.filter(status=Donation.Status.PAID))
        sponsorships = list(Sponsorship.objects.filter(status=Sponsorship.Status.ACTIVE))

        if not donations and not sponsorships:
            self.stdout.write(self.style.WARNING('Need paid donations or active sponsorships.'))
            return

        created = 0
        for i in range(count):
            if donations and (not sponsorships or random.random() < 0.6):
                donation = random.choice(donations)
                Payment.objects.create(
                    donation=donation,
                    sponsorship=None,
                    provider='wompi',
                    provider_reference=f'WOMPI-DON-{random.randint(100000, 999999)}',
                    amount=donation.amount,
                    status=random.choice([
                        Payment.Status.APPROVED, Payment.Status.APPROVED,
                        Payment.Status.PENDING, Payment.Status.DECLINED,
                    ]),
                    paid_at=timezone.now() if random.random() < 0.7 else None,
                    metadata={'source': 'fake_data', 'type': 'donation'},
                )
            elif sponsorships:
                sponsorship = random.choice(sponsorships)
                Payment.objects.create(
                    donation=None,
                    sponsorship=sponsorship,
                    provider='wompi',
                    provider_reference=f'WOMPI-SPO-{random.randint(100000, 999999)}',
                    amount=sponsorship.amount,
                    status=random.choice([
                        Payment.Status.APPROVED, Payment.Status.APPROVED,
                        Payment.Status.PENDING,
                    ]),
                    paid_at=timezone.now() if random.random() < 0.8 else None,
                    metadata={'source': 'fake_data', 'type': 'sponsorship'},
                )
            created += 1

        self.stdout.write(self.style.SUCCESS(f'Created {created} payments'))
