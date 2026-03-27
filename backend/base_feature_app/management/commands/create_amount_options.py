from django.core.management.base import BaseCommand
from base_feature_app.models import DonationAmountOption, SponsorshipAmountOption


DONATION_AMOUNTS = [
    {'amount': 5000,   'label': '$5.000',   'order': 0},
    {'amount': 10000,  'label': '$10.000',  'order': 1},
    {'amount': 15000,  'label': '$15.000',  'order': 2},
    {'amount': 25000,  'label': '$25.000',  'order': 3},
    {'amount': 50000,  'label': '$50.000',  'order': 4},
    {'amount': 100000, 'label': '$100.000', 'order': 5},
    {'amount': 200000, 'label': '$200.000', 'order': 6},
    {'amount': 300000, 'label': '$300.000', 'order': 7},
    {'amount': 500000, 'label': '$500.000', 'order': 8},
]

SPONSORSHIP_AMOUNTS = [
    {'amount': 10000,  'label': '$10.000',  'order': 0},
    {'amount': 15000,  'label': '$15.000',  'order': 1},
    {'amount': 20000,  'label': '$20.000',  'order': 2},
    {'amount': 30000,  'label': '$30.000',  'order': 3},
    {'amount': 50000,  'label': '$50.000',  'order': 4},
    {'amount': 75000,  'label': '$75.000',  'order': 5},
    {'amount': 100000, 'label': '$100.000', 'order': 6},
    {'amount': 150000, 'label': '$150.000', 'order': 7},
    {'amount': 200000, 'label': '$200.000', 'order': 8},
]


class Command(BaseCommand):
    help = 'Create donation and sponsorship amount options (idempotent)'

    def add_arguments(self, parser):
        parser.add_argument(
            '--count', type=int, default=9,
            help='Number of options per type (donation + sponsorship)',
        )

    def handle(self, *args, **options):
        count = options['count']
        created = 0

        for data in DONATION_AMOUNTS[:count]:
            _, was_created = DonationAmountOption.objects.get_or_create(
                amount=data['amount'],
                defaults={'label': data['label'], 'order': data['order']},
            )
            if was_created:
                created += 1

        for data in SPONSORSHIP_AMOUNTS[:count]:
            _, was_created = SponsorshipAmountOption.objects.get_or_create(
                amount=data['amount'],
                defaults={'label': data['label'], 'order': data['order']},
            )
            if was_created:
                created += 1

        self.stdout.write(self.style.SUCCESS(f'Created {created} amount options'))
