import random

from django.core.management.base import BaseCommand

from base_feature_app.models import Favorite, Animal, User


class Command(BaseCommand):
    help = 'Create Favorite records for Mi Huella'

    def add_arguments(self, parser):
        parser.add_argument('--count', type=int, default=15)

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

            Favorite.objects.get_or_create(user=user, animal=animal)
            created += 1

        self.stdout.write(self.style.SUCCESS(f'Created {created} favorites'))
