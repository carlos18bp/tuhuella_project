from rest_framework import serializers
from base_feature_app.models import Campaign
from base_feature_app.serializers.utils import get_lang
from django_attachments.models import Attachment


class CampaignDetailSerializer(serializers.ModelSerializer):
    shelter_name = serializers.CharField(source='shelter.name', read_only=True)
    progress_percentage = serializers.IntegerField(read_only=True)
    title = serializers.SerializerMethodField()
    description = serializers.SerializerMethodField()
    cover_image_url = serializers.SerializerMethodField()
    evidence_gallery_urls = serializers.SerializerMethodField()

    class Meta:
        model = Campaign
        fields = [
            'id', 'title', 'description', 'shelter', 'shelter_name',
            'status', 'goal_amount', 'raised_amount', 'progress_percentage',
            'cover_image_url', 'evidence_gallery_urls',
            'starts_at', 'ends_at', 'created_at', 'updated_at',
        ]

    def get_title(self, obj):
        return getattr(obj, f'title_{get_lang(self)}')

    def get_description(self, obj):
        return getattr(obj, f'description_{get_lang(self)}')

    def get_cover_image_url(self, obj):
        if obj.cover_image and obj.cover_image.primary_attachment:
            return obj.cover_image.primary_attachment.file.url
        return ''

    def get_evidence_gallery_urls(self, obj):
        if not obj.evidence_gallery:
            return []
        return [
            att.file.url
            for att in Attachment.objects.filter(library=obj.evidence_gallery).order_by('rank')
        ]
