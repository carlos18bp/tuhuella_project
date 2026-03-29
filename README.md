# Mi Huella — Adopta, Apadrina, Transforma

> Plataforma de adopción y apadrinamiento animal. Conectamos refugios con personas que quieren dar un hogar o apoyar a un animal.

[![Django](https://img.shields.io/badge/Django-6.0+-092E20?style=flat&logo=django)](https://www.djangoproject.com/)
[![Next.js](https://img.shields.io/badge/Next.js-16+-000000?style=flat&logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19+-61DAFB?style=flat&logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5+-3178C6?style=flat&logo=typescript)](https://www.typescriptlang.org/)
[![Python](https://img.shields.io/badge/Python-3.12+-3776AB?style=flat&logo=python)](https://www.python.org/)

---

## Descripción

Mi Huella es una plataforma web que conecta refugios de animales con personas interesadas en adoptar, apadrinar o donar. Los refugios verificados pueden publicar animales, gestionar solicitudes de adopción, y crear campañas de recaudación. Los adoptantes pueden explorar animales, enviar solicitudes, apadrinar mensualmente y donar a campañas.

### Roles del sistema

- **Adopter** — Explora animales, envía solicitudes, apadrina, dona, marca favoritos
- **Shelter Admin** — Gestiona animales, revisa solicitudes, crea campañas, envía invitaciones
- **Admin** — Aprueba refugios, modera contenido, visualiza métricas

---

## Tabla de Contenidos

- [Tecnologías](#tecnologías)
- [Estructura](#estructura)
- [Inicio Rápido](#inicio-rápido)
- [Backend (Django)](#backend)
- [Frontend (Next.js)](#frontend)
- [E2E Flows](#e2e-flows)

---

## ✨ Features

### Backend (Django)
- ✅ **Django REST Framework** - Complete RESTful API with function-based views
- ✅ **JWT Authentication** - Simple JWT for tokens
- ✅ **Google OAuth** - Sign in with Google (token verification via `requests`)
- ✅ **Password Reset** - Email-based passcode flow with `PasswordCode` model
- ✅ **Email Service** - Centralized email logic (`services/email_service.py`)
- ✅ **Custom User Model** - User with email as identifier and role-based permissions
- ✅ **Complete CRUD** - Shelter, Animal, Adoption, Campaign, Donation, Sponsorship, Payment, UpdatePost, AdopterIntent, ShelterInvite, Favorite, Notification
- ✅ **Customized Django Admin** - Organized by sections
- ✅ **File Management** - `django-attachments` for images and files
- ✅ **Image Thumbnails** - `easy-thumbnails` for automatic resizing
- ✅ **Automatic File Cleanup** - `django-cleanup` removes orphan files
- ✅ **Fake Data Generation** - Management commands with Faker + factory-boy
- ✅ **Complete Tests** - Pytest for models, serializers, views, admin, forms, and utilities
- ✅ **Linting** - Ruff for fast Python linting
- ✅ **Coverage Reporting** - Custom terminal coverage report with top-N focus files
- ✅ **CORS Configured** - Ready for local development
- ✅ **Environment Management** - `python-dotenv` with centralized settings

### Frontend (Next.js + React)
- ✅ **Next.js 16 + App Router** - Server and client components with TypeScript
- ✅ **React 19** - Latest React with hooks and server components
- ✅ **TypeScript** - Full type safety across the project
- ✅ **Zustand** - State management with `persist` middleware (cart, locale)
- ✅ **Axios** - HTTP client with interceptors and automatic token refresh
- ✅ **TailwindCSS 4** - Utility-first styling via `@tailwindcss/postcss`
- ✅ **Google Login** - `@react-oauth/google` integration
- ✅ **next-intl** - Multi-language internationalization (en/es)
- ✅ **Cookie-based Auth** - `js-cookie` for token storage
- ✅ **JWT Decode** - `jwt-decode` for client-side token inspection
- ✅ **Custom Hooks** - `useRequireAuth` for protected routes
- ✅ **Reusable Components** - Carousels, cards, layout components
- ✅ **Jest 30** - Unit and component tests with React Testing Library
- ✅ **Playwright** - Modular E2E tests with flow coverage reporter

### DevOps & Tooling
- ✅ **Git Configuration** - Complete `.gitignore`
- ✅ **Pre-commit Hook** - Test quality gate on staged test files
- ✅ **ESLint** - TypeScript linting with `eslint-config-next` + `eslint-plugin-playwright`
- ✅ **Ruff** - Python linting
- ✅ **Environment Variables** - Documented `.env.example` files (backend + frontend)
- ✅ **CI Workflow** - GitHub Actions test quality gate
- ✅ **Documentation** - Complete architecture, testing, and quality standards

### Production Infrastructure
- ✅ **Settings Split** - Base / Dev / Prod settings via `DJANGO_SETTINGS_MODULE`
- ✅ **Security Hardening** - HSTS, secure cookies, SSL redirect (production)
- ✅ **Automated Backups** - django-dbbackup with Huey scheduler (every 20 days, 90-day retention)
- ✅ **Query Profiling** - django-silk behind `ENABLE_SILK` flag (staff-only access)
- ✅ **Task Queue** - Huey + Redis for background tasks
- ✅ **Systemd Templates** - Service files for Huey in production

---

## 🛠 Technologies

### Backend
| Technology | Version | Description |
|------------|---------|-------------|
| Python | 3.12+ | Programming language |
| Django | 6.0+ | Web framework |
| Django REST Framework | 3.16+ | REST API toolkit |
| Simple JWT | 5.5+ | JWT authentication |
| django-cors-headers | 4.9+ | CORS middleware |
| django-attachments | Custom | File management |
| django-cleanup | 9.0+ | Automatic orphan file removal |
| easy-thumbnails | 2.10+ | Image thumbnail generation |
| python-dotenv | 1.2+ | Environment variable management |
| requests | 2.32+ | HTTP library (Google OAuth verification) |
| Faker | 40.5+ | Fake data generation |
| factory-boy | 3.3+ | Test factories |
| freezegun | 1.5+ | Time mocking for tests |
| Pytest | 9.0+ | Testing framework |
| pytest-cov | 7.0+ | Coverage plugin |
| Ruff | 0.15+ | Python linter |
| django-dbbackup | 4.0+ | Database & media backup automation |
| django-silk | 5.0+ | Query profiling & N+1 detection |
| Huey | 2.5+ | Lightweight task queue |
| Redis | 4.0+ | Message broker for Huey |

### Frontend
| Technology | Version | Description |
|------------|---------|-------------|
| Next.js | 16.1+ | React framework with App Router |
| React | 19.2+ | UI library |
| TypeScript | 5+ | Type-safe JavaScript |
| Zustand | 5.0+ | State management |
| Axios | 1.13+ | HTTP client |
| TailwindCSS | 4.2+ | CSS framework |
| next-intl | 4.8+ | Internationalization |
| @react-oauth/google | 0.13+ | Google OAuth |
| js-cookie | 3.0+ | Cookie management |
| jwt-decode | 4.0+ | JWT token decoding |
| ESLint | 9.39+ | TypeScript linting |
| eslint-plugin-playwright | 2.7+ | Playwright lint rules |
| Jest | 30.2+ | Unit testing |
| @testing-library/react | 16.3+ | React component testing |
| Playwright | 1.58+ | E2E testing |

---

## 📁 Project Structure

```
tuhuella_project/
├── backend/                              # Django Backend
│   ├── base_feature_app/                # Main app
│   │   ├── models/                      # User, Shelter, Animal, Adoption, Campaign,
│   │   │                                # Donation, Sponsorship, Payment, UpdatePost,
│   │   │                                # AdopterIntent, ShelterInvite, Subscription,
│   │   │                                # Favorite, Notification, PasswordCode
│   │   ├── serializers/                 # List, Detail, CreateUpdate per model (~34 files)
│   │   ├── views/                       # Function-based CRUD views + auth + admin + payment
│   │   ├── urls/                        # URL routing by domain module
│   │   ├── services/                    # Business logic (email_service)
│   │   ├── utils/                       # Utility functions (auth_utils)
│   │   ├── tests/                       # Tests (models, serializers, views, commands, utils)
│   │   ├── admin.py                     # Custom MiHuellaAdminSite organized by sections
│   │   └── management/commands/         # create_fake_data, delete_fake_data, create_users, etc.
│   ├── base_feature_project/            # Settings and configuration
│   ├── django_attachments/              # File management app
│   ├── conftest.py                      # Root pytest config (coverage report)
│   ├── pytest.ini                       # Pytest configuration
│   ├── requirements.txt                 # Python dependencies
│   └── .env.example                     # Environment variables (example)
│
├── frontend/                             # Next.js + React Frontend
│   ├── app/                             # Next.js App Router
│   │   ├── page.tsx                     # Home / landing page
│   │   ├── layout.tsx                   # Root layout (Inter font, Header + Footer)
│   │   ├── providers.tsx                # Google OAuth provider
│   │   ├── globals.css                  # Stone palette, teal/amber/emerald accents
│   │   ├── animales/                    # Animal listing + [animalId] detail
│   │   ├── refugios/                    # Shelter listing + [shelterId] profile
│   │   ├── campanas/                    # Campaign listing + [campaignId] detail
│   │   ├── busco-adoptar/               # Public adopter intents
│   │   ├── favoritos/                   # User favorites
│   │   ├── mis-solicitudes/             # User adoption applications
│   │   ├── mis-donaciones/              # User donation history
│   │   ├── mis-apadrinamientos/         # User sponsorships
│   │   ├── mi-intencion/                # User adopter intent
│   │   ├── mi-perfil/                   # User profile
│   │   ├── refugio/                     # Shelter panel (dashboard, animales, solicitudes,
│   │   │                                # campanas, donaciones, configuracion, onboarding)
│   │   ├── admin/                       # Admin panel (dashboard, refugios/aprobar,
│   │   │                                # moderacion, pagos, metricas)
│   │   ├── checkout/                    # Donation, sponsorship, confirmation (placeholder)
│   │   ├── sign-in/                     # Sign in page
│   │   ├── sign-up/                     # Sign up page
│   │   ├── forgot-password/             # Password reset page
│   │   ├── faq/                         # FAQ page
│   │   └── __tests__/                   # Page-level tests
│   ├── components/                      # React components
│   │   └── layout/                      # Header (glassmorphism + role nav), Footer
│   ├── lib/                             # Libraries and utilities
│   │   ├── stores/                      # Zustand stores (auth, shelter, animal, adoption,
│   │   │                                # campaign, donation, sponsorship, favorite, locale)
│   │   ├── services/                    # API client + token utilities
│   │   ├── hooks/                       # useRequireAuth
│   │   ├── i18n/                        # Internationalization config (en/es)
│   │   ├── types.ts                     # Domain type definitions
│   │   └── constants.ts                 # Routes, API endpoints, cookie keys
│   ├── e2e/                             # Modular E2E tests (Playwright)
│   │   ├── auth/                        # Auth tests
│   │   ├── app/                         # App flow tests
│   │   ├── public/                      # Public page tests
│   │   ├── helpers/                     # Flow tags, test utils
│   │   ├── fixtures.ts                  # E2E test fixtures
│   │   └── flow-definitions.json        # Mi Huella E2E flow definitions
│   ├── package.json                     # npm dependencies
│   ├── playwright.config.ts             # Playwright configuration
│   └── .env.example                     # Environment variables (example)
│
├── scripts/                              # Test & quality tooling
├── docs/                                 # Project documentation
├── .github/workflows/                    # CI pipelines
├── .pre-commit-config.yaml              # Pre-commit hooks
└── README.md                             # This file
```

---

## 🚀 Quick Start

### Prerequisites

- **Python 3.12+**
- **Node.js 20+** and **npm**
- **Git**

### 1. Clone Repository

```bash
git clone https://github.com/carlos18bp/tuhuella_project.git
cd tuhuella_project
```

### 2. Backend Setup

```bash
# Create virtual environment
python3 -m venv backend/venv

# Activate virtual environment
source backend/venv/bin/activate  # Linux/Mac
# backend\venv\Scripts\activate   # Windows

# Install dependencies
pip install -r backend/requirements.txt

# Configure environment variables
cp backend/.env.example backend/.env
# Edit backend/.env with your values

# Run migrations
cd backend
python manage.py migrate

# Create superuser
python manage.py createsuperuser

# Create test data with defaults (optional)
python manage.py create_fake_data

# Create test data with custom count (optional)
python manage.py create_fake_data 20

# Delete test data (optional — protects superusers)
python manage.py delete_fake_data --confirm

# Start server
python manage.py runserver
```

Backend will be available at: `http://localhost:8000`

### 3. Frontend Setup

```bash
# In a new terminal
cd frontend

# Install dependencies
npm install

# Configure environment variables
cp .env.example .env.local
# Edit .env.local with your values

# Start development server
npm run dev
```

Frontend will be available at: `http://localhost:3000`

### 4. Access

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000/api
- **Django Admin**: http://localhost:8000/admin

---

## 🐍 Backend (Django)

### Environment Configuration

Copy the example file and configure your environment:

```bash
cp backend/.env.example backend/.env
# Edit backend/.env with your values
```

See `backend/.env.example` for all available options grouped by category (environment, CORS, database, JWT, email, Redis, backups, Silk profiling, API keys).

**Settings files:**
- `settings.py` — Base/shared configuration (used by default)
- `settings_dev.py` — Development overrides (`DEBUG=True`, console email)
- `settings_prod.py` — Production hardening (`DEBUG=False`, security headers, required secret validation)

In production, set: `DJANGO_SETTINGS_MODULE=base_feature_project.settings_prod`

**Generate new SECRET_KEY:**

```bash
python -c "from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())"
```

### Backups

Automated backups run every 20 days via Huey task queue. Backups are stored in `/var/backups/mi_huella/` with 90-day retention (5 backups).

Manual backup:
```bash
cd backend
source venv/bin/activate
python manage.py dbbackup --compress
python manage.py mediabackup --compress
```

### Performance Monitoring

Query profiling is powered by [django-silk](https://github.com/jazzband/django-silk) and is **disabled by default**. Enable it by setting `ENABLE_SILK=true` in your `.env`.

#### What Silk captures

Only `/api/` requests are intercepted (`SILKY_INTERCEPT_FUNC`). For each recorded request Silk stores:

- Request metadata: path, method, status code, response time
- Every SQL query: SQL text, execution time, query count per request

> **No Python profiler, no request/response bodies, no `/silk/` UI.** The dashboard is intentionally not exposed — this setup is for automated DB-level monitoring only (cron reports + garbage collection).

#### Key settings (configurable via `.env`)

| Variable | Default | Description |
|----------|---------|-------------|
| `ENABLE_SILK` | `false` | Master switch — adds silk to INSTALLED_APPS and middleware |
| `SLOW_QUERY_THRESHOLD_MS` | `500` | Queries slower than this (ms) appear in the weekly report |
| `N_PLUS_ONE_THRESHOLD` | `10` | Requests with more queries than this are flagged as N+1 suspects |

#### Manual data cleanup

Use `silk_garbage_collect` to delete old profiling records:

```bash
cd backend
source venv/bin/activate

# Delete records older than 7 days (default)
python manage.py silk_garbage_collect

# Delete records older than 30 days
python manage.py silk_garbage_collect --days=30

# Preview what would be deleted (no destructive action)
python manage.py silk_garbage_collect --dry-run

# Combine: preview with custom retention
python manage.py silk_garbage_collect --days=14 --dry-run
```

Example output:
```
Silk records older than 2026-02-17 04:00:00+00:00:
  - Requests to delete: 1847
Deleted 1847 records
```

#### Automated Silk cron jobs (Huey)

When `ENABLE_SILK=true`, two periodic tasks run automatically:

**`silk_garbage_collection`** — runs daily at **4:00 AM**
- Calls `silk_garbage_collect --days=7` to purge records older than 7 days
- Keeps the profiling database lean without manual intervention

**`weekly_slow_queries_report`** — runs every **Monday at 8:00 AM**
- Scans the last 7 days of recorded data
- Appends a structured report to `backend/logs/silk-weekly-report.log`
- Reports two sections:
  - **Slow queries**: top 50 SQL queries exceeding `SLOW_QUERY_THRESHOLD_MS` (default 500 ms), ordered slowest first
  - **N+1 suspects**: top 20 requests with more than `N_PLUS_ONE_THRESHOLD` (default 10) queries, ordered by query count

Example report (`backend/logs/silk-weekly-report.log`):
```
============================================================
WEEKLY QUERY REPORT - 2026-02-24
============================================================

## SLOW QUERIES (>500ms)
----------------------------------------
[1230ms] /api/animals/ - SELECT "animal"."id", "animal"."name" FROM "animal" LEFT OUTER JOIN...
[874ms] /api/adoptions/ - SELECT "adoption_application"."id" FROM "adoption_application" INNER JOIN...
[612ms] /api/campaigns/ - SELECT COUNT(*) AS "__count" FROM "campaign"...

## POTENTIAL N+1 (>10 queries/request)
----------------------------------------
[34 queries] /api/animals/
[18 queries] /api/adoptions/
[11 queries] /api/campaigns/3/

============================================================
```

### Task Queue

This project uses Huey with Redis for background tasks:

| Task | Schedule | Description |
|------|----------|-------------|
| `scheduled_backup` | Days 1 & 21, 3:00 AM | DB and media backup |
| `silk_garbage_collection` | Daily, 4:00 AM | Clean old profiling data |
| `weekly_slow_queries_report` | Mondays, 8:00 AM | Performance report |

In production, ensure the Huey service is running:
```bash
sudo systemctl status base_feature_project-huey
```

### Available Models

| Model | Description | Main Fields |
|-------|-------------|------------|
| **User** | Custom user (email as identifier) | email, first_name, last_name, phone, city, role (adopter/shelter_admin/admin) |
| **Shelter** | Animal shelters | name, legal_name, description, city, address, phone, email, verification_status, owner (FK) |
| **Animal** | Animals for adoption | name, species, breed, age_range, gender, size, status, special_needs, gallery, shelter (FK) |
| **AdoptionApplication** | Adoption requests | animal (FK), user (FK), status, form_answers (JSON), notes |
| **Campaign** | Fundraising campaigns | title, description, goal_amount, raised_amount, status, shelter (FK) |
| **Donation** | One-time donations | amount, status, message, user (FK), shelter (FK), campaign (FK) |
| **Sponsorship** | Recurring animal sponsorships | amount, frequency, status, user (FK), animal (FK) |
| **Payment** | Payment transactions | provider (wompi), provider_reference, amount, status, metadata (JSON) |
| **UpdatePost** | Shelter/campaign updates | title, content, image, shelter (FK), campaign (FK), animal (FK) |
| **AdopterIntent** | Adopter search profiles | preferences (JSON), description, status, visibility, user (1-to-1) |
| **ShelterInvite** | Shelter → adopter invitations | message, status, shelter (FK), adopter_intent (FK) |
| **Subscription** | Recurring payment subscriptions | provider, interval, next_payment_at, status, sponsorship (1-to-1) |
| **Favorite** | User favorite animals | user (FK), animal (FK) |
| **NotificationPreference** | Notification settings | user (FK), event_key, channel, enabled |
| **NotificationLog** | Notification history | recipient (FK), event_key, channel, status, sent_at |
| **PasswordCode** | Password reset codes | user (FK), code, created_at, used |

### API Endpoints

#### Authentication
```
POST   /api/token/                                    # Get JWT tokens (access + refresh)
POST   /api/token/refresh/                             # Refresh JWT token
POST   /api/sign_in/                                   # Sign in (email + password)
POST   /api/sign_up/                                   # Register new user
POST   /api/google_login/                              # Sign in with Google OAuth
POST   /api/send_passcode/                             # Send password reset code via email
POST   /api/verify_passcode_and_reset_password/        # Verify code and reset password
POST   /api/update_password/                           # Update password (auth)
GET    /api/validate_token/                            # Validate current token (auth)
```

#### Shelters
```
GET    /api/shelters/                  # List shelters (public)
POST   /api/shelters/                  # Create shelter (auth)
GET    /api/shelters/<id>/             # Shelter detail
PATCH  /api/shelters/<id>/             # Update shelter (owner)
```

#### Animals
```
GET    /api/animals/                   # List animals (public, filterable)
POST   /api/animals/                   # Create animal (shelter_admin)
GET    /api/animals/<id>/              # Animal detail
PATCH  /api/animals/<id>/              # Update animal (shelter_admin)
```

#### Adoptions
```
GET    /api/adoptions/                 # List applications (auth)
POST   /api/adoptions/                 # Create application (adopter)
PATCH  /api/adoptions/<id>/status/     # Update application status (shelter_admin)
```

#### Campaigns
```
GET    /api/campaigns/                 # List campaigns (public)
POST   /api/campaigns/                 # Create campaign (shelter_admin)
GET    /api/campaigns/<id>/            # Campaign detail
PATCH  /api/campaigns/<id>/            # Update campaign (shelter_admin)
```

#### Donations
```
GET    /api/donations/                 # List donations (auth)
POST   /api/donations/                 # Create donation (auth)
```

#### Sponsorships
```
GET    /api/sponsorships/              # List sponsorships (auth)
POST   /api/sponsorships/              # Create sponsorship (auth)
```

#### Payments (Wompi placeholder)
```
POST   /api/payments/create-intent/    # Create payment intent
POST   /api/payments/webhook/          # Payment webhook callback
GET    /api/payments/<id>/status/      # Payment status
```

#### Favorites
```
GET    /api/favorites/                 # List favorites (auth)
POST   /api/favorites/                 # Add favorite (auth)
DELETE /api/favorites/<id>/            # Remove favorite (auth)
```

#### Adopter Intents
```
GET    /api/adopter-intents/           # List public intents
POST   /api/adopter-intents/           # Create intent (auth)
GET    /api/adopter-intents/me/        # Get own intent (auth)
PATCH  /api/adopter-intents/me/        # Update own intent (auth)
```

#### Shelter Invites
```
GET    /api/shelter-invites/           # List invites (auth)
POST   /api/shelter-invites/           # Create invite (shelter_admin)
```

#### Admin
```
GET    /api/admin/dashboard/           # Dashboard metrics (admin)
GET    /api/admin/pending-shelters/    # Pending shelters (admin)
POST   /api/admin/shelters/<id>/approve/ # Approve/reject shelter (admin)
GET    /api/admin/metrics/             # Detailed metrics (admin)
```

### Management Commands

#### Create Fake Data

```bash
# Create all data with defaults (users → shelters → animals → campaigns → donations → sponsorships)
python manage.py create_fake_data

# Create all data with custom count
python manage.py create_fake_data 20

# Individual commands
python manage.py create_users 10
python manage.py create_shelters 5
python manage.py create_animals 30
python manage.py create_campaigns 10
python manage.py create_donations 20
python manage.py create_sponsorships 15
```

**Note:** The `create_users` command never deletes superusers or staff.

#### Delete Fake Data

```bash
# Delete all fake data (protects superusers)
python manage.py delete_fake_data --confirm
```

#### Silk Profiling Data Cleanup

```bash
# Delete Silk records older than 7 days (default)
python manage.py silk_garbage_collect

# Custom retention period
python manage.py silk_garbage_collect --days=30

# Dry run — preview without deleting
python manage.py silk_garbage_collect --dry-run
```

> Requires `ENABLE_SILK=true`. This command is also run automatically every day at 4:00 AM by the Huey task queue.

### Django Admin

Admin is organized in logical sections:

- **👥 User Management**: Users, PasswordCodes
- **🏠 Shelter Management**: Shelters, ShelterInvites
- **🐾 Animal Management**: Animals, Favorites
- **� Adoption Management**: AdoptionApplications, AdopterIntents
- **💰 Campaigns & Donations**: Campaigns, Donations, Sponsorships, Payments, Subscriptions
- **📢 Content & Notifications**: UpdatePosts, NotificationPreferences, NotificationLogs

Access: http://localhost:8000/admin

---

## 🎨 Frontend (Next.js + React)

### Environment Variables

Create a `frontend/.env.local` file based on `frontend/.env.example`:

```bash
# Google OAuth (optional)
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your_google_client_id_here.apps.googleusercontent.com

# API Configuration (optional — defaults to /api which uses Next.js rewrites)
NEXT_PUBLIC_API_BASE_URL=/api

# Django backend origin used by Next.js rewrites and media proxy
NEXT_PUBLIC_BACKEND_ORIGIN=http://localhost:8000
```

**Note:** In Next.js, variables must start with `NEXT_PUBLIC_` to be accessible in the browser. Changes require a dev server restart.

### Store Structure (Zustand)

#### Auth Store (`lib/stores/authStore.ts`)
```typescript
// State
{ accessToken, refreshToken, user, isAuthenticated }

// Actions
signIn({ email, password })             // Authenticate via API
signUp({ email, password, ... })         // Register new user
googleLogin({ credential, ... })         // Sign in with Google
signOut()                                // Clear tokens + user
syncFromCookies()                        // Sync state from cookies
sendPasswordResetCode(email)             // Send reset code
resetPassword({ email, code, new_password }) // Verify code + reset
```

#### Shelter Store (`lib/stores/shelterStore.ts`)
```typescript
// State
{ shelters: [], shelter: null, loading, error }

// Actions
fetchShelters()                          // Fetch all shelters
fetchShelter(id)                         // Fetch single shelter
createShelter(data)                      // Register new shelter
updateShelter(id, data)                  // Update shelter info
```

#### Animal Store (`lib/stores/animalStore.ts`)
```typescript
// State
{ animals: [], animal: null, filters: {}, loading, error }

// Actions
fetchAnimals(filters?)                   // Fetch animals with optional filters
fetchAnimal(id)                          // Fetch single animal
createAnimal(data)                       // Create animal (shelter_admin)
updateAnimal(id, data)                   // Update animal (shelter_admin)
setFilters(filters)                      // Set filter state
```

#### Adoption Store (`lib/stores/adoptionStore.ts`)
```typescript
// State
{ applications: [], loading, error }

// Actions
fetchApplications()                      // Fetch user's applications
createApplication(data)                  // Submit adoption application
updateStatus(id, status)                 // Update application status (shelter_admin)
```

#### Campaign Store (`lib/stores/campaignStore.ts`)
```typescript
// State
{ campaigns: [], campaign: null, loading, error }

// Actions
fetchCampaigns()                         // Fetch all campaigns
fetchCampaign(id)                        // Fetch single campaign
```

#### Donation Store (`lib/stores/donationStore.ts`)
```typescript
// State
{ donations: [], loading, error }

// Actions
fetchDonations()                         // Fetch user's donations
createDonation(data)                     // Create donation
```

#### Sponsorship Store (`lib/stores/sponsorshipStore.ts`)
```typescript
// State
{ sponsorships: [], loading, error }

// Actions
fetchSponsorships()                      // Fetch user's sponsorships
```

#### Favorite Store (`lib/stores/favoriteStore.ts`)
```typescript
// State
{ favorites: [], loading, error }

// Actions
fetchFavorites()                         // Fetch user's favorites
```

#### Locale Store (`lib/stores/localeStore.ts`)
```typescript
// State (persisted via zustand/persist)
{ locale: 'en' }

// Actions
setLocale(locale)                        // Switch locale (en/es)
```

### Main Components

#### Layout
- **Header** - Glassmorphism navigation with role-aware links (adopter/shelter_admin/admin)
- **Footer** - Stone-100 footer with explore, account, and info columns

### Available Routes

| Route | Page | Description |
|-------|------|-------------|
| `/` | Home | Landing page with hero, featured animals, shelter spotlight |
| `/animales` | Animales | Animal listing with filters |
| `/animales/:id` | Animal Detail | Animal info, gallery, adoption/sponsorship CTAs |
| `/refugios` | Refugios | Shelter listing |
| `/refugios/:id` | Shelter Profile | Shelter info, animals, campaigns |
| `/campanas` | Campañas | Campaign listing with progress bars |
| `/campanas/:id` | Campaign Detail | Campaign detail with donation CTA |
| `/busco-adoptar` | Busco Adoptar | Public adopter intents |
| `/faq` | FAQ | Frequently asked questions |
| `/sign-in` | Sign In | Sign in (guest only) |
| `/sign-up` | Sign Up | Sign up (guest only) |
| `/forgot-password` | Forgot Password | Password reset flow |
| `/favoritos` | Favoritos | User's favorite animals (auth) |
| `/mis-solicitudes` | Mis Solicitudes | User's adoption applications (auth) |
| `/mis-donaciones` | Mis Donaciones | User's donation history (auth) |
| `/mis-apadrinamientos` | Mis Apadrinamientos | User's sponsorships (auth) |
| `/mi-intencion` | Mi Intención | User's adopter intent (auth) |
| `/mi-perfil` | Mi Perfil | User profile (auth) |
| `/refugio/onboarding` | Registrar Refugio | Shelter registration form (auth) |
| `/refugio/dashboard` | Panel Refugio | Shelter dashboard (shelter_admin) |
| `/refugio/animales` | Gestión Animales | Manage shelter animals (shelter_admin) |
| `/refugio/solicitudes` | Solicitudes | Manage adoption applications (shelter_admin) |
| `/refugio/campanas` | Campañas | Manage campaigns (shelter_admin) |
| `/refugio/donaciones` | Donaciones | View received donations (shelter_admin) |
| `/refugio/configuracion` | Configuración | Shelter settings (shelter_admin) |
| `/admin/dashboard` | Admin Panel | Platform metrics (admin) |
| `/admin/refugios/aprobar` | Aprobar Refugios | Approve/reject shelters (admin) |
| `/admin/moderacion` | Moderación | Content moderation (admin) |
| `/admin/pagos` | Auditoría Pagos | Payment audit (admin) |
| `/admin/metricas` | Métricas | Detailed platform metrics (admin) |
| `/checkout/donacion` | Checkout Donación | Donation payment (placeholder) |
| `/checkout/apadrinamiento` | Checkout Apadrinamiento | Sponsorship payment (placeholder) |
| `/checkout/confirmacion` | Confirmación | Payment confirmation |

### NPM Scripts

```bash
# Development
npm run dev                # Development server
npm run build              # Production build
npm run start              # Start production server

# Unit Testing (Jest)
npm run test               # Run all unit tests
npm run test:watch         # Watch mode
npm run test:ci            # CI mode
npm run test:coverage      # Unit tests with coverage report

# E2E Testing (Playwright)
npm run e2e                # Run all E2E tests
npm run e2e:desktop        # Desktop Chrome only
npm run e2e:mobile         # Mobile Chrome (Pixel 5) only
npm run e2e:tablet         # Tablet (iPad Mini) only
npm run e2e:coverage       # E2E + user flow coverage report

# E2E — module helpers
npm run e2e:modules        # List available E2E modules
npm run e2e:module -- auth # Run a single module
npm run e2e:coverage:module -- auth  # Module-scoped coverage

# E2E — utilities
npm run test:e2e:ui        # Interactive UI
npm run test:e2e:headed    # With visible browser
npm run test:e2e:debug     # Debug mode

# Combined
npm run test:all           # Unit + E2E

# Cleanup
npm run e2e:clean          # Remove playwright-report, test-results, blob-report

# Linting
npm run lint               # Run ESLint
```

---

## 🧪 Testing

### Global Test Runner (Backend + Frontend + E2E)

Run **backend pytest**, **frontend unit (Jest)**, and **frontend E2E (Playwright)** from a single command. By default suites run **sequentially** with verbose output; use `--parallel` for parallel execution with a live progress indicator. Use `--resume` to re-run only failed/unknown suites from the last run.

```bash
# From repo root — sequential (default)
python3 scripts/run-tests-all-suites.py

# Parallel mode
python3 scripts/run-tests-all-suites.py --parallel

# Resume failed/unknown suites from last run
python3 scripts/run-tests-all-suites.py --resume

# Skip a suite
python3 scripts/run-tests-all-suites.py --skip-e2e
python3 scripts/run-tests-all-suites.py --skip-backend --skip-unit

# Pass extra args to individual suites
python3 scripts/run-tests-all-suites.py --backend-args="-k test_user" --e2e-args="--headed"

# Force output mode
python3 scripts/run-tests-all-suites.py --parallel --verbose
python3 scripts/run-tests-all-suites.py --quiet

# Enable coverage reporting (opt-in)
python3 scripts/run-tests-all-suites.py --coverage
```

**What it does:**
- Runs up to 3 suites (backend, frontend-unit, frontend-e2e), sequential by default.
- In parallel mode, shows a live progress bar with per-suite status and elapsed time.
- Keeps going even if a suite fails so you get all reports.
- Prints a final summary with per-suite status and duration. Coverage highlights appear only when `--coverage` is enabled.
- `--resume` re-runs only failed/unknown suites based on `test-reports/last-run.json`.
- Without `--resume`, logs and resume metadata are overwritten at the start of a run.
- Jest output is run with `--silent` in this runner to avoid noisy console logs; run `npm run test` directly if you need console output.

**Outputs:**
- Logs per suite: `test-reports/backend.log`, `test-reports/frontend-unit.log`, `test-reports/frontend-e2e.log`
- Backend coverage: terminal summary (only with `--coverage`)
- Frontend unit coverage: `frontend/coverage/coverage-summary.json` (only with `--coverage`)
- Frontend E2E flow coverage: `frontend/e2e-results/flow-coverage.json` (only with `--coverage`)
- Resume metadata: `test-reports/last-run.json`

### Backend (Pytest)

#### Run Tests

```bash
cd backend

# All tests
pytest

# With coverage
pytest --cov

# Specific tests
pytest base_feature_app/tests/models/
pytest base_feature_app/tests/serializers/
pytest base_feature_app/tests/views/

# Single file tests
pytest base_feature_app/tests/models/test_user_model.py

# Verbose tests
pytest -v
```

#### Test Coverage

- ✅ **Models**: User, Blog, Product, Sale, SoldProduct, PasswordCode
- ✅ **Serializers**: List, Detail, CreateUpdate for all models
- ✅ **Views**: CRUD endpoints, auth endpoints, JWT, public endpoints, permissions
- ✅ **Admin**: Admin site registration, configuration, and custom sections
- ✅ **Forms**: Blog, Product, User forms
- ✅ **Utils**: Auth utilities, URL configuration, email service, global test runner

#### Test Structure

```
backend/base_feature_app/tests/
├── conftest.py                       # App-level fixtures
├── helpers.py                        # Test helper utilities
├── models/
│   ├── test_user_model.py
│   ├── test_blog_model.py
│   ├── test_product_model.py
│   ├── test_sale_model.py
│   └── test_password_code_model.py
├── serializers/
│   ├── test_blog_serializers.py
│   ├── test_product_serializers.py
│   ├── test_sale_serializer.py
│   └── test_user_create_update_serializer.py
├── views/
│   ├── test_auth_endpoints.py
│   ├── test_crud_endpoints.py
│   ├── test_crud_detail_endpoints.py
│   ├── test_jwt_endpoints.py
│   ├── test_public_endpoints.py
│   └── test_sale_and_user_detail_permissions.py
├── services/                         # Service tests
├── commands/                         # Management command tests
└── utils/
    ├── test_admin.py
    ├── test_auth_utils.py
    ├── test_forms.py
    ├── test_urls.py
    └── test_run_tests_suites.py
```

### Frontend (Jest + Playwright)

#### Unit Tests (Jest)

```bash
cd frontend

# All tests
npm run test

# With coverage
npm run test:coverage

# Specific tests
npm test -- lib/stores/__tests__/authStore.test.ts
npm test -- components/blog/__tests__/BlogCard.test.tsx
```

#### Unit Test Coverage

- ✅ **Stores**: authStore, blogStore, productStore, cartStore, localeStore
- ✅ **Components**: BlogCard, BlogCarousel, ProductCard, ProductCarousel, layout
- ✅ **Pages**: Home, Sign In, Sign Up, Blogs, Blog Detail, Catalog, Product Detail, Checkout, Dashboard, Backoffice, Forgot Password, Providers
- ✅ **Services**: HTTP client, tokens
- ✅ **Hooks**: useRequireAuth
- ✅ **i18n**: Locale configuration
- ✅ **Lib**: Constants, types

#### E2E Tests (Playwright)

```bash
cd frontend

# Install browsers (first time)
npx playwright install

# Run all E2E tests
npm run e2e

# Run tests + flow coverage report
npm run e2e:coverage

# List available E2E modules
npm run e2e:modules

# Run a single module (example: auth)
npm run e2e:module -- auth

# Module-scoped coverage
npm run e2e:coverage:module -- auth

# Per-viewport filtering
npm run e2e:desktop          # Desktop Chrome only
npm run e2e:mobile           # Mobile Chrome (Pixel 5) only
npm run e2e:tablet           # Tablet (iPad Mini) only

# With interactive UI
npm run test:e2e:ui

# Headed mode
npm run test:e2e:headed
```

**Note:** `--grep @module:<name>` only runs tests tagged with that module. When you run a subset, the flow coverage report will still list other modules/flows as missing because they were not executed.

**Note:** E2E tests automatically start both Next.js and Django dev servers. Keep backend available to avoid proxy errors.

#### Unit Test Structure

```
frontend/
├── app/
│   ├── __tests__/
│   │   ├── comingSoon.test.tsx
│   │   └── providers.test.tsx
│   ├── backoffice/__tests__/page.test.tsx
│   ├── blogs/__tests__/page.test.tsx
│   ├── blogs/[blogId]/__tests__/page.test.tsx
│   ├── catalog/__tests__/page.test.tsx
│   ├── checkout/__tests__/page.test.tsx
│   ├── dashboard/__tests__/page.test.tsx
│   ├── forgot-password/__tests__/page.test.tsx
│   ├── products/[productId]/__tests__/page.test.tsx
│   ├── sign-in/__tests__/page.test.tsx
│   └── sign-up/__tests__/page.test.tsx
├── components/
│   ├── blog/__tests__/
│   │   ├── BlogCard.test.tsx
│   │   └── BlogCarousel.test.tsx
│   ├── product/__tests__/
│   │   ├── ProductCard.test.tsx
│   │   └── ProductCarousel.test.tsx
│   └── layout/__tests__/
│       └── layout.test.tsx
└── lib/
    ├── __tests__/
    │   ├── constants.test.ts
    │   └── fixtures.ts
    ├── stores/__tests__/
    │   ├── authStore.test.ts
    │   ├── blogStore.test.ts
    │   ├── productStore.test.ts
    │   ├── cartStore.test.ts
    │   └── localeStore.test.ts
    ├── services/__tests__/
    │   ├── http.test.ts
    │   └── tokens.test.ts
    ├── hooks/__tests__/
    │   └── useRequireAuth.test.ts
    └── i18n/__tests__/
        └── config.test.ts
```

#### E2E Test Structure (Modular)

```
frontend/e2e/
├── auth/
│   └── auth.spec.ts                 # Login, logout, register, redirects
├── app/
│   ├── cart.spec.ts                 # Shopping cart
│   ├── checkout.spec.ts             # Checkout flow
│   ├── complete-purchase.spec.ts    # Full purchase flow
│   └── user-flows.spec.ts          # Authenticated user flows
├── public/
│   ├── blogs.spec.ts                # Blog list and navigation
│   ├── products.spec.ts             # Product catalog and navigation
│   ├── navigation.spec.ts           # General navigation
│   └── smoke.spec.ts                # Smoke tests
├── helpers/
│   └── flow-tags.ts                 # Module tagging helpers
├── reporters/
│   └── flow-coverage-reporter.mjs   # Flow coverage reporter
├── fixtures.ts                      # E2E test fixtures
├── test-with-coverage.ts            # Coverage test helper
└── flow-definitions.json            # E2E flow definitions
```

---

## 📚 Documentation

The project includes complete documentation:

### Available Guides

| File | Description |
|------|-------------|
| **docs/DJANGO_REACT_ARCHITECTURE_STANDARD.md** | Full architecture standard (models, views, stores, router, admin, fake data, tests) |
| **docs/TESTING_QUALITY_STANDARDS.md** | Test quality standards (naming, assertions, isolation, anti-patterns) |
| **docs/BACKEND_AND_FRONTEND_COVERAGE_REPORT_STANDARD.md** | Backend & frontend coverage report configuration |
| **docs/E2E_FLOW_COVERAGE_REPORT_STANDARD.md** | E2E flow coverage reporter & flow definitions |
| **docs/TEST_QUALITY_GATE_REFERENCE.md** | Quality gate checks reference |
| **docs/USER_FLOW_MAP.md** | End-to-end user flow map by module |
| **docs/GLOBAL_RULES_GUIDELINES.md** | Global development rules & guidelines |
| **frontend/TESTING.md** | Frontend testing guide |
| **frontend/SETUP.md** | Frontend setup guide |
| **frontend/e2e/README.md** | Playwright E2E guide |
| **backend/.../commands/README.md** | Fake data commands guide |
| **README.md** | This file — general project documentation |

### Scripts

| File | Purpose |
|------|---------|
| `scripts/run-tests-all-suites.py` | Global test runner (sequential by default; backend + frontend unit + E2E) |
| `scripts/test_quality_gate.py` | Test quality gate CLI |
| `scripts/quality/` | Quality gate analyzer modules |

### Configuration Files

| File | Purpose |
|------|---------|
| `.gitignore` | Files to ignore in Git |
| `.pre-commit-config.yaml` | Pre-commit hooks (test quality gate on staged tests) |
| `.github/workflows/test-quality-gate.yml` | GitHub Actions CI workflow |
| `backend/.env.example` | Environment variables template (backend) |
| `backend/pytest.ini` | Pytest configuration |
| `frontend/.env.example` | Environment variables template (frontend) |
| `frontend/eslint.config.mjs` | ESLint configuration |
| `frontend/jest.config.cjs` | Jest configuration |
| `frontend/playwright.config.ts` | Playwright configuration |
| `frontend/tsconfig.json` | TypeScript configuration |
| `frontend/next.config.ts` | Next.js configuration (API rewrites, media proxy) |
| `frontend/postcss.config.mjs` | PostCSS configuration |

---

## 🎯 Reference Projects

Real implementation examples using this base:

### E-commerce
- [🕯️ Candle Project](https://github.com/carlos18bp/candle_project) - Artisanal candles store

### Internal tool
- [⚖️ G&M Project](https://github.com/carlos18bp/gym_projectt) - Law firm management system

### Features
- [🔐 Sign In/Sign On Feature](https://github.com/carlos18bp/signin_signon_feature) - Complete authentication system with registration

---

## 🔧 Customization

### Add New Models

1. Create model in `backend/base_feature_app/models/`
2. Create serializers (List, Detail, CreateUpdate)
3. Create views in `views/`
4. Add URLs in `urls/`
5. Register in admin (`admin.py`)
6. Create fake data command if needed
7. Write tests (models, serializers, views)

### Add New Pages

1. Create page in `frontend/app/your-page/page.tsx`
2. Add Zustand store in `lib/stores/` if needed
3. Create reusable components in `components/`
4. Write unit tests in `__tests__/` directories
5. Write E2E tests in `e2e/`

---

## 🤝 Contributing

Contributions are welcome! If you find a bug or have a suggestion:

1. **Fork** the project
2. Create a **branch** for your feature (`git checkout -b feature/AmazingFeature`)
3. **Commit** your changes (`git commit -m 'Add some AmazingFeature'`)
4. **Push** to the branch (`git push origin feature/AmazingFeature`)
5. Open a **Pull Request**

### Code Standards

- **Global & Architecture**: Follow the guidelines and architecture described in
  [docs/GLOBAL_RULES_GUIDELINES.md](docs/GLOBAL_RULES_GUIDELINES.md) and
  [docs/DJANGO_REACT_ARCHITECTURE_STANDARD.md](docs/DJANGO_REACT_ARCHITECTURE_STANDARD.md).
- **Backend**: Follow PEP 8 (enforced by `ruff`) along with the standards above.
- **Frontend**: Follow ESLint configuration along with the standards above.
- **Tests & Quality**: Apply the standards defined in
  [docs/TESTING_QUALITY_STANDARDS.md](docs/TESTING_QUALITY_STANDARDS.md),
  [docs/TEST_QUALITY_GATE_REFERENCE.md](docs/TEST_QUALITY_GATE_REFERENCE.md), and the coverage reports in
  [docs/BACKEND_AND_FRONTEND_COVERAGE_REPORT_STANDARD.md](docs/BACKEND_AND_FRONTEND_COVERAGE_REPORT_STANDARD.md) and
  [docs/E2E_FLOW_COVERAGE_REPORT_STANDARD.md](docs/E2E_FLOW_COVERAGE_REPORT_STANDARD.md).
- **User Flows**: Align changes with the flow map in
  [docs/USER_FLOW_MAP.md](docs/USER_FLOW_MAP.md).
- **Commits**: Descriptive messages in English.

---

## 📄 License

This project is under the MIT License. See `LICENSE` file for more details.

---

## 👤 Author

**Carlos Buitrago**

- GitHub: [@carlos18bp](https://github.com/carlos18bp)

---

## 🙏 Acknowledgments

- Django REST Framework for the excellent toolkit
- Next.js team for the incredible framework
- React team for the UI library
- All contributors of the libraries used

---

**⭐ If this project helps you, consider giving it a star!**

*Last updated: February 2026*
