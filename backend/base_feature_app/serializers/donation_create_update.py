from rest_framework import serializers

from base_feature_app.models import Donation


class DonationCreateUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Donation
        fields = ['id', 'destination', 'shelter', 'campaign', 'amount', 'message']

    def validate(self, attrs):
        dest = attrs.get('destination', Donation.Destination.SHELTER)
        shelter = attrs.get('shelter')
        campaign = attrs.get('campaign')
        if dest == Donation.Destination.PLATFORM:
            attrs['shelter'] = None
            attrs['campaign'] = None
        elif dest == Donation.Destination.SHELTER:
            if not shelter:
                raise serializers.ValidationError(
                    {'shelter': 'Shelter is required for this destination.'},
                )
            attrs['campaign'] = None
        elif dest == Donation.Destination.CAMPAIGN:
            if not campaign:
                raise serializers.ValidationError(
                    {'campaign': 'Campaign is required for this destination.'},
                )
            attrs['shelter'] = campaign.shelter
        return attrs

    def create(self, validated_data):
        instance = Donation(**validated_data)
        instance.full_clean()
        instance.save()
        return instance

    def update(self, instance, validated_data):
        for key, value in validated_data.items():
            setattr(instance, key, value)
        instance.full_clean()
        instance.save()
        return instance
