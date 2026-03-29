from rest_framework import serializers

from base_feature_app.models import FAQTopic, FAQItem
from base_feature_app.serializers.utils import get_lang


class FAQItemSerializer(serializers.ModelSerializer):
    question = serializers.SerializerMethodField()
    answer = serializers.SerializerMethodField()

    class Meta:
        model = FAQItem
        fields = ('id', 'question', 'answer', 'order')

    def get_question(self, obj):
        return getattr(obj, f'question_{get_lang(self)}')

    def get_answer(self, obj):
        return getattr(obj, f'answer_{get_lang(self)}')


class FAQTopicSerializer(serializers.ModelSerializer):
    display_name = serializers.SerializerMethodField()
    items = serializers.SerializerMethodField()

    class Meta:
        model = FAQTopic
        fields = ('id', 'slug', 'display_name', 'items')

    def get_display_name(self, obj):
        return getattr(obj, f'display_name_{get_lang(self)}')

    def get_items(self, obj):
        active_items = obj.items.filter(is_active=True)
        return FAQItemSerializer(active_items, many=True, context=self.context).data
