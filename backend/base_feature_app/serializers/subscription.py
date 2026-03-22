from rest_framework import serializers
from base_feature_app.models import Subscription


class SubscriptionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Subscription
        fields = [
            'id', 'sponsorship', 'provider', 'provider_reference',
            'interval', 'next_payment_at', 'status',
            'created_at', 'updated_at',
        ]
