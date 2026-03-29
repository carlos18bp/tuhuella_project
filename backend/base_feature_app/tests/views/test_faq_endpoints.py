import pytest
from django.urls import reverse

from base_feature_app.tests.factories import FAQItemFactory, FAQTopicFactory


@pytest.mark.django_db
def test_list_all_faqs_returns_active_topics(api_client):
    """Only active FAQ topics are returned."""
    FAQTopicFactory(is_active=True)
    FAQTopicFactory(is_active=True)
    FAQTopicFactory(is_active=False)
    url = reverse('faq-list-all')
    response = api_client.get(url)
    assert response.status_code == 200
    assert len(response.json()) == 2


@pytest.mark.django_db
def test_list_all_faqs_includes_active_items_only(api_client):
    """Each topic only includes its active items."""
    topic = FAQTopicFactory(is_active=True)
    FAQItemFactory(topic=topic, is_active=True)
    FAQItemFactory(topic=topic, is_active=True)
    FAQItemFactory(topic=topic, is_active=False)
    url = reverse('faq-list-all')
    response = api_client.get(url)
    items = response.json()[0]['items']
    assert len(items) == 2


@pytest.mark.django_db
def test_faqs_by_topic_returns_matching_topic(api_client):
    """GET by slug returns the matching active topic."""
    FAQTopicFactory(slug='adoption', is_active=True)
    url = reverse('faq-by-topic', kwargs={'topic_slug': 'adoption'})
    response = api_client.get(url)
    assert response.status_code == 200
    assert response.json()['slug'] == 'adoption'


@pytest.mark.django_db
def test_faqs_by_topic_not_found_for_inactive(api_client):
    """Inactive topic returns 404."""
    FAQTopicFactory(slug='hidden', is_active=False)
    url = reverse('faq-by-topic', kwargs={'topic_slug': 'hidden'})
    response = api_client.get(url)
    assert response.status_code == 404


@pytest.mark.django_db
def test_faqs_by_topic_not_found_for_bad_slug(api_client):
    """Nonexistent slug returns 404."""
    url = reverse('faq-by-topic', kwargs={'topic_slug': 'nonexistent'})
    response = api_client.get(url)
    assert response.status_code == 404
