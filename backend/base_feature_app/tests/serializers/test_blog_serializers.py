import pytest
from rest_framework.exceptions import ValidationError as DRFValidationError

from base_feature_app.serializers.blog import (
    BlogPostAdminDetailSerializer,
    BlogPostAdminListSerializer,
    BlogPostCreateUpdateSerializer,
    BlogPostFromJSONSerializer,
    BlogPostListSerializer,
    _validate_content_json,
    _get_cover_image_display,
)

# ── Sources validation ───────────────────────────────────────────────────────


@pytest.mark.django_db
def test_validate_sources_rejects_non_list():
    """Non-list sources value raises validation error."""
    serializer = BlogPostCreateUpdateSerializer(data={
        'title_es': 'Test', 'sources': 'not a list',
    })
    assert not serializer.is_valid()
    assert 'sources' in serializer.errors


@pytest.mark.django_db
def test_validate_sources_rejects_non_dict_item():
    """Non-dict item in sources raises validation error."""
    serializer = BlogPostCreateUpdateSerializer(data={
        'title_es': 'Test', 'sources': ['string'],
    })
    assert not serializer.is_valid()
    assert 'sources' in serializer.errors


@pytest.mark.django_db
def test_validate_sources_rejects_missing_url_key():
    """Source item without url key raises validation error."""
    serializer = BlogPostCreateUpdateSerializer(data={
        'title_es': 'Test', 'sources': [{'name': 'x'}],
    })
    assert not serializer.is_valid()
    assert 'sources' in serializer.errors


@pytest.mark.django_db
def test_validate_sources_passes_valid_data():
    """Valid sources data passes validation."""
    serializer = BlogPostCreateUpdateSerializer(data={
        'title_es': 'Test',
        'sources': [{'name': 'Wikipedia', 'url': 'https://wikipedia.org'}],
    })
    serializer.is_valid()
    assert 'sources' not in serializer.errors


# ── Content JSON validation ──────────────────────────────────────────────────


def test_validate_content_json_rejects_non_dict():
    """Non-dict content_json raises validation error."""
    with pytest.raises(DRFValidationError) as exc_info:
        _validate_content_json('not a dict')
    assert 'JSON object' in str(exc_info.value)


def test_validate_content_json_rejects_missing_intro():
    """Content missing intro key raises validation error."""
    with pytest.raises(DRFValidationError) as exc_info:
        _validate_content_json({'sections': []})
    assert 'intro' in str(exc_info.value)


def test_validate_content_json_rejects_section_without_heading():
    """Section without heading key raises validation error."""
    with pytest.raises(DRFValidationError) as exc_info:
        _validate_content_json({
            'intro': 'Introduction text',
            'sections': [{'content': 'No heading here'}],
        })
    assert 'heading' in str(exc_info.value)


def test_validate_content_json_passes_valid_structure():
    """Valid content_json structure passes without error."""
    result = _validate_content_json({
        'intro': 'Introduction',
        'sections': [{'heading': 'Section 1', 'content': 'Body text'}],
    })
    assert result['intro'] == 'Introduction'


# ── _get_cover_image_display ─────────────────────────────────────────────────

def test_get_cover_image_display_returns_empty_when_no_cover():
    """Returns '' when cover_image is None and cover_image_url is empty."""
    from types import SimpleNamespace
    obj = SimpleNamespace(cover_image=None, cover_image_url='')
    assert _get_cover_image_display(obj) == ''


def test_get_cover_image_display_falls_back_to_url_field():
    """Returns cover_image_url when cover_image (Library) is None."""
    from types import SimpleNamespace
    obj = SimpleNamespace(cover_image=None, cover_image_url='https://unsplash.com/img.jpg')
    assert _get_cover_image_display(obj) == 'https://unsplash.com/img.jpg'


def test_get_cover_image_display_prefers_uploaded_file():
    """Uploaded file URL takes priority over cover_image_url."""
    from types import SimpleNamespace
    library = SimpleNamespace(
        primary_attachment=SimpleNamespace(file=SimpleNamespace(url='/media/blog/img.jpg')),
    )
    obj = SimpleNamespace(cover_image=library, cover_image_url='https://unsplash.com/img.jpg')
    assert _get_cover_image_display(obj) == '/media/blog/img.jpg'


@pytest.mark.django_db
def test_blog_list_serializer_cover_image_empty_when_no_attachment(blog_post):
    """List serializer returns '' for cover_image when no file or URL is set."""
    blog_post.cover_image = None
    blog_post.cover_image_url = ''
    blog_post.save(update_fields=['cover_image', 'cover_image_url'])

    data = BlogPostListSerializer(blog_post, context={}).data
    assert data['cover_image'] == ''


@pytest.mark.django_db
def test_blog_list_serializer_cover_image_resolves_url_field(blog_post):
    """List serializer resolves cover_image from cover_image_url fallback."""
    blog_post.cover_image = None
    blog_post.cover_image_url = 'https://unsplash.com/photo.jpg'
    blog_post.save(update_fields=['cover_image', 'cover_image_url'])

    data = BlogPostListSerializer(blog_post, context={}).data
    assert data['cover_image'] == 'https://unsplash.com/photo.jpg'


# ── Admin serializers ────────────────────────────────────────────────────────


@pytest.mark.django_db
def test_blog_post_admin_list_serializer_returns_bilingual_fields(blog_post):
    """BlogPostAdminListSerializer exposes both Spanish and English title and excerpt fields."""
    data = BlogPostAdminListSerializer(blog_post).data

    assert data['title_es'] == 'Guía de adopción responsable'
    assert data['title_en'] == 'Responsible Adoption Guide'
    assert 'excerpt_es' in data
    assert 'excerpt_en' in data


@pytest.mark.django_db
def test_blog_post_admin_detail_serializer_returns_all_language_fields(blog_post):
    """BlogPostAdminDetailSerializer exposes bilingual content and meta fields."""
    data = BlogPostAdminDetailSerializer(blog_post).data

    assert 'content_es' in data
    assert 'content_en' in data
    assert 'meta_title_es' in data
    assert 'meta_title_en' in data
    assert 'content_json_es' in data
    assert 'content_json_en' in data


@pytest.mark.django_db
def test_blog_post_create_update_serializer_validates_content_json_es():
    """BlogPostCreateUpdateSerializer accepts valid content_json_es structure."""
    serializer = BlogPostCreateUpdateSerializer(data={
        'title_es': 'Guía de adopción',
        'title_en': 'Adoption Guide',
        'excerpt_es': 'Todo lo que necesitas saber.',
        'excerpt_en': 'Everything you need to know.',
        'content_json_es': {
            'intro': 'Introducción al tema.',
            'sections': [{'heading': 'Sección 1', 'content': 'Contenido de la sección.'}],
        },
    })

    assert serializer.is_valid(), serializer.errors


def test_blog_post_from_json_serializer_validates_valid_data():
    """BlogPostFromJSONSerializer accepts a complete valid payload with content_json_es."""
    serializer = BlogPostFromJSONSerializer(data={
        'title_es': 'Adopción responsable',
        'title_en': 'Responsible adoption',
        'excerpt_es': 'Todo lo que necesitas saber.',
        'excerpt_en': 'Everything you need to know.',
        'content_json_es': {
            'intro': 'Introducción.',
            'sections': [{'heading': 'Sección 1', 'content': 'Contenido'}],
        },
    })

    assert serializer.is_valid(), serializer.errors
