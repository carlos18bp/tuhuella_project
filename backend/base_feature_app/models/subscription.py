from django.db import models


class Subscription(models.Model):
    class Status(models.TextChoices):
        ACTIVE = 'active', 'Active'
        PAUSED = 'paused', 'Paused'
        CANCELED = 'canceled', 'Canceled'
        EXPIRED = 'expired', 'Expired'

    class Interval(models.TextChoices):
        MONTHLY = 'monthly', 'Monthly'
        QUARTERLY = 'quarterly', 'Quarterly'
        YEARLY = 'yearly', 'Yearly'

    sponsorship = models.OneToOneField(
        'base_feature_app.Sponsorship',
        on_delete=models.CASCADE,
        related_name='subscription',
    )
    provider = models.CharField(max_length=50, default='wompi')
    provider_reference = models.CharField(max_length=255, blank=True)
    interval = models.CharField(
        max_length=20,
        choices=Interval.choices,
        default=Interval.MONTHLY,
    )
    next_payment_at = models.DateTimeField(null=True, blank=True)
    status = models.CharField(
        max_length=20,
        choices=Status.choices,
        default=Status.ACTIVE,
    )

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f'Subscription for {self.sponsorship} ({self.get_status_display()})'
