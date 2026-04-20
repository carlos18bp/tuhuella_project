# Generated manually for platform-support content seed.

from django.db import migrations


FAQ_TOPIC = {
    'slug': 'apoyo-plataforma',
    'display_name_es': 'Apoya la plataforma',
    'display_name_en': 'Support the platform',
    'is_active': True,
    'order': 50,
}


FAQ_ITEMS = [
    {
        'order': 1,
        'question_es': '¿Qué es una donación a la plataforma?',
        'question_en': 'What is a platform donation?',
        'answer_es': (
            'Es un aporte voluntario dirigido al sostenimiento operativo de Tuhuella: '
            'servidores, dominio, correos transaccionales, mantenimiento técnico y '
            'desarrollo de nuevas funcionalidades. A diferencia de una donación a un '
            'refugio o campaña, este aporte no financia a una organización externa, '
            'sino la infraestructura que hace posible que todas las demás formas de '
            'apoyo (adopción, apadrinamiento, campañas) existan.'
        ),
        'answer_en': (
            'It is a voluntary contribution aimed at keeping Tuhuella running: '
            'servers, domain, transactional email, technical maintenance, and new '
            'feature development. Unlike a donation to a shelter or campaign, this '
            'contribution does not fund an external organization — it sustains the '
            'infrastructure that makes every other way of supporting the cause '
            '(adoption, sponsorship, campaigns) possible.'
        ),
    },
    {
        'order': 2,
        'question_es': '¿Por qué la plataforma tiene costos?',
        'question_en': 'Why does the platform have costs?',
        'answer_es': (
            'Tuhuella nació como una iniciativa conjunta entre una casa de software y '
            'una veterinaria. Sostener la plataforma requiere pagar servidores, '
            'almacenamiento de imágenes, servicio de correo, nombre de dominio, '
            'certificados de seguridad y el tiempo de las personas que la mantienen, '
            'corrigen errores y agregan nuevas funciones.'
        ),
        'answer_en': (
            'Tuhuella was born as a joint initiative between a software studio and a '
            'veterinary clinic. Keeping it alive requires paying for servers, image '
            'storage, email service, domain name, security certificates, and the time '
            'of the people who maintain it, fix bugs, and ship new features.'
        ),
    },
    {
        'order': 3,
        'question_es': '¿A dónde va exactamente el dinero que aporto?',
        'question_en': 'Where exactly does my contribution go?',
        'answer_es': (
            'Tu aporte se destina principalmente a: (1) hosting e infraestructura en la '
            'nube, (2) servicios de correo y notificaciones, (3) dominio y '
            'certificados, (4) mejoras continuas de la plataforma. Ningún aporte se '
            'transforma en utilidad para los impulsores mientras la iniciativa siga '
            'cubriendo costos operativos.'
        ),
        'answer_en': (
            'Your contribution mainly covers: (1) cloud hosting and infrastructure, '
            '(2) email and notification services, (3) domain and certificates, '
            '(4) ongoing platform improvements. No contribution becomes profit for '
            'the founders while the initiative is still covering operating costs.'
        ),
    },
    {
        'order': 4,
        'question_es': '¿En qué se diferencia de donar a un refugio o campaña?',
        'question_en': 'How is it different from donating to a shelter or campaign?',
        'answer_es': (
            'Cuando donas a un refugio o a una campaña específica, el 100% del aporte '
            'se dirige a esa organización o causa concreta (alimento, tratamientos, '
            'esterilizaciones, etc.). Cuando donas a la plataforma, ese aporte sostiene '
            'a Tuhuella como puente entre personas, animales y refugios.'
        ),
        'answer_en': (
            'When you donate to a shelter or a specific campaign, 100% of the '
            'contribution goes to that organization or cause (food, treatments, '
            'spaying/neutering, etc.). When you donate to the platform, that '
            'contribution keeps Tuhuella running as a bridge between people, animals, '
            'and shelters.'
        ),
    },
    {
        'order': 5,
        'question_es': '¿Recibo algún comprobante de mi aporte?',
        'question_en': 'Do I get a receipt for my contribution?',
        'answer_es': (
            'Sí. Una vez procesado el pago, recibirás un correo electrónico con la '
            'confirmación y los datos de tu aporte. También podrás ver tu historial '
            'completo en la sección "Mis donaciones" dentro de tu cuenta.'
        ),
        'answer_en': (
            'Yes. Once the payment is processed, you will receive an email with the '
            'confirmation and the details of your contribution. You can also see your '
            'full history in the "My donations" section inside your account.'
        ),
    },
]


BLOG_POST = {
    'slug': 'por-que-tuhuella-tiene-costos',
    'title_es': 'Por qué Tuhuella tiene costos (y por qué tu apoyo importa)',
    'title_en': 'Why Tuhuella has costs (and why your support matters)',
    'excerpt_es': (
        'Tuhuella es una iniciativa de una casa de software y una veterinaria. '
        'Explicamos qué hay detrás de la plataforma y por qué sostenerla es una '
        'causa en sí misma.'
    ),
    'excerpt_en': (
        'Tuhuella is an initiative run by a software studio and a veterinary '
        'clinic. Here is what goes on behind the scenes and why keeping it alive '
        'is a cause in itself.'
    ),
    'content_es': (
        '<p>Tuhuella nació con una idea simple: que ninguna persona que quiera '
        'adoptar, apadrinar o ayudar a un animal se quede sin un lugar claro y '
        'confiable para hacerlo. Y que ningún refugio tenga que luchar solo para '
        'hacerse visible.</p>'
        '<p>Detrás de cada ficha de animal, de cada campaña, de cada notificación '
        'que te llega por correo, hay una infraestructura técnica que cuesta '
        'dinero y tiempo: servidores, dominios, servicios de correo, '
        'almacenamiento de imágenes, certificados de seguridad y — lo más '
        'importante — el trabajo continuo de quienes mantienen la plataforma '
        'al día.</p>'
        '<h3>¿Por qué abrir una vía de apoyo a la plataforma?</h3>'
        '<p>Hasta ahora, la comunidad podía apoyar a los animales de cuatro '
        'formas: adoptando, apadrinando, donando a un refugio o donando a una '
        'campaña específica. Todas son vitales. Pero ninguna de ellas financia '
        'la plataforma que las hace posibles.</p>'
        '<p>Con esta quinta vía de apoyo — <strong>donación al sostenimiento '
        'de la plataforma</strong> — queremos abrir una puerta honesta: si '
        'Tuhuella te parece útil, si crees en conectar refugios con personas '
        'que quieren ayudar, este aporte permite que siga existiendo.</p>'
        '<h3>¿A dónde va tu aporte?</h3>'
        '<ul>'
        '<li>Hosting e infraestructura en la nube.</li>'
        '<li>Servicios de correo electrónico y notificaciones.</li>'
        '<li>Nombre de dominio y certificados de seguridad.</li>'
        '<li>Mejoras continuas, corrección de errores y nuevas funciones.</li>'
        '</ul>'
        '<p>Cada aporte, por pequeño que sea, alivia la carga operativa y nos '
        'da oxígeno para seguir sumando refugios, animales y personas a la red.</p>'
        '<p>Gracias por estar aquí. Gracias por creer.</p>'
    ),
    'content_en': (
        '<p>Tuhuella was born with a simple idea: that nobody who wants to '
        'adopt, sponsor, or help an animal should be left without a clear, '
        'trustworthy place to do so. And that no shelter should have to fight '
        'alone to be seen.</p>'
        '<p>Behind every animal profile, every campaign, every email '
        'notification, there is a technical infrastructure that costs money '
        'and time: servers, domains, email services, image storage, security '
        'certificates, and — most importantly — the ongoing work of the '
        'people who keep the platform running.</p>'
        '<h3>Why open a way to support the platform?</h3>'
        '<p>Until now, the community could support animals in four ways: '
        'adopting, sponsoring, donating to a shelter, or donating to a '
        'specific campaign. All of them are vital. But none of them funds '
        'the platform that makes them possible.</p>'
        '<p>With this fifth way to support — <strong>donating to the '
        'platform itself</strong> — we want to open an honest door: if '
        'Tuhuella feels useful to you, if you believe in connecting shelters '
        'with people who want to help, this contribution is what keeps it '
        'alive.</p>'
        '<h3>Where does your contribution go?</h3>'
        '<ul>'
        '<li>Cloud hosting and infrastructure.</li>'
        '<li>Email and notification services.</li>'
        '<li>Domain name and security certificates.</li>'
        '<li>Ongoing improvements, bug fixes, and new features.</li>'
        '</ul>'
        '<p>Every contribution, no matter how small, eases the operational '
        'load and gives us room to keep adding shelters, animals, and people '
        'to the network.</p>'
        '<p>Thank you for being here. Thank you for believing.</p>'
    ),
    'category': 'historias',
    'author': 'tuhuella-team',
    'read_time_minutes': 4,
    'is_published': True,
}


def seed_platform_content(apps, schema_editor):
    FAQTopic = apps.get_model('base_feature_app', 'FAQTopic')
    FAQItem = apps.get_model('base_feature_app', 'FAQItem')
    BlogPost = apps.get_model('base_feature_app', 'BlogPost')

    topic, _ = FAQTopic.objects.get_or_create(
        slug=FAQ_TOPIC['slug'],
        defaults={k: v for k, v in FAQ_TOPIC.items() if k != 'slug'},
    )

    for item in FAQ_ITEMS:
        FAQItem.objects.get_or_create(
            topic=topic,
            question_es=item['question_es'],
            defaults={
                'question_en': item['question_en'],
                'answer_es': item['answer_es'],
                'answer_en': item['answer_en'],
                'order': item['order'],
                'is_active': True,
            },
        )

    from django.utils import timezone
    BlogPost.objects.get_or_create(
        slug=BLOG_POST['slug'],
        defaults={
            'title_es': BLOG_POST['title_es'],
            'title_en': BLOG_POST['title_en'],
            'excerpt_es': BLOG_POST['excerpt_es'],
            'excerpt_en': BLOG_POST['excerpt_en'],
            'content_es': BLOG_POST['content_es'],
            'content_en': BLOG_POST['content_en'],
            'category': BLOG_POST['category'],
            'author': BLOG_POST['author'],
            'read_time_minutes': BLOG_POST['read_time_minutes'],
            'is_published': BLOG_POST['is_published'],
            'published_at': timezone.now(),
        },
    )


def unseed_platform_content(apps, schema_editor):
    FAQTopic = apps.get_model('base_feature_app', 'FAQTopic')
    BlogPost = apps.get_model('base_feature_app', 'BlogPost')

    FAQTopic.objects.filter(slug=FAQ_TOPIC['slug']).delete()
    BlogPost.objects.filter(slug=BLOG_POST['slug']).delete()


class Migration(migrations.Migration):

    dependencies = [
        ('base_feature_app', '0020_campaign_approval_and_messages'),
    ]

    operations = [
        migrations.RunPython(seed_platform_content, unseed_platform_content),
    ]
