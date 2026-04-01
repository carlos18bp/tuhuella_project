from django.core.exceptions import ValidationError
from django.db import models

from base_feature_app.models.mixins import ArchivableModel


class Payment(ArchivableModel):
    class Status(models.TextChoices):
        PENDING = 'pending', 'Pending'
        APPROVED = 'approved', 'Approved'
        DECLINED = 'declined', 'Declined'
        VOIDED = 'voided', 'Voided'
        ERROR = 'error', 'Error'

    donation = models.ForeignKey(
        'base_feature_app.Donation',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='payments',
    )
    sponsorship = models.ForeignKey(
        'base_feature_app.Sponsorship',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='payments',
    )

    provider = models.CharField(max_length=50, default='wompi')
    provider_reference = models.CharField(max_length=255, blank=True)
    amount = models.DecimalField(max_digits=12, decimal_places=2)
    status = models.CharField(
        max_length=20,
        choices=Status.choices,
        default=Status.PENDING,
    )
    paid_at = models.DateTimeField(null=True, blank=True)
    metadata = models.JSONField(default=dict, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']
        constraints = [
            models.CheckConstraint(
                condition=(
                    models.Q(donation__isnull=False, sponsorship__isnull=True)
                    | models.Q(donation__isnull=True, sponsorship__isnull=False)
                ),
                name='payment_exactly_one_parent',
            ),
        ]

    def clean(self):
        super().clean()
        d_ok = self.donation_id is not None
        s_ok = self.sponsorship_id is not None
        if d_ok == s_ok:
            raise ValidationError(
                'Payment must be linked to exactly one of donation or sponsorship.',
            )

    @property
    def modality(self):
        """Business modality derived from FK (donation vs sponsorship)."""
        if self.donation_id:
            return 'donation'
        if self.sponsorship_id:
            return 'sponsorship'
        return ''

    def __str__(self):
        return f'Payment {self.provider_reference or self.pk} ({self.get_status_display()})'
