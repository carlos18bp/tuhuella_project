from django.db import models
from django.utils import timezone
from django.utils.text import slugify

from base_feature_app.models.mixins import ArchivableModel


class BlogPost(ArchivableModel):
    """
    Model for blog articles.

    Each post has a title, slug (auto-generated), cover image,
    excerpt for cards/listing, full HTML content, and a JSON list
    of sources consulted (each with name and url).

    Supports two content formats:
    - HTML (content_es / content_en) — legacy plain HTML.
    - Structured JSON (content_json_es / content_json_en) — rich
      sections with headings, lists, timelines, subsections, etc.
      When present, the frontend renders the JSON; otherwise it
      falls back to HTML.
    """

    AUTHOR_CHOICES = [
        ('tuhuella-team', 'Mi Huella Team'),
        ('laura-blanco', 'Laura Blanco'),
    ]

    CATEGORY_CHOICES = [
        ('adopcion', 'Adopción'),
        ('cuidado-animal', 'Cuidado Animal'),
        ('salud-animal', 'Salud Animal'),
        ('historias', 'Historias'),
        ('consejos', 'Consejos'),
        ('eventos', 'Eventos'),
        ('voluntariado', 'Voluntariado'),
        ('nutricion', 'Nutrición'),
        ('entrenamiento', 'Entrenamiento'),
        ('legislacion', 'Legislación'),
    ]

    title_es = models.CharField(max_length=255)
    title_en = models.CharField(max_length=255)
    slug = models.SlugField(max_length=255, unique=True, blank=True)
    cover_image = models.ImageField(upload_to='blog/covers/', blank=True)
    cover_image_url = models.URLField(
        max_length=500, blank=True, default='',
        help_text='External URL for cover image (used when no file is uploaded).',
    )
    cover_image_credit = models.CharField(
        max_length=255, blank=True, default='',
        help_text='Attribution text for the cover image (e.g. "Photo by John Doe on Unsplash").',
    )
    cover_image_credit_url = models.URLField(
        max_length=500, blank=True, default='',
        help_text='URL to the photographer profile or image source page.',
    )
    excerpt_es = models.TextField(
        help_text='Resumen corto en español (1-2 oraciones).'
    )
    excerpt_en = models.TextField(
        help_text='Short summary in English (1-2 sentences).'
    )
    content_es = models.TextField(
        blank=True, default='',
        help_text='Contenido completo del artículo en HTML (español).'
    )
    content_en = models.TextField(
        blank=True, default='',
        help_text='Full article content in HTML (English).'
    )
    content_json_es = models.JSONField(
        default=dict, blank=True,
        help_text='Structured JSON content in Spanish (intro, sections, conclusion, cta).'
    )
    content_json_en = models.JSONField(
        default=dict, blank=True,
        help_text='Structured JSON content in English (intro, sections, conclusion, cta).'
    )
    sources = models.JSONField(
        default=list, blank=True,
        help_text='List of {name, url} objects for consulted sources.'
    )

    category = models.CharField(
        max_length=50, blank=True, default='',
        help_text='Category slug for filtering (e.g. adopcion, cuidado-animal, salud-animal).'
    )
    read_time_minutes = models.PositiveIntegerField(
        default=0,
        help_text='Estimated reading time in minutes.'
    )
    is_featured = models.BooleanField(
        default=False,
        help_text='Pin this post as the featured/hero post on the blog listing.'
    )
    author = models.CharField(
        max_length=50, blank=True, default='tuhuella-team',
        choices=AUTHOR_CHOICES,
        help_text='Author profile slug (tuhuella-team, laura-blanco).',
    )

    meta_title_es = models.CharField(
        max_length=255, blank=True, default='',
        help_text='SEO title override in Spanish.'
    )
    meta_title_en = models.CharField(
        max_length=255, blank=True, default='',
        help_text='SEO title override in English.'
    )
    meta_description_es = models.TextField(
        blank=True, default='',
        help_text='SEO meta description in Spanish.'
    )
    meta_description_en = models.TextField(
        blank=True, default='',
        help_text='SEO meta description in English.'
    )
    meta_keywords_es = models.CharField(
        max_length=500, blank=True, default='',
        help_text='Comma-separated SEO keywords in Spanish.',
    )
    meta_keywords_en = models.CharField(
        max_length=500, blank=True, default='',
        help_text='Comma-separated SEO keywords in English.',
    )

    is_published = models.BooleanField(default=False)
    published_at = models.DateTimeField(null=True, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-published_at', '-created_at']
        verbose_name = 'Blog Post'
        verbose_name_plural = 'Blog Posts'

    def __str__(self):
        return self.title_es

    def save(self, *args, **kwargs):
        if not self.slug:
            base_slug = slugify(self.title_es)
            slug = base_slug
            counter = 1
            while BlogPost.objects.filter(slug=slug).exclude(pk=self.pk).exists():
                slug = f'{base_slug}-{counter}'
                counter += 1
            self.slug = slug
        if self.is_published and not self.published_at:
            self.published_at = timezone.now()
        super().save(*args, **kwargs)
