from rest_framework import serializers
from base_feature_app.models import VolunteerPosition
from base_feature_app.serializers.utils import get_lang


class VolunteerPositionSerializer(serializers.ModelSerializer):
    title = serializers.SerializerMethodField()
    description = serializers.SerializerMethodField()
    requirements = serializers.SerializerMethodField()

    class Meta:
        model = VolunteerPosition
        fields = [
            'id', 'title', 'description', 'requirements',
            'category', 'icon', 'order',
        ]

    def get_title(self, obj):
        lang = get_lang(self)
        val = getattr(obj, f'title_{lang}')
        return val or obj.title_es

    def get_description(self, obj):
        lang = get_lang(self)
        val = getattr(obj, f'description_{lang}')
        return val or obj.description_es

    def get_requirements(self, obj):
        lang = get_lang(self)
        val = getattr(obj, f'requirements_{lang}')
        return val or obj.requirements_es
