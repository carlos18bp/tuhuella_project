from rest_framework import serializers
from base_feature_app.models import Shelter


class ShelterDetailSerializer(serializers.ModelSerializer):
    owner_email = serializers.EmailField(source='owner.email', read_only=True)
    is_verified = serializers.BooleanField(read_only=True)

    class Meta:
        model = Shelter
        fields = [
            'id', 'name', 'legal_name', 'description', 'city', 'address',
            'phone', 'email', 'website', 'verification_status', 'verified_at',
            'is_verified', 'owner_email', 'created_at', 'updated_at',
        ]
