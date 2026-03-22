from rest_framework import serializers
from base_feature_app.models import Shelter


class ShelterCreateUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Shelter
        fields = [
            'id', 'name', 'legal_name', 'description', 'city', 'address',
            'phone', 'email', 'website',
        ]
