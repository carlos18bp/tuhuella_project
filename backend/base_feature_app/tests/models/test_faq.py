import pytest
from django.db import IntegrityError, transaction

from base_feature_app.models import FAQItem, FAQTopic
from base_feature_app.tests.factories import FAQItemFactory, FAQTopicFactory


@pytest.mark.django_db
def test_topic_persists_and_str_returns_spanish_name():
    topic = FAQTopicFactory(display_name_es='Adopción')
    assert FAQTopic.objects.filter(pk=topic.pk).exists()
    assert str(topic) == 'Adopción'


@pytest.mark.django_db
def test_topic_defaults_to_active_with_zero_order():
    topic = FAQTopic.objects.create(
        slug='cuidados', display_name_es='Cuidados', display_name_en='Care',
    )
    assert topic.is_active is True
    assert topic.order == 0


@pytest.mark.django_db
def test_topic_slug_must_be_unique():
    FAQTopicFactory(slug='adopcion')
    with pytest.raises(IntegrityError):
        with transaction.atomic():
            FAQTopicFactory(slug='adopcion')
    assert FAQTopic.objects.filter(slug='adopcion').count() == 1


@pytest.mark.django_db
def test_topics_ordered_by_order_then_slug():
    FAQTopicFactory(slug='b-topic', order=2)
    FAQTopicFactory(slug='a-topic', order=1)
    slugs = list(FAQTopic.objects.values_list('slug', flat=True))
    assert slugs == ['a-topic', 'b-topic']


@pytest.mark.django_db
def test_item_persists_and_str_returns_question():
    item = FAQItemFactory(question_es='¿Cómo adopto?')
    assert FAQItem.objects.filter(pk=item.pk).exists()
    assert str(item) == '¿Cómo adopto?'


@pytest.mark.django_db
def test_deleting_topic_cascades_to_items():
    topic = FAQTopicFactory()
    FAQItemFactory(topic=topic)
    topic.delete()
    assert FAQItem.objects.count() == 0
