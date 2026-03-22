# Mi Huella — Technical Stack & Decisions

## Backend

| Component | Technology | Version | Notes |
|-----------|-----------|---------|-------|
| Framework | Django | 5.x | Monolith with DRF |
| API | Django REST Framework | 3.x | FBV pattern, JWT auth |
| Auth | `djangorestframework-simplejwt` | — | Access + refresh tokens |
| OAuth | Google OAuth | — | `@react-oauth/google` on frontend |
| Database | SQLite (dev) / MySQL (prod) | — | Single DB, no sharding |
| Images | `django-attachments` | — | `SingleImageField`, `GalleryField` |
| Thumbnails | `easy-thumbnails` | — | On-demand thumbnail generation |
| Cleanup | `django-cleanup` | — | Auto-delete orphaned files |
| Task Queue | Huey + Redis | — | Async tasks (silk reports, etc.) |
| Profiling | `django-silk` | — | Slow query / N+1 detection |
| Backups | `django-dbbackup` | — | Scheduled DB backups |
| Fake Data | Faker | — | Management commands, no factory-boy |
| Linting | Ruff | — | Fast Python linter |
| Testing | pytest + pytest-django | — | Unit + integration |

## Frontend

| Component | Technology | Version | Notes |
|-----------|-----------|---------|-------|
| Framework | Next.js | 16.x | App Router |
| UI Library | React | 19.x | Server + Client components |
| Language | TypeScript | 5.x | Strict mode |
| State | Zustand | 5.x | 9 stores, persist middleware |
| HTTP | Axios | — | Centralized `api` instance with interceptors |
| Styling | TailwindCSS | 4.x | Stone palette + accent variables |
| i18n | next-intl | 4.x | en/es, cookie-based locale |
| Animations | GSAP + ScrollTrigger | — | Scroll-reveal on grids |
| Carousels | Swiper | — | Animal gallery |
| Transitions | Framer Motion | — | Page transitions via `template.tsx` |
| Icons | Heroicons + Lucide | — | Dual icon library |
| Auth | `@react-oauth/google` | — | Google sign-in button |
| Cookies | `js-cookie` + `jwt-decode` | — | Token management |
| Testing | Jest (unit) + Playwright (E2E) | — | Component + flow tests |

## Architecture Decisions

### 1. FBV over CBV (Backend Views)
All views use function-based views with `@api_view` decorators. This keeps views flat, explicit, and easy to test without class inheritance complexity.

### 2. Zustand over Redux
Zustand chosen for minimal boilerplate, TypeScript-first design, and per-store modularity. Each domain (animal, shelter, campaign) has its own independent store.

### 3. App Router (Next.js)
Using Next.js App Router for file-based routing, server components, and the `template.tsx` pattern for page transitions.

### 4. Cookie-based i18n (no URL prefix)
Locale stored in a Zustand-persisted cookie. No `/en/` or `/es/` URL prefixes — keeps URLs clean and avoids SSR complexity. Trade-off: no SEO per-locale URLs.

### 5. GSAP dynamic import
GSAP and ScrollTrigger are loaded dynamically via `import()` inside the `useScrollReveal` hook to avoid SSR issues and reduce initial bundle size.

### 6. Placeholder payments
Wompi integration is stubbed with placeholder views that create `Payment` records but don't call external APIs. This allows the full payment flow UI to be built and tested without SDK dependency.

### 7. Single Django app
All models live in `base_feature_app` (kept from template). Content is Mi Huella-specific but the app name is preserved to avoid migration headaches.

## Environment Variables

### Backend (`backend/.env`)
```
DJANGO_SECRET_KEY=
DJANGO_DEBUG=true
DJANGO_ALLOWED_HOSTS=localhost,127.0.0.1
DJANGO_DB_ENGINE=django.db.backends.sqlite3
GOOGLE_OAUTH_CLIENT_ID=
REDIS_URL=redis://localhost:6379/1
```

### Frontend (`frontend/.env.local`)
```
NEXT_PUBLIC_BACKEND_ORIGIN=http://localhost:8000
NEXT_PUBLIC_GOOGLE_CLIENT_ID=
```
