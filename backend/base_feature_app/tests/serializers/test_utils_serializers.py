from unittest.mock import MagicMock

from base_feature_app.serializers.utils import get_lang, library_primary_url


# ── library_primary_url ──────────────────────────────────────────────────────

def test_library_primary_url_returns_empty_when_library_is_none():
    assert library_primary_url(None) == ''


def test_library_primary_url_returns_custom_default_when_library_is_none():
    assert library_primary_url(None, default='/placeholder.jpg') == '/placeholder.jpg'


def test_library_primary_url_returns_empty_when_primary_attachment_is_none():
    library = MagicMock()
    library.primary_attachment = None
    assert library_primary_url(library) == ''


def test_library_primary_url_returns_url_when_attachment_present():
    library = MagicMock()
    library.primary_attachment.file.url = '/media/covers/img.jpg'
    assert library_primary_url(library) == '/media/covers/img.jpg'


# ── get_lang ─────────────────────────────────────────────────────────────────

def test_get_lang_returns_es_when_no_context():
    class _FakeSerializer:
        context = {}
    assert get_lang(_FakeSerializer()) == 'es'


def test_get_lang_returns_en_from_context_dict():
    class _FakeSerializer:
        context = {'lang': 'en'}
    assert get_lang(_FakeSerializer()) == 'en'


def test_get_lang_returns_es_for_unknown_lang_from_request():
    req = MagicMock()
    req.query_params.get.return_value = 'fr'

    class _FakeSerializer:
        context = {'request': req}
    assert get_lang(_FakeSerializer()) == 'es'
