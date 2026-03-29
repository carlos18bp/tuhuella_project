from rest_framework import serializers
from base_feature_app.models import ShelterInvite


class ShelterInviteCreateUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = ShelterInvite
        fields = ['id', 'shelter', 'adopter_intent', 'message']
