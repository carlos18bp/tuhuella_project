---
description: Error documentation standard for tracking and resolving bugs. Use when documenting bugs, writing post-mortems, or creating error tracking entries.
---

# Error Documentation Standard

## When to Document

Document errors when:
- A bug takes more than 30 minutes to diagnose
- The root cause was non-obvious or counter-intuitive
- The fix has implications for other parts of the codebase
- The error could recur in a different context

## Error Entry Format

Each documented error should include:

### 1. Summary
- **Date**: When the error was discovered
- **Severity**: Critical / High / Medium / Low
- **Module**: Backend model, serializer, view, frontend store, component, E2E, etc.
- **Status**: Open / Resolved / Won't Fix

### 2. Symptoms
- What was observed (error messages, unexpected behavior, test failures)
- How it was discovered (CI, manual testing, user report)

### 3. Root Cause
- The actual underlying issue
- Why it happened (missing validation, race condition, wrong assumption, etc.)

### 4. Fix Applied
- What was changed and why
- Files modified with brief description
- Any migration or data fix required

### 5. Prevention
- What guardrail was added (test, validation, lint rule)
- Lessons learned reference (if applicable)

## Storage

Error entries are stored in `docs/errors/` as individual markdown files:
```
docs/errors/
├── 2026-01-15-fixtures-import-old-types.md
├── 2026-02-01-silk-report-stale-endpoints.md
└── ...
```

## Template

```markdown
# [Short Description]

- **Date**: YYYY-MM-DD
- **Severity**: High
- **Module**: frontend/lib/__tests__
- **Status**: Resolved

## Symptoms
[What was observed]

## Root Cause
[Why it happened]

## Fix
[What was changed]

## Prevention
[What guardrail was added]
```
