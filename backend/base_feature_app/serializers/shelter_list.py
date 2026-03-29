from rest_framework import serializers
from base_feature_app.models import Shelter
from base_feature_app.serializers.utils import get_lang


class ShelterListSerializer(serializers.ModelSerializer):
    owner_email = serializers.EmailField(source='owner.email', read_only=True)
    is_verified = serializers.BooleanField(read_only=True)
    logo_url = serializers.SerializerMethodField()
    cover_image_url = serializers.SerializerMethodField()
    description = serializers.SerializerMethodField()

    class Meta:
        model = Shelter
        fields = [
            'id', 'name', 'description', 'city', 'verification_status',
            'is_verified', 'logo_url', 'cover_image_url',
            'owner_email', 'created_at',
        ]

    def get_description(self, obj):
        return getattr(obj, f'description_{get_lang(self)}')

    def get_logo_url(self, obj):
        if obj.logo:
            return obj.logo.url
        return ''

    def get_cover_image_url(self, obj):
        if obj.cover_image:
            return obj.cover_image.url
        return ''
