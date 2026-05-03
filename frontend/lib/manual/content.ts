import {
  BookOpen,
  Globe,
  Heart,
  Home,
  KeyRound,
  Stethoscope,
  Shield,
  Users,
  Zap,
} from 'lucide-react';

import type { ManualSection } from './types';

export const MANUAL_SECTIONS: ManualSection[] = [
  {
    id: 'introduction',
    audience: 'cross',
    title: { es: 'Introducción', en: 'Introduction' },
    icon: BookOpen,
    processes: [
      {
        id: 'platform-overview',
        audience: 'cross',
        title: { es: '¿Qué es Tuhuella?', en: 'What is Tuhuella?' },
        summary: {
          es: 'Plataforma que conecta refugios con adoptantes, padrinos y donantes de animales.',
          en: 'Platform that connects shelters with adopters, sponsors, and donors of animals.',
        },
        why: {
          es: 'Nació para reducir el abandono: facilita la adopción responsable, el apadrinamiento mensual y las campañas de donación, con refugios verificados.',
          en: 'It exists to reduce abandonment: it enables responsible adoption, monthly sponsorship, and donation campaigns through verified shelters.',
        },
        steps: {
          es: [
            'Cualquier visitante puede ver animales, refugios y campañas sin tener cuenta.',
            'Al crear cuenta, el usuario puede aplicar a adopción, apadrinar o donar.',
            'Los refugios publican animales y campañas que el equipo de Tuhuella revisa antes de mostrarlas.',
            'Web managers y administradores supervisan la operación y aprueban contenido.',
            'Veterinarios registran el seguimiento post-adopción de los animales.',
          ],
          en: [
            'Any visitor can browse animals, shelters, and campaigns without an account.',
            'With an account, users can apply to adopt, sponsor, or donate.',
            'Shelters publish animals and campaigns that the Tuhuella team reviews before showing them.',
            'Web managers and admins supervise operations and approve content.',
            'Veterinarians record post-adoption follow-ups.',
          ],
        },
        keywords: ['platform', 'plataforma', 'overview', 'visión', 'tuhuella', 'resumen', 'intro'],
      },
      {
        id: 'roles-overview',
        audience: 'cross',
        title: { es: 'Roles y qué puede hacer cada uno', en: 'Roles and what each one can do' },
        summary: {
          es: 'Tuhuella tiene 6 perfiles: visitante, adoptante, refugio, veterinario, web manager y admin.',
          en: 'Tuhuella has 6 profiles: visitor, adopter, shelter, veterinarian, web manager, and admin.',
        },
        why: {
          es: 'Saber qué rol tiene cada persona ayuda a entender qué pantallas verá y con qué permisos.',
          en: 'Knowing each person’s role makes it clear which screens they can access and what they can do.',
        },
        steps: {
          es: [
            'Visitante: navega sin cuenta; puede explorar animales, refugios, campañas y blog.',
            'Adoptante: postula, apadrina, dona, guarda favoritos y sigue sus solicitudes.',
            'Refugio: publica animales, recibe solicitudes, crea campañas y comparte actualizaciones.',
            'Veterinario: atiende seguimientos post-adopción que le asignaron.',
            'Web manager: supervisa refugios, solicitudes y campañas a nivel plataforma.',
            'Admin: aprueba refugios y campañas, audita pagos y gestiona el blog.',
          ],
          en: [
            'Visitor: browses without an account; explores animals, shelters, campaigns, and blog.',
            'Adopter: applies, sponsors, donates, saves favorites, and tracks applications.',
            'Shelter: publishes animals, receives applications, creates campaigns, and posts updates.',
            'Veterinarian: handles assigned post-adoption follow-ups.',
            'Web manager: supervises shelters, applications, and campaigns platform-wide.',
            'Admin: approves shelters and campaigns, audits payments, and manages the blog.',
          ],
        },
        keywords: ['roles', 'perfiles', 'permisos', 'profiles', 'who does what'],
      },
    ],
  },

  {
    id: 'getting-started',
    audience: 'public',
    title: { es: 'Cómo empezar', en: 'How to get started' },
    icon: KeyRound,
    highlight: true,
    processes: [
      {
        id: 'auth-sign-up',
        audience: 'public',
        title: { es: 'Crear una cuenta', en: 'Create an account' },
        summary: {
          es: 'Registro con email y contraseña para poder adoptar, apadrinar o donar.',
          en: 'Register with email and password to adopt, sponsor, or donate.',
        },
        why: {
          es: 'Sin cuenta solo puedes mirar. Para enviar una solicitud, apadrinar o donar necesitas estar registrado.',
          en: 'Without an account you can only browse. Submitting an application, sponsoring, or donating all require registration.',
        },
        steps: {
          es: [
            'Entra a "Crear cuenta" desde el encabezado o desde cualquier botón que pida sesión.',
            'Ingresa nombre, email y una contraseña segura.',
            'Acepta los términos y confirma el registro.',
            'Serás llevado automáticamente a tu perfil para completar tus datos.',
          ],
          en: [
            'Click "Sign up" in the header or on any button that requires a session.',
            'Enter your name, email, and a secure password.',
            'Accept the terms and confirm registration.',
            'You will be taken to your profile to complete your info.',
          ],
        },
        route: '/sign-up',
        keywords: ['sign up', 'registrarse', 'crear cuenta', 'registro', 'nueva cuenta'],
      },
      {
        id: 'auth-sign-in',
        audience: 'public',
        title: { es: 'Iniciar sesión', en: 'Sign in' },
        summary: {
          es: 'Acceso con email y contraseña para volver a tu cuenta.',
          en: 'Log in with email and password to return to your account.',
        },
        why: {
          es: 'Al iniciar sesión recuperas tus favoritos, tus solicitudes y tus donaciones, y puedes continuar cualquier proceso.',
          en: 'Signing in brings back your favorites, applications, and donations, and lets you continue any process.',
        },
        steps: {
          es: [
            'Entra a "Iniciar sesión" desde el encabezado.',
            'Escribe tu email y contraseña.',
            'Según tu rol, serás llevado a la pantalla que te corresponde (perfil, panel del refugio, tablero del veterinario, etc.).',
          ],
          en: [
            'Click "Sign in" in the header.',
            'Enter your email and password.',
            'Based on your role, you are taken to the right starting screen (profile, shelter panel, vet board, and so on).',
          ],
        },
        route: '/sign-in',
        tips: {
          es: [
            'Si un enlace requiere sesión y no has iniciado, Tuhuella te pide iniciar sesión y te devuelve a la pantalla original al terminar.',
          ],
          en: [
            'If a link requires a session, Tuhuella asks you to sign in and then takes you back to the original screen.',
          ],
        },
        keywords: ['sign in', 'iniciar sesion', 'login', 'entrar', 'acceso'],
      },
      {
        id: 'auth-forgot-password',
        audience: 'public',
        title: { es: 'Recuperar contraseña', en: 'Recover password' },
        summary: {
          es: 'Flujo para restablecer la contraseña cuando la olvidas.',
          en: 'Flow to reset your password when you forget it.',
        },
        why: {
          es: 'Evita que pierdas el acceso a tu cuenta y a todo el historial de adopciones, donaciones y apadrinamientos.',
          en: 'Prevents you from losing access to your account and the full history of adoptions, donations, and sponsorships.',
        },
        steps: {
          es: [
            'En la pantalla de inicio de sesión, pulsa "¿Olvidaste tu contraseña?".',
            'Escribe tu email para recibir un código o enlace de recuperación.',
            'Revisa tu correo (incluida la carpeta de spam) y sigue el enlace.',
            'Define una nueva contraseña y vuelve a iniciar sesión.',
          ],
          en: [
            'On the sign-in screen, click "Forgot your password?".',
            'Enter your email to receive a recovery code or link.',
            'Check your inbox (and spam folder) and follow the link.',
            'Set a new password and sign in again.',
          ],
        },
        route: '/forgot-password',
        keywords: ['forgot password', 'recuperar', 'contraseña', 'reset', 'olvidé'],
      },
      {
        id: 'locale-switch',
        audience: 'public',
        title: { es: 'Cambiar el idioma', en: 'Change language' },
        summary: {
          es: 'La plataforma funciona en español e inglés y se cambia desde el selector del encabezado.',
          en: 'The platform runs in Spanish and English; switch from the header selector.',
        },
        why: {
          es: 'Permite que adoptantes, donantes y aliados internacionales naveguen y lean el blog en su idioma.',
          en: 'Lets international adopters, donors, and allies browse and read the blog in their own language.',
        },
        steps: {
          es: [
            'Abre el selector ES / EN en el encabezado.',
            'Elige el idioma deseado.',
            'La página se recarga en el mismo lugar pero en el idioma elegido.',
          ],
          en: [
            'Open the ES / EN switcher in the header.',
            'Pick your preferred language.',
            'The page reloads on the same view in the chosen language.',
          ],
        },
        keywords: ['idioma', 'language', 'locale', 'es', 'en', 'switch'],
      },
    ],
  },

  {
    id: 'public-views',
    audience: 'public',
    title: { es: 'Vistas públicas', en: 'Public views' },
    icon: Globe,
    processes: [
      {
        id: 'public-home',
        audience: 'public',
        title: { es: 'Página de inicio', en: 'Home page' },
        summary: {
          es: 'Portada con llamados a adoptar, buscar animales, donar y trabajar con nosotros.',
          en: 'Landing with calls to adopt, browse animals, donate, and work with us.',
        },
        why: {
          es: 'Es el primer contacto. Desde aquí el visitante decide explorar, postular o donar.',
          en: 'It is the first touchpoint. From here visitors decide to explore, apply, or donate.',
        },
        steps: {
          es: [
            'Sección principal con botones a Animales, Busco adoptar, Donar y Trabaja con nosotros.',
            'Bloque "Cómo funciona" con 3 pasos explicativos.',
            'Carruseles con animales destacados, refugios y campañas activas.',
          ],
          en: [
            'Main block with buttons to Animals, Looking to adopt, Donate, and Work with us.',
            '"How it works" block with 3 explanatory steps.',
            'Carousels with featured animals, shelters, and active campaigns.',
          ],
        },
        route: '/',
        keywords: ['home', 'inicio', 'landing', 'portada'],
      },
      {
        id: 'public-browse-animals',
        audience: 'public',
        title: { es: 'Explorar animales', en: 'Browse animals' },
        summary: {
          es: 'Listado de animales filtrable por especie, tamaño, edad y compatibilidad.',
          en: 'Animal listing filterable by species, size, age, and compatibility.',
        },
        why: {
          es: 'Es el punto principal de descubrimiento. Todos los animales publicados aparecen aquí.',
          en: 'The main discovery surface. Every published animal is listed here.',
        },
        steps: {
          es: [
            'El visitante aplica filtros y ve una cuadrícula de tarjetas.',
            'Al tocar una tarjeta se abre el detalle del animal.',
          ],
          en: [
            'The visitor applies filters and sees a grid of cards.',
            'Tapping a card opens the animal detail.',
          ],
        },
        route: '/animals',
        keywords: ['animals', 'animales', 'browse', 'catalogo', 'filtros', 'adoptar'],
      },
      {
        id: 'public-animal-detail',
        audience: 'public',
        title: { es: 'Detalle del animal', en: 'Animal detail' },
        summary: {
          es: 'Galería, datos básicos, historial médico y botones para adoptar o apadrinar.',
          en: 'Gallery, basic info, medical history, and buttons to adopt or sponsor.',
        },
        why: {
          es: 'Es donde el usuario decide si aplica, apadrina o simplemente guarda el animal en favoritos.',
          en: 'This is where users decide to apply, sponsor, or just save the animal to favorites.',
        },
        steps: {
          es: [
            'Mirar galería y datos básicos (especie, raza, edad, tamaño).',
            'Revisar salud: vacunas, esterilización y chequeos específicos de la especie.',
            'Pulsar "Adoptar" lleva a iniciar sesión si hace falta, o directo al formulario.',
          ],
          en: [
            'View the gallery and basic info (species, breed, age, size).',
            'Check health: vaccines, sterilization, and species-specific checks.',
            'Clicking "Adopt" leads to sign-in if needed, or straight to the form.',
          ],
        },
        route: '/animals/[animalId]',
        keywords: ['animal detail', 'ficha', 'perfil animal', 'salud', 'screening'],
      },
      {
        id: 'public-browse-shelters',
        audience: 'public',
        title: { es: 'Explorar refugios', en: 'Browse shelters' },
        summary: {
          es: 'Listado de refugios con estado de verificación y página de cada uno.',
          en: 'Shelter directory with verification status and a page per shelter.',
        },
        why: {
          es: 'Permite conocer quiénes están detrás de los animales y elegir a quién apoyar.',
          en: 'Lets users learn who is behind the animals and choose whom to support.',
        },
        steps: {
          es: [
            'Ver el listado, con distinción entre refugios verificados y pendientes.',
            'Abrir el detalle con información del refugio, galería, animales publicados y campañas activas.',
          ],
          en: [
            'View the list, separating verified shelters from pending ones.',
            'Open the detail to see shelter info, gallery, published animals, and active campaigns.',
          ],
        },
        route: '/shelters',
        keywords: ['shelters', 'refugios', 'fundaciones', 'organizaciones'],
      },
      {
        id: 'public-campaigns',
        audience: 'public',
        title: { es: 'Campañas de recaudación', en: 'Fundraising campaigns' },
        summary: {
          es: 'Campañas con meta, barra de avance y opción de donar directamente.',
          en: 'Campaigns with goal, progress bar, and direct donation option.',
        },
        why: {
          es: 'Es la vía principal para financiar gastos médicos puntuales y mejoras de los refugios.',
          en: 'The main way to fund specific medical bills and shelter improvements.',
        },
        steps: {
          es: [
            'Listado con pestañas "Activas" y "Completadas".',
            'Detalle con meta, monto recaudado, refugio responsable, evidencia y actualizaciones.',
            'El botón "Donar" abre el proceso de pago.',
          ],
          en: [
            'List with "Active" and "Completed" tabs.',
            'Detail with goal, amount raised, responsible shelter, evidence, and updates.',
            'The "Donate" button opens the payment flow.',
          ],
        },
        route: '/campaigns',
        keywords: ['campañas', 'campaigns', 'recaudacion', 'fundraising', 'meta'],
      },
      {
        id: 'public-blog',
        audience: 'public',
        title: { es: 'Blog bilingüe', en: 'Bilingual blog' },
        summary: {
          es: 'Artículos en español e inglés sobre bienestar animal, adopción y cuidado.',
          en: 'Articles in Spanish and English on animal welfare, adoption, and care.',
        },
        why: {
          es: 'Ofrece contenido educativo que ayuda al usuario a tomar mejores decisiones de adopción y cuidado.',
          en: 'Offers educational content that helps users make better adoption and care decisions.',
        },
        steps: {
          es: [
            'Listado por categorías con artículos destacados.',
            'Detalle con lectura estructurada y barra de progreso.',
          ],
          en: [
            'Category listing with featured posts.',
            'Detail view with structured reading and a progress bar.',
          ],
        },
        route: '/blog',
        keywords: ['blog', 'articulos', 'contenido', 'bienestar'],
      },
      {
        id: 'public-looking-to-adopt',
        audience: 'public',
        title: { es: 'Busco adoptar', en: 'Looking to adopt' },
        summary: {
          es: 'Página guía para quien aún no sabe qué animal quiere adoptar.',
          en: 'Guided page for people who do not yet know which animal they want to adopt.',
        },
        why: {
          es: 'Ayuda al visitante a aclarar qué busca (especie, tamaño, estilo de vida) antes de ver el catálogo.',
          en: 'Helps visitors clarify what they want (species, size, lifestyle) before seeing the catalog.',
        },
        steps: {
          es: [
            'Responder preguntas guiadas sobre hogar y estilo de vida.',
            'Recibir recomendaciones de especies y perfiles afines.',
            'Saltar al listado de animales con filtros sugeridos.',
          ],
          en: [
            'Answer guided questions about home and lifestyle.',
            'Receive recommendations about matching species and profiles.',
            'Jump to the animal listing with suggested filters.',
          ],
        },
        route: '/looking-to-adopt',
        keywords: ['busco adoptar', 'looking to adopt', 'guiado', 'recomendacion'],
      },
      {
        id: 'public-about',
        audience: 'public',
        title: { es: 'Sobre nosotros', en: 'About us' },
        summary: {
          es: 'Historia, misión y valores de Tuhuella.',
          en: 'Tuhuella story, mission, and values.',
        },
        why: {
          es: 'Construye confianza en adoptantes, refugios aliados y donantes nuevos.',
          en: 'Builds trust with adopters, partner shelters, and new donors.',
        },
        steps: {
          es: [
            'Abrir la página desde el menú o pie de página.',
            'Leer misión, equipo y modelo de operación.',
          ],
          en: [
            'Open the page from the menu or footer.',
            'Read mission, team, and operating model.',
          ],
        },
        route: '/about',
        keywords: ['about', 'sobre nosotros', 'quienes somos', 'mision'],
      },
      {
        id: 'public-faq',
        audience: 'public',
        title: { es: 'Preguntas frecuentes', en: 'Frequently asked questions' },
        summary: {
          es: 'Respuestas a las dudas más comunes sobre adopción, apadrinamiento y donaciones.',
          en: 'Answers to common questions on adoption, sponsorship, and donations.',
        },
        why: {
          es: 'Resuelve dudas sin necesidad de contactar soporte y reduce el miedo a empezar un proceso.',
          en: 'Clears doubts without contacting support and lowers the friction of starting a process.',
        },
        steps: {
          es: [
            'Abrir "Preguntas frecuentes" desde el menú o el pie de página.',
            'Buscar la categoría (adopción, pagos, cuenta, refugios).',
            'Expandir la pregunta para ver la respuesta.',
          ],
          en: [
            'Open "FAQ" from the menu or footer.',
            'Find the category (adoption, payments, account, shelters).',
            'Expand a question to see the answer.',
          ],
        },
        route: '/faq',
        keywords: ['faq', 'preguntas', 'dudas', 'ayuda', 'help'],
      },
      {
        id: 'public-contact',
        audience: 'public',
        title: { es: 'Contáctanos', en: 'Contact us' },
        summary: {
          es: 'Formulario para enviar una consulta al equipo de Tuhuella.',
          en: 'Form to send an inquiry to the Tuhuella team.',
        },
        why: {
          es: 'Canal oficial para reportar problemas, pedir ayuda puntual o proponer alianzas.',
          en: 'Official channel to report problems, request targeted help, or propose partnerships.',
        },
        steps: {
          es: [
            'Abrir "Contáctanos" desde el pie de página.',
            'Llenar nombre, email, asunto y mensaje.',
            'Enviar y esperar respuesta por correo.',
          ],
          en: [
            'Open "Contact us" from the footer.',
            'Fill in name, email, subject, and message.',
            'Submit and wait for an email reply.',
          ],
        },
        route: '/contactanos',
        keywords: ['contact', 'contactanos', 'contacto', 'soporte', 'ayuda'],
      },
      {
        id: 'public-strategic-allies',
        audience: 'public',
        title: { es: 'Aliados estratégicos', en: 'Strategic allies' },
        summary: {
          es: 'Listado de organizaciones, empresas y aliados que apoyan a Tuhuella.',
          en: 'List of organizations, companies, and partners supporting Tuhuella.',
        },
        why: {
          es: 'Da visibilidad y credibilidad a quienes colaboran con la causa.',
          en: 'Gives visibility and credibility to partners collaborating with the cause.',
        },
        steps: {
          es: [
            'Abrir "Aliados estratégicos" desde el menú o el pie de página.',
            'Ver la lista de aliados con su rol en la plataforma.',
          ],
          en: [
            'Open "Strategic allies" from the menu or footer.',
            'See the list of partners and their role in the platform.',
          ],
        },
        route: '/strategic-allies',
        keywords: ['aliados', 'strategic allies', 'partners', 'sponsors'],
      },
      {
        id: 'public-terms',
        audience: 'public',
        title: { es: 'Términos y condiciones', en: 'Terms and conditions' },
        summary: {
          es: 'Documento legal con las reglas de uso de Tuhuella.',
          en: 'Legal document with the rules for using Tuhuella.',
        },
        why: {
          es: 'Obligatorio leerlo antes de registrar una cuenta. Explica responsabilidades de usuarios, refugios y plataforma.',
          en: 'Mandatory reading before creating an account. Spells out responsibilities of users, shelters, and the platform.',
        },
        steps: {
          es: [
            'Abrir "Términos y condiciones" desde el pie de página o al crear cuenta.',
            'Leer las secciones de uso, pagos, datos personales y responsabilidades.',
          ],
          en: [
            'Open "Terms and conditions" from the footer or when creating an account.',
            'Read the sections on usage, payments, personal data, and responsibilities.',
          ],
        },
        route: '/terms',
        keywords: ['terms', 'terminos', 'condiciones', 'legal'],
      },
      {
        id: 'public-work-with-us',
        audience: 'public',
        title: { es: 'Trabaja con nosotros', en: 'Work with us' },
        summary: {
          es: 'Cartelera de posiciones de voluntariado y colaboraciones abiertas.',
          en: 'Board of volunteer positions and open collaborations.',
        },
        why: {
          es: 'Tuhuella crece con voluntarios y aliados operativos; esta es la puerta de entrada.',
          en: 'Tuhuella grows thanks to volunteers and operational allies; this is the entry point.',
        },
        steps: {
          es: [
            'Abrir "Trabaja con nosotros" desde el encabezado o el pie de página.',
            'Revisar la lista de posiciones con descripción y requisitos.',
            'Pulsar "Postular" en la posición de interés.',
          ],
          en: [
            'Open "Work with us" from the header or footer.',
            'Review the list of positions with description and requirements.',
            'Click "Apply" on the position of interest.',
          ],
        },
        route: '/work-with-us',
        keywords: ['work with us', 'trabaja con nosotros', 'voluntariado', 'volunteer', 'trabajo'],
      },
      {
        id: 'public-volunteer-apply',
        audience: 'public',
        title: { es: 'Postular a una posición', en: 'Apply for a position' },
        summary: {
          es: 'Formulario para postular a una posición de voluntariado o colaboración.',
          en: 'Form to apply for a volunteer or collaboration position.',
        },
        why: {
          es: 'Centraliza las postulaciones y garantiza que todas lleguen al equipo encargado.',
          en: 'Centralizes applications and ensures they all reach the responsible team.',
        },
        steps: {
          es: [
            'Desde la posición elegida pulsar "Postular".',
            'Llenar datos personales, motivación y disponibilidad.',
            'Adjuntar CV o enlaces si la posición lo pide.',
            'Enviar y esperar respuesta por correo.',
          ],
          en: [
            'From the chosen position click "Apply".',
            'Fill in personal info, motivation, and availability.',
            'Attach CV or links if the position requests them.',
            'Submit and wait for an email response.',
          ],
        },
        route: '/work-with-us/apply/[positionId]',
        keywords: ['postular', 'apply', 'voluntario', 'cv', 'aplicar posicion'],
      },
    ],
  },

  {
    id: 'role-adopter',
    audience: 'adopter',
    title: { es: 'Rol: Adoptante', en: 'Role: Adopter' },
    icon: Heart,
    processes: [
      {
        id: 'adopter-apply',
        audience: 'adopter',
        title: { es: 'Enviar solicitud de adopción', en: 'Submit adoption application' },
        summary: {
          es: 'Formulario de 6 secciones para postular a un animal específico.',
          en: '6-section form to apply for a specific animal.',
        },
        why: {
          es: 'Es el canal oficial para evaluar la compatibilidad entre el adoptante y el animal. El refugio revisa cada solicitud.',
          en: 'The official channel to assess compatibility between adopter and animal. The shelter reviews every application.',
        },
        steps: {
          es: [
            'Desde el detalle del animal, pulsar "Adoptar".',
            'Completar las 6 secciones: información básica, hogar, experiencia, compatibilidad, compromiso y logística.',
            'Enviar — la solicitud queda en estado "Enviada".',
            'El refugio avanza la solicitud: Enviada → En revisión → Entrevista → Aprobada o Rechazada.',
          ],
          en: [
            'From the animal detail, click "Adopt".',
            'Complete the 6 sections: basic info, home, experience, compatibility, commitment, logistics.',
            'Submit — the application moves to "Submitted".',
            'The shelter advances it: Submitted → In review → Interview → Approved or Rejected.',
          ],
        },
        route: '/adopt/[animalId]',
        keywords: ['adoption', 'adopcion', 'solicitud', 'application', 'aplicar', 'postular', 'formulario'],
      },
      {
        id: 'adopter-track-applications',
        audience: 'adopter',
        title: { es: 'Seguir mis solicitudes', en: 'Track my applications' },
        summary: {
          es: 'Listado con el estado de cada solicitud enviada.',
          en: 'List with the status of each submitted application.',
        },
        why: {
          es: 'Le da transparencia al adoptante: ve en qué parte del proceso está cada solicitud.',
          en: 'Gives adopters transparency: they see where each application stands in the process.',
        },
        steps: {
          es: [
            'Entrar a "Mis solicitudes".',
            'Ver la lista con estados: Enviada, En revisión, Entrevista, Aprobada o Rechazada.',
            'Si una solicitud está aprobada, abrir el historial clínico del animal adoptado.',
          ],
          en: [
            'Go to "My applications".',
            'See the list with statuses: Submitted, In review, Interview, Approved, Rejected.',
            'If an application is approved, open the clinical history of the adopted animal.',
          ],
        },
        route: '/my-applications',
        keywords: ['applications', 'solicitudes', 'track', 'seguimiento', 'estado'],
      },
      {
        id: 'adopter-favorites',
        audience: 'adopter',
        title: { es: 'Gestionar favoritos', en: 'Manage favorites' },
        summary: {
          es: 'Guardar animales, agregar notas y comparar hasta 3 lado a lado.',
          en: 'Save animals, add notes, and compare up to 3 side by side.',
        },
        why: {
          es: 'Evita tener que buscar de nuevo a los animales que estás evaluando.',
          en: 'Avoids having to search again for the animals you are evaluating.',
        },
        steps: {
          es: [
            'Pulsar el corazón en cualquier tarjeta de animal.',
            'En "Favoritos" ver la lista, alternar cuadrícula/lista y editar tus notas.',
            'Activar el modo comparar para ver 2 o 3 animales lado a lado.',
          ],
          en: [
            'Click the heart on any animal card.',
            'In "Favorites" view the list, toggle grid/list, and edit your notes.',
            'Enable compare mode to view 2 or 3 animals side by side.',
          ],
        },
        route: '/favorites',
        keywords: ['favorites', 'favoritos', 'corazon', 'comparar', 'compare'],
      },
      {
        id: 'adopter-intent',
        audience: 'adopter',
        title: { es: 'Publicar "Busco adoptar"', en: 'Publish "Looking to adopt"' },
        summary: {
          es: 'Declarar qué tipo de animal buscas para que los refugios puedan invitarte.',
          en: 'Declare what kind of animal you are looking for so shelters can invite you.',
        },
        why: {
          es: 'Invierte el flujo: son los refugios quienes te buscan a ti, no al revés.',
          en: 'Flips the flow: shelters reach out to you rather than the other way around.',
        },
        steps: {
          es: [
            'Entrar a "Mi intención".',
            'Definir preferencias (especie, tamaño, edad), descripción y visibilidad (pública o privada).',
            'Los refugios pueden enviarte invitaciones; llegan como notificación.',
          ],
          en: [
            'Go to "My intent".',
            'Set preferences (species, size, age), description, and visibility (public or private).',
            'Shelters can send invites; they arrive as a notification.',
          ],
        },
        route: '/my-intent',
        keywords: ['intent', 'busco adoptar', 'preferencias', 'matching', 'invitacion'],
      },
      {
        id: 'adopter-donate',
        audience: 'adopter',
        title: { es: 'Donar', en: 'Donate' },
        summary: {
          es: 'Donación única a la plataforma, a un refugio o a una campaña.',
          en: 'One-time donation to the platform, a shelter, or a campaign.',
        },
        why: {
          es: 'Es el flujo transaccional más simple y queda registrado en tu historial de donaciones.',
          en: 'The simplest transactional flow; it is recorded in your donations history.',
        },
        steps: {
          es: [
            'Abrir el checkout de donación con el destino preseleccionado.',
            'Elegir el monto (preestablecido o personalizado) y el método de pago (tarjeta, PSE, Nequi).',
            'Confirmar el pago con la pasarela segura.',
            'Ver el resultado y encontrar la donación en "Mis donaciones".',
          ],
          en: [
            'Open the donation checkout with the preselected destination.',
            'Pick an amount (preset or custom) and payment method (card, PSE, Nequi).',
            'Confirm the payment through the secure gateway.',
            'See the result and find the donation in "My donations".',
          ],
        },
        route: '/checkout/donation',
        keywords: ['donate', 'donar', 'donacion', 'checkout', 'pago'],
      },
      {
        id: 'adopter-sponsor',
        audience: 'adopter',
        title: { es: 'Apadrinar animal', en: 'Sponsor an animal' },
        summary: {
          es: 'Compromiso económico mensual o único asociado a un animal específico.',
          en: 'Monthly or one-time financial commitment tied to a specific animal.',
        },
        why: {
          es: 'Le da al refugio ingresos recurrentes y al apadrinante una conexión con el animal.',
          en: 'Gives the shelter recurring income and the sponsor a bond with the animal.',
        },
        steps: {
          es: [
            'Desde el detalle del animal pulsar "Apadrinar".',
            'Elegir monto, frecuencia (mensual o único) y método de pago.',
            'Confirmar el pago.',
            'Ver tus apadrinamientos activos en "Mis apadrinamientos".',
          ],
          en: [
            'From the animal detail click "Sponsor".',
            'Choose amount, frequency (monthly or one-time), and payment method.',
            'Confirm the payment.',
            'See your active sponsorships in "My sponsorships".',
          ],
        },
        route: '/checkout/sponsorship',
        keywords: ['sponsor', 'apadrinar', 'apadrinamiento', 'padrino', 'mensual'],
      },
      {
        id: 'adopter-edit-profile',
        audience: 'adopter',
        title: { es: 'Editar mi perfil', en: 'Edit my profile' },
        summary: {
          es: 'Actualizar nombre, foto, datos de contacto y contraseña.',
          en: 'Update name, photo, contact info, and password.',
        },
        why: {
          es: 'Si los datos están desactualizados, el refugio puede no lograr contactarte tras aprobar una solicitud.',
          en: 'Outdated info can prevent the shelter from reaching you after approving an application.',
        },
        steps: {
          es: [
            'Entrar a "Editar perfil".',
            'Actualizar nombre, foto, teléfono, ciudad y dirección.',
            'Cambiar contraseña si hace falta.',
            'Guardar los cambios.',
          ],
          en: [
            'Go to "Edit profile".',
            'Update name, photo, phone, city, and address.',
            'Change password if needed.',
            'Save changes.',
          ],
        },
        route: '/my-profile/edit',
        keywords: ['profile', 'perfil', 'editar', 'datos', 'contraseña'],
      },
      {
        id: 'adopter-notifications-inbox',
        audience: 'adopter',
        title: { es: 'Bandeja de notificaciones', en: 'Notifications inbox' },
        summary: {
          es: 'Centro con los avisos recibidos: solicitudes, pagos, follow-ups e invitaciones.',
          en: 'Center with received notices: applications, payments, follow-ups, and invites.',
        },
        why: {
          es: 'Agrupa lo importante en un solo lugar para que no pierdas eventos clave de tu proceso.',
          en: 'Groups important events in one place so you do not miss key steps of your process.',
        },
        steps: {
          es: [
            'Abrir el ícono de la campana en el encabezado para ver las últimas notificaciones.',
            'Entrar a "Notificaciones" para ver el historial completo.',
            'Marcar como leídas o abrir el enlace asociado a cada aviso.',
          ],
          en: [
            'Click the bell icon in the header to see the latest notifications.',
            'Open "Notifications" to see the full history.',
            'Mark as read or open the link associated with each notice.',
          ],
        },
        route: '/my-profile/notifications',
        keywords: ['notifications', 'notificaciones', 'bandeja', 'inbox', 'campana'],
      },
      {
        id: 'adopter-notification-preferences',
        audience: 'adopter',
        title: { es: 'Preferencias de notificación', en: 'Notification preferences' },
        summary: {
          es: 'Activar o desactivar email y avisos dentro de la plataforma por tipo de evento.',
          en: 'Enable or disable email and in-app alerts per event type.',
        },
        why: {
          es: 'Permite personalizar la comunicación sin perder eventos críticos (aprobación, recordatorios, pagos).',
          en: 'Personalizes communication without missing critical events (approvals, reminders, payments).',
        },
        steps: {
          es: [
            'Entrar a la pantalla de notificaciones.',
            'Abrir "Preferencias".',
            'Activar o desactivar canal por evento (solicitud aprobada, donación recibida, etc.).',
            'Guardar los cambios.',
          ],
          en: [
            'Open the notifications screen.',
            'Go to "Preferences".',
            'Toggle the channel per event (application approved, donation received, etc.).',
            'Save changes.',
          ],
        },
        route: '/my-profile/notifications',
        keywords: ['preferencias', 'preferences', 'email', 'canal', 'silenciar'],
      },
      {
        id: 'adopter-my-donations',
        audience: 'adopter',
        title: { es: 'Mis donaciones', en: 'My donations' },
        summary: {
          es: 'Historial de todas las donaciones que has hecho.',
          en: 'History of every donation you have made.',
        },
        why: {
          es: 'Sirve para llevar control personal, reclamar certificados y ver el destino de cada donación.',
          en: 'Helpful for personal tracking, requesting certificates, and seeing where each donation went.',
        },
        steps: {
          es: [
            'Entrar a "Mis donaciones".',
            'Ver la lista con fecha, monto, estado y destino (plataforma, refugio o campaña).',
            'Abrir una donación para ver su recibo.',
          ],
          en: [
            'Go to "My donations".',
            'See the list with date, amount, status, and destination (platform, shelter, or campaign).',
            'Open a donation to view its receipt.',
          ],
        },
        route: '/my-donations',
        keywords: ['donations', 'donaciones', 'historial', 'recibo', 'mis donaciones'],
      },
      {
        id: 'adopter-my-sponsorships',
        audience: 'adopter',
        title: { es: 'Mis apadrinamientos', en: 'My sponsorships' },
        summary: {
          es: 'Listado de los apadrinamientos activos y pasados, con opción de cancelar.',
          en: 'List of active and past sponsorships, with an option to cancel.',
        },
        why: {
          es: 'Te permite controlar tu compromiso recurrente y ver actualizaciones del animal apadrinado.',
          en: 'Lets you control your recurring commitment and see updates from the sponsored animal.',
        },
        steps: {
          es: [
            'Entrar a "Mis apadrinamientos".',
            'Ver lista con animal, monto, frecuencia, estado y último pago.',
            'Abrir un apadrinamiento para ver historial y actualizaciones del refugio.',
            'Pausar o cancelar si es necesario.',
          ],
          en: [
            'Go to "My sponsorships".',
            'See list with animal, amount, frequency, status, and last payment.',
            'Open a sponsorship to see history and shelter updates.',
            'Pause or cancel if needed.',
          ],
        },
        route: '/my-sponsorships',
        keywords: ['sponsorships', 'apadrinamientos', 'recurring', 'mensual', 'padrino'],
      },
    ],
  },

  {
    id: 'role-shelter',
    audience: 'shelter_admin',
    title: { es: 'Rol: Refugio', en: 'Role: Shelter' },
    icon: Home,
    processes: [
      {
        id: 'shelter-application',
        audience: 'adopter',
        title: { es: 'Postularte como refugio', en: 'Apply as a shelter' },
        summary: {
          es: 'Wizard formal de 4 pasos donde se capturan datos básicos, legales/fiscales, documentos y motivación del refugio.',
          en: 'Formal 4-step wizard that captures basic info, legal/fiscal data, documents, and motivation.',
        },
        why: {
          es: 'Es el único camino para que un adopter se convierta en refugio: al aprobar la postulación, el sistema crea el refugio verificado y promueve al usuario a shelter_admin automáticamente.',
          en: 'This is the only path for an adopter to become a shelter: on approval, the system creates a verified shelter and atomically promotes the user role to shelter_admin.',
        },
        steps: {
          es: [
            'Desde Mi Perfil, abrir la tarjeta "Postularte como refugio".',
            'Paso 1 — datos básicos: nombre, descripción, ciudad, dirección, teléfono, email, sitio web.',
            'Paso 2 — datos legales: razón social, NIT/RUT, nombre y cédula del representante legal.',
            'Paso 3 — adjuntar documentos de soporte.',
            'Paso 4 — motivación, experiencia previa y capacidad estimada.',
            'Enviar postulación — queda "En cola de revisión".',
            'Esperar la decisión: al aprobar, el rol cambia a shelter_admin y el refugio queda creado y verificado.',
          ],
          en: [
            'From My Profile, open the "Apply as a shelter" card.',
            'Step 1 — basic data: name, description, city, address, phone, email, website.',
            'Step 2 — legal data: legal name, tax ID, legal representative name and ID.',
            'Step 3 — attach supporting documents.',
            'Step 4 — motivation, prior experience, and estimated capacity.',
            'Submit application — status becomes "Awaiting review".',
            'Wait for the decision: on approval, role changes to shelter_admin and the shelter is created and verified.',
          ],
        },
        route: '/shelter-application',
        keywords: ['postulacion', 'shelter application', 'registro refugio', 'crear refugio', 'verificacion', 'wizard'],
      },
      {
        id: 'shelter-dashboard',
        audience: 'shelter_admin',
        title: { es: 'Panel del refugio', en: 'Shelter dashboard' },
        summary: {
          es: 'Vista general con animales publicados, solicitudes pendientes, campañas activas y donaciones recibidas.',
          en: 'Overview with published animals, pending applications, active campaigns, and received donations.',
        },
        why: {
          es: 'Es el punto de partida diario del refugio: muestra qué requiere atención.',
          en: 'The shelter daily starting point: it shows what needs attention.',
        },
        steps: {
          es: [
            'Entrar a "Panel" tras iniciar sesión.',
            'Revisar indicadores: solicitudes nuevas, animales publicados, campañas activas.',
            'Saltar a la sección correspondiente (animales, solicitudes, campañas, donaciones).',
          ],
          en: [
            'Open "Dashboard" after signing in.',
            'Review indicators: new applications, published animals, active campaigns.',
            'Jump to the relevant section (animals, applications, campaigns, donations).',
          ],
        },
        route: '/shelter/dashboard',
        keywords: ['shelter dashboard', 'panel', 'refugio', 'resumen'],
      },
      {
        id: 'shelter-manage-animals',
        audience: 'shelter_admin',
        title: { es: 'Publicar y gestionar animales', en: 'Publish and manage animals' },
        summary: {
          es: 'Crear, editar y archivar animales con galería, salud y notas médicas bilingües.',
          en: 'Create, edit, and archive animals with gallery, health, and bilingual medical notes.',
        },
        why: {
          es: 'Cada animal publicado habilita solicitudes de adopción y apadrinamientos.',
          en: 'Each published animal enables adoption applications and sponsorships.',
        },
        steps: {
          es: [
            'En "Animales" crear un animal: especie, raza, edad, tamaño, género, galería y salud.',
            'Cambiar el estado del animal: borrador → publicado → (en proceso / adoptado / archivado).',
            'Mantener notas médicas y chequeos al día.',
          ],
          en: [
            'In "Animals" create one: species, breed, age, size, gender, gallery, and health.',
            'Change the animal status: draft → published → (in process / adopted / archived).',
            'Keep medical notes and health checks up to date.',
          ],
        },
        route: '/shelter/animals',
        keywords: ['animals shelter', 'publicar', 'crear animal'],
      },
      {
        id: 'shelter-manage-applications',
        audience: 'shelter_admin',
        title: { es: 'Revisar solicitudes de adopción', en: 'Review adoption applications' },
        summary: {
          es: 'Ver, avanzar el estado y aprobar o rechazar las solicitudes recibidas.',
          en: 'View, advance the status, and approve or reject incoming applications.',
        },
        why: {
          es: 'Al aprobar una solicitud se crea automáticamente un seguimiento post-adopción a 30 días para el veterinario.',
          en: 'On approval, a 30-day post-adoption follow-up is automatically created for the veterinarian.',
        },
        steps: {
          es: [
            'Abrir "Solicitudes" y filtrar por estado.',
            'Entrar a una solicitud y revisar las respuestas del formulario.',
            'Avanzar el estado: Enviada → En revisión → Entrevista → Aprobada o Rechazada.',
            'Si se aprueba, asignar un veterinario al seguimiento.',
          ],
          en: [
            'Open "Applications" and filter by status.',
            'Enter an application and review the form answers.',
            'Advance the status: Submitted → In review → Interview → Approved or Rejected.',
            'If approved, assign a veterinarian to the follow-up.',
          ],
        },
        route: '/shelter/applications',
        keywords: ['solicitudes', 'review applications', 'aprobar', 'rechazar', 'adopcion'],
      },
      {
        id: 'shelter-create-campaign',
        audience: 'shelter_admin',
        title: { es: 'Crear campaña de donación', en: 'Create a donation campaign' },
        summary: {
          es: 'Campaña con meta, fecha final, animales vinculados y evidencia; requiere aprobación del admin.',
          en: 'Campaign with goal, end date, linked animals, and evidence; requires admin approval.',
        },
        why: {
          es: 'Las campañas son la vía para recaudar fondos para gastos específicos. Si no se aprueban, no son visibles al público.',
          en: 'Campaigns are the way to raise funds for specific expenses. Without approval they are not public.',
        },
        steps: {
          es: [
            'En "Campañas → Nueva" completar título, descripción, meta y fecha final.',
            'Subir galería de evidencia y vincular animales si aplica.',
            'Enviar — la campaña queda "Pendiente de revisión".',
            'Un administrador la aprueba y queda visible en la sección pública de campañas.',
          ],
          en: [
            'In "Campaigns → New" fill title, description, goal, and end date.',
            'Upload evidence gallery and link animals if applicable.',
            'Submit — the campaign moves to "Pending review".',
            'An admin approves it and it becomes visible in the public campaigns section.',
          ],
        },
        route: '/shelter/campaigns/new',
        keywords: ['create campaign', 'crear campaña', 'recaudacion', 'meta', 'evidencia'],
      },
      {
        id: 'shelter-edit-campaign',
        audience: 'shelter_admin',
        title: { es: 'Editar campaña existente', en: 'Edit an existing campaign' },
        summary: {
          es: 'Ajustar texto, meta, evidencia o cerrar una campaña.',
          en: 'Adjust text, goal, evidence, or close a campaign.',
        },
        why: {
          es: 'Las campañas evolucionan: a veces se supera la meta, cambia la situación médica o se debe cerrar antes.',
          en: 'Campaigns evolve: goals are surpassed, medical situations change, or they need to be closed earlier.',
        },
        steps: {
          es: [
            'Abrir la lista de campañas del refugio.',
            'Entrar al detalle de la campaña a editar.',
            'Actualizar datos y guardar.',
            'Si ya no aplica, cerrar la campaña para que no reciba más donaciones.',
          ],
          en: [
            'Open the shelter campaigns list.',
            'Enter the detail of the campaign to edit.',
            'Update fields and save.',
            'If no longer relevant, close the campaign so it stops accepting donations.',
          ],
        },
        route: '/shelter/campaigns/[id]',
        keywords: ['editar campaña', 'edit campaign', 'cerrar campaña', 'ajustar'],
      },
      {
        id: 'shelter-donations-dashboard',
        audience: 'shelter_admin',
        title: { es: 'Tablero de donaciones recibidas', en: 'Incoming donations dashboard' },
        summary: {
          es: 'Ver todas las donaciones dirigidas al refugio o a sus campañas.',
          en: 'View every donation routed to the shelter or its campaigns.',
        },
        why: {
          es: 'Permite llevar control contable y seguir el avance de las campañas.',
          en: 'Enables accounting control and campaign progress tracking.',
        },
        steps: {
          es: [
            'Entrar a "Donaciones".',
            'Ver la lista con monto, estado, donante (email) y destino.',
          ],
          en: [
            'Go to "Donations".',
            'See the list with amount, status, donor email, and destination.',
          ],
        },
        route: '/shelter/donations',
        keywords: ['donations shelter', 'donaciones recibidas', 'contabilidad'],
      },
      {
        id: 'shelter-updates',
        audience: 'shelter_admin',
        title: { es: 'Publicar actualizaciones', en: 'Publish updates' },
        summary: {
          es: 'Publicaciones cortas atadas a un animal o a una campaña que forman un feed público.',
          en: 'Short posts tied to an animal or campaign forming a public feed.',
        },
        why: {
          es: 'Da transparencia a donantes y apadrinantes sobre el uso de los recursos.',
          en: 'Gives transparency to donors and sponsors about how resources are used.',
        },
        steps: {
          es: [
            'Abrir "Actualizaciones → Crear".',
            'Escribir título y contenido, y vincular un animal o campaña.',
            'La publicación aparece en el feed del animal o campaña vinculada.',
          ],
          en: [
            'Open "Updates → Create".',
            'Write title and content, and link an animal or campaign.',
            'The post shows up in the feed of the linked animal or campaign.',
          ],
        },
        route: '/shelter/updates',
        keywords: ['updates', 'actualizaciones', 'feed', 'transparencia'],
      },
      {
        id: 'shelter-settings',
        audience: 'shelter_admin',
        title: { es: 'Ajustes del refugio', en: 'Shelter settings' },
        summary: {
          es: 'Actualizar la información pública del refugio y datos de contacto.',
          en: 'Update the public shelter information and contact data.',
        },
        why: {
          es: 'La información debe estar al día para que adoptantes y donantes confíen en el refugio.',
          en: 'Information must stay current for adopters and donors to trust the shelter.',
        },
        steps: {
          es: [
            'Entrar a "Ajustes".',
            'Actualizar nombre, descripción, ciudad, teléfono, email y sitio web.',
            'Guardar los cambios.',
          ],
          en: [
            'Go to "Settings".',
            'Update name, description, city, phone, email, and website.',
            'Save changes.',
          ],
        },
        route: '/shelter/settings',
        keywords: ['settings', 'ajustes', 'configuracion', 'refugio'],
      },
    ],
  },

  {
    id: 'role-veterinarian',
    audience: 'veterinarian',
    title: { es: 'Rol: Veterinario', en: 'Role: Veterinarian' },
    icon: Stethoscope,
    processes: [
      {
        id: 'vet-followups',
        audience: 'veterinarian',
        title: { es: 'Ver mis seguimientos asignados', en: 'View my assigned follow-ups' },
        summary: {
          es: 'Lista de seguimientos post-adopción que te fueron asignados.',
          en: 'List of post-adoption follow-ups assigned to you.',
        },
        why: {
          es: 'Cada veterinario solo ve lo que le asignaron, para respetar la privacidad clínica.',
          en: 'Each vet only sees assigned items, to preserve clinical privacy.',
        },
        steps: {
          es: [
            'Entrar a "Seguimientos".',
            'Filtrar por estado: Pendiente, En proceso, Completo, Vencido.',
            'Abrir un seguimiento para ver el animal, el adoptante y su historial clínico.',
          ],
          en: [
            'Go to "Follow-ups".',
            'Filter by status: Pending, In progress, Complete, Overdue.',
            'Open a follow-up to see the animal, adopter, and clinical history.',
          ],
        },
        route: '/veterinarian/follow-ups',
        keywords: ['follow-ups', 'seguimientos', 'veterinario', 'clinico'],
      },
      {
        id: 'vet-clinical-entry',
        audience: 'veterinarian',
        title: { es: 'Añadir una entrada clínica', en: 'Add a clinical entry' },
        summary: {
          es: 'Registrar un chequeo, vacunación, tratamiento, observación o incidente.',
          en: 'Record a checkup, vaccination, treatment, observation, or incident.',
        },
        why: {
          es: 'Construye el historial clínico del animal; lo ve el adoptante y el refugio.',
          en: 'Builds the animal clinical history; adopter and shelter both see it.',
        },
        steps: {
          es: [
            'Abrir el seguimiento del animal.',
            'Llenar el formulario con tipo, título, descripción (ES/EN) y fecha.',
            'Al guardar, se envía una notificación al adoptante automáticamente.',
          ],
          en: [
            'Open the animal follow-up.',
            'Fill the form with type, title, description (ES/EN), and date.',
            'On save, a notification is automatically sent to the adopter.',
          ],
        },
        route: '/veterinarian/follow-ups/[id]',
        keywords: ['clinical', 'clinico', 'entrada', 'vacuna', 'checkup', 'tratamiento'],
      },
      {
        id: 'vet-mark-complete',
        audience: 'veterinarian',
        title: { es: 'Marcar seguimiento como completo', en: 'Mark follow-up as complete' },
        summary: {
          es: 'Cerrar un seguimiento cuando el proceso clínico termina.',
          en: 'Close a follow-up when the clinical process is done.',
        },
        why: {
          es: 'Limpia el tablero y libera al veterinario para recibir nuevos casos.',
          en: 'Clears the board and frees the vet to take new cases.',
        },
        steps: {
          es: [
            'En el detalle del seguimiento, pulsar "Marcar completo".',
            'El estado cambia a "Completo" con la fecha actual.',
          ],
          en: [
            'On the follow-up detail, click "Mark complete".',
            'The status changes to "Complete" with the current date.',
          ],
        },
        route: '/veterinarian/follow-ups/[id]',
        keywords: ['completar', 'marcar completo', 'cerrar seguimiento'],
      },
    ],
  },

  {
    id: 'role-web-manager',
    audience: 'web_manager',
    title: { es: 'Rol: Web Manager', en: 'Role: Web Manager' },
    icon: Users,
    highlight: true,
    processes: [
      {
        id: 'wm-shelters-list',
        audience: 'web_manager',
        title: { es: 'Ver todos los refugios', en: 'View all shelters' },
        summary: {
          es: 'Tabla global con filtros por estado de verificación y ciudad.',
          en: 'Global table with filters by verification status and city.',
        },
        why: {
          es: 'Es el punto de partida del rol: muestra el universo de refugios en la plataforma.',
          en: 'The role entry point: it shows the entire universe of shelters on the platform.',
        },
        steps: {
          es: [
            'Entrar a "Refugios".',
            'Aplicar filtros: Pendiente, Verificado, Rechazado.',
            'Abrir un refugio para ver su información y solicitudes asociadas.',
          ],
          en: [
            'Go to "Shelters".',
            'Apply filters: Pending, Verified, Rejected.',
            'Open a shelter to see its info and linked applications.',
          ],
        },
        route: '/web-manager/shelters',
        tips: {
          es: [
            'Si ves muchos refugios pendientes, coordina con el admin para acelerar aprobaciones.',
          ],
          en: [
            'If many shelters are pending, coordinate with the admin to speed up approvals.',
          ],
        },
        keywords: ['shelters', 'refugios', 'verificacion', 'lista refugios'],
      },
      {
        id: 'wm-shelter-detail',
        audience: 'web_manager',
        title: { es: 'Detalle de un refugio', en: 'Shelter detail' },
        summary: {
          es: 'Dos pestañas: información del refugio y solicitudes de sus animales.',
          en: 'Two tabs: shelter information and applications for its animals.',
        },
        why: {
          es: 'Reúne en una sola vista todo lo necesario para supervisar un refugio.',
          en: 'Combines in a single view everything needed to supervise a shelter.',
        },
        steps: {
          es: [
            'Abrir el refugio desde la lista.',
            'Revisar información y estado de verificación.',
            'Cambiar a la pestaña "Solicitudes" para ver estado por animal.',
            'Desde ahí asignar veterinario si un seguimiento está pendiente.',
          ],
          en: [
            'Open the shelter from the list.',
            'Review info and verification status.',
            'Switch to the "Applications" tab to see status per animal.',
            'From there, assign a veterinarian if a follow-up is pending.',
          ],
        },
        route: '/web-manager/shelters/[id]',
        keywords: ['detalle refugio', 'shelter detail', 'asignar vet'],
      },
      {
        id: 'wm-applications-board',
        audience: 'web_manager',
        title: { es: 'Tablero global de solicitudes', en: 'Global applications board' },
        summary: {
          es: 'Todas las solicitudes de adopción de todos los refugios, con filtros de estado y fecha.',
          en: 'All adoption applications from every shelter, with status and date filters.',
        },
        why: {
          es: 'Ayuda a detectar solicitudes estancadas y actuar antes de que el interés se pierda.',
          en: 'Helps detect stalled applications and act before interest fades.',
        },
        steps: {
          es: [
            'Entrar a "Solicitudes".',
            'Filtrar por estado, refugio y rango de fechas.',
            'Identificar solicitudes con muchos días en un mismo estado y escalar al refugio.',
          ],
          en: [
            'Go to "Applications".',
            'Filter by status, shelter, and date range.',
            'Spot applications stuck in one state for many days and escalate to the shelter.',
          ],
        },
        route: '/web-manager/applications',
        tips: {
          es: [
            'Regla práctica: una solicitud con más de 10 días en "En revisión" suele necesitar un empujón manual.',
          ],
          en: [
            'Rule of thumb: an application over 10 days in "In review" usually needs a manual nudge.',
          ],
        },
        keywords: ['applications board', 'solicitudes todas', 'cross-shelter', 'seguimiento aplicaciones'],
      },
      {
        id: 'wm-assign-veterinarian',
        audience: 'web_manager',
        title: { es: 'Asignar veterinario a un seguimiento', en: 'Assign a veterinarian to a follow-up' },
        summary: {
          es: 'Elegir un veterinario disponible para cubrir un seguimiento post-adopción.',
          en: 'Pick an available veterinarian to cover a post-adoption follow-up.',
        },
        why: {
          es: 'Sin un veterinario asignado el seguimiento queda sin responsable y puede vencer.',
          en: 'Without an assigned vet, the follow-up has no owner and can go overdue.',
        },
        steps: {
          es: [
            'Desde el detalle de la solicitud o del refugio, pulsar "Asignar veterinario".',
            'Elegir un veterinario de la lista.',
            'Confirmar — le llega una notificación al veterinario.',
          ],
          en: [
            'From the application or shelter detail, click "Assign veterinarian".',
            'Pick a vet from the list.',
            'Confirm — the vet gets a notification.',
          ],
        },
        keywords: ['assign', 'asignar', 'veterinario', 'follow-up'],
      },
      {
        id: 'wm-campaigns',
        audience: 'web_manager',
        title: { es: 'Campañas globales', en: 'Cross-shelter campaigns' },
        summary: {
          es: 'Ver todas las campañas y crear campañas a nivel plataforma si aplica.',
          en: 'See all campaigns and create platform-level campaigns if applicable.',
        },
        why: {
          es: 'Permite apoyar a los refugios con campañas globales (emergencias, aliados, eventos).',
          en: 'Supports shelters with global campaigns (emergencies, allies, events).',
        },
        steps: {
          es: [
            'Entrar a "Campañas".',
            'Crear una nueva o abrir una existente para revisar detalles.',
          ],
          en: [
            'Go to "Campaigns".',
            'Create a new one or open an existing one to review details.',
          ],
        },
        route: '/web-manager/campaigns',
        keywords: ['campañas wm', 'campaigns web manager', 'global'],
      },
      {
        id: 'wm-campaign-detail',
        audience: 'web_manager',
        title: { es: 'Detalle de una campaña global', en: 'Global campaign detail' },
        summary: {
          es: 'Revisar y editar una campaña global desde el rol web manager.',
          en: 'Review and edit a global campaign from the web manager role.',
        },
        why: {
          es: 'Permite ajustar textos, meta o evidencia cuando la campaña es de plataforma.',
          en: 'Allows adjusting text, goal, or evidence when the campaign is platform-level.',
        },
        steps: {
          es: [
            'Desde "Campañas" abrir la campaña deseada.',
            'Revisar meta, avance y evidencia.',
            'Editar información y guardar.',
          ],
          en: [
            'From "Campaigns" open the desired campaign.',
            'Review goal, progress, and evidence.',
            'Edit information and save.',
          ],
        },
        route: '/web-manager/campaigns/[id]',
        keywords: ['detalle campaña', 'editar campaña wm', 'global campaign'],
      },
    ],
  },

  {
    id: 'role-admin',
    audience: 'admin',
    title: { es: 'Rol: Admin', en: 'Role: Admin' },
    icon: Shield,
    processes: [
      {
        id: 'admin-login',
        audience: 'admin',
        title: { es: 'Acceso de administrador', en: 'Admin access' },
        summary: {
          es: 'Pantalla dedicada para que el equipo interno inicie sesión como administrador.',
          en: 'Dedicated screen for the internal team to sign in as admin.',
        },
        why: {
          es: 'Separa el inicio de sesión de staff del de usuarios y permite validar privilegios con más control.',
          en: 'Keeps staff sign-in separate from regular users and lets privileges be validated with more control.',
        },
        steps: {
          es: [
            'Abrir la pantalla de acceso de administrador.',
            'Iniciar sesión con las credenciales autorizadas.',
            'Serás llevado al panel de administración.',
          ],
          en: [
            'Open the admin login screen.',
            'Sign in with authorized credentials.',
            'You will be taken to the admin panel.',
          ],
        },
        route: '/admin-login',
        keywords: ['admin login', 'staff', 'acceso admin'],
      },
      {
        id: 'admin-dashboard',
        audience: 'admin',
        title: { es: 'Panel de la plataforma', en: 'Platform dashboard' },
        summary: {
          es: 'Indicadores clave: usuarios, refugios, animales, solicitudes, donaciones y apadrinamientos.',
          en: 'Key indicators: users, shelters, animals, applications, donations, and sponsorships.',
        },
        why: {
          es: 'Es el pulso de la plataforma y el punto de partida diario del administrador.',
          en: 'The pulse of the platform and the daily starting point for an admin.',
        },
        steps: {
          es: [
            'Entrar al panel de administración.',
            'Revisar indicadores y alertas.',
            'Saltar a la sección relevante (refugios, métricas, blog).',
          ],
          en: [
            'Open the admin dashboard.',
            'Review indicators and alerts.',
            'Jump to the relevant section (shelters, metrics, blog).',
          ],
        },
        route: '/admin/dashboard',
        keywords: ['admin dashboard', 'kpis', 'metricas globales'],
      },
      {
        id: 'admin-approve-shelters',
        audience: 'admin',
        title: { es: 'Aprobar o rechazar refugios', en: 'Approve or reject shelters' },
        summary: {
          es: 'Revisar los refugios "Pendientes" y decidir si se verifican o se rechazan.',
          en: 'Review "Pending" shelters and decide whether to verify or reject them.',
        },
        why: {
          es: 'Un refugio no publica animales con visibilidad plena hasta que queda verificado.',
          en: 'A shelter does not fully publish animals until it is verified.',
        },
        steps: {
          es: [
            'Entrar a "Aprobar refugios".',
            'Revisar documentación y datos.',
            'Aprobar (queda como Verificado con fecha actual) o rechazar con motivo.',
          ],
          en: [
            'Go to "Approve shelters".',
            'Review documentation and data.',
            'Approve (becomes Verified with current date) or reject with a reason.',
          ],
        },
        route: '/admin/shelters/approve',
        keywords: ['approve shelters', 'aprobar refugios', 'verificar'],
      },
      {
        id: 'admin-approve-campaigns',
        audience: 'admin',
        title: { es: 'Aprobar campañas de refugios', en: 'Approve shelter campaigns' },
        summary: {
          es: 'Las campañas enviadas por refugios quedan pendientes hasta que el admin las revisa.',
          en: 'Shelter-submitted campaigns stay pending until the admin reviews them.',
        },
        why: {
          es: 'Previene campañas engañosas o mal configuradas antes de que reciban donaciones.',
          en: 'Prevents misleading or misconfigured campaigns before they receive donations.',
        },
        steps: {
          es: [
            'Filtrar campañas "Pendientes".',
            'Verificar descripción, meta, fechas y evidencia.',
            'Aprobar o rechazar indicando el motivo.',
          ],
          en: [
            'Filter "Pending" campaigns.',
            'Verify description, goal, dates, and evidence.',
            'Approve or reject, giving a reason.',
          ],
        },
        keywords: ['approve campaigns', 'aprobar campañas', 'moderar'],
      },
      {
        id: 'admin-metrics',
        audience: 'admin',
        title: { es: 'Métricas detalladas', en: 'Detailed metrics' },
        summary: {
          es: 'Estadísticas de donaciones, tasas de adopción y retención de usuarios.',
          en: 'Donation stats, adoption rates, and user retention.',
        },
        why: {
          es: 'Permite medir la salud del proyecto y tomar decisiones de producto.',
          en: 'Measures project health and drives product decisions.',
        },
        steps: {
          es: [
            'Entrar a "Métricas".',
            'Revisar promedio de solicitudes por animal, tiempo medio de adopción y retención a 30 días.',
          ],
          en: [
            'Go to "Metrics".',
            'Review average applications per animal, mean adoption time, and 30-day retention.',
          ],
        },
        route: '/admin/metrics',
        keywords: ['metrics', 'metricas', 'kpi', 'retencion', 'adopcion promedio'],
      },
      {
        id: 'admin-blog-crud',
        audience: 'admin',
        title: { es: 'Gestionar el blog', en: 'Manage the blog' },
        summary: {
          es: 'Crear, editar, duplicar y programar publicaciones bilingües.',
          en: 'Create, edit, duplicate, and schedule bilingual posts.',
        },
        why: {
          es: 'Controla la voz editorial de la plataforma y ayuda a posicionar el contenido en buscadores.',
          en: 'Controls the platform editorial voice and helps content rank in search engines.',
        },
        steps: {
          es: [
            'En "Blog" ver la lista de publicaciones y abrir el calendario.',
            'Crear o editar una publicación.',
            'Subir portada, llenar título y contenido en ES y EN, categorías y campos de SEO.',
          ],
          en: [
            'In "Blog" view the list of posts and open the calendar.',
            'Create or edit a post.',
            'Upload cover image, fill title and content in ES and EN, categories, and SEO fields.',
          ],
        },
        route: '/admin/blog',
        keywords: ['blog crud', 'editar blog', 'posts', 'publicar articulo'],
      },
      {
        id: 'admin-moderation',
        audience: 'admin',
        title: { es: 'Cola de moderación', en: 'Moderation queue' },
        summary: {
          es: 'Contenido reportado o sospechoso pendiente de revisión.',
          en: 'Reported or suspicious content awaiting review.',
        },
        why: {
          es: 'Protege a la comunidad de contenido dañino o engañoso.',
          en: 'Protects the community from harmful or misleading content.',
        },
        steps: {
          es: [
            'Entrar a "Moderación".',
            'Evaluar cada ítem y aplicar la acción correspondiente.',
          ],
          en: [
            'Go to "Moderation".',
            'Assess each item and apply the right action.',
          ],
        },
        route: '/admin/moderation',
        keywords: ['moderation', 'moderacion', 'reportes', 'flag'],
      },
      {
        id: 'admin-payments-audit',
        audience: 'admin',
        title: { es: 'Auditoría de pagos', en: 'Payments audit' },
        summary: {
          es: 'Listado de pagos para conciliar con la pasarela y detectar errores.',
          en: 'Payments list to reconcile with the gateway and detect errors.',
        },
        why: {
          es: 'Detecta pagos con error, rechazados o pendientes colgados y evita pérdidas.',
          en: 'Detects stuck error, declined, or pending payments and prevents losses.',
        },
        steps: {
          es: [
            'Entrar a "Pagos".',
            'Filtrar por estado y referencia.',
            'Investigar y marcar como procesado, o reintentar si aplica.',
          ],
          en: [
            'Go to "Payments".',
            'Filter by status and reference.',
            'Investigate and mark as processed, or retry if applicable.',
          ],
        },
        route: '/admin/payments',
        keywords: ['payments', 'pagos', 'auditoria', 'pasarela'],
      },
      {
        id: 'admin-impersonate',
        audience: 'admin',
        title: { es: 'Entrar como otro usuario', en: 'Log in as another user' },
        summary: {
          es: 'Permite al admin acceder temporalmente a la cuenta de un usuario para soporte.',
          en: 'Lets the admin temporarily access a user account for support purposes.',
        },
        why: {
          es: 'Sirve para reproducir un problema reportado y ayudar al usuario sin pedirle su contraseña.',
          en: 'Useful to reproduce a reported problem and help the user without asking for their password.',
        },
        steps: {
          es: [
            'Desde el detalle del usuario en el panel de administración, pulsar "Entrar como".',
            'Se abre una nueva pestaña con la sesión del usuario seleccionado.',
            'Al terminar, cerrar esa pestaña para volver a la sesión propia.',
          ],
          en: [
            'From the user detail in the admin panel, click "Log in as".',
            'A new tab opens with the selected user session.',
            'When done, close that tab to return to your own session.',
          ],
        },
        keywords: ['impersonate', 'entrar como', 'soporte', 'login as'],
      },
    ],
  },

  {
    id: 'cross-cutting',
    audience: 'cross',
    title: { es: 'Procesos transversales', en: 'Cross-cutting processes' },
    icon: Zap,
    processes: [
      {
        id: 'cross-role-redirection',
        audience: 'cross',
        title: { es: 'Dónde aterriza cada rol después de iniciar sesión', en: 'Where each role lands after sign-in' },
        summary: {
          es: 'Cada rol va a la pantalla que más le sirve al iniciar sesión.',
          en: 'Each role lands on the screen that is most useful after sign-in.',
        },
        why: {
          es: 'Minimiza clicks y deja claro el alcance del rol desde el primer momento.',
          en: 'Reduces clicks and clarifies role scope from the first moment.',
        },
        steps: {
          es: [
            'Adoptante → Mi perfil.',
            'Refugio → Panel del refugio (o registro del refugio si aún no lo tiene).',
            'Veterinario → Seguimientos asignados.',
            'Web manager → Listado de refugios.',
            'Admin → Panel de administración.',
          ],
          en: [
            'Adopter → My profile.',
            'Shelter → Shelter dashboard (or shelter registration if not registered yet).',
            'Veterinarian → Assigned follow-ups.',
            'Web manager → Shelters list.',
            'Admin → Admin dashboard.',
          ],
        },
        keywords: ['redirect', 'redireccion', 'post login', 'rol'],
      },
      {
        id: 'cross-session-expired',
        audience: 'cross',
        title: { es: 'Qué pasa cuando caduca la sesión', en: 'What happens when the session expires' },
        summary: {
          es: 'Tuhuella mantiene tu sesión activa mientras usas la plataforma; si expira, te pide iniciar sesión de nuevo.',
          en: 'Tuhuella keeps your session active while you use the platform; if it expires, it asks you to sign in again.',
        },
        why: {
          es: 'Por seguridad, la sesión no dura infinito. Evita que alguien use tu cuenta si dejas el equipo abierto.',
          en: 'For security reasons, sessions do not last forever. It prevents someone else from using your account on an open device.',
        },
        steps: {
          es: [
            'Si la sesión expira mientras haces algo, aparece la pantalla de inicio de sesión.',
            'Al ingresar de nuevo, vuelves al mismo lugar y puedes continuar.',
            'Si cierras sesión manualmente, se borran tus datos del navegador.',
          ],
          en: [
            'If the session expires while you are doing something, the sign-in screen appears.',
            'Once you sign in again, you return to the same place and continue.',
            'If you sign out manually, your browser data is cleared.',
          ],
        },
        keywords: ['session', 'sesion', 'expira', 'caduca', 'logout'],
      },
      {
        id: 'cross-emails',
        audience: 'cross',
        title: { es: 'Cuándo recibes emails de Tuhuella', en: 'When you receive emails from Tuhuella' },
        summary: {
          es: 'Lista de eventos que disparan email y cómo silenciarlos.',
          en: 'List of events that trigger emails and how to mute them.',
        },
        why: {
          es: 'Ayuda a entender por qué llegó un correo (o por qué no llegó) y a ajustar preferencias.',
          en: 'Helps understand why an email arrived (or didn’t) and how to adjust preferences.',
        },
        steps: {
          es: [
            'Al registrarte, recibes bienvenida y verificación.',
            'Al enviar una solicitud de adopción, recibes confirmación; al cambiar de estado también.',
            'Al confirmarse una donación o apadrinamiento, recibes el recibo.',
            'Al añadir una entrada clínica en un seguimiento, el adoptante recibe aviso.',
            'Para silenciar eventos: entra a "Preferencias de notificación" y desactiva el canal email.',
          ],
          en: [
            'When you sign up, you receive welcome and verification emails.',
            'When you submit an adoption application, you get confirmation; you also get emails as its status changes.',
            'When a donation or sponsorship is confirmed, you receive the receipt.',
            'When a clinical entry is added to a follow-up, the adopter gets an email.',
            'To mute events: go to "Notification preferences" and turn off the email channel.',
          ],
        },
        tips: {
          es: [
            'Si no te llega un email esperado, revisa la carpeta de spam y tus preferencias de notificación.',
          ],
          en: [
            'If an expected email never arrives, check your spam folder and your notification preferences.',
          ],
        },
        keywords: ['emails', 'correos', 'avisos', 'notificaciones email'],
      },
      {
        id: 'cross-payments',
        audience: 'cross',
        title: { es: 'Cómo funcionan los pagos', en: 'How payments work' },
        summary: {
          es: 'Donaciones y apadrinamientos se cobran a través de una pasarela de pago segura.',
          en: 'Donations and sponsorships are charged through a secure payment gateway.',
        },
        why: {
          es: 'Tuhuella no almacena tus datos de tarjeta; la pasarela procesa el cobro y confirma el resultado.',
          en: 'Tuhuella does not store your card data; the gateway processes the charge and confirms the result.',
        },
        steps: {
          es: [
            'Desde el checkout eliges monto y método de pago (tarjeta, PSE o Nequi).',
            'Te llevamos a la pasarela para que confirmes el cobro.',
            'Al volver, ves el resultado: Aprobado, Pendiente o Rechazado.',
            'Los pagos aprobados aparecen en "Mis donaciones" o "Mis apadrinamientos".',
          ],
          en: [
            'From the checkout you pick amount and payment method (card, PSE, or Nequi).',
            'We take you to the gateway to confirm the charge.',
            'On return, you see the result: Approved, Pending, or Declined.',
            'Approved payments show up in "My donations" or "My sponsorships".',
          ],
        },
        tips: {
          es: [
            'Si un pago queda en "Pendiente", no lo intentes de nuevo: espera unos minutos a que la pasarela confirme.',
          ],
          en: [
            'If a payment stays "Pending", do not retry immediately: wait a few minutes for the gateway to confirm.',
          ],
        },
        keywords: ['payments', 'pagos', 'pasarela', 'checkout', 'tarjeta'],
      },
      {
        id: 'cross-bilingual',
        audience: 'cross',
        title: { es: 'Contenido bilingüe', en: 'Bilingual content' },
        summary: {
          es: 'Tuhuella funciona en español (por defecto) y en inglés.',
          en: 'Tuhuella runs in Spanish (default) and English.',
        },
        why: {
          es: 'Los textos de interfaz y contenidos clave (blog, animales, notas) se muestran en el idioma elegido.',
          en: 'Interface text and key content (blog, animals, notes) display in the selected language.',
        },
        steps: {
          es: [
            'Cada pantalla vive en una URL con prefijo de idioma (por ejemplo /es/animales o /en/animals).',
            'Los contenidos bilingües (blog, animales, notas clínicas) muestran la versión que corresponde al idioma activo.',
            'El selector ES/EN cambia el idioma sin perder la pantalla actual.',
          ],
          en: [
            'Every screen lives at a URL with a language prefix (for example /es/animales or /en/animals).',
            'Bilingual content (blog, animals, clinical notes) shows the version matching the active language.',
            'The ES/EN switcher changes language without losing the current screen.',
          ],
        },
        keywords: ['i18n', 'bilingue', 'bilingual', 'idioma', 'es', 'en'],
      },
    ],
  },
];
