from django.db import models
from django.conf import settings


class Donation(models.Model):
    class Status(models.TextChoices):
        PENDING = 'pending', 'Pending'
        PAID = 'paid', 'Paid'
        FAILED = 'failed', 'Failed'
        REFUNDED = 'refunded', 'Refunded'

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

    def __str__(self):
        target = self.campaign or self.shelter or 'Platform'
        return f'{self.user.email} → {target} (${self.amount})'
