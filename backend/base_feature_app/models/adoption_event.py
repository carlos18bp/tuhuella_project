from django.conf import settings
from django.db import models

from base_feature_app.models.mixins import ArchivableModel


class AdoptionApplicationEvent(ArchivableModel):
    application = models.ForeignKey(
        'base_feature_app.AdoptionApplication',
        on_delete=models.CASCADE,
        related_name='events',
    )
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.PROTECT,
        related_name='adoption_application_events',
    )
    event_date = models.DateTimeField()
    description = models.TextField(max_length=2000)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-event_date', '-created_at']

    def __str__(self):
        return f'Event #{self.pk} on application #{self.application_id} ({self.event_date:%Y-%m-%d})'
