import random

from django.core.management.base import BaseCommand
from django.utils import timezone
from base_feature_app.models import NotificationPreference, NotificationLog, User

EVENT_KEYS = [
    'adoption_status_changed',
    'donation_received',
    'sponsorship_renewed',
    'shelter_verified',
    'new_shelter_invite',
    'campaign_goal_reached',
]


class Command(BaseCommand):
    help = 'Create NotificationPreference and NotificationLog records for Mi Huella'

    def add_arguments(self, parser):
        parser.add_argument('--count', type=int, default=10)

    def handle(self, *args, **options):
        count = options['count']
        users = list(User.objects.filter(is_superuser=False))

        if not users:
            self.stdout.write(self.style.WARNING('No non-superuser users found.'))
            return

        before = NotificationPreference.objects.count()
        new_prefs = [
            NotificationPreference(
                user=user,
                event_key=event_key,
                channel=channel,
                enabled=random.random() < 0.8,
            )
            for user in users
            for event_key in random.sample(EVENT_KEYS, k=min(3, len(EVENT_KEYS)))
            for channel in [NotificationPreference.Channel.EMAIL, NotificationPreference.Channel.IN_APP]
        ]
        NotificationPreference.objects.bulk_create(new_prefs, ignore_conflicts=True)
        prefs_created = NotificationPreference.objects.count() - before

        logs_created = 0
        for i in range(count):
            user = random.choice(users)
            NotificationLog.objects.create(
                recipient=user,
                event_key=random.choice(EVENT_KEYS),
                channel=random.choice([
                    NotificationPreference.Channel.EMAIL,
                    NotificationPreference.Channel.IN_APP,
                ]),
                status=random.choice([
                    NotificationLog.Status.SENT,
                    NotificationLog.Status.SENT,
                    NotificationLog.Status.QUEUED,
                    NotificationLog.Status.FAILED,
                ]),
                metadata={'source': 'fake_data'},
                sent_at=timezone.now() if random.random() < 0.7 else None,
            )
            logs_created += 1

        self.stdout.write(self.style.SUCCESS(
            f'Created {prefs_created} prefs and {logs_created} logs'
        ))
