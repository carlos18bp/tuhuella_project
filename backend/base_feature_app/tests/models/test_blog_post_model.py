import pytest
from django.utils import timezone
from freezegun import freeze_time

from base_feature_app.models import BlogPost


@pytest.mark.django_db
def test_blog_post_str_returns_title_es(blog_post):
    """__str__ returns the Spanish title."""
    assert str(blog_post) == 'Guía de adopción responsable'


@pytest.mark.django_db
def test_blog_post_slug_auto_generated(blog_post):
    """Slug is auto-generated from title_es on creation."""
    assert blog_post.slug != ''
    assert 'guia-de-adopcion-responsable' in blog_post.slug


@pytest.mark.django_db
def test_blog_post_slug_unique():
    """Two posts with the same title get different slugs."""
    p1 = BlogPost.objects.create(
        title_es='Título Duplicado', title_en='Duplicate Title',
        excerpt_es='Test', excerpt_en='Test',
    )
    p2 = BlogPost.objects.create(
        title_es='Título Duplicado', title_en='Duplicate Title',
        excerpt_es='Test', excerpt_en='Test',
    )
    assert p1.slug != p2.slug


@pytest.mark.django_db
def test_blog_post_published_at_set_on_publish():
    """published_at is set when is_published transitions to True."""
    post = BlogPost.objects.create(
        title_es='Test', title_en='Test',
        excerpt_es='Test', excerpt_en='Test',
        is_published=False,
    )
    assert post.published_at is None

    post.is_published = True
    post.save()
    post.refresh_from_db()
    assert post.published_at is not None


@pytest.mark.django_db
@freeze_time('2025-03-15 12:00:00')
def test_blog_post_default_ordering():
    """Blog posts are ordered by -published_at, -created_at."""
    now = timezone.now()
    old = BlogPost.objects.create(
        title_es='Old', title_en='Old',
        excerpt_es='Old', excerpt_en='Old',
        is_published=True,
        published_at=now - timezone.timedelta(days=10),
    )
    new = BlogPost.objects.create(
        title_es='New', title_en='New',
        excerpt_es='New', excerpt_en='New',
        is_published=True,
        published_at=now,
    )
    posts = list(BlogPost.objects.all())
    assert posts[0] == new
    assert posts[1] == old


@pytest.mark.django_db
def test_blog_post_category_choices():
    """All expected categories are valid choices."""
    valid = {slug for slug, _ in BlogPost.CATEGORY_CHOICES}
    assert 'adopcion' in valid
    assert 'salud-animal' in valid
    assert 'legislacion' in valid


@pytest.mark.django_db
def test_blog_post_author_choices():
    """All expected authors are valid choices."""
    valid = {slug for slug, _ in BlogPost.AUTHOR_CHOICES}
    assert 'tuhuella-team' in valid
    assert 'laura-blanco' in valid


@pytest.mark.django_db
def test_blog_post_draft_has_no_published_at(draft_blog_post):
    """Draft posts have published_at=None."""
    assert draft_blog_post.is_published is False
    assert draft_blog_post.published_at is None
