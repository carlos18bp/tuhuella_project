from rest_framework import serializers
from base_feature_app.models import Campaign
from base_feature_app.serializers.utils import get_lang


class CampaignListSerializer(serializers.ModelSerializer):
    shelter_name = serializers.CharField(source='shelter.name', read_only=True)
    progress_percentage = serializers.IntegerField(read_only=True)
    cover_image_url = serializers.SerializerMethodField()
    title = serializers.SerializerMethodField()
    description = serializers.SerializerMethodField()

    class Meta:
        model = Campaign
        fields = [
            'id', 'title', 'description', 'shelter', 'shelter_name', 'status',
            'goal_amount', 'raised_amount', 'progress_percentage',
            'cover_image_url', 'starts_at', 'ends_at', 'created_at',
        ]

    def get_title(self, obj):
        return getattr(obj, f'title_{get_lang(self)}')

    def get_description(self, obj):
        return getattr(obj, f'description_{get_lang(self)}')

    def get_cover_image_url(self, obj):
        if obj.cover_image:
            return obj.cover_image.url
        return ''
