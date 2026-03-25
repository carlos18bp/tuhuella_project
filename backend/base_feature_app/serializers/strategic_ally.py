from rest_framework import serializers
from base_feature_app.models import StrategicAlly
from base_feature_app.serializers.utils import get_lang


class StrategicAllySerializer(serializers.ModelSerializer):
    description = serializers.SerializerMethodField()
    logo_url = serializers.SerializerMethodField()

    class Meta:
        model = StrategicAlly
        fields = [
            'id', 'name', 'description', 'logo_url',
            'website', 'ally_type', 'order',
        ]

    def get_description(self, obj):
        lang = get_lang(self)
        val = getattr(obj, f'description_{lang}')
        return val or obj.description_es

    def get_logo_url(self, obj):
        if obj.logo and obj.logo.primary_attachment:
            return obj.logo.primary_attachment.file.url
        return ''
