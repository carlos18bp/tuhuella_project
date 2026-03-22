from rest_framework import serializers
from base_feature_app.models import AdopterIntent


class AdopterIntentCreateUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = AdopterIntent
        fields = ['id', 'preferences', 'description', 'status', 'visibility']
