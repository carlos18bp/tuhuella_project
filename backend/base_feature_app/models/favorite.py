from django.db import models
from django.conf import settings


class Favorite(models.Model):
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='favorites',
    )
    animal = models.ForeignKey(
        'base_feature_app.Animal',
        on_delete=models.CASCADE,
        related_name='favorited_by',
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ['user', 'animal']
        ordering = ['-created_at']

    def __str__(self):
        return f'{self.user.email} ♥ {self.animal.name}'
