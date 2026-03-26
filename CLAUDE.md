# Mi Huella — Claude Code Configuration

## Project Identity

- **Name**: Mi Huella (Animal shelter/adoption platform)
- **Domain**: (Staging — TBD)
- **Stack**: Django + DRF (backend) / Next.js + React + TypeScript + Zustand (frontend) / MySQL 8 / Redis / Huey
- **Server path**: `/home/ryzepeck/webapps/base_django_react_next_feature_staging`
- **Services**: `base_django_react_next_feature_staging` (Gunicorn), `base_django_react_next_feature-staging-huey`
- **Settings module**: `DJANGO_SETTINGS_MODULE=base_feature_project.settings_prod`

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
// ✅ Next.js — use env vars
const apiUrl = process.env.NEXT_PUBLIC_API_URL
const secretKey = process.env.API_SECRET_KEY  // server-only, no NEXT_PUBLIC_ prefix

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

#### React

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

// ❌ NEVER use dangerouslySetInnerHTML with user input
return <div dangerouslySetInnerHTML={{ __html: userInput }} />

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
- [ ] No `dangerouslySetInnerHTML` with user data
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

This project uses a Memory Bank system to maintain context across sessions. The core files are:

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
    subgraph LIT[ docs/literature ]
        L1[...]
        L2[...]
    end
    subgraph RFC[ tasks/rfc/ ]
        R1[...]
        R2[...]
    end
    PC --o LIT
    TC --o RFC
```

### Core Files (Required)

| # | File | Purpose |
|---|------|---------|
| 1 | `docs/methodology/product_requirement_docs.md` | PRD: why this project exists, core requirements, scope |
| 2 | `docs/methodology/architecture.md` | System architecture, component relationships, Mermaid diagrams |
| 3 | `docs/methodology/technical.md` | Tech stack, dev setup, design patterns, technical constraints |
| 4 | `tasks/tasks_plan.md` | Task backlog, progress tracking, known issues |
| 5 | `tasks/active_context.md` | Current work focus, recent changes, next steps |
| 6 | `docs/methodology/error-documentation.md` | Known errors, their context, and resolutions |
| 7 | `docs/methodology/lessons-learned.md` | Project intelligence, patterns, preferences |

### Context Files (Optional)

- `docs/literature/` — Literature survey and research (LaTeX files)
- `tasks/rfc/` — RFCs for individual tasks (LaTeX files)

### When to Read Memory Files

- Before significant implementation tasks, read the relevant core files
- Before planning tasks, read `docs/methodology/` and `tasks/`
- When debugging, check `docs/methodology/error-documentation.md` for previously solved issues

### When to Update Memory Files

1. After discovering new project patterns
2. After implementing significant changes
3. When the user requests with **update memory files** (review ALL core files)
4. When context needs clarification
5. After a significant part of a plan is verified

Focus particularly on `tasks/active_context.md` and `tasks/tasks_plan.md` as they track current state. And `docs/methodology/architecture.md` has a section of current workflow that also gets updated by any code changes.

---

## Directory Structure

```mermaid
flowchart TD
    Root[Project Root]
    Root --> Backend[backend/]
    Root --> Frontend[frontend/]
    Root --> Docs[docs/]
    Root --> Tasks[tasks/]
    Root --> Scripts[scripts/]
    Root --> Claude[.claude/skills/]
    Root --> GitHub[.github/workflows/]

    Backend --> BApp[base_feature_app/ — Django app]
    Backend --> BProject[base_feature_project/ — Django project]
    Backend --> BModels[base_feature_app/models/ — 16 models]
    Backend --> BServices[base_feature_app/services/]
    Backend --> BViews[base_feature_app/views/]
    Backend --> BUrls[base_feature_app/urls/ — 13 sub-modules]
    Backend --> BMedia[media/]

    Frontend --> FApp[app/ — Next.js App Router]
    Frontend --> FComponents[components/]
    Frontend --> FStores[lib/stores/ — 9 Zustand stores]
    Frontend --> FServices[lib/services/ — http.ts Axios instance]
    Frontend --> FE2E[e2e/ — Playwright]

    Docs --> Methodology[methodology/]
    Docs --> FlowDefs[e2e-flow-definitions.json — mirror]
    Tasks --> ActiveCtx[active_context.md]
    Tasks --> TasksPlan[tasks_plan.md]

    Claude --> CSkills[plan, implement, debug, deploy, git-commit, etc.]
```

---

## Testing Rules

### Execution Constraints

- **Never run the full test suite** — always specify files
- **Maximum per execution**: 20 tests per batch, 3 commands per cycle
- **Backend**: Always activate venv first: `source venv/bin/activate && pytest path/to/test_file.py -v`
- **Frontend unit**: `npm test -- path/to/file.spec.ts`
- **E2E**: max 2 files per `npx playwright test` invocation
- Use `E2E_REUSE_SERVER=1` when dev server is already running

### Quality Standards

Full reference: `docs/TESTING_QUALITY_STANDARDS.md`

- Each test verifies **ONE specific behavior**
- **No conjunctions** in test names — split into separate tests
- Assert **observable outcomes** (status codes, DB state, rendered UI)
- **No conditionals** in test body — use parameterization
- Follow **AAA pattern**: Arrange → Act → Assert
- Mock only at **system boundaries** (external APIs, clock, email)

---

## Lessons Learned — Mi Huella

### Architecture Patterns

#### Single Django App: `base_feature_app`
- Kept from the template to avoid migration headaches
- All 16 models live in `base_feature_app/models/` (split into individual files)
- URLs split into 13 sub-modules under `base_feature_app/urls/`
- Services and views follow the same split-file pattern

#### Role-Based Access Control
- Three roles: `adopter` (default), `shelter_admin`, `admin`
- New users are assigned the `adopter` role automatically
- Permission checks enforce role boundaries on all sensitive endpoints

#### Structured JSON Fields
- `AdoptionApplication.form_answers` stores adoption form responses as structured JSON
- `AdopterIntent.preferences` stores adopter preferences as structured JSON
- Both follow defined schemas for consistent frontend rendering

#### File Handling
- `django-attachments` provides `SingleImageField` and `GalleryField` for image management
- `django-cleanup` auto-deletes orphaned files when model instances are updated or deleted

### Code Style & Conventions

#### Frontend State Management: Zustand
- 9 Zustand stores with TypeScript types under `lib/stores/`
- HTTP requests centralized via `lib/services/http.ts` Axios instance
- Do NOT scatter raw `fetch()` or `axios` calls across components

#### Internationalization: next-intl
- Locale managed via Zustand store + cookie persistence
- All user-facing strings go through next-intl translation functions
- Locale is read from Zustand state, not from URL path

#### UI / Animation Stack
- **Color palette**: Stone (base), Teal (primary), Amber (accent), Emerald (success), Red (error)
- **GSAP + ScrollTrigger** for scroll-reveal animations — always dynamic-import to avoid SSR crashes
- **Swiper** for image carousels
- **Framer Motion** for page transitions

#### Naming Conventions
- Backend: snake_case for everything (Python standard)
- Frontend stores: camelCase file names under `lib/stores/`
- Frontend components: PascalCase
- Frontend services: camelCase under `lib/services/`

### Development Workflow

#### Backend Commands Always Need venv
```bash
source venv/bin/activate && <command>
```

#### Huey Immediate Mode in Development
- When `DJANGO_ENV != 'production'`, Huey tasks execute synchronously
- No need to run Redis or Huey worker for development

### Testing Insights

- 43 user flows defined in `frontend/e2e/flow-definitions.json`
- Mirror copy in `docs/e2e-flow-definitions.json` — **keep both files in sync**
- Playwright E2E tests are sharded into 5 parallel CI jobs
- Every E2E flow must be registered in both flow-definitions files

### Methodology Maintenance

- Memory Bank based on [rules_template](https://github.com/Bhartendu-Kumar/rules_template)
- Refresh memory files after adding new models, significant test changes, or when file counts drift >10%

---

## Error Documentation — Mi Huella

### Resolved Issues

#### [ERROR-001] Stale model imports in test helpers
- Test helpers referenced old model names that no longer existed after model refactoring
- **Resolution**: Updated all test helper imports to match current model file structure

#### [ERROR-002] Stale admin classes in test_admin.py
- Admin test file referenced admin classes that had been renamed or removed
- **Resolution**: Updated `test_admin.py` to reflect current admin registrations

#### [ERROR-003] Stale URL module imports in test_urls.py
- URL tests imported from modules that had been restructured into 13 sub-modules
- **Resolution**: Updated `test_urls.py` imports to match the new URL sub-module structure

#### [ERROR-004] Stale Role.CUSTOMER in tests
- Tests referenced `Role.CUSTOMER` which was renamed to `Role.ADOPTER` during domain modeling
- **Resolution**: Replaced all `Role.CUSTOMER` references with `Role.ADOPTER` across test files
