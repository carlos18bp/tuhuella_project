from django.core.management.base import BaseCommand
from base_feature_app.models import DonationAmountOption, SponsorshipAmountOption


DONATION_AMOUNTS = [
    {'amount': 10000,  'label': '$10.000',  'order': 0},
    {'amount': 25000,  'label': '$25.000',  'order': 1},
    {'amount': 50000,  'label': '$50.000',  'order': 2},
    {'amount': 100000, 'label': '$100.000', 'order': 3},
    {'amount': 200000, 'label': '$200.000', 'order': 4},
]

SPONSORSHIP_AMOUNTS = [
    {'amount': 15000,  'label': '$15.000',  'order': 0},
    {'amount': 30000,  'label': '$30.000',  'order': 1},
    {'amount': 50000,  'label': '$50.000',  'order': 2},
    {'amount': 75000,  'label': '$75.000',  'order': 3},
    {'amount': 200000, 'label': '$200.000', 'order': 4},
]


class Command(BaseCommand):
    help = 'Seed default donation and sponsorship amount options (idempotent)'

    def handle(self, *args, **options):
        self.stdout.write(self.style.NOTICE('Seeding amount options...'))

        for data in DONATION_AMOUNTS:
            _, created = DonationAmountOption.objects.get_or_create(
                amount=data['amount'],
                defaults={'label': data['label'], 'order': data['order']},
            )
            if created:
                self.stdout.write(f'  Created DonationAmountOption: {data["label"]}')

        for data in SPONSORSHIP_AMOUNTS:
            _, created = SponsorshipAmountOption.objects.get_or_create(
                amount=data['amount'],
                defaults={'label': data['label'], 'order': data['order']},
            )
            if created:
                self.stdout.write(f'  Created SponsorshipAmountOption: {data["label"]}')

        self.stdout.write(self.style.SUCCESS('Amount options seeded successfully!'))
