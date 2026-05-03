from datetime import timedelta

from django.conf import settings
from django.db import models
from django.utils import timezone

from base_feature_app.models.mixins import ArchivableModel

FOLLOW_UP_INTERVAL_DAYS = 5


class AdoptionApplication(ArchivableModel):
    class Status(models.TextChoices):
        SUBMITTED = 'submitted', 'Submitted'
        REVIEWING = 'reviewing', 'Reviewing'
        INTERVIEW = 'interview', 'Interview'
        APPROVED = 'approved', 'Approved'
        REJECTED = 'rejected', 'Rejected'

    animal = models.ForeignKey(
        'base_feature_app.Animal',
        on_delete=models.CASCADE,
        related_name='adoption_applications',
    )
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='adoption_applications',
    )
    status = models.CharField(
        max_length=20,
        choices=Status.choices,
        default=Status.SUBMITTED,
    )
    form_answers = models.JSONField(default=dict, blank=True)
    notes = models.TextField(blank=True)
    reviewed_at = models.DateTimeField(null=True, blank=True)
    next_follow_up_due_at = models.DateTimeField(null=True, blank=True, db_index=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']
        unique_together = ['animal', 'user']

    def __str__(self):
        return f'{self.user.email} → {self.animal.name} ({self.get_status_display()})'

    def schedule_follow_up(self):
        self.next_follow_up_due_at = timezone.now() + timedelta(days=FOLLOW_UP_INTERVAL_DAYS)

    def clear_follow_up(self):
        self.next_follow_up_due_at = None
