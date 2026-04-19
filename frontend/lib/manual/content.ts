import {
  BookOpen,
  Globe,
  Heart,
  Home,
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
          es: 'Plataforma para conectar refugios con adoptantes, padrinos y donantes de animales.',
          en: 'Platform connecting shelters with adopters, sponsors, and donors of animals.',
        },
        why: {
          es: 'El objetivo es reducir el abandono facilitando adopción responsable, apadrinamiento mensual y campañas de donación con trazabilidad y verificación de refugios.',
          en: 'The goal is to reduce abandonment by enabling responsible adoption, monthly sponsorship, and traceable donation campaigns with shelter verification.',
        },
        steps: {
          es: [
            'Un visitante explora animales, refugios y campañas sin cuenta.',
            'Al crear cuenta puede aplicar a adopción, apadrinar o donar.',
            'Los refugios publican animales y campañas, que pasan por aprobación.',
            'Admins y web managers supervisan la operación y aprueban contenido.',
            'Veterinarios registran seguimientos post-adopción.',
          ],
          en: [
            'A visitor browses animals, shelters, and campaigns without an account.',
            'With an account they can apply for adoption, sponsor, or donate.',
            'Shelters publish animals and campaigns that go through approval.',
            'Admins and web managers supervise operations and approve content.',
            'Veterinarians record post-adoption follow-ups.',
          ],
        },
        keywords: ['platform', 'plataforma', 'overview', 'visión', 'tuhuella', 'resumen', 'intro'],
      },
      {
        id: 'tech-stack',
        audience: 'cross',
        title: { es: 'Stack técnico', en: 'Technical stack' },
        summary: {
          es: 'Django 6 + DRF, Next.js 16 + React 19, MySQL, Redis, Huey.',
          en: 'Django 6 + DRF, Next.js 16 + React 19, MySQL, Redis, Huey.',
        },
        why: {
          es: 'Conocer el stack ayuda a reportar incidencias con contexto correcto y a ubicar dónde vive cada pieza.',
          en: 'Knowing the stack helps report issues with proper context and locate where each piece lives.',
        },
        steps: {
          es: [
            'Backend: Django 6 + DRF, vistas 100% FBV, app única base_feature_app.',
            'Frontend: Next.js 16 App Router, React 19, TypeScript, Zustand, next-intl.',
            'Base de datos: MySQL 8 (tuhuella_db).',
            'Cola asíncrona: Huey sobre Redis para emails y notificaciones.',
            'Auth: JWT en /api/ (15 min access), sesión + CSRF en admin de Django.',
          ],
          en: [
            'Backend: Django 6 + DRF, 100% function-based views, single app base_feature_app.',
            'Frontend: Next.js 16 App Router, React 19, TypeScript, Zustand, next-intl.',
            'Database: MySQL 8 (tuhuella_db).',
            'Async queue: Huey over Redis for emails and notifications.',
            'Auth: JWT on /api/ (15-min access), session + CSRF on Django admin.',
          ],
        },
        keywords: ['stack', 'django', 'next', 'react', 'mysql', 'redis', 'huey', 'jwt', 'tech'],
      },
      {
        id: 'three-services',
        audience: 'cross',
        title: { es: 'Tres servicios en producción', en: 'Three services in production' },
        summary: {
          es: 'Backend Gunicorn, worker Huey y frontend Next.js corren como unidades systemd independientes.',
          en: 'Gunicorn backend, Huey worker, and Next.js frontend run as independent systemd units.',
        },
        why: {
          es: 'Si algún servicio cae, hay síntomas específicos: sin backend no carga nada; sin Huey no llegan emails; sin frontend no carga la UI.',
          en: 'If any service is down there are specific symptoms: no backend means nothing loads; no Huey means no emails arrive; no frontend means UI fails to load.',
        },
        steps: {
          es: [
            'tuhuella_project.service — Gunicorn en 8000 sirve /api y /media.',
            'tuhuella-huey.service — worker que envía emails y notificaciones.',
            'tuhuella-frontend.service — Next.js Node 20 en 3001.',
            'nginx enruta al frontend y el frontend reescribe /api/* y /media/* al backend.',
          ],
          en: [
            'tuhuella_project.service — Gunicorn on 8000 serving /api and /media.',
            'tuhuella-huey.service — worker that sends emails and notifications.',
            'tuhuella-frontend.service — Next.js Node 20 on 3001.',
            'nginx routes to the frontend and the frontend rewrites /api/* and /media/* to the backend.',
          ],
        },
        tips: {
          es: [
            'Si un usuario reporta que no recibe emails, revisa tuhuella-huey.service primero.',
            'Tras un deploy, reinicia las tres unidades.',
          ],
          en: [
            'If a user reports missing emails, check tuhuella-huey.service first.',
            'After a deploy, restart all three units.',
          ],
        },
        keywords: ['systemd', 'gunicorn', 'huey', 'service', 'deploy', 'nginx', 'produccion'],
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
          es: 'Landing con hero, animales destacados, refugios y campañas activas.',
          en: 'Landing with hero, featured animals, shelters, and active campaigns.',
        },
        why: {
          es: 'Primer punto de contacto y conversión hacia adopción o donación.',
          en: 'First contact point that drives conversion toward adoption or donation.',
        },
        steps: {
          es: [
            'Hero con CTAs a Animales, Busco Adoptar, Donar y Trabaja con nosotros.',
            'Sección "Cómo funciona" con 3 pasos explicativos.',
            'Carruseles de animales destacados, refugios y campañas activas.',
          ],
          en: [
            'Hero with CTAs to Animals, Looking to Adopt, Donate, and Work with Us.',
            '"How it works" section with 3 explanatory steps.',
            'Carousels of featured animals, shelters, and active campaigns.',
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
          es: 'Listado filtrable por especie, tamaño, edad, género y nivel de energía.',
          en: 'Filterable list by species, size, age, gender, and energy level.',
        },
        why: {
          es: 'Descubrimiento principal. Todos los animales publicados son visibles aquí.',
          en: 'Primary discovery surface. All published animals are listed here.',
        },
        steps: {
          es: [
            'El visitante aplica filtros y ve grid de tarjetas.',
            'Click en una tarjeta abre el detalle del animal.',
          ],
          en: [
            'Visitor applies filters and sees a grid of cards.',
            'Clicking a card opens the animal detail.',
          ],
        },
        route: '/animals',
        endpoints: ['GET /api/animals/'],
        keywords: ['animals', 'animales', 'browse', 'catalogo', 'filtros', 'adoptar'],
      },
      {
        id: 'public-animal-detail',
        audience: 'public',
        title: { es: 'Detalle del animal', en: 'Animal detail' },
        summary: {
          es: 'Galería, historial médico, screenings de enfermedades y CTA de adopción/apadrinamiento.',
          en: 'Gallery, medical history, disease screenings, and adoption/sponsorship CTA.',
        },
        why: {
          es: 'Es la vista donde el usuario decide aplicar o apadrinar. Muestra salud y compatibilidad.',
          en: 'This is where the user decides to apply or sponsor. Shows health and compatibility info.',
        },
        steps: {
          es: [
            'Ver galería y datos básicos (especie, raza, edad, tamaño).',
            'Revisar salud: vacunas, esterilización, screenings por especie.',
            'CTA Adoptar redirige a /sign-in si no hay sesión, o al formulario.',
          ],
          en: [
            'View gallery and basic info (species, breed, age, size).',
            'Review health: vaccines, sterilization, species-specific screenings.',
            'Adopt CTA redirects to /sign-in if not logged in, otherwise to the form.',
          ],
        },
        route: '/animals/[animalId]',
        endpoints: ['GET /api/animals/:id/', 'GET /api/animals/:id/similar/'],
        keywords: ['animal detail', 'ficha', 'perfil animal', 'salud', 'screening'],
      },
      {
        id: 'public-browse-shelters',
        audience: 'public',
        title: { es: 'Refugios', en: 'Shelters' },
        summary: {
          es: 'Listado de refugios verificados y pendientes; detalle con animales y campañas.',
          en: 'List of verified and pending shelters; detail with animals and campaigns.',
        },
        why: {
          es: 'Permite al usuario conocer quiénes están detrás de los animales y elegir a quién apoyar.',
          en: 'Lets users learn who is behind the animals and choose whom to support.',
        },
        steps: {
          es: [
            'Ver listado con estado de verificación.',
            'Abrir detalle con info del refugio, galería, animales publicados y campañas activas.',
          ],
          en: [
            'View list with verification status.',
            'Open detail with shelter info, gallery, published animals, and active campaigns.',
          ],
        },
        route: '/shelters',
        endpoints: ['GET /api/shelters/'],
        keywords: ['shelters', 'refugios', 'fundaciones', 'organizaciones'],
      },
      {
        id: 'public-campaigns',
        audience: 'public',
        title: { es: 'Campañas', en: 'Campaigns' },
        summary: {
          es: 'Campañas de recaudación con barra de progreso y donación directa.',
          en: 'Fundraising campaigns with progress bar and direct donation.',
        },
        why: {
          es: 'Son la vía principal para financiar gastos médicos puntuales y mejoras de infraestructura de los refugios.',
          en: 'Main route to fund specific medical expenses and shelter infrastructure improvements.',
        },
        steps: {
          es: [
            'Listado con pestañas Activas y Completadas.',
            'Detalle con monto objetivo, monto recaudado, refugio, evidencias y actualizaciones.',
            'CTA Donar abre el checkout.',
          ],
          en: [
            'List with Active and Completed tabs.',
            'Detail with goal, raised amount, shelter, evidence, and updates feed.',
            'Donate CTA opens the checkout.',
          ],
        },
        route: '/campaigns',
        endpoints: ['GET /api/campaigns/'],
        keywords: ['campañas', 'campaigns', 'recaudacion', 'fundraising', 'meta'],
      },
      {
        id: 'public-blog',
        audience: 'public',
        title: { es: 'Blog bilingüe', en: 'Bilingual blog' },
        summary: {
          es: 'Artículos en español e inglés por categorías de bienestar animal.',
          en: 'Articles in Spanish and English across animal welfare categories.',
        },
        why: {
          es: 'Ofrece contenido educativo y mejora el SEO y la retención de usuarios.',
          en: 'Provides educational content and improves SEO and user retention.',
        },
        steps: {
          es: [
            'Listado por categorías con featured posts.',
            'Detalle con contenido JSON estructurado y barra de progreso de lectura.',
          ],
          en: [
            'Category-based listing with featured posts.',
            'Detail view with structured JSON content and reading-progress bar.',
          ],
        },
        route: '/blog',
        endpoints: ['GET /api/blog/'],
        keywords: ['blog', 'articulos', 'contenido', 'bienestar'],
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
          es: 'Es la vía oficial para evaluar compatibilidad adoptante-animal. Una vez enviada, el refugio la revisa.',
          en: 'Official channel to assess adopter-animal fit. Once submitted, the shelter reviews it.',
        },
        steps: {
          es: [
            'Desde el detalle del animal, pulsar "Adoptar".',
            'Completar las 6 secciones: información básica, hogar, experiencia, compatibilidad, compromiso y logística.',
            'Enviar — se crea una AdoptionApplication con estado submitted.',
            'El refugio transiciona la solicitud: reviewing → interview → approved/rejected.',
          ],
          en: [
            'From the animal detail, click "Adopt".',
            'Complete the 6 sections: basic info, home, experience, compatibility, commitment, logistics.',
            'Submit — an AdoptionApplication is created with status submitted.',
            'The shelter moves it: reviewing → interview → approved/rejected.',
          ],
        },
        route: '/adopt/[animalId]',
        endpoints: ['POST /api/adoptions/create/'],
        keywords: ['adoption', 'adopcion', 'solicitud', 'application', 'aplicar', 'postular', 'formulario'],
      },
      {
        id: 'adopter-track-applications',
        audience: 'adopter',
        title: { es: 'Seguir mis solicitudes', en: 'Track my applications' },
        summary: {
          es: 'Listado con estado de cada solicitud enviada.',
          en: 'List showing the status of each submitted application.',
        },
        why: {
          es: 'Transparencia: el adoptante ve en qué parte del proceso está y cuándo aprobaron o rechazaron.',
          en: 'Transparency: the adopter sees where in the process they are and when it was approved or rejected.',
        },
        steps: {
          es: [
            'Entrar a /my-applications.',
            'Ver lista con estados (submitted, reviewing, interview, approved, rejected).',
            'Si está aprobada, acceder a /my-applications/:id/history para ver el historial clínico.',
          ],
          en: [
            'Go to /my-applications.',
            'See list with statuses (submitted, reviewing, interview, approved, rejected).',
            'If approved, open /my-applications/:id/history to see clinical history.',
          ],
        },
        route: '/my-applications',
        endpoints: ['GET /api/adoptions/'],
        keywords: ['applications', 'solicitudes', 'track', 'seguimiento', 'estado'],
      },
      {
        id: 'adopter-favorites',
        audience: 'adopter',
        title: { es: 'Gestionar favoritos', en: 'Manage favorites' },
        summary: {
          es: 'Guardar animales de interés, anotar notas y comparar hasta 3 lado a lado.',
          en: 'Save animals of interest, add notes, and compare up to 3 side by side.',
        },
        why: {
          es: 'Reduce la fricción de volver a encontrar animales que el usuario está evaluando.',
          en: 'Reduces friction of finding again the animals a user is evaluating.',
        },
        steps: {
          es: [
            'Pulsar el corazón en cualquier tarjeta de animal.',
            'En /favorites ver lista, alternar grid/lista, editar notas por animal.',
            'Activar modo comparar para ver 2 o 3 animales lado a lado.',
          ],
          en: [
            'Click the heart on any animal card.',
            'In /favorites view the list, toggle grid/list, edit notes per animal.',
            'Enable compare mode to view 2 or 3 animals side by side.',
          ],
        },
        route: '/favorites',
        endpoints: ['GET /api/favorites/', 'POST /api/favorites/toggle/'],
        keywords: ['favorites', 'favoritos', 'corazon', 'comparar', 'compare'],
      },
      {
        id: 'adopter-intent',
        audience: 'adopter',
        title: { es: 'Publicar intención de adopción', en: 'Publish adopter intent' },
        summary: {
          es: 'Declarar qué tipo de animal se busca para que refugios puedan invitar al adoptante.',
          en: 'Declare what kind of animal is sought so shelters can invite the adopter.',
        },
        why: {
          es: 'Invierte el flujo tradicional: los refugios buscan al adoptante en vez de al revés.',
          en: 'Inverts the traditional flow: shelters reach out to the adopter rather than the other way around.',
        },
        steps: {
          es: [
            'Entrar a /my-intent.',
            'Definir preferencias (especie, tamaño, edad), descripción y visibilidad (pública o privada).',
            'Refugios pueden enviar invitaciones que llegan como notificación.',
          ],
          en: [
            'Go to /my-intent.',
            'Set preferences (species, size, age), description, and visibility (public or private).',
            'Shelters can send invites that arrive as notifications.',
          ],
        },
        route: '/my-intent',
        endpoints: ['GET/PUT /api/adopter-intents/mine/'],
        keywords: ['intent', 'busco adoptar', 'preferencias', 'matching', 'invitacion'],
      },
      {
        id: 'adopter-donate',
        audience: 'adopter',
        title: { es: 'Donar', en: 'Donate' },
        summary: {
          es: 'Donación única a plataforma, refugio o campaña con método de pago a elegir.',
          en: 'One-time donation to platform, shelter, or campaign with selectable payment method.',
        },
        why: {
          es: 'Es el flujo transaccional más simple. Genera un registro Donation y luego un Payment al confirmarse.',
          en: 'The simplest transactional flow. Creates a Donation record and a Payment upon confirmation.',
        },
        steps: {
          es: [
            'Abrir /checkout/donation con destino preseleccionado.',
            'Elegir monto (preset o personalizado) y método (tarjeta, PSE, Nequi).',
            'Redirección a la página de confirmación con resultado.',
            'La donación y el Payment aparecen en /my-donations.',
          ],
          en: [
            'Open /checkout/donation with preselected destination.',
            'Pick amount (preset or custom) and method (card, PSE, Nequi).',
            'Redirect to confirmation page with result.',
            'The donation and Payment appear in /my-donations.',
          ],
        },
        route: '/checkout/donation',
        endpoints: ['POST /api/donations/create/', 'POST /api/payments/intent/'],
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
          es: 'Ofrece al refugio flujo recurrente y al usuario conexión emocional con un animal en particular.',
          en: 'Gives the shelter recurring income and the user an emotional bond with a specific animal.',
        },
        steps: {
          es: [
            'Desde el detalle del animal o /checkout/sponsorship pulsar Apadrinar.',
            'Elegir monto, frecuencia (mensual/única) y método de pago.',
            'Ver apadrinamientos activos en /my-sponsorships.',
          ],
          en: [
            'From animal detail or /checkout/sponsorship click Sponsor.',
            'Choose amount, frequency (monthly/one-time), and payment method.',
            'View active sponsorships in /my-sponsorships.',
          ],
        },
        route: '/checkout/sponsorship',
        endpoints: ['POST /api/sponsorships/create/'],
        keywords: ['sponsor', 'apadrinar', 'apadrinamiento', 'padrino', 'mensual'],
      },
      {
        id: 'adopter-notifications',
        audience: 'adopter',
        title: { es: 'Gestionar notificaciones', en: 'Manage notifications' },
        summary: {
          es: 'Activar o desactivar canales email/in-app por tipo de evento.',
          en: 'Enable or disable email/in-app channels per event type.',
        },
        why: {
          es: 'Permite personalizar la comunicación sin perder eventos importantes (aprobación, recordatorios).',
          en: 'Allows tailoring communication without missing critical events (approvals, reminders).',
        },
        steps: {
          es: [
            'Entrar a /my-profile/notifications.',
            'Activar/desactivar canal por evento (aplicación aprobada, donación recibida, etc.).',
          ],
          en: [
            'Go to /my-profile/notifications.',
            'Toggle channel per event (application approved, donation received, etc.).',
          ],
        },
        route: '/my-profile/notifications',
        endpoints: ['GET/PUT /api/notifications/preferences/'],
        keywords: ['notifications', 'preferencias', 'email', 'canal', 'notificaciones'],
      },
    ],
  },

  {
    id: 'role-shelter',
    audience: 'shelter_admin',
    title: { es: 'Rol: Refugio (Shelter Admin)', en: 'Role: Shelter Admin' },
    icon: Home,
    processes: [
      {
        id: 'shelter-onboarding',
        audience: 'shelter_admin',
        title: { es: 'Registrar un refugio', en: 'Register a shelter' },
        summary: {
          es: 'Onboarding donde se captura la información legal y de contacto del refugio.',
          en: 'Onboarding that captures the shelter legal and contact info.',
        },
        why: {
          es: 'Un shelter admin nuevo no puede operar sin un refugio vinculado con estado pending a verified.',
          en: 'A new shelter admin cannot operate without a linked shelter moving from pending to verified.',
        },
        steps: {
          es: [
            'Tras login, el refugio va a /shelter/onboarding si no tiene refugio creado.',
            'Envía nombre, nombre legal, descripción, ciudad, teléfono, email y website.',
            'Se crea el Shelter con verification_status=pending.',
            'Espera la aprobación del admin.',
          ],
          en: [
            'After login, the shelter admin lands on /shelter/onboarding if no shelter exists.',
            'Submits name, legal name, description, city, phone, email, and website.',
            'A Shelter is created with verification_status=pending.',
            'Waits for admin approval.',
          ],
        },
        route: '/shelter/onboarding',
        endpoints: ['POST /api/shelters/create/'],
        keywords: ['onboarding', 'registro refugio', 'crear refugio', 'verificacion'],
      },
      {
        id: 'shelter-manage-animals',
        audience: 'shelter_admin',
        title: { es: 'Publicar y gestionar animales', en: 'Publish and manage animals' },
        summary: {
          es: 'CRUD completo de animales con galería, salud y notas médicas bilingües.',
          en: 'Full CRUD for animals with gallery, health, and bilingual medical notes.',
        },
        why: {
          es: 'Cada animal publicado habilita solicitudes de adopción y apadrinamiento.',
          en: 'Each published animal enables adoption and sponsorship requests.',
        },
        steps: {
          es: [
            'En /shelter/animals crear un animal: especie, raza, edad, tamaño, género, galería, salud.',
            'Transicionar estado: draft → published → (in_process/adopted/archived).',
            'Mantener notas médicas y screenings actualizados.',
          ],
          en: [
            'In /shelter/animals create an animal: species, breed, age, size, gender, gallery, health.',
            'Transition status: draft → published → (in_process/adopted/archived).',
            'Keep medical notes and screenings up to date.',
          ],
        },
        route: '/shelter/animals',
        endpoints: ['POST /api/animals/create/', 'PATCH /api/animals/:id/update/'],
        keywords: ['animals shelter', 'publicar', 'crud', 'animal crear'],
      },
      {
        id: 'shelter-manage-applications',
        audience: 'shelter_admin',
        title: { es: 'Revisar solicitudes de adopción', en: 'Review adoption applications' },
        summary: {
          es: 'Ver, transicionar estado y aprobar o rechazar solicitudes recibidas.',
          en: 'View, transition state, and approve or reject incoming applications.',
        },
        why: {
          es: 'Al aprobar, el sistema crea automáticamente un PostAdoptionFollowUp a 30 días.',
          en: 'On approval, the system automatically creates a PostAdoptionFollowUp 30 days out.',
        },
        steps: {
          es: [
            'Abrir /shelter/applications y filtrar por estado.',
            'Entrar a una solicitud y revisar respuestas del formulario.',
            'Transicionar: submitted → reviewing → interview → approved/rejected.',
            'Si se aprueba, asignar un veterinario al follow-up.',
          ],
          en: [
            'Open /shelter/applications and filter by status.',
            'Enter an application and review form answers.',
            'Transition: submitted → reviewing → interview → approved/rejected.',
            'If approved, assign a veterinarian to the follow-up.',
          ],
        },
        route: '/shelter/applications',
        endpoints: ['PATCH /api/adoptions/:id/status/', 'POST /api/follow-ups/'],
        keywords: ['solicitudes', 'review applications', 'aprobar', 'rechazar', 'adopcion'],
      },
      {
        id: 'shelter-create-campaign',
        audience: 'shelter_admin',
        title: { es: 'Crear campaña de donación', en: 'Create a donation campaign' },
        summary: {
          es: 'Campaña con meta, fecha final, animales vinculados y evidencia; requiere aprobación de admin.',
          en: 'Campaign with goal, end date, linked animals, and evidence; requires admin approval.',
        },
        why: {
          es: 'Las campañas son la vía para recaudar para gastos específicos. Si no se aprueba, no aparecen al público.',
          en: 'Campaigns are the path to raise funds for specific expenses. Without approval they are not public.',
        },
        steps: {
          es: [
            'Desde /shelter/campaigns/new completar título, descripción, meta y fecha final.',
            'Subir galería de evidencia y vincular animales si aplica.',
            'Enviar — la campaña pasa a approval_status=pending.',
            'Un admin la aprueba y queda visible en /campaigns.',
          ],
          en: [
            'From /shelter/campaigns/new fill title, description, goal, and end date.',
            'Upload evidence gallery and link animals if applicable.',
            'Submit — campaign becomes approval_status=pending.',
            'An admin approves it and it becomes visible in /campaigns.',
          ],
        },
        route: '/shelter/campaigns/new',
        endpoints: ['POST /api/campaigns/create/'],
        keywords: ['create campaign', 'crear campaña', 'recaudacion', 'meta', 'evidencia'],
      },
      {
        id: 'shelter-donations-dashboard',
        audience: 'shelter_admin',
        title: { es: 'Tablero de donaciones recibidas', en: 'Incoming donations dashboard' },
        summary: {
          es: 'Ver todas las donaciones dirigidas al refugio o a sus campañas.',
          en: 'View all donations routed to the shelter or its campaigns.',
        },
        why: {
          es: 'Permite conciliación contable y seguimiento del progreso de campañas.',
          en: 'Enables accounting reconciliation and campaign progress tracking.',
        },
        steps: {
          es: [
            'Entrar a /shelter/donations.',
            'Ver listado con monto, estado, donante (email) y destino.',
          ],
          en: [
            'Go to /shelter/donations.',
            'See list with amount, status, donor email, and destination.',
          ],
        },
        route: '/shelter/donations',
        endpoints: ['GET /api/donations/shelter/'],
        keywords: ['donations shelter', 'donaciones recibidas', 'contabilidad'],
      },
      {
        id: 'shelter-updates',
        audience: 'shelter_admin',
        title: { es: 'Publicar actualizaciones', en: 'Publish updates' },
        summary: {
          es: 'Posts atados a campañas o animales que forman un feed público.',
          en: 'Posts tied to campaigns or animals forming a public feed.',
        },
        why: {
          es: 'Da transparencia a donantes y apadrinantes sobre el uso de fondos.',
          en: 'Gives transparency to donors and sponsors about fund usage.',
        },
        steps: {
          es: [
            'Abrir /shelter/updates/create.',
            'Escribir título y contenido, vincular campaña o animal.',
            'El post aparece en el feed del objetivo vinculado.',
          ],
          en: [
            'Open /shelter/updates/create.',
            'Write title and content, link a campaign or animal.',
            'The post shows up in the feed of the linked target.',
          ],
        },
        route: '/shelter/updates',
        endpoints: ['POST /api/update-posts/create/'],
        keywords: ['updates', 'actualizaciones', 'feed', 'transparencia'],
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
        title: { es: 'Ver follow-ups asignados', en: 'View assigned follow-ups' },
        summary: {
          es: 'Listado de seguimientos post-adopción asignados a este veterinario.',
          en: 'List of post-adoption follow-ups assigned to this veterinarian.',
        },
        why: {
          es: 'Un veterinario solo ve lo que le asignaron para respetar privacidad clínica.',
          en: 'A veterinarian only sees what was assigned, preserving clinical privacy.',
        },
        steps: {
          es: [
            'Entrar a /veterinarian/follow-ups.',
            'Filtrar por estado (pending, in_progress, completed, overdue).',
          ],
          en: [
            'Go to /veterinarian/follow-ups.',
            'Filter by status (pending, in_progress, completed, overdue).',
          ],
        },
        route: '/veterinarian/follow-ups',
        endpoints: ['GET /api/follow-ups/'],
        keywords: ['follow-ups', 'seguimientos', 'veterinario', 'clinico'],
      },
      {
        id: 'vet-clinical-entry',
        audience: 'veterinarian',
        title: { es: 'Añadir entrada clínica', en: 'Add a clinical entry' },
        summary: {
          es: 'Registrar checkup, vacunación, tratamiento, observación o incidente.',
          en: 'Record a checkup, vaccination, treatment, observation, or incident.',
        },
        why: {
          es: 'Construye el historial clínico del animal, visible para el adoptante y el refugio.',
          en: 'Builds the animal clinical history, visible to the adopter and shelter.',
        },
        steps: {
          es: [
            'Abrir /veterinarian/follow-ups/:id.',
            'Llenar formulario con tipo, título, cuerpo bilingüe y fecha.',
            'Al guardar se dispara notificación al adoptante.',
          ],
          en: [
            'Open /veterinarian/follow-ups/:id.',
            'Fill the form with type, title, bilingual body, and date.',
            'On save a notification is sent to the adopter.',
          ],
        },
        route: '/veterinarian/follow-ups/[id]',
        endpoints: ['POST /api/clinical-entries/create/'],
        keywords: ['clinical', 'clinico', 'entrada', 'vacuna', 'checkup', 'tratamiento'],
      },
      {
        id: 'vet-mark-complete',
        audience: 'veterinarian',
        title: { es: 'Marcar follow-up como completo', en: 'Mark follow-up as complete' },
        summary: {
          es: 'Cerrar un seguimiento cuando el proceso clínico termina.',
          en: 'Close a follow-up when the clinical process is finished.',
        },
        why: {
          es: 'Permite limpiar el tablero y libera al veterinario para nuevos casos.',
          en: 'Clears the board and frees the vet for new cases.',
        },
        steps: {
          es: [
            'En el detalle del follow-up, pulsar Marcar completo.',
            'El estado cambia a completed y completed_date se autopobla.',
          ],
          en: [
            'On follow-up detail, click Mark complete.',
            'Status changes to completed and completed_date is auto-filled.',
          ],
        },
        route: '/veterinarian/follow-ups/[id]',
        endpoints: ['PATCH /api/follow-ups/:id/status/'],
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
          es: 'Tabla global filtrable por estado de verificación y ciudad.',
          en: 'Global table filterable by verification status and city.',
        },
        why: {
          es: 'Es el punto de partida del rol. Desde aquí el web manager entiende el universo de refugios.',
          en: 'The role entry point. From here the web manager understands the shelter universe.',
        },
        steps: {
          es: [
            'Entrar a /web-manager/shelters.',
            'Aplicar chips de filtro: pending, verified, rejected.',
            'Abrir un refugio para ver su info y solicitudes asociadas.',
          ],
          en: [
            'Go to /web-manager/shelters.',
            'Apply filter chips: pending, verified, rejected.',
            'Open a shelter to view its info and linked applications.',
          ],
        },
        route: '/web-manager/shelters',
        endpoints: ['GET /api/shelters/'],
        tips: {
          es: [
            'Si ves muchos refugios pending, coordina con admin para acelerar aprobaciones.',
          ],
          en: [
            'If many shelters are pending, coordinate with admin to speed up approvals.',
          ],
        },
        keywords: ['shelters', 'refugios', 'verificacion', 'lista refugios'],
      },
      {
        id: 'wm-shelter-detail',
        audience: 'web_manager',
        title: { es: 'Detalle de refugio', en: 'Shelter detail' },
        summary: {
          es: 'Dos pestañas: información del refugio y solicitudes de sus animales.',
          en: 'Two tabs: shelter information and applications for its animals.',
        },
        why: {
          es: 'Unifica en una vista todo lo necesario para supervisar un refugio específico.',
          en: 'Combines in a single view everything needed to supervise a specific shelter.',
        },
        steps: {
          es: [
            'Abrir /web-manager/shelters/:id.',
            'Revisar info y estado de verificación.',
            'Cambiar a la pestaña Aplicaciones para ver estado por animal.',
            'Desde ahí, asignar veterinario si un follow-up está pending.',
          ],
          en: [
            'Open /web-manager/shelters/:id.',
            'Review info and verification status.',
            'Switch to the Applications tab to see status per animal.',
            'From there, assign a veterinarian if a follow-up is pending.',
          ],
        },
        route: '/web-manager/shelters/[id]',
        endpoints: ['GET /api/shelters/:id/', 'GET /api/adoptions/shelter/:id/'],
        keywords: ['detalle refugio', 'shelter detail', 'asignar vet'],
      },
      {
        id: 'wm-applications-board',
        audience: 'web_manager',
        title: { es: 'Tablero global de solicitudes', en: 'Global applications board' },
        summary: {
          es: 'Todas las solicitudes de adopción de todos los refugios con filtros de estado y fecha.',
          en: 'All adoption applications across all shelters with status and date filters.',
        },
        why: {
          es: 'Detecta solicitudes estancadas (aging) y permite intervenir antes de que caduque interés.',
          en: 'Detects stalled (aging) applications and lets you intervene before interest fades.',
        },
        steps: {
          es: [
            'Entrar a /web-manager/applications.',
            'Filtrar por status, shelter, date_from, date_to.',
            'Identificar solicitudes con muchos días en un mismo estado y escalar al refugio.',
          ],
          en: [
            'Go to /web-manager/applications.',
            'Filter by status, shelter, date_from, date_to.',
            'Spot applications stuck for many days in one state and escalate to the shelter.',
          ],
        },
        route: '/web-manager/applications',
        endpoints: ['GET /api/adoptions/'],
        tips: {
          es: [
            'Regla de oro: una aplicación más de 10 días en reviewing suele necesitar un empujón manual.',
          ],
          en: [
            'Rule of thumb: an application over 10 days in reviewing usually needs a manual nudge.',
          ],
        },
        keywords: ['applications board', 'solicitudes todas', 'cross-shelter', 'seguimiento aplicaciones'],
      },
      {
        id: 'wm-assign-veterinarian',
        audience: 'web_manager',
        title: { es: 'Asignar veterinario a un follow-up', en: 'Assign a veterinarian to a follow-up' },
        summary: {
          es: 'Seleccionar veterinario disponible para cubrir un seguimiento post-adopción.',
          en: 'Pick an available veterinarian to cover a post-adoption follow-up.',
        },
        why: {
          es: 'Sin asignación, el seguimiento queda sin responsable y corre riesgo de caer en overdue.',
          en: 'Without assignment, the follow-up has no owner and risks falling into overdue status.',
        },
        steps: {
          es: [
            'Desde el detalle de la aplicación/shelter, pulsar Asignar veterinario.',
            'Elegir un veterinario del dropdown (viene de /api/admin/users/veterinarians/).',
            'Confirmar — se dispara notificación al veterinario.',
          ],
          en: [
            'From application/shelter detail, click Assign veterinarian.',
            'Select a vet from the dropdown (data from /api/admin/users/veterinarians/).',
            'Confirm — notification is dispatched to the vet.',
          ],
        },
        endpoints: ['GET /api/admin/users/veterinarians/', 'PATCH /api/follow-ups/:id/assign/'],
        keywords: ['assign', 'asignar', 'veterinario', 'follow-up'],
      },
      {
        id: 'wm-campaigns',
        audience: 'web_manager',
        title: { es: 'Campañas transversales', en: 'Cross-shelter campaigns' },
        summary: {
          es: 'Consultar todas las campañas, abrir detalle y crear campañas de plataforma si aplica.',
          en: 'Consult all campaigns, open details, and create platform-wide campaigns if applicable.',
        },
        why: {
          es: 'El web manager apoya a refugios con campañas globales (emergencias, aliados, eventos).',
          en: 'The web manager supports shelters with global campaigns (emergencies, allies, events).',
        },
        steps: {
          es: [
            'Entrar a /web-manager/campaigns.',
            'Crear nueva con /web-manager/campaigns/new o abrir una existente.',
          ],
          en: [
            'Go to /web-manager/campaigns.',
            'Create new at /web-manager/campaigns/new or open an existing one.',
          ],
        },
        route: '/web-manager/campaigns',
        keywords: ['campañas wm', 'campaigns web manager', 'global'],
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
        id: 'admin-dashboard',
        audience: 'admin',
        title: { es: 'Dashboard de plataforma', en: 'Platform dashboard' },
        summary: {
          es: 'KPIs: usuarios, refugios, animales, solicitudes, donaciones y apadrinamientos.',
          en: 'KPIs: users, shelters, animals, applications, donations, and sponsorships.',
        },
        why: {
          es: 'Es el pulso de la plataforma y el punto de partida diario para un admin.',
          en: 'The platform pulse and the daily starting point for an admin.',
        },
        steps: {
          es: [
            'Entrar a /admin/dashboard.',
            'Revisar KPIs y alertas.',
            'Navegar a la sección relevante (shelters, metrics, blog).',
          ],
          en: [
            'Go to /admin/dashboard.',
            'Review KPIs and alerts.',
            'Jump to the relevant section (shelters, metrics, blog).',
          ],
        },
        route: '/admin/dashboard',
        endpoints: ['GET /api/admin/dashboard/'],
        keywords: ['admin dashboard', 'kpis', 'metricas globales'],
      },
      {
        id: 'admin-approve-shelters',
        audience: 'admin',
        title: { es: 'Aprobar o rechazar refugios', en: 'Approve or reject shelters' },
        summary: {
          es: 'Revisa refugios con verification_status=pending y actúa.',
          en: 'Review shelters with verification_status=pending and act.',
        },
        why: {
          es: 'Un refugio no publica animales con visibilidad plena hasta que está verified.',
          en: 'A shelter does not fully publish animals until it is verified.',
        },
        steps: {
          es: [
            'Entrar a /admin/shelters/approve.',
            'Revisar documentación y datos.',
            'Aprobar (verification_status=verified + verified_at=now) o rechazar.',
          ],
          en: [
            'Go to /admin/shelters/approve.',
            'Review documentation and data.',
            'Approve (verification_status=verified + verified_at=now) or reject.',
          ],
        },
        route: '/admin/shelters/approve',
        endpoints: ['PATCH /api/shelters/:id/verify/'],
        keywords: ['approve shelters', 'aprobar refugios', 'verificar'],
      },
      {
        id: 'admin-approve-campaigns',
        audience: 'admin',
        title: { es: 'Aprobar campañas de refugios', en: 'Approve shelter campaigns' },
        summary: {
          es: 'Las campañas enviadas por refugios quedan en pending hasta que se revisan.',
          en: 'Shelter-submitted campaigns stay pending until reviewed.',
        },
        why: {
          es: 'Previene campañas engañosas o mal configuradas antes de que acepten donaciones.',
          en: 'Prevents misleading or misconfigured campaigns before they accept donations.',
        },
        steps: {
          es: [
            'Filtrar campañas por approval_status=pending.',
            'Verificar descripción, meta, fechas y evidencia.',
            'Aprobar o rechazar con razón.',
          ],
          en: [
            'Filter campaigns by approval_status=pending.',
            'Verify description, goal, dates, and evidence.',
            'Approve or reject with reason.',
          ],
        },
        endpoints: ['PATCH /api/campaigns/:id/approval/'],
        keywords: ['approve campaigns', 'aprobar campañas', 'moderar'],
      },
      {
        id: 'admin-metrics',
        audience: 'admin',
        title: { es: 'Métricas detalladas', en: 'Detailed metrics' },
        summary: {
          es: 'Estadísticas de donaciones, tasas de adopción y retención.',
          en: 'Donation stats, adoption rates, and retention.',
        },
        why: {
          es: 'Permite medir salud del negocio y tomar decisiones de producto.',
          en: 'Measures business health and drives product decisions.',
        },
        steps: {
          es: [
            'Entrar a /admin/metrics.',
            'Revisar: promedio de solicitudes por animal, tiempo medio de adopción, retención 30d.',
          ],
          en: [
            'Go to /admin/metrics.',
            'Review: average applications per animal, mean adoption time, 30-day retention.',
          ],
        },
        route: '/admin/metrics',
        endpoints: ['GET /api/admin/metrics/'],
        keywords: ['metrics', 'metricas', 'kpi', 'retencion', 'adopcion promedio'],
      },
      {
        id: 'admin-blog-crud',
        audience: 'admin',
        title: { es: 'Gestionar blog', en: 'Manage blog' },
        summary: {
          es: 'Crear, editar, duplicar y calendarizar posts bilingües.',
          en: 'Create, edit, duplicate, and schedule bilingual posts.',
        },
        why: {
          es: 'Controla la voz editorial de la plataforma; impacta SEO y confianza.',
          en: 'Controls the platform editorial voice; drives SEO and trust.',
        },
        steps: {
          es: [
            'En /admin/blog listar posts y abrir calendario.',
            'Crear con /admin/blog/crear; editar con /admin/blog/:id/editar.',
            'Subir cover, llenar título/contenido bilingüe, SEO y categorías.',
          ],
          en: [
            'In /admin/blog list posts and open the calendar.',
            'Create via /admin/blog/crear; edit via /admin/blog/:id/editar.',
            'Upload cover, fill bilingual title/content, SEO, and categories.',
          ],
        },
        route: '/admin/blog',
        endpoints: ['POST /api/blog/admin/', 'PATCH /api/blog/admin/:id/'],
        keywords: ['blog crud', 'editar blog', 'posts', 'publicar articulo'],
      },
      {
        id: 'admin-moderation',
        audience: 'admin',
        title: { es: 'Cola de moderación', en: 'Moderation queue' },
        summary: {
          es: 'Señales de contenido reportado o sospechoso pendientes de revisión.',
          en: 'Reported or suspicious content signals awaiting review.',
        },
        why: {
          es: 'Protege a la comunidad de contenido dañino o engañoso.',
          en: 'Protects the community from harmful or misleading content.',
        },
        steps: {
          es: [
            'Entrar a /admin/moderation.',
            'Evaluar cada ítem y aplicar acción correspondiente.',
          ],
          en: [
            'Go to /admin/moderation.',
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
          es: 'Listado de Payments para conciliación con el proveedor (Wompi).',
          en: 'Payments list for reconciliation with the provider (Wompi).',
        },
        why: {
          es: 'Detecta pagos en error, declined o pending colgados y evita pérdida de dinero.',
          en: 'Detects stuck error, declined, or pending payments and prevents revenue loss.',
        },
        steps: {
          es: [
            'Entrar a /admin/payments.',
            'Filtrar por estado y proveedor_reference.',
            'Investigar y marcar como procesado o reintentar si aplica.',
          ],
          en: [
            'Go to /admin/payments.',
            'Filter by status and provider_reference.',
            'Investigate and mark as processed or retry if applicable.',
          ],
        },
        route: '/admin/payments',
        keywords: ['payments', 'pagos', 'auditoria', 'wompi'],
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
        id: 'cross-auth-jwt',
        audience: 'cross',
        title: { es: 'Autenticación JWT', en: 'JWT authentication' },
        summary: {
          es: 'Access token de 15 min + refresh token con auto-refresh en 401.',
          en: '15-min access token + refresh token with auto-refresh on 401.',
        },
        why: {
          es: 'La sesión del frontend depende de este flujo; si falla, ninguna acción autenticada funciona.',
          en: 'The frontend session depends on this flow; if it fails, no authenticated action works.',
        },
        steps: {
          es: [
            'Sign in devuelve access + refresh y el usuario.',
            'El interceptor de axios inyecta el access en cada request.',
            'Si el backend devuelve 401, el interceptor pide /auth/refresh y reintenta.',
            'Si el refresh falla, se cierra sesión y redirige a /sign-in.',
          ],
          en: [
            'Sign in returns access + refresh and the user.',
            'The axios interceptor injects the access on every request.',
            'If the backend returns 401, the interceptor calls /auth/refresh and retries.',
            'If refresh fails, session is cleared and user is redirected to /sign-in.',
          ],
        },
        endpoints: ['/auth/sign_in/', '/auth/refresh/', '/auth/validate_token/'],
        keywords: ['auth', 'jwt', 'login', 'refresh', 'token', 'sesion'],
      },
      {
        id: 'cross-notifications',
        audience: 'cross',
        title: { es: 'Notificaciones por evento', en: 'Event-driven notifications' },
        summary: {
          es: 'Los eventos crean NotificationLog; un task Huey envía el email localizado.',
          en: 'Events create NotificationLog; a Huey task sends the localized email.',
        },
        why: {
          es: 'Desacopla la lógica de negocio del envío de correo y permite reintentos y auditoría.',
          en: 'Decouples business logic from email sending and allows retries and auditing.',
        },
        steps: {
          es: [
            'Un evento (ej. application_approved) crea un NotificationLog.',
            'Se encola send_email_notification(log_id) en Huey.',
            'El worker renderiza el template localizado y envía el email.',
            'El log cambia a SENT o FAILED.',
          ],
          en: [
            'An event (e.g. application_approved) creates a NotificationLog.',
            'send_email_notification(log_id) is queued in Huey.',
            'The worker renders the localized template and sends the email.',
            'The log transitions to SENT or FAILED.',
          ],
        },
        tips: {
          es: [
            'Si un usuario reporta que no recibe emails, revisa NotificationLog por su user_id y estado.',
          ],
          en: [
            'If a user reports missing emails, check NotificationLog for their user_id and status.',
          ],
        },
        keywords: ['notifications', 'notificaciones', 'email', 'huey', 'log', 'template'],
      },
      {
        id: 'cross-payments',
        audience: 'cross',
        title: { es: 'Pagos (Wompi stub)', en: 'Payments (Wompi stub)' },
        summary: {
          es: 'Donaciones y apadrinamientos crean un Payment al confirmarse en el proveedor.',
          en: 'Donations and sponsorships create a Payment when confirmed at the provider.',
        },
        why: {
          es: 'Asegura trazabilidad entre la intención de donar y el cobro real.',
          en: 'Ensures traceability between donation intent and actual charge.',
        },
        steps: {
          es: [
            'El checkout crea Donation/Sponsorship (pending).',
            'Se llama a /api/payments/intent/ y se redirige al proveedor.',
            'Al volver, la confirmación crea un Payment y marca el registro como paid.',
          ],
          en: [
            'Checkout creates a Donation/Sponsorship (pending).',
            'A /api/payments/intent/ call redirects to the provider.',
            'On return, the confirmation creates a Payment and marks the record as paid.',
          ],
        },
        endpoints: ['/api/payments/intent/', '/api/payments/confirm/'],
        keywords: ['payments', 'wompi', 'pago', 'checkout', 'provider'],
      },
      {
        id: 'cross-i18n',
        audience: 'cross',
        title: { es: 'Bilingüe con next-intl', en: 'Bilingual with next-intl' },
        summary: {
          es: 'Español (default) e inglés vía /es/... y /en/... con paired fields en backend.',
          en: 'Spanish (default) and English via /es/... and /en/... with backend paired fields.',
        },
        why: {
          es: 'Evita archivos .po y permite contenido rico bilingüe en modelos (blog, animales, notas).',
          en: 'Avoids .po files and supports rich bilingual content in models (blog, animals, notes).',
        },
        steps: {
          es: [
            'Cada página vive bajo /[locale]/ y usa useTranslations().',
            'Los modelos con contenido bilingüe exponen *_es y *_en; el frontend lee según locale.',
            'LocaleSwitcher cambia la ruta preservando la vista actual.',
          ],
          en: [
            'Each page lives under /[locale]/ and uses useTranslations().',
            'Bilingual models expose *_es and *_en; the frontend reads based on locale.',
            'LocaleSwitcher swaps the route preserving the current view.',
          ],
        },
        keywords: ['i18n', 'next-intl', 'bilingue', 'es', 'en', 'idioma', 'locale'],
      },
      {
        id: 'cross-role-redirection',
        audience: 'cross',
        title: { es: 'Redirección por rol post-login', en: 'Post-login role redirection' },
        summary: {
          es: 'Cada rol aterriza en su propio dashboard después del login.',
          en: 'Each role lands on its own dashboard after login.',
        },
        why: {
          es: 'Minimiza clicks y deja claro el alcance del rol desde el primer momento.',
          en: 'Reduces clicks and clarifies role scope from the first moment.',
        },
        steps: {
          es: [
            'adopter → /my-profile.',
            'shelter_admin → /shelter/dashboard (o /shelter/onboarding si no tiene refugio).',
            'veterinarian → /veterinarian/follow-ups.',
            'web_manager → /web-manager/shelters.',
            'admin → /admin/dashboard.',
          ],
          en: [
            'adopter → /my-profile.',
            'shelter_admin → /shelter/dashboard (or /shelter/onboarding if no shelter).',
            'veterinarian → /veterinarian/follow-ups.',
            'web_manager → /web-manager/shelters.',
            'admin → /admin/dashboard.',
          ],
        },
        keywords: ['redirect', 'redireccion', 'post login', 'rol'],
      },
    ],
  },
];
