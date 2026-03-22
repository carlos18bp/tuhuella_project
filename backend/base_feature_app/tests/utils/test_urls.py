import importlib
import importlib.util
from pathlib import Path

import pytest


@pytest.mark.django_db
def test_url_modules_import_and_have_patterns():
    """Verifies each URL sub-module imports successfully and registers the expected named patterns."""
    package_urls = importlib.import_module('base_feature_app.urls')
    assert hasattr(package_urls, 'urlpatterns')

    auth_urls = importlib.import_module('base_feature_app.urls.auth')
    shelter_urls = importlib.import_module('base_feature_app.urls.shelter')
    animal_urls = importlib.import_module('base_feature_app.urls.animal')
    adoption_urls = importlib.import_module('base_feature_app.urls.adoption')
    campaign_urls = importlib.import_module('base_feature_app.urls.campaign')
    favorite_urls = importlib.import_module('base_feature_app.urls.favorite')

    assert any(pattern.name == 'sign_up' for pattern in auth_urls.urlpatterns)
    assert any(pattern.name == 'shelter-list' for pattern in shelter_urls.urlpatterns)
    assert any(pattern.name == 'animal-list' for pattern in animal_urls.urlpatterns)
    assert any(pattern.name == 'adoption-list' for pattern in adoption_urls.urlpatterns)
    assert any(pattern.name == 'campaign-list' for pattern in campaign_urls.urlpatterns)
    assert any(pattern.name == 'favorite-list' for pattern in favorite_urls.urlpatterns)


@pytest.mark.django_db
def test_all_url_modules_importable():
    """Verifies all 13 URL sub-modules import without errors."""
    modules = [
        'base_feature_app.urls.auth',
        'base_feature_app.urls.shelter',
        'base_feature_app.urls.animal',
        'base_feature_app.urls.adoption',
        'base_feature_app.urls.campaign',
        'base_feature_app.urls.donation',
        'base_feature_app.urls.sponsorship',
        'base_feature_app.urls.payment',
        'base_feature_app.urls.update_post',
        'base_feature_app.urls.adopter_intent',
        'base_feature_app.urls.shelter_invite',
        'base_feature_app.urls.admin_urls',
        'base_feature_app.urls.favorite',
    ]
    for module_path in modules:
        mod = importlib.import_module(module_path)
        assert hasattr(mod, 'urlpatterns'), f'{module_path} missing urlpatterns'
        assert len(mod.urlpatterns) >= 1, f'{module_path} has no URL patterns'


@pytest.mark.django_db
def test_module_urls_package_is_executable():
    """Verifies the urls package __init__.py loads and has at least 13 included URL modules."""
    urls_path = Path(__file__).resolve().parents[2] / 'urls' / '__init__.py'
    spec = importlib.util.spec_from_file_location('base_feature_app.urls_module', urls_path)
    module = importlib.util.module_from_spec(spec)
    assert spec is not None
    assert spec.loader is not None
    spec.loader.exec_module(module)

    assert hasattr(module, 'urlpatterns')
    assert len(module.urlpatterns) >= 13
