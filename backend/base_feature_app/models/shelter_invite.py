from django.db import models


class ShelterInvite(models.Model):
    class Status(models.TextChoices):
        PENDING = 'pending', 'Pending'
        ACCEPTED = 'accepted', 'Accepted'
        REJECTED = 'rejected', 'Rejected'

    shelter = models.ForeignKey(
        'base_feature_app.Shelter',
        on_delete=models.CASCADE,
        related_name='invites_sent',
    )
    adopter_intent = models.ForeignKey(
        'base_feature_app.AdopterIntent',
        on_delete=models.CASCADE,
        related_name='invites_received',
    )
    message = models.TextField(blank=True)
    status = models.CharField(
        max_length=20,
        choices=Status.choices,
        default=Status.PENDING,
    )

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']
        unique_together = ['shelter', 'adopter_intent']

    def __str__(self):
        return f'{self.shelter.name} → {self.adopter_intent.user.email} ({self.get_status_display()})'
