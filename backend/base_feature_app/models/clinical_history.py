from django.conf import settings
from django.db import models


class ClinicalHistoryEntry(models.Model):
    class EntryType(models.TextChoices):
        CHECKUP = 'checkup', 'Checkup'
        VACCINATION = 'vaccination', 'Vaccination'
        TREATMENT = 'treatment', 'Treatment'
        OBSERVATION = 'observation', 'Observation'
        INCIDENT = 'incident', 'Incident'

    animal = models.ForeignKey(
        'base_feature_app.Animal',
        on_delete=models.CASCADE,
        related_name='clinical_entries',
    )
    follow_up = models.ForeignKey(
        'base_feature_app.PostAdoptionFollowUp',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='clinical_entries',
    )
    author = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
    )
    entry_type = models.CharField(max_length=16, choices=EntryType.choices)
    title = models.CharField(max_length=255)
    body_es = models.TextField(blank=True)
    body_en = models.TextField(blank=True)
    occurred_at = models.DateTimeField()
    attachment_urls = models.JSONField(default=list, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-occurred_at']

    def __str__(self):
        return f'{self.entry_type}: {self.title} ({self.animal_id})'
