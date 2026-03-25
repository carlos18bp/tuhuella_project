from django.db import models
from django_attachments.fields import SingleImageField, GalleryField
from django_attachments.models import Library


class Campaign(models.Model):
    class Status(models.TextChoices):
        DRAFT = 'draft', 'Draft'
        ACTIVE = 'active', 'Active'
        COMPLETED = 'completed', 'Completed'
        PAUSED = 'paused', 'Paused'
        ARCHIVED = 'archived', 'Archived'

    shelter = models.ForeignKey(
        'base_feature_app.Shelter',
        on_delete=models.CASCADE,
        related_name='campaigns',
    )
    title_es = models.CharField(max_length=300)
    title_en = models.CharField(max_length=300, default='')
    description_es = models.TextField(blank=True)
    description_en = models.TextField(blank=True)
    goal_amount = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    raised_amount = models.DecimalField(max_digits=12, decimal_places=2, default=0)

    status = models.CharField(
        max_length=20,
        choices=Status.choices,
        default=Status.DRAFT,
    )

    cover_image = SingleImageField(
        related_name='campaign_cover',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
    )
    evidence_gallery = GalleryField(
        related_name='campaign_evidence',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
    )

    starts_at = models.DateTimeField(null=True, blank=True)
    ends_at = models.DateTimeField(null=True, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return self.title_es

    @property
    def progress_percentage(self):
        if self.goal_amount and self.goal_amount > 0:
            return min(100, int((self.raised_amount / self.goal_amount) * 100))
        return 0

    def delete(self, *args, **kwargs):
        for field in [self.cover_image, self.evidence_gallery]:
            try:
                if field:
                    field.delete()
            except Library.DoesNotExist:
                pass
        super().delete(*args, **kwargs)
