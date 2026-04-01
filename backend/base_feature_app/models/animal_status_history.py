from django.conf import settings
from django.db import models


class AnimalStatusHistory(models.Model):
    """Audit trail for Animal.status changes."""

    animal = models.ForeignKey(
        'base_feature_app.Animal',
        on_delete=models.CASCADE,
        related_name='status_history',
    )
    previous_status = models.CharField(max_length=20, blank=True, default='')
    new_status = models.CharField(max_length=20)
    reason = models.TextField(blank=True, default='')
    changed_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='animal_status_changes',
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']
        verbose_name_plural = 'animal status histories'

    def __str__(self):
        return f'{self.animal_id}: {self.previous_status!r} → {self.new_status!r}'
