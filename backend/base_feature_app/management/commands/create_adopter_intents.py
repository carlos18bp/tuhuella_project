import random

from django.core.management.base import BaseCommand
from faker import Faker

from base_feature_app.models import AdopterIntent, User

fake = Faker()


class Command(BaseCommand):
    help = 'Create AdopterIntent records for Mi Huella'

    def add_arguments(self, parser):
        parser.add_argument('--count', type=int, default=5)

    def handle(self, *args, **options):
        count = options['count']
        adopters = list(
            User.objects.filter(role=User.Role.ADOPTER)
            .exclude(adopter_intent__isnull=False)
        )

        if not adopters:
            self.stdout.write(self.style.WARNING('No adopter users without an intent found.'))
            return

        created = 0
        for user in adopters[:count]:
            AdopterIntent.objects.create(
                user=user,
                preferences={
                    'species': random.choice(['dog', 'cat', 'any']),
                    'size': random.choice(['small', 'medium', 'large', 'any']),
                    'age_range': random.choice(['puppy', 'young', 'adult', 'senior', 'any']),
                },
                description=fake.paragraph(nb_sentences=2),
                status=random.choice([
                    AdopterIntent.Status.ACTIVE,
                    AdopterIntent.Status.ACTIVE,
                    AdopterIntent.Status.PAUSED,
                ]),
                visibility=random.choice([
                    AdopterIntent.Visibility.PUBLIC,
                    AdopterIntent.Visibility.PUBLIC,
                    AdopterIntent.Visibility.PRIVATE,
                ]),
            )
            created += 1

        self.stdout.write(self.style.SUCCESS(f'Created {created} adopter intents'))
