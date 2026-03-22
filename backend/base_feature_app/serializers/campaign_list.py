from rest_framework import serializers
from base_feature_app.models import Campaign


class CampaignListSerializer(serializers.ModelSerializer):
    shelter_name = serializers.CharField(source='shelter.name', read_only=True)
    progress_percentage = serializers.IntegerField(read_only=True)

    class Meta:
        model = Campaign
        fields = [
            'id', 'title', 'shelter', 'shelter_name', 'status',
            'goal_amount', 'raised_amount', 'progress_percentage',
            'starts_at', 'ends_at', 'created_at',
        ]
