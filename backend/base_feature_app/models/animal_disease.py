from django.db import models


class AnimalDiseaseScreening(models.Model):
    DOG_DISEASES = ['distemper', 'parvovirus', 'ehrlichia', 'leptospirosis', 'heartworm']
    CAT_DISEASES = ['fiv', 'felv', 'panleukopenia', 'fip', 'calicivirus']
    DISEASE_CHOICES = [(k, k) for k in DOG_DISEASES + CAT_DISEASES]

    class Result(models.TextChoices):
        POSITIVE = 'positive', 'Positive'
        NEGATIVE = 'negative', 'Negative'
        NOT_TESTED = 'not_tested', 'Not tested'

    animal = models.ForeignKey(
        'base_feature_app.Animal',
        on_delete=models.CASCADE,
        related_name='disease_screenings',
    )
    disease_key = models.CharField(max_length=32, choices=DISEASE_CHOICES)
    result = models.CharField(max_length=12, choices=Result.choices, default=Result.NOT_TESTED)
    tested_on = models.DateField(null=True, blank=True)
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = [('animal', 'disease_key')]
        ordering = ['disease_key']

    def __str__(self):
        return f'{self.animal_id}:{self.disease_key}={self.result}'
