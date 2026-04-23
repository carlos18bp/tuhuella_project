from base_feature_app.serializers.utils import get_lang, library_primary_url


# ── library_primary_url ──────────────────────────────────────────────────────

def test_library_primary_url_returns_empty_when_library_is_none():
    assert library_primary_url(None) == ''


def test_library_primary_url_returns_custom_default_when_library_is_none():
    assert library_primary_url(None, default='/placeholder.jpg') == '/placeholder.jpg'


def test_library_primary_url_returns_empty_when_primary_attachment_is_none():
    from types import SimpleNamespace
    library = SimpleNamespace(primary_attachment=None)
    assert library_primary_url(library) == ''


def test_library_primary_url_returns_url_when_attachment_present():
    from types import SimpleNamespace
    library = SimpleNamespace(
        primary_attachment=SimpleNamespace(file=SimpleNamespace(url='/media/covers/img.jpg')),
    )
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
    from types import SimpleNamespace
    req = SimpleNamespace(query_params=SimpleNamespace(get=lambda *_: 'fr'))

    class _FakeSerializer:
        context = {'request': req}
    assert get_lang(_FakeSerializer()) == 'es'
