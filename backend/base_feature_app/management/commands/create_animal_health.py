import random
from datetime import timedelta

from django.core.management.base import BaseCommand
from django.utils import timezone

from base_feature_app.models import Animal, AnimalDiseaseScreening


class Command(BaseCommand):
    help = 'Create AnimalDiseaseScreening records for existing animals'

    def handle(self, *args, **options):
        animals = list(Animal.objects.all())
        if not animals:
            self.stdout.write(self.style.WARNING('No animals found.'))
            return

        today = timezone.now().date()
        to_create = []

        for animal in animals:
            diseases = (
                AnimalDiseaseScreening.DOG_DISEASES
                if animal.species == Animal.Species.DOG
                else AnimalDiseaseScreening.CAT_DISEASES
            )
            sampled = random.sample(diseases, random.randint(2, min(3, len(diseases))))

            for disease_key in sampled:
                result = random.choices(
                    [
                        AnimalDiseaseScreening.Result.NEGATIVE,
                        AnimalDiseaseScreening.Result.NOT_TESTED,
                        AnimalDiseaseScreening.Result.POSITIVE,
                    ],
                    weights=[3, 2, 1],
                    k=1,
                )[0]
                tested_on = (
                    today - timedelta(days=random.randint(7, 90))
                    if result != AnimalDiseaseScreening.Result.NOT_TESTED
                    else None
                )
                to_create.append(AnimalDiseaseScreening(
                    animal=animal,
                    disease_key=disease_key,
                    result=result,
                    tested_on=tested_on,
                    notes='',
                ))

        created = AnimalDiseaseScreening.objects.bulk_create(
            to_create, ignore_conflicts=True, batch_size=500
        )
        self.stdout.write(self.style.SUCCESS(f'Created {len(created)} disease screenings'))
