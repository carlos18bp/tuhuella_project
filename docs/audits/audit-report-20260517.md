# Vulnerability Audit & Dependency Update Report

**Branch:** chore/17052026-vuln-audit
**Date:** 2026-05-17
**Base:** master @ 831510f
**Scope:** patch + minor updates only (no major version bumps)

## Summary

| Surface  | Vulns (initial) | Vulns (final) | Outdated (initial) |
|----------|-----------------|---------------|-------------------|
| Frontend | 3 (1 critical, 1 high, 1 moderate) | 3 (unchanged) | 17 packages |
| Backend  | 25 (in 8 packages) | 8 (in 4 packages) | 21 packages |

---

## Frontend — `npm audit` (initial)

| Package | Severity | Notes |
|---------|----------|-------|
| swiper  | critical | Prototype pollution (GHSA-hmx5-qpq5-p643); fix = v12.x (major — skipped) |
| next    | high | DoS via Server Components, Middleware bypass (multiple CVEs); fix = 16.3.0+ not yet stable |
| postcss | moderate | XSS via unescaped `</style>` (GHSA-qx2v-qp2m-jg93); transitive dep of next |

**Totals:** 1 critical / 1 high / 1 moderate = 3 total.

## Frontend — `npm outdated` (initial)

| Package | Current | Latest | Action |
|---------|---------|--------|--------|
| @playwright/test | 1.59.1 | 1.60.0 | bumped |
| @tailwindcss/postcss | 4.2.4 | 4.3.0 | bumped |
| @types/node | 25.6.0 | 25.8.0 | bumped |
| axios | 1.15.2 | 1.16.1 | bumped |
| eslint | 9.39.4 | 10.4.0 | SKIP (major 10.x) |
| eslint-config-next | 16.2.4 | 16.2.6 | bumped |
| jest | 30.3.0 | 30.4.2 | bumped |
| jest-environment-jsdom | 30.3.0 | 30.4.1 | bumped |
| js-cookie | 3.0.5 | 3.0.7 | bumped |
| lucide-react | 0.577.0 | 1.16.0 | SKIP (major 1.x) |
| next | 16.2.4 | 16.2.6 | bumped (vuln range still active at 16.2.6) |
| next-intl | 4.11.0 | 4.12.0 | bumped |
| react | 19.2.5 | 19.2.6 | bumped |
| react-dom | 19.2.5 | 19.2.6 | bumped |
| swiper | 11.2.10 | 12.1.4 | SKIP (major 12.x) |
| tailwindcss | 4.2.4 | 4.3.0 | bumped |
| typescript | 5.9.3 | 6.0.3 | SKIP (major 6.x) |
| zustand | 5.0.12 | 5.0.13 | bumped |

---

## Backend — `pip-audit` (initial)

| Package | Version | CVEs | Min fix |
|---------|---------|------|---------|
| django | 6.0.2 | CVE-2026-25674, CVE-2026-25673 | 6.0.3 |
| django | 6.0.2 | CVE-2026-33033, CVE-2026-33034, CVE-2026-4292, CVE-2026-4277, CVE-2026-3902 | 6.0.4 |
| django | 6.0.2 | CVE-2026-35192, CVE-2026-6907, CVE-2026-5766 | 6.0.5 |
| pillow | 12.1.1 | CVE-2026-40192, CVE-2026-42308, CVE-2026-42309, CVE-2026-42310, CVE-2026-42311 | 12.2.0 |
| pip | 24.0 | CVE-2025-8869, CVE-2026-1703, CVE-2026-3219, CVE-2026-6357 | 25.3+ |
| pygments | 2.19.2 | CVE-2026-4539 | 2.20.0 |
| pytest | 9.0.2 | CVE-2025-71176 | 9.0.3 |
| python-dotenv | 1.2.1 | CVE-2026-28684 | 1.2.2 |
| requests | 2.32.5 | CVE-2026-25645 | 2.33.0 |
| urllib3 | 2.6.3 | CVE-2026-44431, CVE-2026-44432 | 2.7.0 |

**Totals inicial:** 25 CVEs en 8 paquetes (venv desactualizado; varios ya corregidos en requirements.txt pero no instalados).

## Backend — `pip list --outdated` (initial)

| Package | Installed | Latest | Action |
|---------|-----------|--------|--------|
| Django | 6.0.2 | 6.0.5 | reqs 6.0.4→6.0.5 (bumped) |
| Faker | 40.5.1 | 40.18.0 | reqs 40.15.0→40.18.0 (bumped) |
| Pygments | 2.19.2 | 2.20.0 | transitive — not in requirements.txt |
| coverage | 7.13.4 | 7.14.0 | reqs 7.13.5→7.14.0 (bumped) |
| django-dbbackup | 5.2.0 | 5.3.0 | pin >=4.0.0 already satisfied |
| djangorestframework | 3.16.1 | 3.17.1 | reqs already 3.17.1; venv synced |
| gunicorn | 23.0.0 | 26.0.0 | SKIP — pin <24.0 |
| huey | 2.6.0 | 3.0.1 | SKIP — major bump |
| pillow | 12.1.1 | 12.2.0 | reqs already 12.2.0; venv synced |
| pip | 24.0 | 26.1.1 | not managed by requirements.txt |
| pytest | 9.0.2 | 9.0.3 | reqs already 9.0.3; venv synced |
| pytest-cov | 7.0.0 | 7.1.0 | reqs already 7.1.0; venv synced |
| python-dotenv | 1.2.1 | 1.2.2 | not in requirements.txt (has python-decouple) |
| redis | 7.3.0 | 7.4.0 | pin >=4.0.0 already satisfied |
| requests | 2.32.5 | 2.34.2 | reqs 2.33.1→2.34.2 (bumped) |
| ruff | 0.15.2 | 0.15.13 | reqs 0.15.12→0.15.13 (bumped) |
| urllib3 | 2.6.3 | 2.7.0 | transitive dep of requests |

---

## Updates Applied

### Frontend (commit `0103c98`)

| Package | Before | After |
|---------|--------|-------|
| @playwright/test | ^1.59.1 | ^1.60.0 |
| @tailwindcss/postcss | ^4.2.4 | ^4.3.0 |
| @types/node | ^25.6.0 | ^25.8.0 |
| axios | ^1.15.2 | ^1.16.1 |
| eslint-config-next | 16.2.4 | 16.2.6 |
| jest | ^30.3.0 | ^30.4.2 |
| jest-environment-jsdom | ^30.3.0 | ^30.4.1 |
| js-cookie | ^3.0.5 | ^3.0.7 |
| next | 16.2.4 | 16.2.6 |
| next-intl | ^4.11.0 | ^4.12.0 |
| react | 19.2.5 | 19.2.6 |
| react-dom | 19.2.5 | 19.2.6 |
| tailwindcss | ^4.2.4 | ^4.3.0 |
| zustand | ^5.0.12 | ^5.0.13 |

Final `npm audit`: 3 vulnerabilities — unchanged (swiper, next, postcss require major bump or unreleased stable).

### Backend (commit `88b7ab0`)

| Package | Before (reqs) | After (reqs) |
|---------|---------------|--------------|
| Django | ==6.0.4 | ==6.0.5 |
| Faker | ==40.15.0 | ==40.18.0 |
| coverage | ==7.13.5 | ==7.14.0 |
| ruff | ==0.15.12 | ==0.15.13 |
| requests | ==2.33.1 | ==2.34.2 |

Venv also synced with pre-existing requirements.txt updates: pillow 12.1.1→12.2.0, pytest 9.0.2→9.0.3, djangorestframework 3.16.1→3.17.1, pytest-cov 7.0.0→7.1.0.

`pip-audit` final: **8 CVEs en 4 paquetes** (todos transitive o fuera de requirements.txt):

| Package | Version | CVEs | Why not fixed |
|---------|---------|------|---------------|
| pip | 24.0 | 4 CVEs | Not in requirements.txt; upgrade separately |
| pygments | 2.19.2 | CVE-2026-4539 | Transitive dep; add explicit pin to fix |
| python-dotenv | 1.2.1 | CVE-2026-28684 | Not in requirements.txt (decouple mismatch) |
| urllib3 | 2.6.3 | CVE-2026-44431, CVE-2026-44432 | Transitive dep of requests; add explicit pin |

---

## Rollbacks

Ninguno.

---

## Verification Results

### Frontend
- Nota: 52+ staging dirs de instalaciones npm interrumpidas anteriores; eliminados y node_modules reinstalado limpiamente (736 paquetes).
- `npm run build`: **success** — todas las rutas compiladas sin errores.
- `npm audit` final: 3 vulnerabilidades (sin cambio — no fixable sin major bump).

### Backend
- `python manage.py check`: **System check identified no issues (0 silenced).**
- `pytest --collect-only -q`: **806 tests collected** sin errores de importación.
- Slice `base_feature_app/tests/utils/test_email_utils.py`: **12 passed** en 21.28s.
