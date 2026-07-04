import pytest

from base_feature_app.serializers.faq import FAQItemSerializer, FAQTopicSerializer
from base_feature_app.tests.factories import FAQItemFactory, FAQTopicFactory


@pytest.mark.django_db
def test_item_serializer_returns_spanish_question_by_default():
    """Without a language context the item question is Spanish."""
    item = FAQItemFactory(question_es='¿Cómo adopto?', question_en='How do I adopt?')
    data = FAQItemSerializer(item).data
    assert data['question'] == '¿Cómo adopto?'


@pytest.mark.django_db
def test_item_serializer_returns_english_question_with_en_context():
    """An 'en' language context returns the English question."""
    item = FAQItemFactory(question_es='¿Cómo adopto?', question_en='How do I adopt?')
    data = FAQItemSerializer(item, context={'lang': 'en'}).data
    assert data['question'] == 'How do I adopt?'


@pytest.mark.django_db
def test_topic_serializer_localizes_display_name():
    """Topic display name honors the language context."""
    topic = FAQTopicFactory(display_name_es='Adopción', display_name_en='Adoption')
    data = FAQTopicSerializer(topic, context={'lang': 'en'}).data
    assert data['display_name'] == 'Adoption'


@pytest.mark.django_db
def test_topic_serializer_excludes_inactive_items():
    """Only active items appear in a topic's item list."""
    topic = FAQTopicFactory()
    FAQItemFactory(topic=topic, is_active=True)
    FAQItemFactory(topic=topic, is_active=False)
    data = FAQTopicSerializer(topic).data
    assert len(data['items']) == 1


@pytest.mark.django_db
def test_topic_serializer_includes_active_items():
    """Active items are serialized in the topic's item list."""
    topic = FAQTopicFactory()
    FAQItemFactory(topic=topic, is_active=True, question_es='Pregunta activa')
    data = FAQTopicSerializer(topic).data
    assert data['items'][0]['question'] == 'Pregunta activa'
