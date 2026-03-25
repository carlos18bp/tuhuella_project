from django.core.management.base import BaseCommand
from base_feature_app.models import StrategicAlly

ALLIES = [
    {
        'name': 'Entre Especies Veterinaria',
        'ally_type': 'veterinary',
        'description_es': 'Clínica veterinaria aliada que ofrece tarifas preferenciales para los animales de nuestros refugios.',
        'description_en': 'Partner veterinary clinic offering preferential rates for animals from our shelters.',
        'website': 'https://entreespecies.com',
        'order': 1,
    },
    {
        'name': 'PetCo Colombia',
        'ally_type': 'company',
        'description_es': 'Empresa de productos para mascotas que dona alimentos y suministros a nuestros refugios mensualmente.',
        'description_en': 'Pet product company that donates food and supplies to our shelters monthly.',
        'website': 'https://petco.co',
        'order': 2,
    },
    {
        'name': 'Fundación Amigos del Animal',
        'ally_type': 'ngo',
        'description_es': 'ONG dedicada a la protección de animales abandonados. Colaboramos en campañas de esterilización y adopción.',
        'description_en': 'NGO dedicated to protecting abandoned animals. We collaborate on sterilization and adoption campaigns.',
        'website': 'https://amigosdelanimal.org',
        'order': 3,
    },
    {
        'name': 'Secretaría de Medio Ambiente',
        'ally_type': 'government',
        'description_es': 'Entidad gubernamental que apoya programas de bienestar animal y regulación de refugios.',
        'description_en': 'Government entity that supports animal welfare programs and shelter regulation.',
        'order': 4,
    },
    {
        'name': 'Radio Huella FM',
        'ally_type': 'media',
        'description_es': 'Emisora local que nos brinda espacios para difundir información sobre adopción y campañas de rescate.',
        'description_en': 'Local radio station that provides us with airtime to share information about adoption and rescue campaigns.',
        'order': 5,
    },
    {
        'name': 'VetClinic 24h',
        'ally_type': 'veterinary',
        'description_es': 'Clínica veterinaria de emergencias 24 horas que atiende casos urgentes de nuestros rescatados.',
        'description_en': '24-hour emergency veterinary clinic that handles urgent cases from our rescues.',
        'website': 'https://vetclinic24h.co',
        'order': 6,
    },
]


class Command(BaseCommand):
    help = 'Create StrategicAlly records for Tu Huella'

    def handle(self, *args, **options):
        created = 0
        for ally_data in ALLIES:
            _, was_created = StrategicAlly.objects.get_or_create(
                name=ally_data['name'],
                defaults=ally_data,
            )
            if was_created:
                created += 1

        self.stdout.write(self.style.SUCCESS(f'Created {created} strategic allies'))
