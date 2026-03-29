from django.db import models


class Payment(models.Model):
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

    def __str__(self):
        return f'Payment {self.provider_reference or self.pk} ({self.get_status_display()})'
