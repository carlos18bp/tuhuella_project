from django.conf import settings
from django.db import models


class ShelterMembership(models.Model):
    """Team members for a shelter (owner row plus optional admins/staff)."""

    class Role(models.TextChoices):
        OWNER = 'owner', 'Owner'
        ADMIN = 'admin', 'Admin'
        STAFF = 'staff', 'Staff'

    shelter = models.ForeignKey(
        'base_feature_app.Shelter',
        on_delete=models.CASCADE,
        related_name='team_memberships',
    )
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='shelter_team_memberships',
    )
    role = models.CharField(
        max_length=20,
        choices=Role.choices,
        default=Role.STAFF,
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['shelter_id', 'role', 'user_id']
        unique_together = [['shelter', 'user']]
        verbose_name_plural = 'shelter memberships'

    def __str__(self):
        return f'{self.user.email} @ {self.shelter.name} ({self.role})'
