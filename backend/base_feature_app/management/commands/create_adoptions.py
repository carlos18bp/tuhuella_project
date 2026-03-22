import random

from django.core.management.base import BaseCommand
from faker import Faker

from base_feature_app.models import AdoptionApplication, Animal, User

fake = Faker()


class Command(BaseCommand):
    help = 'Create AdoptionApplication records for Mi Huella'

    def add_arguments(self, parser):
        parser.add_argument('--count', type=int, default=8)

    def handle(self, *args, **options):
        count = options['count']
        adopters = list(User.objects.filter(role=User.Role.ADOPTER))
        animals = list(Animal.objects.filter(status='published'))

        if not adopters or not animals:
            self.stdout.write(self.style.WARNING('Need adopter users and published animals.'))
            return

        created = 0
        seen = set()
        for _ in range(count):
            user = random.choice(adopters)
            animal = random.choice(animals)
            key = (user.pk, animal.pk)
            if key in seen:
                continue
            seen.add(key)

            AdoptionApplication.objects.create(
                user=user,
                animal=animal,
                status=random.choice([
                    AdoptionApplication.Status.SUBMITTED,
                    AdoptionApplication.Status.SUBMITTED,
                    AdoptionApplication.Status.APPROVED,
                    AdoptionApplication.Status.REJECTED,
                ]),
                form_answers={
                    'has_pets': random.choice([True, False]),
                    'housing_type': random.choice(['house', 'apartment']),
                    'experience': fake.sentence(),
                    'motivation': fake.paragraph(nb_sentences=2),
                },
                notes=fake.sentence() if random.random() < 0.3 else '',
            )
            created += 1

        self.stdout.write(self.style.SUCCESS(f'Created {created} adoption applications'))
