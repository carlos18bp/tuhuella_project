from django.core.management.base import BaseCommand
from base_feature_app.models import VolunteerPosition

POSITIONS = [
    {
        'category': 'photographer',
        'title_es': 'Fotógrafo de Mascotas',
        'title_en': 'Pet Photographer',
        'description_es': 'Captura las mejores fotos de nuestros animales para ayudarlos a encontrar un hogar. Tus imágenes son la primera impresión que los adoptantes tienen.',
        'description_en': 'Capture the best photos of our animals to help them find a home. Your images are the first impression adopters get.',
        'requirements_es': 'Cámara propia (DSLR o mirrorless preferible). Disponibilidad los fines de semana.',
        'requirements_en': 'Own camera (DSLR or mirrorless preferred). Weekend availability.',
        'icon': 'camera',
        'order': 1,
    },
    {
        'category': 'shelter_helper',
        'title_es': 'Ayudante de Refugio',
        'title_en': 'Shelter Helper',
        'description_es': 'Ayuda con la alimentación, limpieza y cuidado diario de los animales en el refugio. Tu presencia hace una gran diferencia.',
        'description_en': 'Help with feeding, cleaning, and daily care of animals at the shelter. Your presence makes a big difference.',
        'requirements_es': 'Amor por los animales. Disponibilidad mínima de 4 horas semanales.',
        'requirements_en': 'Love for animals. Minimum availability of 4 hours per week.',
        'icon': 'heart',
        'order': 2,
    },
    {
        'category': 'driver',
        'title_es': 'Conductor / Transportador',
        'title_en': 'Driver / Transporter',
        'description_es': 'Transporta animales rescatados al refugio o a citas veterinarias. Tu vehículo puede salvar vidas.',
        'description_en': 'Transport rescued animals to the shelter or veterinary appointments. Your vehicle can save lives.',
        'requirements_es': 'Licencia de conducir vigente. Vehículo propio con espacio para transportar animales.',
        'requirements_en': 'Valid driver\'s license. Own vehicle with space to transport animals.',
        'icon': 'truck',
        'order': 3,
    },
    {
        'category': 'veterinary_volunteer',
        'title_es': 'Voluntario Veterinario',
        'title_en': 'Veterinary Volunteer',
        'description_es': 'Presta tus conocimientos veterinarios para cuidar la salud de nuestros animales. Desde chequeos básicos hasta asistencia en cirugías.',
        'description_en': 'Lend your veterinary knowledge to care for our animals\' health. From basic checkups to surgical assistance.',
        'requirements_es': 'Estudiante avanzado o profesional en medicina veterinaria.',
        'requirements_en': 'Advanced student or professional in veterinary medicine.',
        'icon': 'stethoscope',
        'order': 4,
    },
    {
        'category': 'social_media',
        'title_es': 'Community Manager',
        'title_en': 'Social Media Manager',
        'description_es': 'Gestiona nuestras redes sociales para dar visibilidad a los animales en adopción y a las campañas del refugio.',
        'description_en': 'Manage our social media to give visibility to animals up for adoption and shelter campaigns.',
        'requirements_es': 'Experiencia básica en redes sociales. Creatividad y compromiso.',
        'requirements_en': 'Basic social media experience. Creativity and commitment.',
        'icon': 'share2',
        'order': 5,
    },
    {
        'category': 'event_coordinator',
        'title_es': 'Coordinador de Eventos',
        'title_en': 'Event Coordinator',
        'description_es': 'Organiza jornadas de adopción, recaudación de fondos y eventos comunitarios que conectan a la comunidad con nuestra causa.',
        'description_en': 'Organize adoption drives, fundraisers, and community events that connect the community with our cause.',
        'requirements_es': 'Habilidades de organización y comunicación. Experiencia en eventos es un plus.',
        'requirements_en': 'Organizational and communication skills. Event experience is a plus.',
        'icon': 'calendar-check',
        'order': 6,
    },
    {
        'category': 'foster_home',
        'title_es': 'Hogar Temporal',
        'title_en': 'Foster Home',
        'description_es': 'Ofrece tu hogar como refugio temporal para animales que necesitan recuperación o socialización antes de ser adoptados.',
        'description_en': 'Offer your home as a temporary shelter for animals that need recovery or socialization before adoption.',
        'requirements_es': 'Espacio adecuado en tu hogar. Compromiso mínimo de 2 semanas.',
        'requirements_en': 'Adequate space in your home. Minimum commitment of 2 weeks.',
        'icon': 'home',
        'order': 7,
    },
    {
        'category': 'fundraiser',
        'title_es': 'Recaudador de Fondos',
        'title_en': 'Fundraiser',
        'description_es': 'Ayuda a recaudar fondos para cubrir los costos veterinarios, alimentación y operaciones del refugio.',
        'description_en': 'Help raise funds to cover veterinary costs, food, and shelter operations.',
        'requirements_es': 'Habilidades de comunicación y persuasión. Red de contactos es un plus.',
        'requirements_en': 'Communication and persuasion skills. Network of contacts is a plus.',
        'icon': 'hand-coins',
        'order': 8,
    },
]


class Command(BaseCommand):
    help = 'Create VolunteerPosition records for Tu Huella'

    def handle(self, *args, **options):
        created = 0
        for pos_data in POSITIONS:
            _, was_created = VolunteerPosition.objects.get_or_create(
                category=pos_data['category'],
                defaults=pos_data,
            )
            if was_created:
                created += 1

        self.stdout.write(self.style.SUCCESS(f'Created {created} volunteer positions'))
