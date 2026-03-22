from rest_framework import serializers
from base_feature_app.models import Payment


class PaymentListSerializer(serializers.ModelSerializer):
    class Meta:
        model = Payment
        fields = [
            'id', 'provider', 'provider_reference', 'amount',
            'status', 'paid_at', 'created_at',
        ]
