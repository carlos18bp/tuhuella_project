from rest_framework import serializers
from base_feature_app.models import Sponsorship


class SponsorshipCreateUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Sponsorship
        fields = ['id', 'animal', 'amount', 'frequency']
