from rest_framework import serializers

from base_feature_app.models import Campaign
from base_feature_app.utils.shelter_access import user_can_manage_shelter


class CampaignCreateUpdateSerializer(serializers.ModelSerializer):
    def validate_shelter(self, value):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            if not user_can_manage_shelter(request.user, value):
                raise serializers.ValidationError('You cannot manage this shelter.')
        return value

    class Meta:
        model = Campaign
        fields = [
            'id', 'shelter', 'title_es', 'title_en', 'description_es',
            'description_en', 'goal_amount', 'status', 'starts_at', 'ends_at',
        ]
