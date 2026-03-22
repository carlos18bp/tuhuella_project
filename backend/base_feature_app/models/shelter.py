from django.db import models
from django.conf import settings
from django_attachments.fields import SingleImageField
from django_attachments.models import Library


class Shelter(models.Model):
    class VerificationStatus(models.TextChoices):
        PENDING = 'pending', 'Pending'
        VERIFIED = 'verified', 'Verified'
        REJECTED = 'rejected', 'Rejected'

    owner = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='shelters',
    )
    name = models.CharField(max_length=200)
    legal_name = models.CharField(max_length=300, blank=True)
    description = models.TextField(blank=True)
    city = models.CharField(max_length=100)
    address = models.CharField(max_length=300, blank=True)
    phone = models.CharField(max_length=50, blank=True)
    email = models.EmailField(blank=True)
    website = models.URLField(blank=True)

    logo = SingleImageField(
        related_name='shelter_logo',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
    )
    cover_image = SingleImageField(
        related_name='shelter_cover',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
    )

    verification_status = models.CharField(
        max_length=20,
        choices=VerificationStatus.choices,
        default=VerificationStatus.PENDING,
    )
    verified_at = models.DateTimeField(null=True, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return self.name

    @property
    def is_verified(self):
        return self.verification_status == self.VerificationStatus.VERIFIED

    def delete(self, *args, **kwargs):
        for field in [self.logo, self.cover_image]:
            try:
                if field:
                    field.delete()
            except Library.DoesNotExist:
                pass
        super().delete(*args, **kwargs)
