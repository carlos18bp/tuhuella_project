import pytest

from base_feature_app.serializers.campaign_message import CampaignMessageSerializer
from base_feature_app.tests.factories import (
    CampaignMessageFactory,
    UserFactory,
    WebManagerUserFactory,
)


@pytest.mark.django_db
def test_author_name_returns_sistema_for_system_message():
    """A system message without an author is attributed to 'Sistema'."""
    message = CampaignMessageFactory(author=None, is_system=True)
    data = CampaignMessageSerializer(message).data
    assert data['author_name'] == 'Sistema'


@pytest.mark.django_db
def test_author_name_returns_empty_for_authorless_non_system_message():
    """A non-system message without an author has an empty author name."""
    message = CampaignMessageFactory(author=None, is_system=False)
    data = CampaignMessageSerializer(message).data
    assert data['author_name'] == ''


@pytest.mark.django_db
def test_author_name_returns_full_name():
    """Author name combines the author's first and last name."""
    author = UserFactory(first_name='Ana', last_name='López')
    message = CampaignMessageFactory(author=author)
    data = CampaignMessageSerializer(message).data
    assert data['author_name'] == 'Ana López'


@pytest.mark.django_db
def test_author_name_falls_back_to_email():
    """Author name falls back to email when both names are blank."""
    author = UserFactory(first_name='', last_name='', email='author@example.com')
    message = CampaignMessageFactory(author=author)
    data = CampaignMessageSerializer(message).data
    assert data['author_name'] == 'author@example.com'


@pytest.mark.django_db
def test_author_role_reflects_author_role():
    """Author role mirrors the author's role."""
    author = WebManagerUserFactory()
    message = CampaignMessageFactory(author=author)
    data = CampaignMessageSerializer(message).data
    assert data['author_role'] == 'web_manager'
