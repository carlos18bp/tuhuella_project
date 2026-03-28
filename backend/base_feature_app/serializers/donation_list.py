from rest_framework import serializers
from base_feature_app.models import Donation


class DonationListSerializer(serializers.ModelSerializer):
    user_email = serializers.EmailField(source='user.email', read_only=True)
    shelter_name = serializers.CharField(source='shelter.name', read_only=True, default=None)
    shelter_city = serializers.CharField(source='shelter.city', read_only=True, default=None)
    campaign_title = serializers.CharField(source='campaign.title_es', read_only=True, default=None)

    class Meta:
        model = Donation
        fields = [
            'id', 'user', 'user_email', 'shelter', 'shelter_name',
            'shelter_city', 'campaign', 'campaign_title',
            'amount', 'message', 'status',
            'paid_at', 'created_at',
        ]
