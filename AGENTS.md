# Tuhuella — Codex AGENTS Configuration

## Project Identity

### Codex Runtime Surfaces
- **Primary instructions**: `AGENTS.md` (root scope) + `backend/AGENTS.md` + `frontend/AGENTS.md`
- **Skills (canonical)**: `.agents/skills/<skill>/SKILL.md` + `agents/openai.yaml`
- **Project config**: `.codex/config.toml`

- **Name**: Tuhuella
- **Domain**: `tuhuella.projectapp.co` / `www.tuhuella.projectapp.co`
- **Stack**: Django 6.0.2 + DRF (backend) / Next.js 16 + React 19 runtime server port 3001 (frontend) / MySQL 8 / Redis / Huey
- **Server path**: `/home/ryzepeck/webapps/tuhuella_project`
- **Services**: `tuhuella_project.service` (Gunicorn), `tuhuella_project.socket`, `tuhuella-huey.service`, `tuhuella-frontend.service` (Next.js port 3001)
- **Settings module**: `DJANGO_SETTINGS_MODULE=base_feature_project.settings_prod`
- **Nginx**: `/etc/nginx/sites-available/tuhuella_project`
- **Static**: `/home/ryzepeck/webapps/tuhuella_project/backend/staticfiles/`
- **Media**: `/home/ryzepeck/webapps/tuhuella_project/backend/media/`
- **Resource limits**: MemoryMax=300M, CPUQuota=40%, OOMScoreAdjust=300

---

## General Rules

These should be respected ALWAYS:
1. Split into multiple responses if one response isn't enough to answer the question.
2. IMPROVEMENTS and FURTHER PROGRESSIONS:
- S1: Suggest ways to improve code stability or scalability.
- S2: Offer strategies to enhance performance or security.
- S3: Recommend methods for improving readability or maintainability.
- Recommend areas for further investigation

---

## Security Rules — OWASP / Secrets / Input Validation

### Secrets and Environment Variables

NEVER hardcode secrets. Always use environment variables.

```python
# ✅ Django — use env vars
import os
from dotenv import load_dotenv

load_dotenv()

SECRET_KEY = os.environ['DJANGO_SECRET_KEY']
DATABASE_URL = os.environ['DATABASE_URL']
STRIPE_API_KEY = os.environ['STRIPE_SECRET_KEY']

# ❌ NEVER do this
SECRET_KEY = 'django-insecure-abc123xyz'
DATABASE_URL = 'mysql://root:password123@localhost/mydb'
```

```typescript
// ✅ Next.js / Nuxt — use env vars
const apiUrl = process.env.NEXT_PUBLIC_API_URL
const secretKey = process.env.API_SECRET_KEY  // server-only, no NEXT_PUBLIC_ prefix

// Nuxt
const config = useRuntimeConfig()
const apiKey = config.apiSecret  // server only
const publicUrl = config.public.apiBase  // client safe

// ❌ NEVER do this
const API_KEY = 'sk-live-abc123xyz'
fetch('https://api.stripe.com/v1/charges', {
  headers: { Authorization: 'Bearer sk-live-abc123xyz' }
})
```

### .env rules

- `.env` files MUST be in `.gitignore`. Always verify before committing
- Use `.env.example` with placeholder values for documentation
- Separate env files per environment: `.env.local`, `.env.staging`, `.env.production`
- Server secrets (API keys, DB passwords) NEVER go in client-side env vars
- In Next.js: only `NEXT_PUBLIC_*` vars are exposed to the browser
- In Nuxt: only `runtimeConfig.public.*` is exposed to the browser

### Input Validation

NEVER trust user input. Validate on both server AND client.

#### Django/DRF

```python
# ✅ Serializer validates input
class OrderSerializer(serializers.Serializer):
    email = serializers.EmailField()
    quantity = serializers.IntegerField(min_value=1, max_value=100)
    product_id = serializers.IntegerField()

    def validate_product_id(self, value):
        if not Product.objects.filter(id=value, is_active=True).exists():
            raise serializers.ValidationError('Product not found')
        return value

# ❌ Using raw request data
def create_order(request):
    product_id = request.data['product_id']  # no validation
    Order.objects.create(product_id=product_id)  # SQL injection risk
```

#### React/Vue

```typescript
// ✅ Validate before sending
import { z } from 'zod'

const orderSchema = z.object({
  email: z.string().email(),
  quantity: z.number().int().min(1).max(100),
  productId: z.number().int().positive(),
})

const handleSubmit = (data: unknown) => {
  const result = orderSchema.safeParse(data)
  if (!result.success) {
    setErrors(result.error.flatten().fieldErrors)
    return
  }
  await submitOrder(result.data)
}
```

### SQL Injection Prevention

```python
# ✅ Django ORM — always safe
users = User.objects.filter(email=user_input)

# ✅ If raw SQL is needed, use parameterized queries
from django.db import connection
with connection.cursor() as cursor:
    cursor.execute("SELECT * FROM users WHERE email = %s", [user_input])

# ❌ NEVER interpolate user input into SQL
cursor.execute(f"SELECT * FROM users WHERE email = '{user_input}'")
```

### XSS Prevention

```typescript
// ✅ React auto-escapes by default — JSX is safe
return <p>{userInput}</p>

// ✅ Vue auto-escapes with {{ }}
// <p>{{ userInput }}</p>

// ❌ NEVER use dangerouslySetInnerHTML with user input
return <div dangerouslySetInnerHTML={{ __html: userInput }} />

// ❌ NEVER use v-html with user input
// <div v-html="userInput" />

// If you MUST render HTML, sanitize first
import DOMPurify from 'dompurify'
const clean = DOMPurify.sanitize(userInput)
```

### CSRF Protection

```python
# ✅ Django — CSRF middleware is on by default, keep it
MIDDLEWARE = [
    'django.middleware.csrf.CsrfViewMiddleware',  # NEVER remove
    ...
]

# ✅ DRF — use SessionAuthentication or JWT
REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': [
        'rest_framework_simplejwt.authentication.JWTAuthentication',
    ],
}

# ❌ NEVER disable CSRF globally
@csrf_exempt  # only for webhooks from external services with signature verification
```

### Authentication and Authorization

```python
# ✅ Always check permissions
from rest_framework.permissions import IsAuthenticated

class OrderViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        # Users can only see their own orders
        return Order.objects.filter(user=self.request.user)
```

### Sensitive Data Exposure

```python
# ✅ Exclude sensitive fields from serializers
class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'email', 'name']
        # password, tokens, internal IDs are excluded

# ❌ Exposing everything
class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = '__all__'  # leaks password hash, tokens, etc.
```

### HTTP Security Headers (Django)

```python
# settings.py — enable all security headers
SECURE_BROWSER_XSS_FILTER = True
SECURE_CONTENT_TYPE_NOSNIFF = True
X_FRAME_OPTIONS = 'DENY'
SECURE_HSTS_SECONDS = 31536000  # 1 year
SECURE_HSTS_INCLUDE_SUBDOMAINS = True
SECURE_SSL_REDIRECT = True  # in production
SESSION_COOKIE_SECURE = True
CSRF_COOKIE_SECURE = True
SESSION_COOKIE_HTTPONLY = True
```

### Dependency Security

- Run `pip audit` (Python) and `npm audit` (Node) regularly
- Never use `*` for dependency versions — pin exact versions
- Review new dependencies before adding them
- Keep dependencies updated, especially security patches

### File Upload Security

```python
# ✅ Validate file type and size
ALLOWED_EXTENSIONS = {'.jpg', '.jpeg', '.png', '.pdf'}
MAX_FILE_SIZE = 5 * 1024 * 1024  # 5MB

def validate_upload(file):
    ext = Path(file.name).suffix.lower()
    if ext not in ALLOWED_EXTENSIONS:
        raise ValidationError(f'File type {ext} not allowed')
    if file.size > MAX_FILE_SIZE:
        raise ValidationError('File too large')
```

### Security Checklist — Before Every Deployment

- [ ] No secrets in code or git history
- [ ] `.env` is in `.gitignore`
- [ ] All user input is validated (server + client)
- [ ] No raw SQL with user input
- [ ] No `dangerouslySetInnerHTML` / `v-html` with user data
- [ ] CSRF protection enabled
- [ ] Authentication required on all sensitive endpoints
- [ ] Serializers exclude sensitive fields
- [ ] Security headers configured
- [ ] `pip audit` / `npm audit` clean
- [ ] File uploads validated
- [ ] DEBUG = False in production
- [ ] ALLOWED_HOSTS configured properly

---

## Memory Bank System

Tuhuella maintains a Memory Bank under `docs/methodology/` and `tasks/`. Read these files before significant implementation, debugging, or planning work.

```mermaid
flowchart TD
    PB[product_requirement_docs.md] --> PC[technical.md]
    PB --> SP[architecture.md]
    SP --> TC[tasks_plan.md]
    PC --> TC
    PB --> TC
    TC --> AC[active_context.md]
    AC --> ER[error-documentation.md]
    AC --> LL[lessons-learned.md]
```

### Core Files

| # | File | Purpose |
|---|------|---------|
| 1 | `docs/methodology/product_requirement_docs.md` | Specs of features (animal adoption flow, sponsorship, donations, shelters, blog, FAQs, volunteer applications) |
| 2 | `docs/methodology/architecture.md` | Backend/frontend design, JWT auth flow, notification pipeline |
| 3 | `docs/methodology/technical.md` | Stack and dependencies |
| 4 | `docs/methodology/error-documentation.md` | Known errors and resolutions |
| 5 | `docs/methodology/lessons-learned.md` | Implementation learnings |
| 6 | `tasks/tasks_plan.md` | Feature roadmap |
| 7 | `tasks/active_context.md` | Current execution context |

### When to Read

- Before significant implementation: read `architecture.md`, `technical.md`, and the relevant `lessons-learned.md` section.
- Before planning: read `tasks_plan.md` and `active_context.md`.
- When debugging: check `error-documentation.md` first.

### When to Update

1. After verifying a new project pattern (add to `lessons-learned.md`).
2. After implementing significant changes (update `tasks_plan.md`).
3. When the user requests with **update memory files** (review all core files).
4. After a significant part of a plan is verified (update `active_context.md`).

Do not churn memory files after every routine code edit.

---

## Directory Structure

```mermaid
flowchart TD
    Root[Project Root]
    Root --> Backend[backend/ — Django + DRF]
    Root --> Frontend[frontend/ — Next.js 16 + React 19 RUNTIME server NOT static export]
    Root --> Docs[docs/]
    Root --> Tasks[tasks/]
    Root --> Scripts[scripts/]
    Root --> AgentSkills[.agents/skills/]

    Backend --> BBaseFeatureApp[base_feature_app/ — single business app: 27 models for animal adoption/donation platform]
    Backend --> BBaseFeatureProj[base_feature_project/ — Django project module shared with fernando_aragon]
    Backend --> BAttachments[django_attachments/ — gallery library]
    Backend --> BLogs[logs/ — django.log, gunicorn-access.log, gunicorn-error.log, backups.log, silk-reports/]
    Backend --> BMedia[media/ + staticfiles/]

    BBaseFeatureApp --> Models[models/ — User, Animal, Shelter, AdoptionApplication, Sponsorship, Donation, Campaign, BlogPost, etc.]
    BBaseFeatureApp --> Views[views/ — FBV @api_view: shelters, animals, adoptions, campaigns, donations, sponsorships, blog, faqs, favorites, notifications, volunteer, contact, auth]
    BBaseFeatureApp --> Services[services/ — EmailService, NotificationService, NotificationTemplates locale-aware]
    BBaseFeatureApp --> Tests[tests/ — pytest + pytest-cov]

    Frontend --> FApp["app/[locale]/ — Next.js App Router with locale segments es/en"]
    FApp --> FPages[shelters/, animals/, blog/, campaigns/, checkout/, sign-in, my-applications/, admin/, etc.]
    Frontend --> FLib[lib/]
    FLib --> FStores[stores/ — Zustand: animalStore, authStore, blogStore, shelterStore, etc.]
    FLib --> FServices[services/http.ts — Axios with JWT interceptors]
    FLib --> FHooks[hooks/ — useScrollReveal, etc.]
    Frontend --> FMessages[messages/ — next-intl es.json + en.json]
    Frontend --> FTest[__tests__/ — Jest + Testing Library]
    Frontend --> FE2E[e2e/ — Playwright Desktop + Mobile + Tablet]

    AgentSkills --> SkillSet[plan, implement, debug, deploy-and-check, deploy-staging, git-commit, etc.]
```

**Important note on naming**: like `fernando_aragon_project`, the **Django project module is `base_feature_project`** (a generic boilerplate name shared between Tuhuella and Fernando Aragón) and the **Django app is `base_feature_app`**. The directory `tuhuella_project/` houses these. Settings module is `base_feature_project.settings_prod`. Do not rename these to `tuhuella_*` — keep the boilerplate names.

**Important note on the frontend service**: unlike most other Next.js projects in this ecosystem (which use static export), **Tuhuella runs Next.js as a long-running Node.js process** via `tuhuella-frontend.service` on port 3001. `next.config.ts` does NOT use `output: 'export'` and instead defines URL rewrites that proxy `/api/*` and `/media/*` back to the Django backend. The frontend uses **Node 20** (not 22).

---

## Testing Rules

### Execution Constraints

- **Never run the full test suite** — always specify files.
- **Maximum per execution**: 20 tests per batch, 3 commands per cycle.
- **Backend**: `cd backend && source venv/bin/activate && pytest base_feature_app/tests/path/to/test_file.py -v`. `pytest.ini` sets `DJANGO_SETTINGS_MODULE=base_feature_project.settings`.
- **Frontend unit (Jest)**: `cd frontend && npm test -- path/to/file.test.tsx`. Config: `jest.config.cjs` with jsdom, coverage thresholds 50% globally, `NODE_OPTIONS=--no-deprecation`.
- **Frontend E2E (Playwright)**: `cd frontend && npm run e2e:module -- path/to/spec.ts`. Profiles: Desktop Chrome, Mobile Chrome, Tablet. Use `E2E_REUSE_SERVER=1` when a Next.js dev server is already running on :3000.

### Quality Standards

Full reference: `docs/TESTING_QUALITY_STANDARDS.md`

- Each test verifies **ONE specific behavior**
- **No conjunctions** in test names — split into separate tests
- Assert **observable outcomes** (status codes, DB state, rendered UI)
- **No conditionals** in test body — use parameterization
- Follow **AAA pattern**: Arrange → Act → Assert
- Mock only at **system boundaries** (external APIs, clock, email)

---

## Lessons Learned — Tuhuella

### What Tuhuella is

Tuhuella (`tuhuella.projectapp.co`) is an **animal adoption + sponsorship + donation platform**. Key features:
- Browse and filter animals (species, size, gender, age, compatibility) from partner shelters.
- Apply for adoption with status tracking.
- Sponsor an animal monthly (`Sponsorship`).
- Make one-time donations to a shelter or to a campaign (`Donation`).
- Run fundraising campaigns with target amounts and end dates.
- Bilingual blog (es/en) authored by shelters.
- Volunteer position listings and applications.
- Per-user dashboards for `my-applications`, `my-donations`, `my-intent`, favorites, and notifications.
- Admin panel for shelter staff to manage their animals, applications, etc.

### Architecture Patterns

#### Single business app with 27 models: `base_feature_app`
- All models, views, serializers, services, and tests live in `backend/base_feature_app/`.
- The Django **module is `base_feature_project`** (a generic boilerplate name shared with `fernando_aragon_project`) and the **app is `base_feature_app`**. Do not rename to `tuhuella_*`.
- **27 models** organized under `base_feature_app/models/` covering: `User`, `Animal`, `Shelter`, `AdoptionApplication`, `Sponsorship`, `Donation`, `Campaign`, `BlogPost`, `Tag`, `FAQ`, `Favorite`, `Notification`, `NotificationLog`, `VolunteerPosition`, `VolunteerApplication`, `ShelterInvite`, `ContactMessage`, etc.

#### Service layer is real
- `base_feature_app/services/` holds the cross-cutting business logic:
  - **`EmailService`** — sends transactional emails through Django's mail backend.
  - **`NotificationService`** — manages user notification preferences and writes `NotificationLog` entries.
  - **`NotificationTemplates`** — renders **locale-aware** email templates (default `es`).
- **Do not inline email or notification logic into views.** Always go through these services.

#### Event-driven notifications via Huey
- `base_feature_app/tasks.py` defines `@db_task() send_email_notification(log_id)`:
  1. App events (sign-up, donation thank-you, application status change) create a `NotificationLog` row.
  2. The task is queued, picks up the log, renders the localized template, sends the email, and updates the log to `SENT` or `FAILED` with timestamps.
- This pattern keeps the request path fast and centralizes email retry/observability.

#### Bilingual content via paired fields
- `BlogPost` and similar content models have **paired columns** (`title_en`/`title_es`, `body_en`/`body_es`, etc.).
- The frontend reads the field that matches the current locale.
- Do **not** introduce `django.i18n` `.po` files for app data — preserve the dual-field convention.

#### `python-dotenv` (not `python-decouple`)
- Tuhuella uses **`python-dotenv`** for environment loading: `from dotenv import load_dotenv; load_dotenv(BASE_DIR / '.env')` at the top of `settings.py`.
- This is **the project's standard** as documented in CLAUDE.md. Do not switch to `python-decouple` here.

#### Custom AdminSite
- `base_feature_app/admin.py` instantiates a custom `admin_site` (instead of the default Django admin) to fit the operational dashboard needs.

#### Archivable mixin (soft-delete)
- Models that need soft deletion inherit from an `ArchivableModel` mixin (`archived_at`). Querysets typically filter out archived rows by default.

#### Conditional Silk
- `django-silk` is gated by `ENABLE_SILK=True`. Off by default. Reports land in `backend/logs/silk-reports/`.

### Code Style & Conventions

#### Backend: 100% function-based views
- Every API view in `base_feature_app/views/` uses `@api_view` + `@permission_classes`.
- Pattern: queryset filter (by user permissions) → serializer validation → save → response.
- Never convert to CBV/`APIView`/`ViewSets` unless explicitly requested.

#### Frontend: Next.js 16 + React 19 + App Router + RUNTIME server
- **Stack**: Next.js 16.1.6, React 19.2.4, TypeScript 5, **Node 20** (not 22).
- **App Router** in `frontend/app/[locale]/` with **dynamic locale segments** (`es`, `en`).
- **NOT static export**: `next.config.ts` does **not** use `output: 'export'`. The Next.js process runs as a **long-running Node service** on **port 3001** (`tuhuella-frontend.service`).
- `next.config.ts` defines **rewrites**: `/api/*` → backend `/api/`, `/media/*` → backend `/media/`. The Next.js server proxies these paths to Django so the frontend can fetch them with same-origin URLs.
- Server Components (the default) are still used for layouts and pure-content pages. Client Components (`'use client'`) handle interactivity, auth state, and dynamic data.

#### Frontend: state management with Zustand
- Stores live in `frontend/lib/stores/` (`animalStore`, `authStore`, `blogStore`, `shelterStore`, etc.).
- The auth store handles JWT token storage and refresh.

#### Frontend: HTTP via Axios
- The single Axios instance is `frontend/lib/services/http.ts`.
- Interceptors handle JWT injection (Bearer header, 15-minute access token) and automatic refresh on 401.
- **Do not call `fetch()` or raw `axios` directly in components.** Always use the wrapped instance.

#### Frontend: i18n with `next-intl`
- `next-intl 4.8.3` provides ES/EN bilingual support.
- Locale messages live in `frontend/messages/` (`es.json`, `en.json`).
- The App Router uses `app/[locale]/` segments for locale-prefixed URLs.
- **Never hardcode user-facing strings** — every visible text goes through `useTranslations()`.

#### Frontend: UI with Tailwind + Lucide + Heroicons
- **No shadcn/ui, no Material UI** — components are custom-built.
- **Icons**: `lucide-react 0.577` + `@heroicons/react 2.2`.
- **Animations**: `framer-motion 12.38`.
- Custom hook: `useScrollReveal` for scroll-triggered effects.

#### Naming
- Stores: PascalCase variable name with camelCase file (`animalStore.ts`).
- Components: PascalCase (`BlogCard.tsx`).
- Pages: `page.tsx` per App Router convention, layouts `layout.tsx`.
- Constants: `lib/constants.ts` (`API_ENDPOINTS`, pagination defaults).
- Hooks: camelCase with `use` prefix (`useScrollReveal.ts`).

### Development Workflow

#### venv lives in `backend/`
```bash
cd backend && source venv/bin/activate
```

#### Frontend dev server
```bash
cd frontend && npm install && npm run dev   # Next.js dev, default :3000
```
- Use **Node 20** — the Node version is pinned by `tuhuella-frontend.service` in production.

### Production Deployment

The deployment is unusual because the frontend runs as its **own systemd service**:

1. `git pull origin master`
2. Backend: `cd backend && source venv/bin/activate && pip install -r requirements.txt && python manage.py migrate`
3. Frontend: `cd frontend && npm ci && npm run build` (Next.js standalone build, NOT static export)
4. Backend: `python manage.py collectstatic --noinput`
5. Restart: `sudo systemctl restart tuhuella_project && sudo systemctl restart tuhuella-huey && sudo systemctl restart tuhuella-frontend`
6. Verify: `bash /home/ryzepeck/webapps/ops/vps/scripts/deployment/post-deploy-check.sh tuhuella_project`

The nginx site config proxies the public domain to the Next.js server on port 3001, which in turn proxies `/api/*` and `/media/*` back to Django via `next.config.ts` rewrites.

### Testing Insights

- **Backend**: pytest 9 + pytest-django + pytest-cov. Tests under `backend/base_feature_app/tests/` plus `backend/django_attachments/tests/`.
- **Frontend unit**: Jest 30 + Testing Library + jsdom. Test files in `frontend/__tests__/` and per-component `__tests__/` folders. Coverage thresholds: 50% globally (branches/functions/lines/statements). Run with `NODE_OPTIONS=--no-deprecation`.
- **Frontend E2E**: Playwright with profiles for Desktop Chrome, Mobile Chrome, and Tablet. Run via `npm run e2e:module`, `npm run e2e:modules`, `npm run e2e:coverage`.
- **Quality gate**: `scripts/test_quality_gate.py`.

### Logs

The `backend/logs/` directory holds:
- `django.log` — main application log (WARNING level in prod).
- `gunicorn-access.log`, `gunicorn-error.log` — Gunicorn HTTP logs.
- `backups.log` — `django-dbbackup` rotation handler (5MB × 3 backups).
- `silk-reports/` — Silk profiling reports (only when `ENABLE_SILK=True`).

### Tech Debt / Things to Be Aware Of

- The Next.js runtime server requires **Node 20** specifically (not 22). Pinned in the systemd unit.
- The service triplet is `tuhuella_project.service`, `tuhuella-huey.service`, `tuhuella-frontend.service`. All three must be running for the site to function end-to-end.
- The `next.config.ts` rewrites mean the Next.js server itself proxies to Django — make sure the Django backend is reachable from the Next.js process (`http://127.0.0.1:8000` or via the configured upstream).

---

## Error Documentation — Tuhuella

### Known Issues

_No known issues recorded yet. When a bug is discovered that warrants long-lived documentation, add it here with the format:_

```
#### [KNOWN-NNN] short title
- **Context**: ...
- **Workaround**: ...
```

### Resolved Issues

_No resolved issues recorded yet. When fixing a non-trivial bug, document the root cause and resolution here:_

```
#### [ERR-NNN] short title
- ...
- **Resolution**: ...
```
