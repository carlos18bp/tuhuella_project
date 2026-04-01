"""
Reusable model mixins.

ArchivableModel: soft-archive via ``archived_at`` instead of hard ``.delete()``
to avoid CASCADE wiping related rows. Public querysets should filter
``archived_at__isnull=True``; admin may show archived rows when needed.
"""
from django.db import models


class ArchivableModel(models.Model):
    archived_at = models.DateTimeField(null=True, blank=True, db_index=True)

    class Meta:
        abstract = True

    @property
    def is_archived(self):
        return self.archived_at is not None
