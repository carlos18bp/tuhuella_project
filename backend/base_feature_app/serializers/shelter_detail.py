from rest_framework import serializers
from base_feature_app.models import Shelter
from base_feature_app.serializers.utils import get_lang
from django_attachments.models import Attachment


class ShelterDetailSerializer(serializers.ModelSerializer):
    owner_email = serializers.EmailField(source='owner.email', read_only=True)
    is_verified = serializers.BooleanField(read_only=True)
    description = serializers.SerializerMethodField()
    logo_url = serializers.SerializerMethodField()
    cover_image_url = serializers.SerializerMethodField()
    gallery_urls = serializers.SerializerMethodField()

    class Meta:
        model = Shelter
        fields = [
            'id', 'name', 'legal_name', 'description', 'city', 'address',
            'phone', 'email', 'website', 'verification_status', 'verified_at',
            'is_verified', 'owner_email', 'logo_url', 'cover_image_url',
            'gallery_urls', 'created_at', 'updated_at',
        ]

    def get_description(self, obj):
        return getattr(obj, f'description_{get_lang(self)}')

    def get_logo_url(self, obj):
        if obj.logo and obj.logo.primary_attachment:
            return obj.logo.primary_attachment.file.url
        return ''

    def get_cover_image_url(self, obj):
        if obj.cover_image and obj.cover_image.primary_attachment:
            return obj.cover_image.primary_attachment.file.url
        return ''

    def get_gallery_urls(self, obj):
        if not obj.gallery:
            return []
        return [
            att.file.url
            for att in Attachment.objects.filter(library=obj.gallery).order_by('rank')
        ]
