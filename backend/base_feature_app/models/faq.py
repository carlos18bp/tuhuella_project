from django.db import models


class FAQTopic(models.Model):
    slug = models.SlugField(max_length=50, unique=True)
    display_name_es = models.CharField(max_length=100)
    display_name_en = models.CharField(max_length=100)
    is_active = models.BooleanField(default=True)
    order = models.PositiveIntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['order', 'slug']
        verbose_name = 'FAQ Topic'
        verbose_name_plural = 'FAQ Topics'

    def __str__(self):
        return self.display_name_es


class FAQItem(models.Model):
    topic = models.ForeignKey(FAQTopic, on_delete=models.CASCADE, related_name='items')
    question_es = models.CharField(max_length=500)
    question_en = models.CharField(max_length=500)
    answer_es = models.TextField()
    answer_en = models.TextField()
    order = models.PositiveIntegerField(default=0)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['order', 'created_at']
        verbose_name = 'FAQ Item'
        verbose_name_plural = 'FAQ Items'

    def __str__(self):
        return self.question_es
