# Backend Rules — Tuhuella

## Stack And Scope
- Django 6.0.2 + DRF 3.16.1, Python 3.12.
- **Single business app**: `base_feature_app` — contains all 27 models for the animal-adoption / sponsorship / donation platform (User, Animal, Shelter, AdoptionApplication, Sponsorship, Donation, Campaign, BlogPost, FAQ, Notification, VolunteerPosition, etc.).
- **Django project module**: `base_feature_project` (a generic boilerplate name **shared with `fernando_aragon_project`** — do not rename).
- Auxiliary app: `django_attachments` (vendored gallery library).
- Production settings module: `base_feature_project.settings_prod`.
- Database: **MySQL 8** (`tuhuella_db`). Cache + queue: Redis. Email: SMTP (env-driven).
- Auth: **JWT via SimpleJWT only**. No session auth on `/api/`.
- Environment loading uses **`python-dotenv`** (NOT `python-decouple`) — `load_dotenv(BASE_DIR / '.env')` at the top of `settings.py`. This is the project standard.

## Project Conventions
- DRF views are **function-based** with `@api_view`. Pattern: queryset filter → serializer validation → service call (when applicable) → response. Do not convert to CBV/`APIView`/`ViewSets`.
- **Service layer is real**: `base_feature_app/services/` holds:
  - `EmailService` — Django mail backend wrapper.
  - `NotificationService` — manages user notification preferences and `NotificationLog` rows.
  - `NotificationTemplates` — locale-aware template rendering for emails (default `es`).
  - **Do not inline email or notification logic into views.** Always go through these services.
- **Event-driven notifications**: app events (sign-up, donation thank-you, application status change) create `NotificationLog` rows; a Huey task (`send_email_notification(log_id)` in `tasks.py`) processes them, renders the template, sends the email, and updates the log to SENT/FAILED.
- **Bilingual content via paired fields**: `BlogPost` and similar models use `title_en`/`title_es`, `body_en`/`body_es`, etc. Frontend reads the field matching the active locale. Do not introduce `django.i18n` `.po` files.
- **Custom AdminSite**: `base_feature_app/admin.py` instantiates a custom `admin_site` (not the default Django admin) for operational dashboard needs.
- **Archivable mixin**: models with soft-delete inherit `ArchivableModel` (`archived_at` field). Default querysets typically filter out archived rows.
- Prefer Django ORM. Raw SQL only when strictly necessary, always parameterized.

## Auth And Security
- **API auth**: **JWT via SimpleJWT** with a 15-minute access token (configurable). Refresh token has a longer lifetime. There is **no session auth on `/api/`**.
- **Admin** uses Django session + CSRF (default).
- reCAPTCHA is verified server-side on signup (`verify_recaptcha()`).
- `settings_prod.py` enforces HSTS (1y, subdomains, preload), `SECURE_SSL_REDIRECT=True`, secure cookies, NOSNIFF, `X_FRAME_OPTIONS=DENY`. Fail-fast if `DJANGO_SECRET_KEY` or `DJANGO_ALLOWED_HOSTS` are missing.
- `CORS_ALLOWED_ORIGINS` is configurable via env.
- Validate input in DRF serializers. Never disable CSRF or hardcode secrets.

## Commands
- Activate venv from `backend/`: `cd backend && source venv/bin/activate`
- Run backend tests: `pytest base_feature_app/tests/path/to/test_file.py -v`
- Run a focused backend check: `python manage.py check`
- Run dev server: `python manage.py runserver`
- Make migrations: `python manage.py makemigrations base_feature_app && python manage.py migrate`

## Testing Rules
- Run only the changed test file or a tight regression slice.
- Never run the full backend suite.
- Keep test names focused on one observable behavior.
- Prefer deterministic tests: freeze time, seed data explicitly, and avoid hidden global state.
- Both `base_feature_app/tests/` and `django_attachments/tests/` have test directories.

## Quirks to Remember
- The Django **module is `base_feature_project`** (shared with `fernando_aragon_project`) — `DJANGO_SETTINGS_MODULE=base_feature_project.settings_prod`.
- Environment loading uses **`python-dotenv`**, not `python-decouple` — preserve this.
- The frontend runs as **its own systemd service** (`tuhuella-frontend.service` on port 3001) — Django does NOT serve a static-exported Next.js bundle. The frontend is a long-running Node 20 process.
- Logs live in `backend/logs/` (`django.log`, `gunicorn-*.log`, `backups.log`, `silk-reports/`).
