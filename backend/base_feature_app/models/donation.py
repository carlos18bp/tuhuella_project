from django.conf import settings
from django.core.exceptions import ValidationError
from django.db import models

from base_feature_app.models.mixins import ArchivableModel


class Donation(ArchivableModel):
    class Status(models.TextChoices):
        PENDING = 'pending', 'Pending'
        PAID = 'paid', 'Paid'
        FAILED = 'failed', 'Failed'
        REFUNDED = 'refunded', 'Refunded'

    class Destination(models.TextChoices):
        PLATFORM = 'platform', 'Platform'
        SHELTER = 'shelter', 'Shelter'
        CAMPAIGN = 'campaign', 'Campaign'

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='donations',
    )
    shelter = models.ForeignKey(
        'base_feature_app.Shelter',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='donations',
    )
    campaign = models.ForeignKey(
        'base_feature_app.Campaign',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='donations',
    )
    destination = models.CharField(
        max_length=20,
        choices=Destination.choices,
        default=Destination.SHELTER,
    )
    amount = models.DecimalField(max_digits=12, decimal_places=2)
    status = models.CharField(
        max_length=20,
        choices=Status.choices,
        default=Status.PENDING,
    )
    message = models.TextField(blank=True)
    paid_at = models.DateTimeField(null=True, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def clean(self):
        super().clean()
        if self.destination == self.Destination.PLATFORM:
            if self.shelter_id or self.campaign_id:
                raise ValidationError(
                    'Platform donations must not set shelter or campaign.',
                )
        elif self.destination == self.Destination.SHELTER:
            if not self.shelter_id or self.campaign_id:
                raise ValidationError(
                    'Shelter donations require shelter and must not set campaign.',
                )
        elif self.destination == self.Destination.CAMPAIGN:
            if not self.campaign_id:
                raise ValidationError('Campaign donations require a campaign.')
            if self.shelter_id and self.shelter_id != self.campaign.shelter_id:
                raise ValidationError('Shelter must match the campaign shelter.')

    def save(self, *args, **kwargs):
        if self.destination == self.Destination.CAMPAIGN and self.campaign_id and not self.shelter_id:
            self.shelter = self.campaign.shelter
        super().save(*args, **kwargs)

    def __str__(self):
        target = self.campaign or self.shelter or 'Platform'
        return f'{self.user.email} → {target} (${self.amount})'
