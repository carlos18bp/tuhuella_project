# Vulnerability Audit & Dependency Update Report

**Branch:** `chore/26082026-vuln-audit`  
**Date:** 2026-08-26  
**Base:** `master` @ `fd63944`  
**Scope:** patch + minor updates only (no major version bumps)

## Summary

| Surface | Vulns (initial) | Outdated (initial) | Vulns (final) | Outdated (final) |
|---|---:|---:|---:|---:|
| Frontend | 11 (1 critical, 9 high, 1 low) | 22 | 1 critical | 6 majors |
| Backend | 33 across 3 packages | 12 in isolated venv | 4 across 1 package | 6 majors/constrained |

The deployment probe reported 25 outdated Python distributions because the deployed
venv also contains older transitive packages. The isolated worktree venv resolved
unconstrained transitives at their current versions and reported 12 direct or pinned
updates before the manifest changes.

---

## Frontend — `npm audit` (initial)

Source: `/tmp/tuhuella_project_staging-npm-audit.json`

| Package | Severity | Notes |
|---|---|---|
| `@babel/core` | low | Transitive arbitrary file-read advisory. |
| `axios` | high | Direct dependency; request construction, proxy and DoS advisories. |
| `brace-expansion` | high | Transitive expansion DoS advisories. |
| `form-data` | high | Transitive multipart CRLF injection. |
| `js-yaml` | high | Transitive quadratic CPU advisories. |
| `nanoid` | high | Transitive infinite-loop advisories. |
| `next` | high | Direct dependency; SSRF, proxy bypass, cache and DoS advisories. |
| `postcss` | high | Transitive file disclosure and source-map advisories. |
| `sharp` | high | Transitive vulnerable libvips versions. |
| `swiper` | critical | Direct dependency; prototype pollution. Major upgrade required. |
| `ws` | high | Transitive memory-exhaustion DoS. |

**Totals:** 1 critical / 9 high / 0 moderate / 1 low.

## Frontend — `npm outdated` (initial)

Source: `/tmp/tuhuella_project_staging-npm-outdated.json`

- `@playwright/test`: 1.60.0 -> 1.62.1.
- `@tailwindcss/postcss`: 4.3.0 -> 4.3.3.
- `@testing-library/user-event`: 14.6.1 -> 14.6.6.
- `@types/node`: 25.8.0 -> 25.9.5; 26.3.0 skipped as major.
- `@types/react`: 19.2.14 -> 19.2.18.
- `@types/react-dom`: 19.2.3 -> 19.2.5.
- `axios`: 1.16.1 -> 1.20.0.
- `eslint`: 9.39.4 -> 9.39.5; 10.9.1 skipped as major.
- `eslint-config-next`: 16.2.6 -> 16.3.3.
- `eslint-plugin-playwright`: 2.10.2 -> 2.11.0.
- `framer-motion`: 12.38.0 -> 12.43.0; 13.1.1 skipped as major.
- `fuse.js`: 7.3.0 -> 7.5.0.
- `js-cookie`: 3.0.7 -> 3.0.8.
- `lucide-react`: 0.577.0; 1.34.0 skipped as major.
- `next`: 16.2.6 -> 16.3.3.
- `next-intl`: 4.12.0 -> 4.13.7.
- `react`: 19.2.6 -> 19.2.8.
- `react-dom`: 19.2.6 -> 19.2.8.
- `swiper`: 11.2.10; 14.1.0 skipped as major.
- `tailwindcss`: 4.3.0 -> 4.3.3.
- `typescript`: 5.9.3; 7.0.2 skipped as major.
- `zustand`: 5.0.13 -> 5.0.15.

---

## Backend — `pip-audit` (initial)

Source: `/tmp/tuhuella_project_staging-pip-audit.json`

| Package | Current | Vulns | Minimum in-major fix |
|---|---:|---:|---:|
| `Django` | 6.0.5 | 9 | 6.0.8 |
| `pillow` | 12.2.0 | 20 | 12.3.0 |
| `sqlparse` | 0.5.5 | 4 | 0.6.0 (major under the 0.x policy) |

## Backend — `pip list --outdated` (initial)

Source: `/tmp/tuhuella_project_staging-pip-outdated.json`

- Safe in-major updates: `asgiref`, `coverage`, `Django`,
  `djangorestframework`, `Faker`, `pillow`, `pytest`, `pytest-django`, and
  `typing_extensions`.
- Updated range floors from the deployed probe: `django-dbbackup` and
  `django-silk`.
- Constrained or major-skipped: `gunicorn`, `huey`, `redis`, `ruff`, and
  `sqlparse`.

---

## Plan

### Frontend

- Apply `npm audit fix` without `--force` to refresh safe transitive versions.
- Apply patch/minor updates within each current major.
- Keep Swiper 11, TypeScript 5, lucide-react 0.x, ESLint 9, Framer Motion 12,
  and Node types 25 until separate major-upgrade reviews.

### Backend

- Apply Django 6.0.8 and Pillow 12.3.0 as the security-priority updates.
- Apply the remaining direct patch/minor updates while preserving pin operators.
- Add `<6`, `<3`, and `<8` ceilings where open ranges could otherwise install
  major versions of django-dbbackup/django-silk, Huey, or Redis in a clean venv.
- Keep sqlparse 0.5.5, Ruff 0.15, Gunicorn 23, Huey 2, and Redis 7 pending
  separate major-upgrade reviews.

## Updates Applied

### Frontend (commit `deps(frontend): apply patch+minor updates`)

- Updated 19 direct dependencies across runtime, framework, CSS, types, linting,
  testing, and E2E tooling.
- Refreshed safe transitive dependencies through `npm audit fix` and the lockfile.
- Final `npm audit`: 1 critical / 0 high / 0 moderate / 0 low.
- Remaining outdated majors: `@types/node`, `eslint`, `framer-motion`,
  `lucide-react`, `swiper`, and `typescript`.

### Backend (commit `deps(backend): apply patch+minor updates`)

- Updated 11 direct dependencies, including Django 6.0.5 -> 6.0.8 and Pillow
  12.2.0 -> 12.3.0.
- Added upper bounds that keep clean installs on Huey 2, Redis 7, and the current
  major of django-dbbackup/django-silk.
- Final `pip-audit`: 4 vulnerabilities in `sqlparse` 0.5.5.
- Remaining outdated majors/constrained packages: Django 6.1, Gunicorn 26,
  Huey 3, Redis 8, Ruff 0.16, and sqlparse 0.6.

## Rollbacks

- Reverted `@testing-library/jest-dom` 6.10.0 to an exact 6.9.1 pin. Version
  6.10.0 requires Node 22 and its package warning recommends 6.9.1 for the 6.x
  line; Tuhuella is contractually pinned to Node 20.

## Verification Results

### Frontend

- `npm audit`: 1 critical vulnerability remains in Swiper; no high, moderate, or
  low findings remain.
- `npm run build`: success with Next.js 16.3.3 and Node 20.19.4; TypeScript and
  all 110 generated pages completed.
- `npm test -- __tests__/proxy.test.ts`: 12 passed.

### Backend

- `pip-audit`: 33 -> 4 vulnerabilities; only sqlparse remains.
- `python manage.py check`: no issues.
- `pytest --collect-only -q`: 888 tests collected without errors.
- `pytest base_feature_app/tests/models/test_adopter_intent_model.py -v`: 8 passed.
- `pip check`: no broken requirements.

## Operational Dry Run

- `housekeeping.sh` ran in dry-run mode; no files were removed.
- Latest backup: 3 days old; total backup footprint: 125 MB.
- No orphan nginx vhosts were found.
- Follow-up review remains for orphan worktrees under `kore_project` and unresolved
  coordinates in the two base template repositories.
