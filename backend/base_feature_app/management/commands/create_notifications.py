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

        prefs_created = 0
        for user in users[:count]:
            for event_key in random.sample(EVENT_KEYS, k=min(3, len(EVENT_KEYS))):
                for channel in [NotificationPreference.Channel.EMAIL, NotificationPreference.Channel.IN_APP]:
                    _, was_created = NotificationPreference.objects.get_or_create(
                        user=user,
                        event_key=event_key,
                        channel=channel,
                        defaults={'enabled': random.random() < 0.8},
                    )
                    if was_created:
                        prefs_created += 1

        logs_created = 0
        for i in range(count):
            user = random.choice(users)
            NotificationLog.objects.create(
                recipient=user,
                event_key=random.choice(EVENT_KEYS),
                channel=random.choice([
                    NotificationLog.Channel.EMAIL,
                    NotificationLog.Channel.IN_APP,
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
            f'Created {prefs_created} notification preferences and {logs_created} notification logs'
        ))
