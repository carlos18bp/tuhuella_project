from rest_framework import serializers
from base_feature_app.models import DonationAmountOption, SponsorshipAmountOption


class DonationAmountOptionSerializer(serializers.ModelSerializer):
    class Meta:
        model = DonationAmountOption
        fields = ['id', 'amount', 'label']


class SponsorshipAmountOptionSerializer(serializers.ModelSerializer):
    class Meta:
        model = SponsorshipAmountOption
        fields = ['id', 'amount', 'label']
