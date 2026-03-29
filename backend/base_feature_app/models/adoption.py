from django.db import models
from django.conf import settings


class AdoptionApplication(models.Model):
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

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']
        unique_together = ['animal', 'user']

    def __str__(self):
        return f'{self.user.email} → {self.animal.name} ({self.get_status_display()})'
