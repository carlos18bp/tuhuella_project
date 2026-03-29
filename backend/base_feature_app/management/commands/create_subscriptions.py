import random

from django.core.management.base import BaseCommand
from django.utils import timezone
from datetime import timedelta
from base_feature_app.models import Subscription, Sponsorship


class Command(BaseCommand):
    help = 'Create Subscription records for Mi Huella'

    def add_arguments(self, parser):
        parser.add_argument('--count', type=int, default=5)

    def handle(self, *args, **options):
        count = options['count']
        sponsorships = list(
            Sponsorship.objects.filter(
                frequency=Sponsorship.Frequency.MONTHLY,
                status=Sponsorship.Status.ACTIVE,
            ).exclude(subscription__isnull=False)
        )

        if not sponsorships:
            self.stdout.write(self.style.WARNING('No monthly active sponsorships without subscription.'))
            return

        created = 0
        for sponsorship in sponsorships[:count]:
            interval = random.choice([
                Subscription.Interval.MONTHLY,
                Subscription.Interval.MONTHLY,
                Subscription.Interval.QUARTERLY,
            ])

            if interval == Subscription.Interval.MONTHLY:
                next_payment_delta = timedelta(days=30)
            elif interval == Subscription.Interval.QUARTERLY:
                next_payment_delta = timedelta(days=90)
            else:
                next_payment_delta = timedelta(days=365)

            Subscription.objects.create(
                sponsorship=sponsorship,
                provider='wompi',
                provider_reference=f'WOMPI-SUB-{random.randint(100000, 999999)}',
                interval=interval,
                next_payment_at=timezone.now() + next_payment_delta,
                status=random.choice([
                    Subscription.Status.ACTIVE, Subscription.Status.ACTIVE,
                    Subscription.Status.PAUSED,
                ]),
            )
            created += 1

        self.stdout.write(self.style.SUCCESS(f'Created {created} subscriptions'))
