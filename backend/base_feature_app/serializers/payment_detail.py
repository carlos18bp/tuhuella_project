from rest_framework import serializers

from base_feature_app.models import Payment, PaymentHistory


class PaymentHistorySerializer(serializers.ModelSerializer):
    class Meta:
        model = PaymentHistory
        fields = ['previous_status', 'new_status', 'source', 'metadata', 'created_at']


class PaymentDetailSerializer(serializers.ModelSerializer):
    modality = serializers.CharField(read_only=True)
    status_history = PaymentHistorySerializer(many=True, read_only=True)

    class Meta:
        model = Payment
        fields = [
            'id', 'donation', 'sponsorship', 'modality', 'provider',
            'provider_reference', 'amount', 'status',
            'paid_at', 'metadata', 'status_history',
            'created_at', 'updated_at',
        ]
