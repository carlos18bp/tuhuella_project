import random

from faker import Faker
from django.core.management.base import BaseCommand
from base_feature_app.models import Animal, Shelter

fake_es = Faker('es_CO')
fake_en = Faker('en_US')

DOG_BREEDS = ['Labrador', 'Mestizo', 'Pastor Alemán', 'Golden Retriever', 'Bulldog', 'Poodle', 'Chihuahua']
CAT_BREEDS = ['Siamés', 'Persa', 'Mestizo', 'Maine Coon', 'Bengal', 'Angora']
NAMES = [
    'Luna', 'Max', 'Bella', 'Rocky', 'Lola', 'Toby', 'Mia', 'Coco',
    'Bruno', 'Nala', 'Simón', 'Canela', 'Thor', 'Nina', 'Rex', 'Kira',
]

DESCRIPTIONS_ES = [
    'Es un compañero cariñoso y juguetón que disfruta de los paseos al aire libre. Se lleva bien con otros animales y es ideal para familias.',
    'Tiene una personalidad tranquila y le encanta acurrucarse. Es muy leal y busca un hogar donde pueda recibir mucho amor.',
    'Es muy activo y le encanta correr y jugar. Necesita un hogar con espacio para ejercitarse y una familia que le dedique tiempo.',
    'Es un animal sociable y amigable que se adapta fácilmente a nuevos entornos. Le gusta estar rodeado de personas y otros animales.',
    'Es independiente pero cariñoso cuando te conoce. Le gusta explorar y es muy curioso. Ideal para personas que buscan un compañero tranquilo.',
    'Tiene mucha energía y le encanta aprender trucos nuevos. Es inteligente y responde bien al entrenamiento positivo.',
    'Es un animal rescatado que ha mostrado una gran capacidad de recuperación. Es dulce, agradecido y está listo para un nuevo comienzo.',
    'Le encanta jugar con pelotas y salir de paseo. Es protector con su familia y muy obediente. Se adapta bien a la vida en apartamento.',
]

DESCRIPTIONS_EN = [
    'A loving and playful companion who enjoys outdoor walks. Gets along well with other animals and is ideal for families.',
    'Has a calm personality and loves to cuddle. Very loyal and looking for a home where they can receive lots of love.',
    'Very active and loves to run and play. Needs a home with space to exercise and a family that will dedicate time.',
    'A sociable and friendly animal that easily adapts to new environments. Loves being around people and other animals.',
    'Independent but affectionate once they get to know you. Likes to explore and is very curious. Ideal for those seeking a calm companion.',
    'Has lots of energy and loves learning new tricks. Intelligent and responds well to positive training.',
    'A rescued animal that has shown great resilience. Sweet, grateful, and ready for a fresh start.',
    'Loves playing with balls and going for walks. Protective of their family and very obedient. Adapts well to apartment living.',
]

SPECIAL_NEEDS_ES = [
    'Necesita medicación diaria para una condición cardíaca.',
    'Requiere una dieta especial baja en grasas.',
    'Tiene alergia a ciertos alimentos, se requiere dieta hipoalergénica.',
    'Necesita revisiones veterinarias periódicas por una condición crónica.',
    'Requiere fisioterapia semanal por una lesión anterior.',
]

SPECIAL_NEEDS_EN = [
    'Requires daily medication for a heart condition.',
    'Needs a special low-fat diet.',
    'Has food allergies, requires a hypoallergenic diet.',
    'Needs periodic veterinary check-ups for a chronic condition.',
    'Requires weekly physical therapy for a previous injury.',
]


class Command(BaseCommand):
    help = 'Create Animal records for Tu Huella'

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

            has_special_needs = random.random() < 0.3
            sn_idx = random.randrange(len(SPECIAL_NEEDS_ES))

            Animal.objects.create(
                shelter=random.choice(shelters),
                name=random.choice(NAMES),
                species=species,
                breed=breed,
                age_range=random.choice(list(Animal.AgeRange)),
                gender=random.choice([Animal.Gender.MALE, Animal.Gender.FEMALE]),
                size=random.choice(list(Animal.Size)),
                description_es=random.choice(DESCRIPTIONS_ES),
                description_en=random.choice(DESCRIPTIONS_EN),
                special_needs_es=SPECIAL_NEEDS_ES[sn_idx] if has_special_needs else '',
                special_needs_en=SPECIAL_NEEDS_EN[sn_idx] if has_special_needs else '',
                status=random.choice([Animal.Status.PUBLISHED, Animal.Status.PUBLISHED, Animal.Status.DRAFT]),
                is_vaccinated=random.choice([True, False]),
                is_sterilized=random.choice([True, False]),
            )
            created += 1

        self.stdout.write(self.style.SUCCESS(f'Created {created} animals'))
