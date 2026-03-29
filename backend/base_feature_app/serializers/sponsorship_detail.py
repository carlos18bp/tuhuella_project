from rest_framework import serializers
from base_feature_app.models import Sponsorship


class SponsorshipDetailSerializer(serializers.ModelSerializer):
    user_email = serializers.EmailField(source='user.email', read_only=True)
    animal_name = serializers.CharField(source='animal.name', read_only=True)
    shelter_name = serializers.CharField(source='animal.shelter.name', read_only=True)

    class Meta:
        model = Sponsorship
        fields = [
            'id', 'user', 'user_email', 'animal', 'animal_name',
            'shelter_name', 'amount', 'frequency', 'status',
            'started_at', 'created_at', 'updated_at',
        ]
