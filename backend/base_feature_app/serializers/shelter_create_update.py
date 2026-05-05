from rest_framework import serializers
from base_feature_app.models import Shelter


class ShelterCreateUpdateSerializer(serializers.ModelSerializer):
    website = serializers.URLField(required=False, allow_blank=True)
    video = serializers.FileField(required=False, allow_null=True)

    class Meta:
        model = Shelter
        fields = [
            'id', 'name', 'legal_name', 'description_es', 'description_en',
            'city', 'address', 'phone', 'email', 'website', 'video',
        ]
