from django.conf import settings
from django.db import models


class PaymentHistory(models.Model):
    """One row per payment status transition (or initial state)."""

    class Source(models.TextChoices):
        SYSTEM = 'system', 'System'
        WEBHOOK = 'webhook', 'Webhook'
        ADMIN = 'admin', 'Admin'
        API = 'api', 'API'

    payment = models.ForeignKey(
        'base_feature_app.Payment',
        on_delete=models.CASCADE,
        related_name='status_history',
    )
    previous_status = models.CharField(max_length=20, blank=True, default='')
    new_status = models.CharField(max_length=20)
    source = models.CharField(
        max_length=20,
        choices=Source.choices,
        default=Source.SYSTEM,
    )
    metadata = models.JSONField(default=dict, blank=True)
    changed_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='payment_status_changes',
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['created_at']
        verbose_name_plural = 'payment histories'

    def __str__(self):
        return f'Payment {self.payment_id}: {self.previous_status!r} → {self.new_status!r}'
