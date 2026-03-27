from django.db import models


class VolunteerPosition(models.Model):
    class Category(models.TextChoices):
        PHOTOGRAPHER = 'photographer', 'Photographer'
        SHELTER_HELPER = 'shelter_helper', 'Shelter Helper'
        DRIVER = 'driver', 'Driver / Transporter'
        VETERINARY_VOLUNTEER = 'veterinary_volunteer', 'Veterinary Volunteer'
        SOCIAL_MEDIA = 'social_media', 'Community Manager'
        EVENT_COORDINATOR = 'event_coordinator', 'Event Coordinator'
        FOSTER_HOME = 'foster_home', 'Foster Home'
        FUNDRAISER = 'fundraiser', 'Fundraiser'
        EDUCATOR = 'educator', 'Educator'
        DESIGNER = 'designer', 'Graphic Designer'
        TRANSLATOR = 'translator', 'Translator'
        DOG_WALKER = 'dog_walker', 'Dog Walker'

    title_es = models.CharField(max_length=200)
    title_en = models.CharField(max_length=200, blank=True)
    description_es = models.TextField()
    description_en = models.TextField(blank=True)
    requirements_es = models.TextField(blank=True)
    requirements_en = models.TextField(blank=True)
    category = models.CharField(
        max_length=30,
        choices=Category.choices,
    )
    icon = models.CharField(max_length=50, blank=True, help_text='Lucide icon name')
    is_active = models.BooleanField(default=True)
    order = models.PositiveIntegerField(default=0)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['order', '-created_at']

    def __str__(self):
        return self.title_es
