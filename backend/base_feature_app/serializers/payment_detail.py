from rest_framework import serializers
from base_feature_app.models import Payment


class PaymentDetailSerializer(serializers.ModelSerializer):
    class Meta:
        model = Payment
        fields = [
            'id', 'donation', 'sponsorship', 'provider',
            'provider_reference', 'amount', 'status',
            'paid_at', 'metadata', 'created_at', 'updated_at',
        ]
