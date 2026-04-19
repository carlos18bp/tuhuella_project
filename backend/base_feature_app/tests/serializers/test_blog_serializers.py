import pytest
from rest_framework.exceptions import ValidationError as DRFValidationError

from base_feature_app.serializers.blog import (
    BlogPostCreateUpdateSerializer,
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
    from unittest.mock import MagicMock
    obj = MagicMock()
    obj.cover_image = None
    obj.cover_image_url = ''
    assert _get_cover_image_display(obj) == ''


def test_get_cover_image_display_falls_back_to_url_field():
    """Returns cover_image_url when cover_image (Library) is None."""
    from unittest.mock import MagicMock
    obj = MagicMock()
    obj.cover_image = None
    obj.cover_image_url = 'https://unsplash.com/img.jpg'
    assert _get_cover_image_display(obj) == 'https://unsplash.com/img.jpg'


def test_get_cover_image_display_prefers_uploaded_file():
    """Uploaded file URL takes priority over cover_image_url."""
    from unittest.mock import MagicMock
    library = MagicMock()
    library.primary_attachment.file.url = '/media/blog/img.jpg'

    obj = MagicMock()
    obj.cover_image = library
    obj.cover_image_url = 'https://unsplash.com/img.jpg'
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
