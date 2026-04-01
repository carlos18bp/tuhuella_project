from rest_framework import serializers
from base_feature_app.models import Payment


class PaymentListSerializer(serializers.ModelSerializer):
    modality = serializers.CharField(read_only=True)

    class Meta:
        model = Payment
        fields = [
            'id', 'donation', 'sponsorship', 'modality', 'provider', 'provider_reference',
            'amount', 'status', 'paid_at', 'created_at',
        ]
