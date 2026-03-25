from django.db import models
from django_attachments.fields import SingleImageField
from django_attachments.models import Library


class StrategicAlly(models.Model):
    class AllyType(models.TextChoices):
        VETERINARY = 'veterinary', 'Veterinary Clinic'
        COMPANY = 'company', 'Company'
        NGO = 'ngo', 'NGO'
        GOVERNMENT = 'government', 'Government'
        MEDIA = 'media', 'Media'
        OTHER = 'other', 'Other'

    name = models.CharField(max_length=200)
    description_es = models.TextField(blank=True)
    description_en = models.TextField(blank=True)
    logo = SingleImageField(
        related_name='ally_logo',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
    )
    website = models.URLField(blank=True)
    ally_type = models.CharField(
        max_length=20,
        choices=AllyType.choices,
    )
    is_active = models.BooleanField(default=True)
    order = models.PositiveIntegerField(default=0)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['order', '-created_at']
        verbose_name_plural = 'strategic allies'

    def __str__(self):
        return self.name

    def delete(self, *args, **kwargs):
        try:
            if self.logo:
                self.logo.delete()
        except Library.DoesNotExist:
            pass
        super().delete(*args, **kwargs)
