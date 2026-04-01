from django.conf import settings
from django.db import models

from base_feature_app.models.mixins import ArchivableModel


class Sponsorship(ArchivableModel):
    class Frequency(models.TextChoices):
        MONTHLY = 'monthly', 'Monthly'
        ONE_TIME = 'one_time', 'One Time'

    class Status(models.TextChoices):
        PENDING = 'pending', 'Pending'
        ACTIVE = 'active', 'Active'
        PAUSED = 'paused', 'Paused'
        CANCELED = 'canceled', 'Canceled'

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='sponsorships',
    )
    animal = models.ForeignKey(
        'base_feature_app.Animal',
        on_delete=models.CASCADE,
        related_name='sponsorships',
    )
    amount = models.DecimalField(max_digits=12, decimal_places=2)
    frequency = models.CharField(
        max_length=10,
        choices=Frequency.choices,
        default=Frequency.ONE_TIME,
    )
    status = models.CharField(
        max_length=20,
        choices=Status.choices,
        default=Status.PENDING,
    )
    started_at = models.DateTimeField(null=True, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f'{self.user.email} sponsors {self.animal.name} (${self.amount}/{self.get_frequency_display()})'
