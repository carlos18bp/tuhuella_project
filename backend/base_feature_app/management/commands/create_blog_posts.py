import random

from django.core.management.base import BaseCommand
from django.utils import timezone

from base_feature_app.models import BlogPost


# Pool of posts per category — at least 10 per category so random sampling works well
POSTS_BY_CATEGORY = {
    'adopcion': [
        {
            'title_es': 'Guía completa para adoptar tu primera mascota',
            'title_en': 'Complete Guide to Adopting Your First Pet',
            'excerpt_es': 'Todo lo que necesitas saber antes de dar el paso más importante: abrir tu hogar a un nuevo compañero.',
            'excerpt_en': 'Everything you need to know before taking the most important step: opening your home to a new companion.',
        },
        {
            'title_es': 'Adopción responsable: más allá del primer día',
            'title_en': 'Responsible Adoption: Beyond the First Day',
            'excerpt_es': 'El compromiso de adoptar no termina cuando llegas a casa. Descubre cómo hacer la transición exitosa.',
            'excerpt_en': 'The commitment of adopting doesn\'t end when you get home. Discover how to make a successful transition.',
        },
        {
            'title_es': 'Mitos sobre adoptar animales adultos',
            'title_en': 'Myths About Adopting Adult Animals',
            'excerpt_es': 'Muchos creen que solo los cachorros se adaptan. Te mostramos por qué adoptar un adulto puede ser la mejor decisión.',
            'excerpt_en': 'Many believe only puppies adapt. We show you why adopting an adult can be the best decision.',
        },
        {
            'title_es': 'Adoptar un gato: lo que nadie te cuenta',
            'title_en': 'Adopting a Cat: What Nobody Tells You',
            'excerpt_es': 'Los gatos adoptados tienen sus propios retos y recompensas. Prepárate con esta guía honesta.',
            'excerpt_en': 'Adopted cats have their own challenges and rewards. Prepare yourself with this honest guide.',
        },
        {
            'title_es': '¿Estás listo para adoptar? Test de autoevaluación',
            'title_en': 'Are You Ready to Adopt? Self-Assessment Test',
            'excerpt_es': 'Antes de ir al refugio, responde estas preguntas para saber si estás realmente preparado.',
            'excerpt_en': 'Before going to the shelter, answer these questions to know if you are truly prepared.',
        },
        {
            'title_es': 'Adopción de animales con necesidades especiales',
            'title_en': 'Adopting Animals with Special Needs',
            'excerpt_es': 'Perros y gatos con discapacidades también merecen un hogar. Conoce lo que implica esta decisión.',
            'excerpt_en': 'Dogs and cats with disabilities also deserve a home. Learn what this decision involves.',
        },
        {
            'title_es': 'Cómo elegir el animal adecuado para tu familia',
            'title_en': 'How to Choose the Right Animal for Your Family',
            'excerpt_es': 'No todas las razas ni temperamentos son iguales. Aprende a encontrar la combinación perfecta.',
            'excerpt_en': 'Not all breeds and temperaments are the same. Learn to find the perfect match.',
        },
        {
            'title_es': 'El proceso de adopción paso a paso',
            'title_en': 'The Adoption Process Step by Step',
            'excerpt_es': 'Desde la solicitud hasta el seguimiento post-adopción: conoce cada etapa del proceso.',
            'excerpt_en': 'From the application to post-adoption follow-up: learn about each stage of the process.',
        },
        {
            'title_es': 'Adoptar vs. comprar: por qué adoptar siempre gana',
            'title_en': 'Adopt vs. Buy: Why Adopting Always Wins',
            'excerpt_es': 'Las razones éticas, económicas y emocionales por las que adoptar es la mejor opción.',
            'excerpt_en': 'The ethical, economic, and emotional reasons why adopting is the best option.',
        },
        {
            'title_es': 'Segunda oportunidad: perros devueltos que encontraron hogar',
            'title_en': 'Second Chance: Returned Dogs Who Found a Home',
            'excerpt_es': 'Historias de animales que fueron devueltos al refugio y finalmente encontraron su familia para siempre.',
            'excerpt_en': 'Stories of animals that were returned to the shelter and finally found their forever family.',
        },
    ],
    'cuidado-animal': [
        {
            'title_es': 'Cuidados básicos para tu primer gato',
            'title_en': 'Basic Care for Your First Cat',
            'excerpt_es': 'Desde la alimentación hasta el enriquecimiento ambiental: todo sobre el cuidado felino.',
            'excerpt_en': 'From nutrition to environmental enrichment: everything about feline care.',
        },
        {
            'title_es': 'Guía de primeros auxilios para mascotas',
            'title_en': 'First Aid Guide for Pets',
            'excerpt_es': 'Saber actuar en una emergencia puede salvar la vida de tu mascota. Aprende los pasos esenciales.',
            'excerpt_en': 'Knowing how to act in an emergency can save your pet\'s life. Learn the essential steps.',
        },
        {
            'title_es': 'El baño perfecto: frecuencia y técnicas para perros',
            'title_en': 'The Perfect Bath: Frequency and Techniques for Dogs',
            'excerpt_es': 'Bañar a tu perro no es tan simple como parece. Descubre la frecuencia ideal y los productos adecuados.',
            'excerpt_en': 'Bathing your dog is not as simple as it seems. Discover the ideal frequency and the right products.',
        },
        {
            'title_es': 'Cómo cuidar los dientes de tu mascota',
            'title_en': 'How to Care for Your Pet\'s Teeth',
            'excerpt_es': 'La salud dental es clave para el bienestar general. Te enseñamos rutinas de higiene bucal efectivas.',
            'excerpt_en': 'Dental health is key to overall well-being. We teach you effective oral hygiene routines.',
        },
        {
            'title_es': 'Enriquecimiento ambiental para gatos de interior',
            'title_en': 'Environmental Enrichment for Indoor Cats',
            'excerpt_es': 'Mantén a tu gato feliz y estimulado con estas ideas de enriquecimiento para el hogar.',
            'excerpt_en': 'Keep your cat happy and stimulated with these enrichment ideas for the home.',
        },
        {
            'title_es': 'Cómo proteger a tu mascota del frío',
            'title_en': 'How to Protect Your Pet from the Cold',
            'excerpt_es': 'El invierno puede ser peligroso para nuestras mascotas. Aprende a mantenerlas calientes y seguras.',
            'excerpt_en': 'Winter can be dangerous for our pets. Learn to keep them warm and safe.',
        },
        {
            'title_es': 'Cuidado de mascotas senior: guía completa',
            'title_en': 'Senior Pet Care: Complete Guide',
            'excerpt_es': 'Las mascotas mayores requieren atención especial. Conoce cómo adaptar su rutina y cuidados.',
            'excerpt_en': 'Senior pets require special attention. Learn how to adapt their routine and care.',
        },
        {
            'title_es': 'Los mejores juguetes para perros según su tamaño',
            'title_en': 'The Best Dog Toys by Size',
            'excerpt_es': 'No todos los juguetes sirven para todos los perros. Elige el adecuado según su tamaño y energía.',
            'excerpt_en': 'Not all toys work for all dogs. Choose the right one based on their size and energy.',
        },
        {
            'title_es': 'Cómo cortar las uñas de tu gato sin estrés',
            'title_en': 'How to Trim Your Cat\'s Nails Without Stress',
            'excerpt_es': 'Una guía paso a paso para que el corte de uñas sea una experiencia tranquila para ambos.',
            'excerpt_en': 'A step-by-step guide to make nail trimming a calm experience for both of you.',
        },
        {
            'title_es': 'Preparando tu hogar para una mascota nueva',
            'title_en': 'Preparing Your Home for a New Pet',
            'excerpt_es': 'Desde eliminar peligros hasta crear un espacio acogedor: prepara tu casa antes de la llegada.',
            'excerpt_en': 'From removing hazards to creating a cozy space: prepare your home before the arrival.',
        },
    ],
    'salud-animal': [
        {
            'title_es': 'Vacunación en gatos: calendario y recomendaciones',
            'title_en': 'Cat Vaccination: Schedule and Recommendations',
            'excerpt_es': 'Guía actualizada sobre el calendario de vacunación felina y por qué es esencial.',
            'excerpt_en': 'Updated guide on the feline vaccination schedule and why it is essential.',
        },
        {
            'title_es': 'Señales de estrés en perros que debes conocer',
            'title_en': 'Signs of Stress in Dogs You Should Know',
            'excerpt_es': 'Aprende a identificar cuándo tu perro está ansioso y cómo ayudarlo a sentirse seguro.',
            'excerpt_en': 'Learn to identify when your dog is anxious and how to help them feel safe.',
        },
        {
            'title_es': 'Los beneficios de esterilizar a tu mascota',
            'title_en': 'The Benefits of Spaying or Neutering Your Pet',
            'excerpt_es': 'La esterilización no solo controla la sobrepoblación, también mejora la salud y calidad de vida.',
            'excerpt_en': 'Spaying or neutering not only controls overpopulation, it also improves health and quality of life.',
        },
        {
            'title_es': 'Parásitos internos y externos: prevención y tratamiento',
            'title_en': 'Internal and External Parasites: Prevention and Treatment',
            'excerpt_es': 'Pulgas, garrapatas y lombrices: cómo proteger a tu mascota de los parásitos más comunes.',
            'excerpt_en': 'Fleas, ticks, and worms: how to protect your pet from the most common parasites.',
        },
        {
            'title_es': 'Alergias en perros: síntomas y soluciones',
            'title_en': 'Allergies in Dogs: Symptoms and Solutions',
            'excerpt_es': 'Tu perro se rasca constantemente? Puede ser alergia. Aprende a identificar y tratar los síntomas.',
            'excerpt_en': 'Does your dog scratch constantly? It could be allergies. Learn to identify and treat the symptoms.',
        },
        {
            'title_es': 'Cuándo llevar a tu mascota al veterinario de emergencia',
            'title_en': 'When to Take Your Pet to the Emergency Vet',
            'excerpt_es': 'Conoce las señales de alerta que indican que tu mascota necesita atención veterinaria inmediata.',
            'excerpt_en': 'Learn the warning signs that indicate your pet needs immediate veterinary attention.',
        },
        {
            'title_es': 'Enfermedades comunes en gatos y cómo prevenirlas',
            'title_en': 'Common Diseases in Cats and How to Prevent Them',
            'excerpt_es': 'Desde infecciones urinarias hasta problemas dentales: las enfermedades felinas más frecuentes.',
            'excerpt_en': 'From urinary infections to dental problems: the most common feline diseases.',
        },
        {
            'title_es': 'La importancia del chequeo veterinario anual',
            'title_en': 'The Importance of Annual Veterinary Checkups',
            'excerpt_es': 'La prevención es la mejor medicina. Descubre qué incluye un chequeo completo y por qué es vital.',
            'excerpt_en': 'Prevention is the best medicine. Discover what a complete checkup includes and why it is vital.',
        },
        {
            'title_es': 'Obesidad en mascotas: un problema creciente',
            'title_en': 'Pet Obesity: A Growing Problem',
            'excerpt_es': 'El sobrepeso afecta la salud y esperanza de vida de tu mascota. Aprende a manejarlo.',
            'excerpt_en': 'Excess weight affects your pet\'s health and life expectancy. Learn how to manage it.',
        },
        {
            'title_es': 'Salud mental en mascotas: ansiedad por separación',
            'title_en': 'Pet Mental Health: Separation Anxiety',
            'excerpt_es': 'Tu mascota destruye cosas cuando te vas? Puede ser ansiedad por separación. Conoce las soluciones.',
            'excerpt_en': 'Does your pet destroy things when you leave? It could be separation anxiety. Learn the solutions.',
        },
    ],
    'historias': [
        {
            'title_es': 'La historia de Luna: de la calle al hogar',
            'title_en': 'Luna\'s Story: From the Street to a Home',
            'excerpt_es': 'Una historia conmovedora de rescate y amor incondicional que te inspirará.',
            'excerpt_en': 'A heartwarming story of rescue and unconditional love that will inspire you.',
        },
        {
            'title_es': 'Historias de éxito: familias que adoptaron en Tu Huella',
            'title_en': 'Success Stories: Families Who Adopted Through Tu Huella',
            'excerpt_es': 'Tres familias comparten su experiencia adoptando a través de nuestra plataforma.',
            'excerpt_en': 'Three families share their experience adopting through our platform.',
        },
        {
            'title_es': 'Max: el perro que salvó a su familia',
            'title_en': 'Max: The Dog Who Saved His Family',
            'excerpt_es': 'Un perro rescatado alertó a su familia de un incendio. Esta es su increíble historia.',
            'excerpt_en': 'A rescued dog alerted his family to a fire. This is his incredible story.',
        },
        {
            'title_es': 'De refugio a terapia: animales que sanan corazones',
            'title_en': 'From Shelter to Therapy: Animals That Heal Hearts',
            'excerpt_es': 'Conoce a los animales rescatados que ahora trabajan como animales de terapia en hospitales.',
            'excerpt_en': 'Meet the rescued animals that now work as therapy animals in hospitals.',
        },
        {
            'title_es': 'Simón y Canela: una amistad inesperada',
            'title_en': 'Simón and Canela: An Unexpected Friendship',
            'excerpt_es': 'Un niño tímido y una perra rescatada formaron un vínculo que cambió la vida de ambos.',
            'excerpt_en': 'A shy boy and a rescued dog formed a bond that changed both their lives.',
        },
        {
            'title_es': 'El viaje de Toby: 200 km para volver a casa',
            'title_en': 'Toby\'s Journey: 200 km to Get Back Home',
            'excerpt_es': 'Toby se perdió durante una mudanza y recorrió 200 km para reencontrarse con su familia.',
            'excerpt_en': 'Toby got lost during a move and traveled 200 km to reunite with his family.',
        },
        {
            'title_es': 'Voluntarios que cambiaron su vida en un refugio',
            'title_en': 'Volunteers Who Changed Their Lives at a Shelter',
            'excerpt_es': 'Cuatro voluntarios cuentan cómo trabajar en un refugio transformó su perspectiva de vida.',
            'excerpt_en': 'Four volunteers share how working at a shelter transformed their outlook on life.',
        },
        {
            'title_es': 'Lola: la gata que conquistó un barrio entero',
            'title_en': 'Lola: The Cat Who Won Over an Entire Neighborhood',
            'excerpt_es': 'Una gata comunitaria se convirtió en la mascota favorita de un vecindario en Bogotá.',
            'excerpt_en': 'A community cat became the favorite pet of a neighborhood in Bogotá.',
        },
        {
            'title_es': 'Antes y después: transformaciones de animales rescatados',
            'title_en': 'Before and After: Transformations of Rescued Animals',
            'excerpt_es': 'Imágenes impactantes que muestran el poder del amor y los cuidados adecuados.',
            'excerpt_en': 'Stunning images that show the power of love and proper care.',
        },
        {
            'title_es': 'La pareja que adoptó 5 perros senior',
            'title_en': 'The Couple Who Adopted 5 Senior Dogs',
            'excerpt_es': 'Carlos y María decidieron dar hogar a los perros que nadie quería. Esta es su historia.',
            'excerpt_en': 'Carlos and María decided to give a home to the dogs nobody wanted. This is their story.',
        },
    ],
    'consejos': [
        {
            'title_es': 'Cómo preparar tu hogar para un perro rescatado',
            'title_en': 'How to Prepare Your Home for a Rescued Dog',
            'excerpt_es': 'Consejos prácticos para hacer la transición más fácil tanto para ti como para tu nuevo amigo peludo.',
            'excerpt_en': 'Practical tips to make the transition easier for both you and your new furry friend.',
        },
        {
            'title_es': '10 errores comunes de dueños primerizos',
            'title_en': '10 Common Mistakes of First-Time Pet Owners',
            'excerpt_es': 'Evita los errores más frecuentes que cometen quienes tienen mascota por primera vez.',
            'excerpt_en': 'Avoid the most common mistakes made by first-time pet owners.',
        },
        {
            'title_es': 'Cómo presentar un nuevo animal a tu mascota actual',
            'title_en': 'How to Introduce a New Animal to Your Current Pet',
            'excerpt_es': 'La convivencia entre mascotas requiere paciencia. Sigue estos pasos para una introducción exitosa.',
            'excerpt_en': 'Coexistence between pets requires patience. Follow these steps for a successful introduction.',
        },
        {
            'title_es': 'Viajar con mascotas: guía completa',
            'title_en': 'Traveling with Pets: Complete Guide',
            'excerpt_es': 'Desde el avión hasta el hotel: todo lo que necesitas para viajar seguro con tu mascota.',
            'excerpt_en': 'From the plane to the hotel: everything you need to travel safely with your pet.',
        },
        {
            'title_es': 'Cómo elegir el mejor alimento para tu perro',
            'title_en': 'How to Choose the Best Food for Your Dog',
            'excerpt_es': 'No todos los alimentos son iguales. Aprende a leer etiquetas y elegir la mejor opción.',
            'excerpt_en': 'Not all foods are the same. Learn to read labels and choose the best option.',
        },
        {
            'title_es': 'Mudanza con mascotas: minimiza el estrés',
            'title_en': 'Moving with Pets: Minimize Stress',
            'excerpt_es': 'Las mudanzas son estresantes para todos, incluidas tus mascotas. Estos consejos ayudarán.',
            'excerpt_en': 'Moving is stressful for everyone, including your pets. These tips will help.',
        },
        {
            'title_es': 'Cómo mantener a tu mascota segura en Navidad',
            'title_en': 'How to Keep Your Pet Safe During Christmas',
            'excerpt_es': 'Luces, chocolate, pólvora: las fiestas esconden peligros para nuestras mascotas.',
            'excerpt_en': 'Lights, chocolate, fireworks: the holidays hide dangers for our pets.',
        },
        {
            'title_es': 'Paseos efectivos: más que solo caminar',
            'title_en': 'Effective Walks: More Than Just Walking',
            'excerpt_es': 'Un buen paseo estimula cuerpo y mente. Aprende a hacer de cada salida una experiencia enriquecedora.',
            'excerpt_en': 'A good walk stimulates body and mind. Learn to make each outing an enriching experience.',
        },
        {
            'title_es': 'Cómo crear una rutina diaria para tu mascota',
            'title_en': 'How to Create a Daily Routine for Your Pet',
            'excerpt_es': 'Las mascotas prosperan con rutinas predecibles. Diseña un horario que funcione para ambos.',
            'excerpt_en': 'Pets thrive on predictable routines. Design a schedule that works for both of you.',
        },
        {
            'title_es': 'Consejos para fotografiar a tu mascota como un profesional',
            'title_en': 'Tips for Photographing Your Pet Like a Pro',
            'excerpt_es': 'Captura los mejores momentos de tu mascota con estos trucos de fotografía sencillos.',
            'excerpt_en': 'Capture the best moments of your pet with these simple photography tricks.',
        },
    ],
    'eventos': [
        {
            'title_es': 'Jornada de adopción este fin de semana',
            'title_en': 'Adoption Event This Weekend',
            'excerpt_es': 'Más de 50 animales buscan hogar. Ven y conoce a tu próximo mejor amigo.',
            'excerpt_en': 'Over 50 animals are looking for a home. Come and meet your next best friend.',
        },
        {
            'title_es': 'Feria de bienestar animal 2026',
            'title_en': 'Animal Welfare Fair 2026',
            'excerpt_es': 'Este abril se celebra la feria más grande de bienestar animal en Colombia. No te la pierdas.',
            'excerpt_en': 'This April, the largest animal welfare fair in Colombia takes place. Don\'t miss it.',
        },
        {
            'title_es': 'Caminata solidaria por los animales sin hogar',
            'title_en': 'Solidarity Walk for Homeless Animals',
            'excerpt_es': 'Únete a nuestra caminata benéfica para recaudar fondos para refugios locales.',
            'excerpt_en': 'Join our charity walk to raise funds for local shelters.',
        },
        {
            'title_es': 'Taller gratuito: primeros auxilios para mascotas',
            'title_en': 'Free Workshop: First Aid for Pets',
            'excerpt_es': 'Aprende técnicas básicas de primeros auxilios en este taller presencial con veterinarios expertos.',
            'excerpt_en': 'Learn basic first aid techniques in this in-person workshop with expert veterinarians.',
        },
        {
            'title_es': 'Festival Perruno en el Parque Simón Bolívar',
            'title_en': 'Dog Festival at Simón Bolívar Park',
            'excerpt_es': 'Un día lleno de actividades, concursos y diversión para perros y sus familias humanas.',
            'excerpt_en': 'A day full of activities, contests, and fun for dogs and their human families.',
        },
        {
            'title_es': 'Jornada de esterilización gratuita — mayo 2026',
            'title_en': 'Free Spay/Neuter Day — May 2026',
            'excerpt_es': 'Esteriliza a tu mascota sin costo. Cupos limitados, inscríbete antes del 15 de mayo.',
            'excerpt_en': 'Spay or neuter your pet for free. Limited spots, register before May 15th.',
        },
        {
            'title_es': 'Charla virtual: tenencia responsable de mascotas',
            'title_en': 'Virtual Talk: Responsible Pet Ownership',
            'excerpt_es': 'Conéctate desde casa y aprende sobre tenencia responsable con nuestros expertos.',
            'excerpt_en': 'Connect from home and learn about responsible ownership with our experts.',
        },
        {
            'title_es': 'Exposición fotográfica: Miradas que salvan vidas',
            'title_en': 'Photo Exhibition: Glances That Save Lives',
            'excerpt_es': 'Una muestra fotográfica que retrata la realidad de los animales en refugios colombianos.',
            'excerpt_en': 'A photo exhibition that portrays the reality of animals in Colombian shelters.',
        },
        {
            'title_es': 'Mercado solidario a favor de refugios',
            'title_en': 'Solidarity Market for Shelters',
            'excerpt_es': 'Compra productos artesanales y ayuda a financiar la alimentación de animales rescatados.',
            'excerpt_en': 'Buy artisanal products and help fund the feeding of rescued animals.',
        },
        {
            'title_es': 'Yoga con mascotas: una experiencia única',
            'title_en': 'Yoga with Pets: A Unique Experience',
            'excerpt_es': 'Relájate y conecta con tu mascota en esta sesión de yoga especial al aire libre.',
            'excerpt_en': 'Relax and connect with your pet in this special outdoor yoga session.',
        },
    ],
    'voluntariado': [
        {
            'title_es': 'Voluntariado en refugios: cómo empezar',
            'title_en': 'Volunteering at Shelters: How to Get Started',
            'excerpt_es': 'Descubre cómo puedes hacer una diferencia real en la vida de los animales de tu comunidad.',
            'excerpt_en': 'Discover how you can make a real difference in the lives of animals in your community.',
        },
        {
            'title_es': 'Ser hogar temporal: todo lo que debes saber',
            'title_en': 'Being a Foster Home: Everything You Need to Know',
            'excerpt_es': 'Los hogares temporales salvan vidas. Conoce los requisitos y beneficios de abrir tu hogar.',
            'excerpt_en': 'Foster homes save lives. Learn the requirements and benefits of opening your home.',
        },
        {
            'title_es': 'Cómo organizar una colecta de alimento para refugios',
            'title_en': 'How to Organize a Food Drive for Shelters',
            'excerpt_es': 'Paso a paso para organizar una recolección de alimento exitosa en tu comunidad.',
            'excerpt_en': 'Step by step to organize a successful food drive in your community.',
        },
        {
            'title_es': 'Voluntariado corporativo: empresas que apoyan refugios',
            'title_en': 'Corporate Volunteering: Companies Supporting Shelters',
            'excerpt_es': 'Cada vez más empresas se suman al voluntariado animal. Conoce cómo involucrar a tu empresa.',
            'excerpt_en': 'More and more companies are joining animal volunteering. Learn how to involve your company.',
        },
        {
            'title_es': 'Rescate animal: cómo actuar cuando encuentras un animal herido',
            'title_en': 'Animal Rescue: How to Act When You Find an Injured Animal',
            'excerpt_es': 'Una guía rápida con los pasos a seguir si encuentras un animal en situación de emergencia.',
            'excerpt_en': 'A quick guide with the steps to follow if you find an animal in an emergency situation.',
        },
        {
            'title_es': 'Formas de ayudar a los animales sin adoptar',
            'title_en': 'Ways to Help Animals Without Adopting',
            'excerpt_es': 'No puedes adoptar? Hay muchas otras formas de contribuir al bienestar animal.',
            'excerpt_en': 'Can\'t adopt? There are many other ways to contribute to animal welfare.',
        },
        {
            'title_es': 'Transportistas voluntarios: héroes silenciosos',
            'title_en': 'Volunteer Transporters: Silent Heroes',
            'excerpt_es': 'Los transportistas voluntarios conectan refugios con adoptantes. Conoce cómo unirte.',
            'excerpt_en': 'Volunteer transporters connect shelters with adopters. Learn how to join.',
        },
        {
            'title_es': 'Cómo crear un grupo de rescate en tu barrio',
            'title_en': 'How to Create a Rescue Group in Your Neighborhood',
            'excerpt_es': 'Organiza a tu comunidad para proteger a los animales callejeros de tu zona.',
            'excerpt_en': 'Organize your community to protect stray animals in your area.',
        },
        {
            'title_es': 'Voluntariado juvenil: adolescentes que hacen la diferencia',
            'title_en': 'Youth Volunteering: Teenagers Making a Difference',
            'excerpt_es': 'Jóvenes de todo el país se unen para ayudar a los animales. Inspírate con sus historias.',
            'excerpt_en': 'Young people from all over the country come together to help animals. Be inspired by their stories.',
        },
        {
            'title_es': 'Padrinos de refugio: apadrina sin adoptar',
            'title_en': 'Shelter Sponsors: Sponsor Without Adopting',
            'excerpt_es': 'El apadrinamiento permite cubrir los gastos de un animal mientras espera su hogar definitivo.',
            'excerpt_en': 'Sponsorship allows covering the expenses of an animal while it waits for its permanent home.',
        },
    ],
    'nutricion': [
        {
            'title_es': 'Nutrición canina: mitos y verdades',
            'title_en': 'Dog Nutrition: Myths and Truths',
            'excerpt_es': 'Desmitificamos las creencias más comunes sobre la alimentación de nuestros perros.',
            'excerpt_en': 'We debunk the most common beliefs about feeding our dogs.',
        },
        {
            'title_es': 'Dieta BARF: ¿es segura para tu mascota?',
            'title_en': 'BARF Diet: Is It Safe for Your Pet?',
            'excerpt_es': 'Analizamos los pros y contras de la alimentación cruda para perros y gatos.',
            'excerpt_en': 'We analyze the pros and cons of raw feeding for dogs and cats.',
        },
        {
            'title_es': 'Alimentos prohibidos para perros y gatos',
            'title_en': 'Forbidden Foods for Dogs and Cats',
            'excerpt_es': 'Chocolate, uvas, cebolla y más: conoce los alimentos que pueden ser tóxicos para tu mascota.',
            'excerpt_en': 'Chocolate, grapes, onion and more: learn which foods can be toxic for your pet.',
        },
        {
            'title_es': 'Snacks saludables que puedes preparar en casa',
            'title_en': 'Healthy Snacks You Can Make at Home',
            'excerpt_es': 'Recetas fáciles y nutritivas para premiar a tu mascota sin comprometer su salud.',
            'excerpt_en': 'Easy and nutritious recipes to reward your pet without compromising their health.',
        },
        {
            'title_es': 'Hidratación en mascotas: más importante de lo que crees',
            'title_en': 'Hydration in Pets: More Important Than You Think',
            'excerpt_es': 'El agua es esencial pero muchas mascotas no beben suficiente. Aprende a fomentar la hidratación.',
            'excerpt_en': 'Water is essential but many pets don\'t drink enough. Learn how to encourage hydration.',
        },
        {
            'title_es': 'Nutrición para cachorros: los primeros 12 meses',
            'title_en': 'Puppy Nutrition: The First 12 Months',
            'excerpt_es': 'La alimentación en la etapa de crecimiento es crucial. Guía mes a mes para cachorros.',
            'excerpt_en': 'Nutrition during the growth stage is crucial. Month-by-month guide for puppies.',
        },
        {
            'title_es': 'Suplementos nutricionales: ¿los necesita tu mascota?',
            'title_en': 'Nutritional Supplements: Does Your Pet Need Them?',
            'excerpt_es': 'No siempre son necesarios, pero en algunos casos pueden marcar la diferencia.',
            'excerpt_en': 'They are not always necessary, but in some cases they can make a difference.',
        },
        {
            'title_es': 'Cómo leer la etiqueta del alimento de tu mascota',
            'title_en': 'How to Read Your Pet\'s Food Label',
            'excerpt_es': 'Ingredientes, porcentajes y marketing: aprende a descifrar lo que realmente come tu mascota.',
            'excerpt_en': 'Ingredients, percentages, and marketing: learn to decipher what your pet really eats.',
        },
        {
            'title_es': 'Alimentación para gatos esterilizados',
            'title_en': 'Diet for Spayed/Neutered Cats',
            'excerpt_es': 'Después de la esterilización, las necesidades nutricionales cambian. Adapta la dieta de tu gato.',
            'excerpt_en': 'After spaying/neutering, nutritional needs change. Adapt your cat\'s diet.',
        },
        {
            'title_es': 'Dietas especiales para mascotas con alergias alimentarias',
            'title_en': 'Special Diets for Pets with Food Allergies',
            'excerpt_es': 'Identifica las alergias alimentarias y aprende a diseñar una dieta segura y equilibrada.',
            'excerpt_en': 'Identify food allergies and learn to design a safe and balanced diet.',
        },
    ],
    'entrenamiento': [
        {
            'title_es': 'Cómo socializar a un cachorro correctamente',
            'title_en': 'How to Properly Socialize a Puppy',
            'excerpt_es': 'Los primeros meses son cruciales. Aprende técnicas de socialización efectivas.',
            'excerpt_en': 'The first months are crucial. Learn effective socialization techniques.',
        },
        {
            'title_es': 'Cómo enseñar trucos básicos a tu perro adoptado',
            'title_en': 'How to Teach Basic Tricks to Your Adopted Dog',
            'excerpt_es': 'El entrenamiento con refuerzo positivo fortalece el vínculo con tu nuevo compañero.',
            'excerpt_en': 'Positive reinforcement training strengthens the bond with your new companion.',
        },
        {
            'title_es': 'Entrenamiento con clicker: guía para principiantes',
            'title_en': 'Clicker Training: A Beginner\'s Guide',
            'excerpt_es': 'El clicker es una herramienta poderosa de refuerzo positivo. Aprende a usarlo paso a paso.',
            'excerpt_en': 'The clicker is a powerful positive reinforcement tool. Learn to use it step by step.',
        },
        {
            'title_es': 'Cómo corregir ladridos excesivos',
            'title_en': 'How to Correct Excessive Barking',
            'excerpt_es': 'Tu perro ladra sin parar? Entiende las causas y aplica técnicas humanitarias de corrección.',
            'excerpt_en': 'Does your dog bark non-stop? Understand the causes and apply humane correction techniques.',
        },
        {
            'title_es': 'Paseo con correa: cómo lograr que tu perro no tire',
            'title_en': 'Leash Walking: How to Stop Your Dog from Pulling',
            'excerpt_es': 'Técnicas efectivas para que los paseos sean placenteros y no una lucha de fuerza.',
            'excerpt_en': 'Effective techniques to make walks pleasant and not a tug-of-war.',
        },
        {
            'title_es': 'Entrenamiento para perros miedosos o traumados',
            'title_en': 'Training for Fearful or Traumatized Dogs',
            'excerpt_es': 'Los perros rescatados pueden tener miedos. Aprende técnicas de desensibilización gentiles.',
            'excerpt_en': 'Rescued dogs may have fears. Learn gentle desensitization techniques.',
        },
        {
            'title_es': 'Cómo enseñar a tu gato a usar el rascador',
            'title_en': 'How to Teach Your Cat to Use the Scratching Post',
            'excerpt_es': 'Evita muebles destruidos con estas técnicas para redirigir el rascado natural de tu gato.',
            'excerpt_en': 'Avoid destroyed furniture with these techniques to redirect your cat\'s natural scratching.',
        },
        {
            'title_es': 'Obediencia básica: los 5 comandos esenciales',
            'title_en': 'Basic Obedience: The 5 Essential Commands',
            'excerpt_es': 'Sentado, quieto, ven, abajo y junto: domina los comandos fundamentales con tu perro.',
            'excerpt_en': 'Sit, stay, come, down, and heel: master the fundamental commands with your dog.',
        },
        {
            'title_es': 'Entrenamiento para perros senior: nunca es tarde',
            'title_en': 'Senior Dog Training: It\'s Never Too Late',
            'excerpt_es': 'Los perros mayores también pueden aprender. Adapta las técnicas a su ritmo y necesidades.',
            'excerpt_en': 'Older dogs can learn too. Adapt techniques to their pace and needs.',
        },
        {
            'title_es': 'Cómo prevenir y solucionar la agresividad en perros',
            'title_en': 'How to Prevent and Solve Aggression in Dogs',
            'excerpt_es': 'La agresividad tiene causas específicas. Identifícalas y trabaja con un plan de modificación conductual.',
            'excerpt_en': 'Aggression has specific causes. Identify them and work with a behavioral modification plan.',
        },
    ],
    'legislacion': [
        {
            'title_es': 'Leyes de protección animal en Colombia',
            'title_en': 'Animal Protection Laws in Colombia',
            'excerpt_es': 'Conoce tus derechos y obligaciones como dueño responsable de mascotas.',
            'excerpt_en': 'Know your rights and obligations as a responsible pet owner.',
        },
        {
            'title_es': 'Ley 1774: los animales como seres sintientes',
            'title_en': 'Law 1774: Animals as Sentient Beings',
            'excerpt_es': 'Un avance histórico en la legislación colombiana que reconoce el sufrimiento animal.',
            'excerpt_en': 'A historic advancement in Colombian legislation that recognizes animal suffering.',
        },
        {
            'title_es': 'Cómo denunciar maltrato animal en Colombia',
            'title_en': 'How to Report Animal Abuse in Colombia',
            'excerpt_es': 'Paso a paso para denunciar casos de maltrato animal ante las autoridades competentes.',
            'excerpt_en': 'Step by step to report cases of animal abuse to the competent authorities.',
        },
        {
            'title_es': 'Razas potencialmente peligrosas: regulación vigente',
            'title_en': 'Potentially Dangerous Breeds: Current Regulations',
            'excerpt_es': 'Conoce las normas que aplican si tienes un perro clasificado como potencialmente peligroso.',
            'excerpt_en': 'Learn the rules that apply if you have a dog classified as potentially dangerous.',
        },
        {
            'title_es': 'Responsabilidad civil por daños causados por mascotas',
            'title_en': 'Civil Liability for Damages Caused by Pets',
            'excerpt_es': 'Qué pasa legalmente si tu mascota causa daños a terceros? Conoce tus responsabilidades.',
            'excerpt_en': 'What happens legally if your pet causes damage to others? Know your responsibilities.',
        },
        {
            'title_es': 'Regulación de refugios y fundaciones animales',
            'title_en': 'Regulation of Shelters and Animal Foundations',
            'excerpt_es': 'Las fundaciones de protección animal deben cumplir requisitos legales. Conócelos aquí.',
            'excerpt_en': 'Animal protection foundations must meet legal requirements. Learn about them here.',
        },
        {
            'title_es': 'Transporte de mascotas: normativa de aerolíneas en Colombia',
            'title_en': 'Pet Transport: Airline Regulations in Colombia',
            'excerpt_es': 'Cada aerolínea tiene sus propias reglas. Conoce los requisitos para volar con tu mascota.',
            'excerpt_en': 'Each airline has its own rules. Learn the requirements for flying with your pet.',
        },
        {
            'title_es': 'Tenencia responsable: qué dice la ley',
            'title_en': 'Responsible Ownership: What the Law Says',
            'excerpt_es': 'Obligaciones legales como dueño de mascota en Colombia: vacunas, identificación y más.',
            'excerpt_en': 'Legal obligations as a pet owner in Colombia: vaccines, identification, and more.',
        },
        {
            'title_es': 'Protección animal en conjuntos residenciales',
            'title_en': 'Animal Protection in Residential Complexes',
            'excerpt_es': 'Tus derechos como dueño de mascota en propiedad horizontal y cómo defenderlos.',
            'excerpt_en': 'Your rights as a pet owner in condominiums and how to defend them.',
        },
        {
            'title_es': 'Avances legislativos en bienestar animal: 2025-2026',
            'title_en': 'Legislative Advances in Animal Welfare: 2025-2026',
            'excerpt_es': 'Los proyectos de ley más relevantes en materia de protección animal que se debaten actualmente.',
            'excerpt_en': 'The most relevant bills on animal protection currently being debated.',
        },
    ],
}

# All categories in the order they appear in the model
ALL_CATEGORIES = list(POSTS_BY_CATEGORY.keys())


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
    help = 'Create sample blog posts for development (3-10 per category)'

    def add_arguments(self, parser):
        parser.add_argument(
            '--count', type=int, default=0,
            help='Total blog posts (0 = auto 3-10 per category)',
        )

    def handle(self, *args, **options):
        authors = [slug for slug, _ in BlogPost.AUTHOR_CHOICES]
        now = timezone.now()
        existing_titles = set(BlogPost.objects.values_list('title_es', flat=True))

        # Build the list of posts to create
        posts_to_create = []
        total_requested = options['count']

        if total_requested > 0:
            # Distribute evenly across categories, then fill randomly
            per_cat = max(3, total_requested // len(ALL_CATEGORIES))
            for cat in ALL_CATEGORIES:
                pool = POSTS_BY_CATEGORY[cat]
                sample_count = min(per_cat, len(pool))
                posts_to_create.extend(random.sample(pool, sample_count))
        else:
            # Default: 3-10 random posts per category
            for cat in ALL_CATEGORIES:
                pool = POSTS_BY_CATEGORY[cat]
                sample_count = random.randint(3, min(10, len(pool)))
                posts_to_create.extend(random.sample(pool, sample_count))

        random.shuffle(posts_to_create)

        created = 0
        for i, sample in enumerate(posts_to_create):
            if sample['title_es'] in existing_titles:
                continue

            is_draft = random.random() < 0.1  # ~10% are drafts
            is_published = not is_draft
            published_at = now - timezone.timedelta(days=random.randint(1, 120)) if is_published else None

            BlogPost.objects.create(
                title_es=sample['title_es'],
                title_en=sample['title_en'],
                excerpt_es=sample['excerpt_es'],
                excerpt_en=sample['excerpt_en'],
                category=sample['category'],
                author=random.choice(authors),
                read_time_minutes=random.randint(3, 15),
                is_featured=(created == 0),
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
            existing_titles.add(sample['title_es'])
            created += 1

        self.stdout.write(self.style.SUCCESS(f'Created {created} blog posts'))
