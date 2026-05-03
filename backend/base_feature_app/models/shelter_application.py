from django.conf import settings
from django.db import models
from django_attachments.fields import GalleryField
from django_attachments.models import Library

from base_feature_app.models.mixins import ArchivableModel


class ShelterApplication(ArchivableModel):
    class Status(models.TextChoices):
        SUBMITTED = 'submitted', 'Submitted'
        UNDER_REVIEW = 'under_review', 'Under Review'
        APPROVED = 'approved', 'Approved'
        REJECTED = 'rejected', 'Rejected'

    applicant = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='shelter_applications',
    )

    shelter_name = models.CharField(max_length=200)
    description_es = models.TextField()
    city = models.CharField(max_length=100)
    address = models.CharField(max_length=300, blank=True)
    phone = models.CharField(max_length=50)
    email = models.EmailField(blank=True)
    website = models.URLField(blank=True)

    legal_name = models.CharField(max_length=300)
    tax_id = models.CharField(max_length=50)
    legal_representative_name = models.CharField(max_length=200)
    legal_representative_id = models.CharField(max_length=50)

    documents = GalleryField(
        related_name='shelter_application_docs',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
    )

    motivation = models.TextField()
    previous_experience = models.TextField(blank=True)
    capacity_estimate = models.PositiveIntegerField(null=True, blank=True)

    status = models.CharField(
        max_length=20,
        choices=Status.choices,
        default=Status.SUBMITTED,
    )
    submitted_at = models.DateTimeField(auto_now_add=True)
    reviewed_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='reviewed_shelter_applications',
    )
    reviewed_at = models.DateTimeField(null=True, blank=True)
    rejection_reason = models.TextField(blank=True)
    created_shelter = models.OneToOneField(
        'Shelter',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='source_application',
    )

    class Meta:
        ordering = ['-submitted_at']
        constraints = [
            models.UniqueConstraint(
                fields=['applicant'],
                condition=models.Q(status__in=['submitted', 'under_review']),
                name='unique_active_shelter_application_per_user',
            ),
        ]

    def __str__(self):
        return f'{self.shelter_name} ({self.applicant.email}) — {self.status}'

    def delete(self, *args, **kwargs):
        try:
            if self.documents:
                self.documents.delete()
        except Library.DoesNotExist:
            pass
        super().delete(*args, **kwargs)
