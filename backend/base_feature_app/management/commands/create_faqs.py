from django.core.management.base import BaseCommand
from base_feature_app.models import FAQTopic, FAQItem


FAQ_DATA = {
    'home': {
        'display_name_es': 'Preguntas generales',
        'display_name_en': 'General Questions',
        'order': 0,
        'items': [
            {
                'question_es': '¿Qué es Tu Huella?',
                'question_en': 'What is Tu Huella?',
                'answer_es': 'Tu Huella es una plataforma que conecta refugios de animales con personas que quieren adoptar, apadrinar o apoyar económicamente a un animal. Facilitamos el proceso para que sea seguro y transparente.',
                'answer_en': 'Tu Huella is a platform that connects animal shelters with people who want to adopt, sponsor, or financially support an animal. We make the process safe and transparent.',
            },
            {
                'question_es': '¿Es gratis usar la plataforma?',
                'question_en': 'Is it free to use the platform?',
                'answer_es': 'Sí. Registrarse, explorar animales y enviar solicitudes de adopción es completamente gratis. Solo se aplican costos cuando decides hacer una donación o apadrinamiento.',
                'answer_en': 'Yes. Signing up, browsing animals, and submitting adoption applications is completely free. Costs only apply when you decide to make a donation or sponsorship.',
            },
            {
                'question_es': '¿Cómo sé si un refugio es confiable?',
                'question_en': 'How do I know if a shelter is trustworthy?',
                'answer_es': 'Todos los refugios en Tu Huella pasan por un proceso de verificación. Solo los refugios verificados pueden publicar animales en la plataforma.',
                'answer_en': 'All shelters on Tu Huella go through a verification process. Only verified shelters can publish animals on the platform.',
            },
            {
                'question_es': '¿Puedo ayudar sin adoptar?',
                'question_en': 'Can I help without adopting?',
                'answer_es': 'Sí. Puedes apadrinar un animal con un aporte mensual o único, donar a campañas específicas, o simplemente compartir los perfiles de animales en tus redes sociales.',
                'answer_en': 'Yes. You can sponsor an animal with a monthly or one-time contribution, donate to specific campaigns, or simply share animal profiles on your social media.',
            },
        ],
    },
    'animals': {
        'display_name_es': 'Adopción de animales',
        'display_name_en': 'Animal Adoption',
        'order': 1,
        'items': [
            {
                'question_es': '¿Cómo funciona el proceso de adopción?',
                'question_en': 'How does the adoption process work?',
                'answer_es': 'Explora los animales disponibles, selecciona uno que te interese, y envía tu solicitud. El refugio revisará tu perfil y te contactará para una entrevista y visita.',
                'answer_en': 'Browse available animals, select one you\'re interested in, and submit your application. The shelter will review your profile and contact you for an interview and visit.',
            },
            {
                'question_es': '¿Puedo filtrar por varias opciones a la vez?',
                'question_en': 'Can I filter by multiple options at once?',
                'answer_es': 'Sí. Los filtros de especie, tamaño y edad permiten seleccionar múltiples opciones simultáneamente para encontrar exactamente lo que buscas.',
                'answer_en': 'Yes. The species, size, and age filters allow you to select multiple options simultaneously to find exactly what you\'re looking for.',
            },
            {
                'question_es': '¿Qué pasa si no encuentro el animal que busco?',
                'question_en': 'What if I can\'t find the animal I\'m looking for?',
                'answer_es': 'Puedes llenar el formulario de "Busco Adoptar" con tus preferencias. Los refugios podrán ver tu intención y contactarte cuando tengan un animal compatible.',
                'answer_en': 'You can fill out the "Looking to Adopt" form with your preferences. Shelters will be able to see your intent and contact you when they have a compatible animal.',
            },
            {
                'question_es': '¿Puedo apadrinar en vez de adoptar?',
                'question_en': 'Can I sponsor instead of adopting?',
                'answer_es': 'Sí. Cada animal tiene la opción de apadrinamiento. Tu aporte mensual o único ayuda a cubrir alimentación, atención veterinaria y cuidados del refugio.',
                'answer_en': 'Yes. Each animal has a sponsorship option. Your monthly or one-time contribution helps cover food, veterinary care, and shelter care.',
            },
        ],
    },
    'shelters': {
        'display_name_es': 'Refugios',
        'display_name_en': 'Shelters',
        'order': 2,
        'items': [
            {
                'question_es': '¿Cómo registro mi refugio?',
                'question_en': 'How do I register my shelter?',
                'answer_es': 'Crea una cuenta, selecciona el rol de administrador de refugio, y completa el formulario de registro. Nuestro equipo verificará la información antes de activar tu perfil.',
                'answer_en': 'Create an account, select the shelter administrator role, and complete the registration form. Our team will verify the information before activating your profile.',
            },
            {
                'question_es': '¿Qué beneficios tiene registrar mi refugio?',
                'question_en': 'What are the benefits of registering my shelter?',
                'answer_es': 'Podrás publicar animales en adopción, recibir solicitudes de adopción, crear campañas de recaudación y recibir donaciones directas de la comunidad.',
                'answer_en': 'You will be able to publish animals for adoption, receive adoption applications, create fundraising campaigns, and receive direct donations from the community.',
            },
            {
                'question_es': '¿Cuánto tarda la verificación?',
                'question_en': 'How long does verification take?',
                'answer_es': 'El proceso de verificación toma entre 1 y 3 días hábiles. Te notificaremos por correo electrónico cuando tu refugio sea aprobado.',
                'answer_en': 'The verification process takes 1 to 3 business days. We will notify you by email when your shelter is approved.',
            },
        ],
    },
    'campaigns': {
        'display_name_es': 'Campañas y donaciones',
        'display_name_en': 'Campaigns & Donations',
        'order': 3,
        'items': [
            {
                'question_es': '¿Cómo funcionan las campañas?',
                'question_en': 'How do campaigns work?',
                'answer_es': 'Los refugios crean campañas con un objetivo de recaudación y una descripción del caso. Tú puedes donar la cantidad que desees y seguir el progreso de la campaña.',
                'answer_en': 'Shelters create campaigns with a fundraising goal and a case description. You can donate any amount you wish and follow the campaign\'s progress.',
            },
            {
                'question_es': '¿A dónde va mi donación?',
                'question_en': 'Where does my donation go?',
                'answer_es': 'Las donaciones van directamente al refugio que creó la campaña. Cada refugio es responsable de informar cómo se utilizan los fondos recaudados.',
                'answer_en': 'Donations go directly to the shelter that created the campaign. Each shelter is responsible for reporting how the raised funds are used.',
            },
            {
                'question_es': '¿Qué métodos de pago aceptan?',
                'question_en': 'What payment methods do you accept?',
                'answer_es': 'Actualmente estamos integrando pagos a través de Wompi. Pronto podrás pagar con tarjeta de crédito, débito y otros medios electrónicos.',
                'answer_en': 'We are currently integrating payments through Wompi. Soon you will be able to pay with credit card, debit card, and other electronic methods.',
            },
        ],
    },
    'adoption': {
        'display_name_es': 'Adopción',
        'display_name_en': 'Adoption',
        'order': 4,
        'items': [
            {
                'question_es': '¿Qué requisitos necesito para adoptar?',
                'question_en': 'What requirements do I need to adopt?',
                'answer_es': 'Debes ser mayor de edad, completar el formulario de adopción con información sobre tu vivienda, experiencia con mascotas y disponibilidad. El refugio evaluará tu solicitud.',
                'answer_en': 'You must be of legal age, complete the adoption form with information about your housing, pet experience, and availability. The shelter will evaluate your application.',
            },
            {
                'question_es': '¿Cuánto tarda el proceso de adopción?',
                'question_en': 'How long does the adoption process take?',
                'answer_es': 'El tiempo varía según el refugio, pero generalmente incluye una revisión de solicitud (1-3 días), entrevista, y coordinación de entrega. En promedio toma entre 1 y 2 semanas.',
                'answer_en': 'The time varies by shelter, but generally includes an application review (1-3 days), interview, and delivery coordination. On average, it takes 1 to 2 weeks.',
            },
            {
                'question_es': '¿Puedo devolver un animal adoptado?',
                'question_en': 'Can I return an adopted animal?',
                'answer_es': 'Si por alguna razón no puedes continuar con el cuidado del animal, contacta al refugio. Ellos te orientarán sobre el proceso de devolución responsable.',
                'answer_en': 'If for any reason you cannot continue caring for the animal, contact the shelter. They will guide you through the responsible return process.',
            },
        ],
    },
    'checkout': {
        'display_name_es': 'Pagos y donaciones',
        'display_name_en': 'Payments & Donations',
        'order': 5,
        'items': [
            {
                'question_es': '¿Es seguro hacer pagos en la plataforma?',
                'question_en': 'Is it safe to make payments on the platform?',
                'answer_es': 'Sí. Utilizamos pasarelas de pago certificadas y no almacenamos datos de tarjetas. Todas las transacciones son procesadas de forma segura.',
                'answer_en': 'Yes. We use certified payment gateways and do not store card data. All transactions are processed securely.',
            },
            {
                'question_es': '¿Puedo cancelar mi apadrinamiento mensual?',
                'question_en': 'Can I cancel my monthly sponsorship?',
                'answer_es': 'Sí, puedes cancelar o pausar tu apadrinamiento en cualquier momento desde la sección "Mis Apadrinamientos" en tu perfil.',
                'answer_en': 'Yes, you can cancel or pause your sponsorship at any time from the "My Sponsorships" section in your profile.',
            },
            {
                'question_es': '¿Recibo un comprobante de mi donación?',
                'question_en': 'Do I receive a receipt for my donation?',
                'answer_es': 'Sí. Después de cada donación o pago, recibirás un correo electrónico con el comprobante de la transacción. También puedes verlo en "Mis Donaciones".',
                'answer_en': 'Yes. After each donation or payment, you will receive an email with the transaction receipt. You can also view it in "My Donations".',
            },
        ],
    },
    'looking-to-adopt': {
        'display_name_es': 'Busco Adoptar',
        'display_name_en': 'Looking to Adopt',
        'order': 6,
        'items': [
            {
                'question_es': '¿Qué es "Busco Adoptar"?',
                'question_en': 'What is "Looking to Adopt"?',
                'answer_es': 'Es un formulario donde describes qué tipo de animal buscas (especie, tamaño, edad, etc.). Los refugios pueden ver tu intención y contactarte cuando tengan un animal compatible.',
                'answer_en': 'It is a form where you describe what type of animal you are looking for (species, size, age, etc.). Shelters can see your intent and contact you when they have a compatible animal.',
            },
            {
                'question_es': '¿Cuánto tiempo tarda en encontrar un match?',
                'question_en': 'How long does it take to find a match?',
                'answer_es': 'Depende de la disponibilidad de animales que coincidan con tus preferencias. Recibirás notificaciones cuando haya coincidencias.',
                'answer_en': 'It depends on the availability of animals that match your preferences. You will receive notifications when there are matches.',
            },
            {
                'question_es': '¿Es obligatorio llenar este formulario para adoptar?',
                'question_en': 'Is it mandatory to fill out this form to adopt?',
                'answer_es': 'No. Puedes adoptar directamente desde la página de animales. Este formulario es una alternativa para que los refugios te encuentren a ti.',
                'answer_en': 'No. You can adopt directly from the animals page. This form is an alternative for shelters to find you.',
            },
            {
                'question_es': '¿Puedo cambiar mis preferencias después de enviar el formulario?',
                'question_en': 'Can I change my preferences after submitting the form?',
                'answer_es': 'Sí. Puedes actualizar tus preferencias en cualquier momento desde la sección "Busco Adoptar" en tu perfil.',
                'answer_en': 'Yes. You can update your preferences at any time from the "Looking to Adopt" section in your profile.',
            },
        ],
    },
    'account': {
        'display_name_es': 'Cuenta y perfil',
        'display_name_en': 'Account & Profile',
        'order': 7,
        'items': [
            {
                'question_es': '¿Cómo creo una cuenta?',
                'question_en': 'How do I create an account?',
                'answer_es': 'Haz clic en "Registrarse", ingresa tu correo electrónico y crea una contraseña. Recibirás un correo de verificación para activar tu cuenta.',
                'answer_en': 'Click "Sign Up", enter your email address and create a password. You will receive a verification email to activate your account.',
            },
            {
                'question_es': '¿Cómo recupero mi contraseña?',
                'question_en': 'How do I recover my password?',
                'answer_es': 'En la página de inicio de sesión, haz clic en "¿Olvidaste tu contraseña?". Te enviaremos un código a tu correo para restablecerla.',
                'answer_en': 'On the login page, click "Forgot your password?". We will send you a code to your email to reset it.',
            },
            {
                'question_es': '¿Puedo cambiar mi correo electrónico?',
                'question_en': 'Can I change my email address?',
                'answer_es': 'Actualmente no es posible cambiar el correo electrónico asociado a tu cuenta. Si necesitas usar otro correo, puedes crear una nueva cuenta.',
                'answer_en': 'Currently it is not possible to change the email address associated with your account. If you need to use a different email, you can create a new account.',
            },
            {
                'question_es': '¿Cómo elimino mi cuenta?',
                'question_en': 'How do I delete my account?',
                'answer_es': 'Puedes solicitar la eliminación de tu cuenta escribiéndonos a soporte. Tus datos serán eliminados de acuerdo con nuestra política de privacidad.',
                'answer_en': 'You can request account deletion by contacting our support team. Your data will be deleted in accordance with our privacy policy.',
            },
        ],
    },
    'sponsorships': {
        'display_name_es': 'Apadrinamientos',
        'display_name_en': 'Sponsorships',
        'order': 8,
        'items': [
            {
                'question_es': '¿Qué es un apadrinamiento?',
                'question_en': 'What is a sponsorship?',
                'answer_es': 'Un apadrinamiento es un aporte económico (único o mensual) para cubrir los gastos de cuidado de un animal específico en un refugio: alimentación, veterinario y alojamiento.',
                'answer_en': 'A sponsorship is a financial contribution (one-time or monthly) to cover the care costs of a specific animal at a shelter: food, veterinary care, and housing.',
            },
            {
                'question_es': '¿Puedo conocer al animal que apadrino?',
                'question_en': 'Can I meet the animal I sponsor?',
                'answer_es': 'Sí. Puedes coordinar una visita con el refugio para conocer al animal. Además, recibirás actualizaciones periódicas sobre su estado.',
                'answer_en': 'Yes. You can arrange a visit with the shelter to meet the animal. Additionally, you will receive periodic updates on their condition.',
            },
            {
                'question_es': '¿Qué pasa si el animal que apadrino es adoptado?',
                'question_en': 'What happens if the animal I sponsor gets adopted?',
                'answer_es': 'Te notificaremos y podrás elegir apadrinar a otro animal o cancelar tu apadrinamiento. La adopción es siempre la mejor noticia.',
                'answer_en': 'We will notify you and you can choose to sponsor another animal or cancel your sponsorship. Adoption is always the best news.',
            },
            {
                'question_es': '¿Puedo apadrinar más de un animal?',
                'question_en': 'Can I sponsor more than one animal?',
                'answer_es': 'Sí, puedes apadrinar tantos animales como desees. Cada apadrinamiento se gestiona de forma independiente.',
                'answer_en': 'Yes, you can sponsor as many animals as you wish. Each sponsorship is managed independently.',
            },
        ],
    },
    'blog': {
        'display_name_es': 'Blog y contenido',
        'display_name_en': 'Blog & Content',
        'order': 9,
        'items': [
            {
                'question_es': '¿Quién escribe los artículos del blog?',
                'question_en': 'Who writes the blog articles?',
                'answer_es': 'Los artículos son escritos por nuestro equipo editorial y colaboradores invitados: veterinarios, entrenadores y voluntarios con experiencia en bienestar animal.',
                'answer_en': 'Articles are written by our editorial team and guest contributors: veterinarians, trainers, and volunteers with experience in animal welfare.',
            },
            {
                'question_es': '¿Puedo sugerir un tema para el blog?',
                'question_en': 'Can I suggest a blog topic?',
                'answer_es': 'Sí. Nos encanta recibir sugerencias de nuestra comunidad. Puedes enviarnos tus ideas a través de nuestras redes sociales o correo de contacto.',
                'answer_en': 'Yes. We love receiving suggestions from our community. You can send us your ideas through our social media or contact email.',
            },
            {
                'question_es': '¿Con qué frecuencia publican contenido nuevo?',
                'question_en': 'How often do you publish new content?',
                'answer_es': 'Publicamos entre 2 y 4 artículos por mes, cubriendo temas de adopción, cuidado animal, historias de éxito y consejos para dueños de mascotas.',
                'answer_en': 'We publish between 2 and 4 articles per month, covering topics on adoption, animal care, success stories, and tips for pet owners.',
            },
        ],
    },
}


class Command(BaseCommand):
    help = 'Create FAQ topics and items'

    def add_arguments(self, parser):
        parser.add_argument(
            '--count', type=int, default=10,
            help='Number of FAQ topics to create',
        )

    def handle(self, *args, **options):
        count = options['count']
        topics_created = 0
        items_created = 0

        for idx, (slug, data) in enumerate(FAQ_DATA.items()):
            if idx >= count:
                break

            topic, created = FAQTopic.objects.get_or_create(
                slug=slug,
                defaults={
                    'display_name_es': data['display_name_es'],
                    'display_name_en': data['display_name_en'],
                    'order': data['order'],
                },
            )
            if created:
                topics_created += 1

            for item_idx, item_data in enumerate(data['items']):
                _, item_created = FAQItem.objects.get_or_create(
                    topic=topic,
                    question_es=item_data['question_es'],
                    defaults={
                        'question_en': item_data['question_en'],
                        'answer_es': item_data['answer_es'],
                        'answer_en': item_data['answer_en'],
                        'order': item_idx,
                    },
                )
                if item_created:
                    items_created += 1

        self.stdout.write(self.style.SUCCESS(
            f'Created {topics_created} FAQ topics and {items_created} items'
        ))
