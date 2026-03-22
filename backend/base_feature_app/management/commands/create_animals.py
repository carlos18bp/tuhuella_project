import random

from faker import Faker
from django.core.management.base import BaseCommand
from base_feature_app.models import Animal, Shelter

fake = Faker()

DOG_BREEDS = ['Labrador', 'Mestizo', 'Pastor Alemán', 'Golden Retriever', 'Bulldog', 'Poodle', 'Chihuahua']
CAT_BREEDS = ['Siamés', 'Persa', 'Mestizo', 'Maine Coon', 'Bengal', 'Angora']
NAMES = [
    'Luna', 'Max', 'Bella', 'Rocky', 'Lola', 'Toby', 'Mia', 'Coco',
    'Bruno', 'Nala', 'Simón', 'Canela', 'Thor', 'Nina', 'Rex', 'Kira',
]


class Command(BaseCommand):
    help = 'Create Animal records for Mi Huella'

    def add_arguments(self, parser):
        parser.add_argument('--count', type=int, default=20)

    def handle(self, *args, **options):
        count = options['count']
        shelters = list(Shelter.objects.filter(verification_status='verified'))

        if not shelters:
            self.stdout.write(self.style.WARNING('No verified shelters found. Run create_shelters first.'))
            return

        created = 0
        for i in range(count):
            species = random.choice([Animal.Species.DOG, Animal.Species.CAT, Animal.Species.OTHER])
            if species == Animal.Species.DOG:
                breed = random.choice(DOG_BREEDS)
            elif species == Animal.Species.CAT:
                breed = random.choice(CAT_BREEDS)
            else:
                breed = 'Otro'

            Animal.objects.create(
                shelter=random.choice(shelters),
                name=random.choice(NAMES),
                species=species,
                breed=breed,
                age_range=random.choice(list(Animal.AgeRange)),
                gender=random.choice([Animal.Gender.MALE, Animal.Gender.FEMALE]),
                size=random.choice(list(Animal.Size)),
                description=fake.paragraph(nb_sentences=3),
                special_needs=fake.sentence() if random.random() < 0.3 else '',
                status=random.choice([Animal.Status.PUBLISHED, Animal.Status.PUBLISHED, Animal.Status.DRAFT]),
                is_vaccinated=random.choice([True, False]),
                is_sterilized=random.choice([True, False]),
            )
            created += 1

        self.stdout.write(self.style.SUCCESS(f'Created {created} animals'))
