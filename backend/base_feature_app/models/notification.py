from django.db import models
from django.conf import settings


class NotificationPreference(models.Model):
    class Channel(models.TextChoices):
        EMAIL = 'email', 'Email'
        PUSH = 'push', 'Push'
        IN_APP = 'in_app', 'In App'

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='notification_preferences',
    )
    event_key = models.CharField(max_length=100)
    channel = models.CharField(max_length=20, choices=Channel.choices)
    enabled = models.BooleanField(default=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ['user', 'event_key', 'channel']
        ordering = ['event_key']

    def __str__(self):
        status = 'ON' if self.enabled else 'OFF'
        return f'{self.user.email} – {self.event_key} via {self.channel} [{status}]'


class NotificationLog(models.Model):
    class Status(models.TextChoices):
        QUEUED = 'queued', 'Queued'
        SENT = 'sent', 'Sent'
        FAILED = 'failed', 'Failed'

    recipient = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='notification_logs',
    )
    event_key = models.CharField(max_length=100)
    channel = models.CharField(
        max_length=20,
        choices=NotificationPreference.Channel.choices,
    )
    status = models.CharField(
        max_length=20,
        choices=Status.choices,
        default=Status.QUEUED,
    )
    metadata = models.JSONField(default=dict, blank=True)
    is_read = models.BooleanField(default=False)
    sent_at = models.DateTimeField(null=True, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f'{self.event_key} → {self.recipient.email} ({self.get_status_display()})'
