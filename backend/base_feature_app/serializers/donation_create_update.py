from rest_framework import serializers
from base_feature_app.models import Donation


class DonationCreateUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Donation
        fields = ['id', 'shelter', 'campaign', 'amount', 'message']
