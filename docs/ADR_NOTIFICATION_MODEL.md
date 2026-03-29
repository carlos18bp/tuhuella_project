# ADR: Notification Model Design

> Status: **Accepted**  
> Date: 2026-03-22

## Context

The original project plan specified a single `Notification` model with polymorphic content fields (`owner_type`/`owner_id`). During implementation, the team opted for a two-model design instead.

## Decision

The notification system uses **two models** instead of one:

1. **`NotificationPreference`** — stores per-user, per-event, per-channel toggle (email, push, in_app).
2. **`NotificationLog`** — records every notification sent, with status tracking (queued, sent, failed) and metadata.

### Why This Is Better

| Concern | Single Model | Two-Model (chosen) |
|---------|-------------|-------------------|
| Separation of concerns | Preferences mixed with logs | Clean separation |
| Query performance | Filter by type column | Dedicated tables, simpler indexes |
| Preference management | N/A or extra table anyway | First-class `unique_together` on (user, event_key, channel) |
| Audit trail | Mixed with config | `NotificationLog` is append-only, ideal for auditing |
| Scalability | Single table grows fast | Logs can be archived independently |

### Schema Summary

```python
# NotificationPreference
- user (FK → User)
- event_key (CharField)
- channel (email | push | in_app)
- enabled (BooleanField)
- unique_together = ['user', 'event_key', 'channel']

# NotificationLog
- recipient (FK → User)
- event_key (CharField)
- channel (email | push | in_app)
- status (queued | sent | failed)
- metadata (JSONField)
- sent_at (DateTimeField, nullable)
```

## Consequences

- The plan's single `Notification` model with `owner_type`/`owner_id` was **not implemented**.
- Serializers, views, admin, and fake data commands already reference the two-model design.
- No migration or refactor needed — the two-model approach is the final design.
