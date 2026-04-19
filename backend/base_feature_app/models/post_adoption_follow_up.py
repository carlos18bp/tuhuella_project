from django.conf import settings
from django.db import models

from base_feature_app.models.mixins import ArchivableModel


class PostAdoptionFollowUp(ArchivableModel):
    class Status(models.TextChoices):
        PENDING = 'pending', 'Pending'
        IN_PROGRESS = 'in_progress', 'In progress'
        COMPLETED = 'completed', 'Completed'
        OVERDUE = 'overdue', 'Overdue'

    adoption_application = models.OneToOneField(
        'base_feature_app.AdoptionApplication',
        on_delete=models.CASCADE,
        related_name='follow_up',
    )
    animal = models.ForeignKey(
        'base_feature_app.Animal',
        on_delete=models.CASCADE,
        related_name='follow_ups',
    )
    adopter = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='follow_ups_as_adopter',
    )
    assigned_veterinarian = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='follow_ups_as_vet',
        limit_choices_to={'role': 'veterinarian'},
    )
    status = models.CharField(max_length=16, choices=Status.choices, default=Status.PENDING)
    scheduled_date = models.DateField()
    completed_date = models.DateField(null=True, blank=True)
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['status', 'scheduled_date']),
        ]

    def __str__(self):
        return f'FollowUp #{self.pk} ({self.animal_id}, {self.status})'
