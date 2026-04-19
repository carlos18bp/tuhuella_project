from django.db import models


class CampaignMessage(models.Model):
    campaign = models.ForeignKey(
        'base_feature_app.Campaign',
        on_delete=models.CASCADE,
        related_name='messages',
    )
    author = models.ForeignKey(
        'base_feature_app.User',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='campaign_messages',
    )
    body = models.TextField()
    is_system = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['created_at']
        indexes = [models.Index(fields=['campaign', 'created_at'])]

    def __str__(self):
        prefix = '[system] ' if self.is_system else ''
        return f'{prefix}Campaign #{self.campaign_id} @ {self.created_at:%Y-%m-%d %H:%M}'
