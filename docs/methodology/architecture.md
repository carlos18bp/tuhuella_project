# Mi Huella — Architecture Overview

> Last updated: 2026-03-29

## System Diagram

```mermaid
graph TB
    subgraph Frontend["Frontend (Next.js 16)"]
        AppRouter["App Router<br/>49 pages"]
        Stores["Zustand Stores<br/>10 stores"]
        Components["Shared UI<br/>31 ui + 10 layout/blog/providers"]
        Hooks["Hooks<br/>4 (useFAQs, useRequireAuth, useScrollReveal, useAuthSync)"]
        I18n["next-intl<br/>en/es"]
        GSAP["GSAP + Swiper<br/>+ Framer Motion"]
    end

    subgraph Backend["Backend (Django 6 + DRF)"]
        Views["FBV Views<br/>22 modules"]
        Serializers["Serializers<br/>44 files"]
        Models["Models<br/>24 classes"]
        Admin["Admin Site<br/>22 admin classes"]
        Commands["Management Commands<br/>21 commands"]
        Services["Services<br/>email + notification"]
    end

    subgraph External["External Services"]
        Google["Google OAuth"]
        Wompi["Wompi Payments<br/>(placeholder)"]
        Redis["Redis<br/>(Huey queue)"]
        DB["SQLite (dev)<br/>MySQL (prod)"]
    end

    AppRouter --> Stores
    Stores -->|Axios| Views
    Views --> Serializers
    Serializers --> Models
    Models --> DB
    Views -->|JWT| Google
    Views -->|stub| Wompi
    Commands --> Models
    Backend --> Redis
```

## Data Model Relationships

```mermaid
erDiagram
    User ||--o{ Shelter : owns
    User ||--o{ AdoptionApplication : submits
    User ||--o{ Donation : makes
    User ||--o{ Sponsorship : creates
    User ||--o{ Favorite : has
    User ||--o| AdopterIntent : publishes

    Shelter ||--o{ Animal : houses
    Shelter ||--o{ Campaign : runs
    Shelter ||--o{ UpdatePost : publishes
    Shelter ||--o{ ShelterInvite : sends

    Animal ||--o{ AdoptionApplication : receives
    Animal ||--o{ Sponsorship : receives
    Animal ||--o{ Favorite : receives

    Campaign ||--o{ Donation : receives

    Sponsorship ||--o| Subscription : has
    Donation ||--o| Payment : has
    Sponsorship ||--o| Payment : has

    AdopterIntent ||--o{ ShelterInvite : receives

    User ||--o| NotificationPreference : configures
    User ||--o{ NotificationLog : receives

    BlogPost }o--|| User : authored_by
    AmountOption }o--o| Campaign : linked_to
    FAQ ||--|| FAQ : standalone
    StrategicAlly ||--|| StrategicAlly : standalone
    VolunteerPosition ||--o{ VolunteerApplication : receives
    VolunteerApplication }o--|| User : submitted_by
    PasswordCode }o--|| User : belongs_to
```

## Models (24 classes across 21 files)

| # | Model | Key Fields |
|---|-------|------------|
| 1 | User | email, role, city, avatar, bio, housing_type, has_yard, has_other_pets, experience_level |
| 2 | Shelter | name, logo, cover_image, gallery, verification_status |
| 3 | Animal | species, age, gender, size, GalleryField |
| 4 | Adoption (AdoptionApplication) | form_answers (JSON), status |
| 5 | Campaign | goal_amount, raised_amount, progress_percentage, evidence_gallery |
| 6 | Donation | amount, shelter FK, campaign FK (both nullable) |
| 7 | Sponsorship | frequency (monthly/one_time), animal FK |
| 8 | Payment | amount, donation/sponsorship FK (both nullable) |
| 9 | UpdatePost | shelter, campaign, animal links |
| 10 | AdopterIntent | preferences (JSON), OneToOne User |
| 11 | ShelterInvite | unique_together shelter+intent |
| 12 | Subscription | OneToOne Sponsorship |
| 13 | Favorite | User + Animal through table, note |
| 14 | NotificationPreference | user FK, event_key, channel, unique_together |
| 15 | NotificationLog | user FK, event_key, channel, metadata (JSON), is_read |
| 16 | PasswordCode | kept from template |
| 17 | BlogPost | bilingual, JSON content, SEO, categories |
| 18 | DonationAmountOption | amount, label, is_active, order |
| 19 | SponsorshipAmountOption | amount, label, is_active, order |
| 20 | FAQTopic | slug, display_name_es/en, order |
| 21 | FAQItem | topic FK, question_es/en, answer_es/en |
| 22 | StrategicAlly | partner organizations |
| 23 | VolunteerPosition | volunteer opportunities, 12 categories |
| 24 | VolunteerApplication | position FK, user FK, motivation, status (pending/reviewed/accepted/rejected) |

## Request Flow

```mermaid
sequenceDiagram
    participant Browser
    participant NextJS as Next.js (SSR/CSR)
    participant Zustand as Zustand Store
    participant DRF as Django REST API
    participant DB as Database

    Browser->>NextJS: Navigate to /animales
    NextJS->>Browser: Render page shell (SSR)
    Browser->>Zustand: useAnimalStore.fetchAnimals()
    Zustand->>DRF: GET /api/animals/?species=dog
    DRF->>DB: SELECT * FROM animal WHERE ...
    DB-->>DRF: QuerySet
    DRF-->>Zustand: JSON response
    Zustand-->>Browser: Re-render with data
```

## Directory Structure

```
tuhuella_project/
├── backend/
│   ├── base_feature_app/
│   │   ├── models/          # 21 model files (24 classes)
│   │   ├── serializers/     # 44 serializer files
│   │   ├── views/           # 22 view modules
│   │   ├── urls/            # 20 URL modules
│   │   ├── management/commands/  # 21 commands
│   │   ├── services/        # email_service, notification_service, notification_templates
│   │   ├── utils/           # auth_utils, email_utils, recaptcha
│   │   ├── templates/emails/ # Branded HTML email templates (base + 3 specific)
│   │   ├── tests/           # 57 test files (models, serializers, views, services, utils, commands)
│   │   └── admin.py         # MiHuellaAdminSite (22 admin classes)
│   ├── base_feature_project/
│   │   ├── settings.py      # Base settings
│   │   ├── settings_prod.py # Production overrides
│   │   └── urls.py          # Root URL config
│   ├── django_attachments/  # Custom image handling
│   └── conftest.py          # Root pytest config
├── frontend/
│   ├── app/[locale]/        # 49 page.tsx files
│   │   ├── page.tsx         # Home
│   │   ├── template.tsx     # Framer Motion transitions
│   │   ├── layout.tsx       # Root layout (Inter, Header, Footer)
│   │   └── providers.tsx    # Google OAuth + Theme provider
│   ├── components/
│   │   ├── layout/          # Header, Footer, Sidebar, PageTransition, LocaleSwitcher, ThemeToggle (6)
│   │   ├── blog/            # BlogContentRenderer, ReadingProgressBar (2)
│   │   ├── ui/              # 31 shared components
│   │   └── providers/       # ThemeProvider, AuthSyncProvider (2)
│   ├── lib/
│   │   ├── stores/          # 10 Zustand stores
│   │   ├── hooks/           # useFAQs, useRequireAuth, useScrollReveal, useAuthSync
│   │   ├── services/        # http.ts, tokens.ts
│   │   ├── i18n/            # config.ts
│   │   ├── types.ts         # 40 exported types
│   │   └── constants.ts     # ROUTES, API_ENDPOINTS
│   ├── i18n/                # next-intl request config
│   ├── messages/            # en.json, es.json
│   └── e2e/                 # 16 Playwright spec files + flow-definitions.json (75 flows)
├── docs/
│   ├── methodology/         # PRD, technical, architecture, errors, lessons
│   └── *.md                 # Standards & guidelines (9 files)
├── scripts/                 # CI, quality gate, systemd
└── tasks/                   # Active context & task plan
```

## Security Architecture

| Layer | Mechanism |
|-------|-----------|
| Authentication | JWT (access + refresh) via `djangorestframework-simplejwt` |
| OAuth | Google sign-in with server-side token verification |
| Authorization | Role-based (`adopter`, `shelter_admin`, `admin`) + object-level queryset filtering |
| CSRF | Django middleware (session endpoints) |
| Input Validation | DRF serializers (server) + Zod-ready (client) |
| Secrets | `.env` files, never committed |
| Headers | HSTS, X-Frame-Options, Content-Type-Nosniff (prod) |

## Testing Architecture

| Layer | Count | Tool |
|-------|-------|------|
| Backend tests | 57 files | pytest + pytest-django |
| Frontend unit tests | 107 files | Jest + Testing Library |
| E2E tests | 16 spec files | Playwright |
| E2E flow definitions | 75 flows | flow-definitions.json |
