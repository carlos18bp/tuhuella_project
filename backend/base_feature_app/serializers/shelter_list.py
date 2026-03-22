from rest_framework import serializers
from base_feature_app.models import Shelter


class ShelterListSerializer(serializers.ModelSerializer):
    owner_email = serializers.EmailField(source='owner.email', read_only=True)

    class Meta:
        model = Shelter
        fields = [
            'id', 'name', 'city', 'verification_status',
            'owner_email', 'created_at',
        ]
