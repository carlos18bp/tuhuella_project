from django.db import models
from django_attachments.fields import SingleImageField
from django_attachments.models import Library


class UpdatePost(models.Model):
    shelter = models.ForeignKey(
        'base_feature_app.Shelter',
        on_delete=models.CASCADE,
        related_name='update_posts',
    )
    campaign = models.ForeignKey(
        'base_feature_app.Campaign',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='update_posts',
    )
    animal = models.ForeignKey(
        'base_feature_app.Animal',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='update_posts',
    )

    title = models.CharField(max_length=300)
    content = models.TextField()

    image = SingleImageField(
        related_name='update_post_image',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
    )

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return self.title

    def delete(self, *args, **kwargs):
        try:
            if self.image:
                self.image.delete()
        except Library.DoesNotExist:
            pass
        super().delete(*args, **kwargs)
