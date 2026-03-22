import random

from django.core.management.base import BaseCommand
from faker import Faker

from base_feature_app.models import UpdatePost, Shelter, Campaign, Animal

fake = Faker()


class Command(BaseCommand):
    help = 'Create UpdatePost records for Mi Huella'

    def add_arguments(self, parser):
        parser.add_argument('--count', type=int, default=10)

    def handle(self, *args, **options):
        count = options['count']
        shelters = list(Shelter.objects.filter(verification_status='verified'))

        if not shelters:
            self.stdout.write(self.style.WARNING('No verified shelters found.'))
            return

        campaigns = list(Campaign.objects.all())
        animals = list(Animal.objects.all())

        created = 0
        for _ in range(count):
            shelter = random.choice(shelters)
            shelter_campaigns = [c for c in campaigns if c.shelter_id == shelter.pk]
            shelter_animals = [a for a in animals if a.shelter_id == shelter.pk]

            UpdatePost.objects.create(
                shelter=shelter,
                campaign=random.choice(shelter_campaigns) if shelter_campaigns and random.random() < 0.4 else None,
                animal=random.choice(shelter_animals) if shelter_animals and random.random() < 0.4 else None,
                title=fake.sentence(nb_words=6),
                content=fake.paragraph(nb_sentences=4),
            )
            created += 1

        self.stdout.write(self.style.SUCCESS(f'Created {created} update posts'))
