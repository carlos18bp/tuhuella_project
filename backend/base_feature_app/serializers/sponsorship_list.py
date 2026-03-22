from rest_framework import serializers
from base_feature_app.models import Sponsorship


class SponsorshipListSerializer(serializers.ModelSerializer):
    animal_name = serializers.CharField(source='animal.name', read_only=True)

    class Meta:
        model = Sponsorship
        fields = [
            'id', 'animal', 'animal_name', 'amount', 'frequency',
            'status', 'started_at', 'created_at',
        ]
