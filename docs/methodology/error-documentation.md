---
trigger: manual
description: Error documentation and known issues tracking. Reference when debugging, fixing bugs, or encountering recurring issues.
---

# Error Documentation — Tuhuella

This file tracks known errors, their context, and resolutions. When a reusable fix or correction is found during development, document it here to avoid repeating the same mistake.

---

## Format

```
### [ERROR-NNN] Short description
- **Date**: YYYY-MM-DD
- **Context**: Where/when this error occurs
- **Root Cause**: Why it happens
- **Resolution**: How to fix it
- **Files Affected**: List of files
```

---

## Resolved Issues

### [ERROR-001] Stale model imports in test helpers
- **Date**: 2026-03-21
- **Context**: `tests/helpers.py` imported `Blog, Product, Sale, SoldProduct` which were deleted during template transformation
- **Root Cause**: Phase 8 cleanup only removed model/view test files but left utility helpers with old imports
- **Resolution**: Rewrote helpers with Tuhuella models (`make_user`, `make_shelter`, `make_animal`, `make_campaign`, `make_donation`, `make_sponsorship`)
- **Files Affected**: `backend/base_feature_app/tests/helpers.py`

### [ERROR-002] Stale admin classes in test_admin.py
- **Date**: 2026-03-21
- **Context**: `test_admin.py` referenced `BlogAdmin, ProductAdmin, SaleAdmin` which no longer exist
- **Root Cause**: Same Phase 8 incomplete cleanup
- **Resolution**: Rewrote tests for `ShelterAdmin, AnimalAdmin, CampaignAdmin, UpdatePostAdmin` + updated `test_admin_site_custom_sections` to assert all 16 Tuhuella models
- **Files Affected**: `backend/base_feature_app/tests/utils/test_admin.py`

### [ERROR-003] Stale URL module imports in test_urls.py
- **Date**: 2026-03-21
- **Context**: `test_urls.py` imported `urls.blog`, `urls.product`, `urls.sale` — deleted URL modules
- **Root Cause**: Same Phase 8 incomplete cleanup; also `urls.py` path was wrong (now `urls/__init__.py`)
- **Resolution**: Rewrote to test all 13 new URL modules + fixed package path assertion
- **Files Affected**: `backend/base_feature_app/tests/utils/test_urls.py`

### [ERROR-004] Stale Role.CUSTOMER in tests
- **Date**: 2026-03-21
- **Context**: `test_user_model.py` and `test_user_create_update_serializer.py` used `User.Role.CUSTOMER` which was renamed to `User.Role.ADOPTER`
- **Root Cause**: Model role choices changed but tests were not updated
- **Resolution**: Changed `Role.CUSTOMER` → `Role.ADOPTER` in both test files
- **Files Affected**: `backend/base_feature_app/tests/models/test_user_model.py`, `backend/base_feature_app/tests/serializers/test_user_create_update_serializer.py`

---

### [ERROR-005] Weak password in test breaks after validate_password added
- **Date**: 2026-04-20
- **Context**: `test_verify_passcode_resets_password` used `'newpass'` (7 chars). Passed before `validate_password()` enforcement was added to `verify_passcode_and_reset_password`.
- **Root Cause**: Test password pre-dated the strength check. `validate_password()` rejects passwords < 8 chars, common words, or all-numeric.
- **Resolution**: Changed test password to `'NewStrongPass123'` (meets all validators).
- **Files Affected**: `backend/base_feature_app/tests/views/test_auth_endpoints.py`

### [ERROR-006] DRF throttle @override_settings does not propagate
- **Date**: 2026-04-20
- **Context**: `@override_settings(REST_FRAMEWORK={'DEFAULT_THROTTLE_RATES': {'sign_in': '3/minute'}})` on a test had no effect — the throttle still used its original rate.
- **Root Cause**: DRF caches `api_settings.DEFAULT_THROTTLE_RATES` at class-load time (module import). Patching Django settings at test runtime doesn't invalidate this cache.
- **Resolution**: Monkey-patch the `get_rate` method directly on the throttle class with try/finally restore:
  ```python
  original_get_rate = SignInThrottle.get_rate
  SignInThrottle.get_rate = lambda self: '3/minute'
  try:
      # trigger requests and assert 429
  finally:
      SignInThrottle.get_rate = original_get_rate
  ```
  Also add an autouse fixture with `cache.clear()` before/after each test to prevent throttle state leakage between tests.
- **Files Affected**: `backend/base_feature_app/tests/views/test_auth_endpoints.py`

## Known Issues

_None currently._
