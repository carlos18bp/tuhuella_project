import random

from django.core.management.base import BaseCommand
from django.utils import timezone

from base_feature_app.models import BlogPost


SAMPLE_POSTS = [
    {
        'title_es': 'Guía completa para adoptar tu primera mascota',
        'title_en': 'Complete Guide to Adopting Your First Pet',
        'excerpt_es': 'Todo lo que necesitas saber antes de dar el paso más importante: abrir tu hogar a un nuevo compañero.',
        'excerpt_en': 'Everything you need to know before taking the most important step: opening your home to a new companion.',
        'category': 'adopcion',
    },
    {
        'title_es': 'Cómo preparar tu hogar para un perro rescatado',
        'title_en': 'How to Prepare Your Home for a Rescued Dog',
        'excerpt_es': 'Consejos prácticos para hacer la transición más fácil tanto para ti como para tu nuevo amigo peludo.',
        'excerpt_en': 'Practical tips to make the transition easier for both you and your new furry friend.',
        'category': 'consejos',
    },
    {
        'title_es': 'Nutrición canina: mitos y verdades',
        'title_en': 'Dog Nutrition: Myths and Truths',
        'excerpt_es': 'Desmitificamos las creencias más comunes sobre la alimentación de nuestros perros.',
        'excerpt_en': 'We debunk the most common beliefs about feeding our dogs.',
        'category': 'nutricion',
    },
    {
        'title_es': 'La historia de Luna: de la calle al hogar',
        'title_en': 'Luna\'s Story: From the Street to a Home',
        'excerpt_es': 'Una historia conmovedora de rescate y amor incondicional que te inspirará.',
        'excerpt_en': 'A heartwarming story of rescue and unconditional love that will inspire you.',
        'category': 'historias',
    },
    {
        'title_es': 'Vacunación en gatos: calendario y recomendaciones',
        'title_en': 'Cat Vaccination: Schedule and Recommendations',
        'excerpt_es': 'Guía actualizada sobre el calendario de vacunación felina y por qué es esencial.',
        'excerpt_en': 'Updated guide on the feline vaccination schedule and why it is essential.',
        'category': 'salud-animal',
    },
    {
        'title_es': 'Cómo socializar a un cachorro correctamente',
        'title_en': 'How to Properly Socialize a Puppy',
        'excerpt_es': 'Los primeros meses son cruciales. Aprende técnicas de socialización efectivas.',
        'excerpt_en': 'The first months are crucial. Learn effective socialization techniques.',
        'category': 'entrenamiento',
    },
    {
        'title_es': 'Voluntariado en refugios: cómo empezar',
        'title_en': 'Volunteering at Shelters: How to Get Started',
        'excerpt_es': 'Descubre cómo puedes hacer una diferencia real en la vida de los animales de tu comunidad.',
        'excerpt_en': 'Discover how you can make a real difference in the lives of animals in your community.',
        'category': 'voluntariado',
    },
    {
        'title_es': 'Leyes de protección animal en Colombia',
        'title_en': 'Animal Protection Laws in Colombia',
        'excerpt_es': 'Conoce tus derechos y obligaciones como dueño responsable de mascotas.',
        'excerpt_en': 'Know your rights and obligations as a responsible pet owner.',
        'category': 'legislacion',
    },
    {
        'title_es': 'Jornada de adopción este fin de semana',
        'title_en': 'Adoption Event This Weekend',
        'excerpt_es': 'Más de 50 animales buscan hogar. Ven y conoce a tu próximo mejor amigo.',
        'excerpt_en': 'Over 50 animals are looking for a home. Come and meet your next best friend.',
        'category': 'eventos',
    },
    {
        'title_es': 'Cuidados básicos para tu primer gato',
        'title_en': 'Basic Care for Your First Cat',
        'excerpt_es': 'Desde la alimentación hasta el enriquecimiento ambiental: todo sobre el cuidado felino.',
        'excerpt_en': 'From nutrition to environmental enrichment: everything about feline care.',
        'category': 'cuidado-animal',
    },
]


def _build_sample_content_json(title, lang='es'):
    """Build a minimal structured JSON content block."""
    if lang == 'es':
        return {
            'intro': f'En este artículo exploraremos todo sobre "{title}". '
                     'Una guía completa para amantes de los animales.',
            'sections': [
                {
                    'heading': '¿Por qué es importante?',
                    'content': 'Entender este tema es fundamental para el bienestar animal.',
                    'list': [
                        'Mejora la calidad de vida de las mascotas',
                        'Fortalece el vínculo humano-animal',
                        'Contribuye a una sociedad más compasiva',
                    ],
                },
                {
                    'heading': 'Consejos prácticos',
                    'content': 'Aquí te compartimos algunas recomendaciones clave.',
                    'subsections': [
                        {'title': 'Preparación', 'description': 'Asegúrate de tener todo listo antes de comenzar.'},
                        {'title': 'Paciencia', 'description': 'Los cambios toman tiempo, sé paciente con el proceso.'},
                    ],
                },
                {
                    'heading': 'Preguntas frecuentes',
                    'faq': [
                        {
                            'question': '¿Cuánto tiempo toma el proceso?',
                            'answer': 'Depende de cada caso, pero generalmente entre 2 y 4 semanas.',
                        },
                        {
                            'question': '¿Necesito experiencia previa?',
                            'answer': 'No es necesario, pero siempre es útil informarse antes.',
                        },
                    ],
                },
            ],
            'conclusion': 'Esperamos que esta guía te sea de utilidad. '
                          'Recuerda que cada pequeña acción cuenta.',
            'cta': '¿Listo para dar el siguiente paso? Visita nuestros refugios asociados.',
        }
    else:
        return {
            'intro': f'In this article we will explore everything about "{title}". '
                     'A complete guide for animal lovers.',
            'sections': [
                {
                    'heading': 'Why is it important?',
                    'content': 'Understanding this topic is fundamental for animal welfare.',
                    'list': [
                        'Improves the quality of life of pets',
                        'Strengthens the human-animal bond',
                        'Contributes to a more compassionate society',
                    ],
                },
                {
                    'heading': 'Practical tips',
                    'content': 'Here we share some key recommendations.',
                    'subsections': [
                        {'title': 'Preparation', 'description': 'Make sure you have everything ready before starting.'},
                        {'title': 'Patience', 'description': 'Changes take time, be patient with the process.'},
                    ],
                },
                {
                    'heading': 'Frequently Asked Questions',
                    'faq': [
                        {
                            'question': 'How long does the process take?',
                            'answer': 'It depends on each case, but generally between 2 and 4 weeks.',
                        },
                        {
                            'question': 'Do I need previous experience?',
                            'answer': 'It is not necessary, but it is always useful to get informed beforehand.',
                        },
                    ],
                },
            ],
            'conclusion': 'We hope this guide is useful to you. '
                          'Remember that every small action counts.',
            'cta': 'Ready to take the next step? Visit our partner shelters.',
        }


class Command(BaseCommand):
    help = 'Create sample blog posts for development'

    def add_arguments(self, parser):
        parser.add_argument('--count', type=int, default=8, help='Number of blog posts to create')

    def handle(self, *args, **options):
        count = min(options['count'], len(SAMPLE_POSTS))
        authors = [slug for slug, _ in BlogPost.AUTHOR_CHOICES]
        now = timezone.now()

        created = 0
        for i, sample in enumerate(SAMPLE_POSTS[:count]):
            if BlogPost.objects.filter(title_es=sample['title_es']).exists():
                self.stdout.write(self.style.WARNING(f'  Skipped (exists): {sample["title_es"]}'))
                continue

            is_published = i < (count - 2)  # last 2 are drafts
            published_at = now - timezone.timedelta(days=(count - i) * 3) if is_published else None

            BlogPost.objects.create(
                title_es=sample['title_es'],
                title_en=sample['title_en'],
                excerpt_es=sample['excerpt_es'],
                excerpt_en=sample['excerpt_en'],
                category=sample['category'],
                author=random.choice(authors),
                read_time_minutes=random.randint(3, 15),
                is_featured=(i == 0),
                is_published=is_published,
                published_at=published_at,
                content_json_es=_build_sample_content_json(sample['title_es'], 'es'),
                content_json_en=_build_sample_content_json(sample['title_en'], 'en'),
                sources=[
                    {'name': 'Mi Huella', 'url': 'https://mihuella.co'},
                ],
                meta_title_es=sample['title_es'],
                meta_title_en=sample['title_en'],
                meta_description_es=sample['excerpt_es'],
                meta_description_en=sample['excerpt_en'],
            )
            created += 1
            status_label = 'published' if is_published else 'draft'
            self.stdout.write(self.style.SUCCESS(f'  Created ({status_label}): {sample["title_es"]}'))

        self.stdout.write(self.style.SUCCESS(f'Created {created} blog posts'))
