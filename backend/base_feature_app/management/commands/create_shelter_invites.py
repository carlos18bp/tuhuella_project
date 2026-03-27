import random

from django.core.management.base import BaseCommand
from faker import Faker
from base_feature_app.models import ShelterInvite, Shelter, AdopterIntent

fake = Faker()


class Command(BaseCommand):
    help = 'Create ShelterInvite records for Mi Huella'

    def add_arguments(self, parser):
        parser.add_argument('--count', type=int, default=5)

    def handle(self, *args, **options):
        count = options['count']
        shelters = list(Shelter.objects.filter(verification_status='verified'))
        intents = list(AdopterIntent.objects.filter(
            status=AdopterIntent.Status.ACTIVE,
            visibility=AdopterIntent.Visibility.PUBLIC,
        ))

        if not shelters or not intents:
            self.stdout.write(self.style.WARNING('Need verified shelters and public active intents.'))
            return

        # Pre-load existing pairs to avoid unique constraint violations
        existing_pairs = set(
            ShelterInvite.objects.values_list('shelter_id', 'adopter_intent_id')
        )

        created = 0
        seen_pairs = set(existing_pairs)
        attempts = 0
        while created < count and attempts < count * 3:
            attempts += 1
            shelter = random.choice(shelters)
            intent = random.choice(intents)
            pair = (shelter.pk, intent.pk)
            if pair in seen_pairs:
                continue
            seen_pairs.add(pair)

            ShelterInvite.objects.create(
                shelter=shelter,
                adopter_intent=intent,
                message=fake.sentence(nb_words=12),
                status=random.choice([
                    ShelterInvite.Status.PENDING,
                    ShelterInvite.Status.PENDING,
                    ShelterInvite.Status.ACCEPTED,
                    ShelterInvite.Status.REJECTED,
                ]),
            )
            created += 1

        self.stdout.write(self.style.SUCCESS(f'Created {created} shelter invites'))
