from django.db import models


class DonationAmountOption(models.Model):
    amount = models.PositiveIntegerField()
    label = models.CharField(max_length=50, blank=True)
    is_active = models.BooleanField(default=True)
    order = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ['order', 'amount']
        verbose_name = 'Donation Amount Option'
        verbose_name_plural = 'Donation Amount Options'

    def __str__(self):
        return self.label or f'${self.amount:,}'


class SponsorshipAmountOption(models.Model):
    amount = models.PositiveIntegerField()
    label = models.CharField(max_length=50, blank=True)
    is_active = models.BooleanField(default=True)
    order = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ['order', 'amount']
        verbose_name = 'Sponsorship Amount Option'
        verbose_name_plural = 'Sponsorship Amount Options'

    def __str__(self):
        return self.label or f'${self.amount:,}'
