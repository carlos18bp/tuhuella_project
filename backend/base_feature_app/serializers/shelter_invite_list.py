from rest_framework import serializers
from base_feature_app.models import ShelterInvite


class ShelterInviteListSerializer(serializers.ModelSerializer):
    shelter_name = serializers.CharField(source='shelter.name', read_only=True)
    adopter_email = serializers.EmailField(source='adopter_intent.user.email', read_only=True)

    class Meta:
        model = ShelterInvite
        fields = [
            'id', 'shelter', 'shelter_name', 'adopter_intent',
            'adopter_email', 'message', 'status', 'created_at',
        ]
