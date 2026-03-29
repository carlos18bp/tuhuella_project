import random

from django.core.management.base import BaseCommand
from faker import Faker

from base_feature_app.models import UpdatePost, Shelter, Campaign, Animal

fake_es = Faker('es_CO')
fake_en = Faker('en_US')

TITLES_ES = [
    'Actualización sobre nuestros rescatados',
    'Nuevo ingreso al refugio',
    'Progreso de recuperación',
    'Jornada de vacunación completada',
    'Evento de adopción este fin de semana',
    'Gracias por sus donaciones',
    'Voluntarios necesarios',
    'Mejoras en las instalaciones',
    'Historia de éxito: adopción completada',
    'Informe mensual del refugio',
]

TITLES_EN = [
    'Update on our rescues',
    'New arrival at the shelter',
    'Recovery progress',
    'Vaccination day completed',
    'Adoption event this weekend',
    'Thank you for your donations',
    'Volunteers needed',
    'Facility improvements',
    'Success story: adoption completed',
    'Monthly shelter report',
]

CONTENTS_ES = [
    'Queremos compartir con ustedes los avances de nuestros animales rescatados. Cada día mejoran gracias al cuidado y amor que reciben en el refugio.',
    'Hoy recibimos un nuevo compañero que necesita mucho amor y atención. Estamos trabajando para que se recupere pronto y pueda encontrar un hogar.',
    'Gracias al apoyo de nuestros donantes, hemos podido realizar mejoras significativas en las instalaciones del refugio para el bienestar de los animales.',
    'Este mes realizamos una jornada de vacunación exitosa. Todos nuestros animales están al día con sus vacunas gracias a su generoso apoyo.',
    'Les invitamos a nuestro próximo evento de adopción. Vengan a conocer a nuestros animales y ayúdennos a encontrarles un hogar amoroso.',
]

CONTENTS_EN = [
    'We want to share with you the progress of our rescued animals. Every day they improve thanks to the care and love they receive at the shelter.',
    'Today we received a new companion who needs lots of love and attention. We are working to help them recover soon and find a home.',
    'Thanks to the support of our donors, we have been able to make significant improvements to the shelter facilities for the well-being of the animals.',
    'This month we held a successful vaccination drive. All our animals are up to date with their vaccines thanks to your generous support.',
    'We invite you to our next adoption event. Come meet our animals and help us find them a loving home.',
]


class Command(BaseCommand):
    help = 'Create UpdatePost records for Tu Huella'

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
            idx = random.randrange(len(TITLES_ES))

            UpdatePost.objects.create(
                shelter=shelter,
                campaign=random.choice(shelter_campaigns) if shelter_campaigns and random.random() < 0.4 else None,
                animal=random.choice(shelter_animals) if shelter_animals and random.random() < 0.4 else None,
                title_es=TITLES_ES[idx],
                title_en=TITLES_EN[idx],
                content_es=random.choice(CONTENTS_ES),
                content_en=random.choice(CONTENTS_EN),
            )
            created += 1

        self.stdout.write(self.style.SUCCESS(f'Created {created} update posts'))
