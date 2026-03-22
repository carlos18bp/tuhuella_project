# Mi Huella — Architecture Overview

## System Diagram

```mermaid
graph TB
    subgraph Frontend["Frontend (Next.js 16)"]
        AppRouter["App Router<br/>33 pages"]
        Stores["Zustand Stores<br/>9 stores"]
        Components["Shared UI<br/>7+ components"]
        I18n["next-intl<br/>en/es"]
        GSAP["GSAP + Swiper<br/>+ Framer Motion"]
    end

    subgraph Backend["Backend (Django 5 + DRF)"]
        Views["FBV Views<br/>13 modules"]
        Serializers["Serializers<br/>34 files"]
        Models["Models<br/>16 classes"]
        Admin["Admin Site<br/>6 sections"]
        Commands["Management Commands<br/>12 commands"]
        Services["Services<br/>email_service"]
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
```

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
│   │   ├── models/          # 16 model files
│   │   ├── serializers/     # 34 serializer files
│   │   ├── views/           # 13 view modules
│   │   ├── urls/            # 13 URL modules
│   │   ├── management/commands/  # 12 commands
│   │   ├── services/        # email_service
│   │   ├── tests/           # pytest tests
│   │   └── admin.py         # MiHuellaAdminSite
│   ├── base_feature_project/
│   │   ├── settings.py      # Base settings
│   │   ├── settings_prod.py # Production overrides
│   │   └── urls.py          # Root URL config
│   └── conftest.py          # Root pytest config
├── frontend/
│   ├── app/                 # 33 page.tsx files
│   │   ├── page.tsx         # Home
│   │   ├── template.tsx     # Framer Motion transitions
│   │   ├── layout.tsx       # Root layout (Inter, Header, Footer)
│   │   └── providers.tsx    # Google OAuth provider
│   ├── components/
│   │   ├── layout/          # Header, Footer, PageTransition, LocaleSwitcher
│   │   └── ui/              # AnimalCard, ShelterCard, CampaignCard, etc.
│   ├── lib/
│   │   ├── stores/          # 9 Zustand stores
│   │   ├── hooks/           # useRequireAuth, useScrollReveal
│   │   ├── services/        # http.ts, tokens.ts
│   │   ├── i18n/            # config.ts
│   │   ├── types.ts         # 14 domain types
│   │   └── constants.ts     # ROUTES, API_ENDPOINTS
│   ├── i18n/                # next-intl request config
│   ├── messages/            # en.json, es.json
│   └── e2e/                 # Playwright specs + flow-definitions.json
├── docs/
│   ├── methodology/         # PRD, technical, architecture
│   └── *.md                 # Standards & guidelines
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
