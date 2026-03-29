import pytest
from rest_framework.exceptions import ValidationError as DRFValidationError

from base_feature_app.serializers.blog import (
    BlogPostCreateUpdateSerializer,
    _validate_content_json,
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
