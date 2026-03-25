from rest_framework import serializers
from base_feature_app.models import Campaign


class CampaignCreateUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Campaign
        fields = [
            'id', 'shelter', 'title_es', 'title_en', 'description_es',
            'description_en', 'goal_amount', 'status', 'starts_at', 'ends_at',
        ]
