from django.utils import timezone
from rest_framework import serializers

from base_feature_app.models import AdoptionApplicationEvent


class AdoptionEventCreateUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = AdoptionApplicationEvent
        fields = ['id', 'event_date', 'description']

    def validate_event_date(self, value):
        if value and value > timezone.now():
            raise serializers.ValidationError('event_date cannot be in the future.')
        return value

    def validate_description(self, value):
        if not value or not value.strip():
            raise serializers.ValidationError('description is required.')
        return value.strip()
