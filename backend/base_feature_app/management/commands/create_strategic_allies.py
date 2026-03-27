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
    {
        'name': 'Universidad Veterinaria del Valle',
        'ally_type': 'ngo',
        'description_es': 'Facultad de veterinaria que envía practicantes al refugio y apoya con consultas especializadas sin costo.',
        'description_en': 'Veterinary school that sends interns to the shelter and provides free specialized consultations.',
        'website': 'https://univalle.edu.co/veterinaria',
        'order': 7,
    },
    {
        'name': 'MascotaShop Online',
        'ally_type': 'company',
        'description_es': 'Tienda de mascotas online que dona un porcentaje de sus ventas a refugios aliados y ofrece descuentos a adoptantes.',
        'description_en': 'Online pet store that donates a percentage of sales to partner shelters and offers discounts to adopters.',
        'website': 'https://mascotashop.co',
        'order': 8,
    },
    {
        'name': 'Fundación Bienestar Animal Colombia',
        'ally_type': 'ngo',
        'description_es': 'Fundación nacional que trabaja en políticas públicas de protección animal y apoya refugios con recursos legales.',
        'description_en': 'National foundation working on public animal protection policies and supporting shelters with legal resources.',
        'website': 'https://bienestaranimal.org.co',
        'order': 9,
    },
    {
        'name': 'NutriPet Premium',
        'ally_type': 'company',
        'description_es': 'Marca de alimento premium para mascotas que dona bolsas de alimento a nuestros refugios aliados cada mes.',
        'description_en': 'Premium pet food brand that donates bags of food to our partner shelters every month.',
        'website': 'https://nutripet.co',
        'order': 10,
    },
    {
        'name': 'Patitas Blog',
        'ally_type': 'media',
        'description_es': 'Blog y canal de YouTube sobre mascotas que difunde nuestras campañas de adopción y recaudación a su audiencia.',
        'description_en': 'Pet blog and YouTube channel that promotes our adoption and fundraising campaigns to their audience.',
        'website': 'https://patitasblog.com',
        'order': 11,
    },
    {
        'name': 'TechPaws Solutions',
        'ally_type': 'company',
        'description_es': 'Empresa de tecnología que colabora con desarrollo y mantenimiento de nuestra plataforma de forma pro bono.',
        'description_en': 'Tech company that collaborates with development and maintenance of our platform pro bono.',
        'website': 'https://techpaws.dev',
        'order': 12,
    },
]


class Command(BaseCommand):
    help = 'Create StrategicAlly records for Tu Huella'

    def add_arguments(self, parser):
        parser.add_argument('--count', type=int, default=12, help='Number of allies to create')

    def handle(self, *args, **options):
        count = min(options['count'], len(ALLIES))
        created = 0
        for ally_data in ALLIES[:count]:
            _, was_created = StrategicAlly.objects.get_or_create(
                name=ally_data['name'],
                defaults=ally_data,
            )
            if was_created:
                created += 1

        self.stdout.write(self.style.SUCCESS(f'Created {created} strategic allies'))
