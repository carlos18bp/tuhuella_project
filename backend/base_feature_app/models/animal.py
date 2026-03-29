from django.db import models
from django_attachments.fields import GalleryField
from django_attachments.models import Library


class Animal(models.Model):
    class Species(models.TextChoices):
        DOG = 'dog', 'Dog'
        CAT = 'cat', 'Cat'
        OTHER = 'other', 'Other'

    class AgeRange(models.TextChoices):
        PUPPY = 'puppy', 'Puppy'
        YOUNG = 'young', 'Young'
        ADULT = 'adult', 'Adult'
        SENIOR = 'senior', 'Senior'

    class Gender(models.TextChoices):
        MALE = 'male', 'Male'
        FEMALE = 'female', 'Female'
        UNKNOWN = 'unknown', 'Unknown'

    class Size(models.TextChoices):
        SMALL = 'small', 'Small'
        MEDIUM = 'medium', 'Medium'
        LARGE = 'large', 'Large'

    class Status(models.TextChoices):
        DRAFT = 'draft', 'Draft'
        PUBLISHED = 'published', 'Published'
        IN_PROCESS = 'in_process', 'In Process'
        ADOPTED = 'adopted', 'Adopted'
        ARCHIVED = 'archived', 'Archived'

    class Compatibility(models.TextChoices):
        YES = 'yes', 'Yes'
        NO = 'no', 'No'
        UNKNOWN = 'unknown', 'Unknown'

    class EnergyLevel(models.TextChoices):
        LOW = 'low', 'Low'
        MEDIUM = 'medium', 'Medium'
        HIGH = 'high', 'High'

    shelter = models.ForeignKey(
        'base_feature_app.Shelter',
        on_delete=models.CASCADE,
        related_name='animals',
    )
    name = models.CharField(max_length=200)
    species = models.CharField(max_length=10, choices=Species.choices, default=Species.DOG)
    breed = models.CharField(max_length=100, blank=True)
    age_range = models.CharField(max_length=10, choices=AgeRange.choices, default=AgeRange.ADULT)
    gender = models.CharField(max_length=10, choices=Gender.choices, default=Gender.UNKNOWN)
    size = models.CharField(max_length=10, choices=Size.choices, default=Size.MEDIUM)
    description_es = models.TextField(blank=True)
    description_en = models.TextField(blank=True)
    special_needs_es = models.TextField(blank=True)
    special_needs_en = models.TextField(blank=True)

    status = models.CharField(max_length=20, choices=Status.choices, default=Status.DRAFT)

    is_vaccinated = models.BooleanField(default=False)
    is_sterilized = models.BooleanField(default=False)

    weight = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True)
    is_house_trained = models.BooleanField(default=False)
    good_with_kids = models.CharField(
        max_length=10, choices=Compatibility.choices, default=Compatibility.UNKNOWN,
    )
    good_with_dogs = models.CharField(
        max_length=10, choices=Compatibility.choices, default=Compatibility.UNKNOWN,
    )
    good_with_cats = models.CharField(
        max_length=10, choices=Compatibility.choices, default=Compatibility.UNKNOWN,
    )
    energy_level = models.CharField(
        max_length=10, choices=EnergyLevel.choices, default=EnergyLevel.MEDIUM,
    )
    coat_color = models.CharField(max_length=100, blank=True)
    intake_date = models.DateField(null=True, blank=True)
    microchip_id = models.CharField(max_length=50, blank=True)

    gallery = GalleryField(
        related_name='animal_gallery',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
    )

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['species', 'size', 'status'], name='animal_species_size_status'),
            models.Index(fields=['status', 'created_at'], name='animal_status_created'),
        ]

    def __str__(self):
        return f'{self.name} ({self.get_species_display()})'

    def delete(self, *args, **kwargs):
        try:
            if self.gallery:
                self.gallery.delete()
        except Library.DoesNotExist:
            pass
        super().delete(*args, **kwargs)
