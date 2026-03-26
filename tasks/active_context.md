# Mi Huella — Active Context

> Last updated: 2026-03-26

## Current State

The project is a mature animal adoption platform with complete backend and frontend implementations, extensive test coverage, and a methodology system for maintaining context.

### What's Working
- **Backend**: 20 models, 40 serializers, 19 view modules, 18 URL modules, 21 admin classes, 21 management commands, 3 services
- **Frontend**: 47 pages, 10 Zustand stores, 34 components (25 UI + 6 layout + 2 blog + 1 provider), 3 custom hooks, next-intl (en/es)
- **Tests**: 56 backend test files, 100 frontend unit test files, 14 E2E spec files
- **E2E**: 75 flow definitions documented across all roles and priorities
- **Design System**: Stone palette + teal/amber/emerald accents, Inter font, glassmorphism header, dark mode
- **Blog**: Full bilingual blog with public listing/detail, admin CRUD, calendar, JSON content, cover images, SEO

### What's Pending
- **Wompi payment integration**: Views are placeholder stubs

## Recent Focus Areas

### Methodology Recommendations (completed)
- S1: Added 24 factory-boy factories in `tests/factories.py`, refactored conftest.py + helpers.py to use them — all tests pass
- S2: Verified — all 75 E2E flows already have @flow: tags in specs (no gaps)
- S3: Fixed CLAUDE.md stale references: removed mirror file refs, updated flow count 43→75, fixed model/store/URL counts

### Theme Toggle & E2E Expansion
- Added dark mode support with ThemeProvider + ThemeToggle component
- Expanded E2E test coverage across adopter, checkout, and shelter specs

### Test Coverage Expansion
- Frontend unit tests grew from ~54 to 100 files
- Added tests for pages, stores (notificationStore, sponsorshipStore), hooks (useFAQs), components (MultiSelectDropdown)
- Backend tests at 56 files covering models, serializers, views, services, utils, commands

### Blog Feature (completed)
- Full bilingual blog system with 14 endpoints, 6 pages, 2 components
- Backend + frontend + E2E tests all passing

## Architecture Snapshot

| Asset | Count |
|-------|-------|
| Backend models | 20 |
| Backend serializers | 40 |
| Backend views | 19 |
| Backend URL modules | 18 |
| Management commands | 21 |
| Frontend pages | 47 |
| Zustand stores | 10 |
| UI components | 25 |
| Custom hooks | 3 |
| Backend test files | 56 |
| Frontend unit test files | 100 |
| E2E spec files | 14 |
| E2E flow definitions | 75 |

## Next Steps
- Integrate Wompi SDK when ready
