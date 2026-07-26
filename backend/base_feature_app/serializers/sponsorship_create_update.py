from rest_framework import serializers
from base_feature_app.models import Sponsorship


class SponsorshipCreateUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Sponsorship
        fields = ['id', 'animal', 'amount', 'frequency']

    def validate_amount(self, value):
        """Reject zero/negative sponsorships before they reach the DB."""
        if value is not None and value <= 0:
            raise serializers.ValidationError('amount must be greater than zero')
        return value
