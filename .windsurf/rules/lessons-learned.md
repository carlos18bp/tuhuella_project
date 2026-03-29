---
description: Lessons learned from past issues and decisions. Use when reviewing past mistakes, onboarding new contributors, or making architectural decisions that echo previous patterns.
---

# Lessons Learned

## Purpose

This document captures lessons from real issues encountered during development. Each lesson links back to the error documentation or decision that prompted it.

## Format

Each lesson follows this structure:

### Lesson Title
- **Context**: What was happening when the lesson was learned
- **Insight**: The key takeaway
- **Action**: What we do differently now

---

## Active Lessons

### 1. Always Update Test Fixtures When Evolving Domain Models

- **Context**: After migrating from the candle e-commerce template to Mi Huella (animal adoption), the frontend test fixtures file (`frontend/lib/__tests__/fixtures.ts`) still imported `Blog`, `Product`, and `CartItem` types that no longer existed in `types.ts`.
- **Insight**: Template-based projects carry hidden debt in test infrastructure. Type-checking catches broken production code but test fixtures may slip through if they aren't imported by production modules.
- **Action**: When domain models change, run a grep for old type names across **all** `__tests__/` directories, not just production code. Add a CI step or pre-commit check that verifies test fixtures compile.

### 2. Clean Up README Examples After Domain Migration

- **Context**: The README Silk performance report example still referenced `/api/products/`, `/api/sales/`, and `/api/blogs/` endpoints after the Mi Huella migration.
- **Insight**: Documentation examples are easily overlooked during search-and-replace operations because they are inside fenced code blocks.
- **Action**: Include documentation files in the post-migration grep checklist. Review all code blocks in README.md and docs/ for stale references.

### 3. Fake Data Commands Must Respect FK Dependency Order

- **Context**: The `create_fake_data` orchestrator must create entities in dependency order (users → shelters → animals → campaigns → ...) and `delete_fake_data` must delete in reverse order.
- **Insight**: Violating dependency order causes IntegrityError in creation and ProtectedError in deletion.
- **Action**: Both commands document their execution order explicitly. Tests verify the order is correct.

### 4. Extract Shared Components Early

- **Context**: Many UI elements (Hero, AnimalGrid, ProgressBar, etc.) were inlined in page files instead of extracted as reusable components.
- **Insight**: Inlined components work but create duplication risk as the app grows. Extraction is harder retroactively because of coupled state.
- **Action**: When a UI element is used in more than one page, extract it immediately into `components/ui/` or `components/layout/`.
