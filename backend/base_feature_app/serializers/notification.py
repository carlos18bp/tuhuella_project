from rest_framework import serializers
from base_feature_app.models import NotificationPreference, NotificationLog


class NotificationPreferenceSerializer(serializers.ModelSerializer):
    class Meta:
        model = NotificationPreference
        fields = ['id', 'event_key', 'channel', 'enabled']


class NotificationLogSerializer(serializers.ModelSerializer):
    class Meta:
        model = NotificationLog
        fields = [
            'id', 'event_key', 'channel', 'status',
            'metadata', 'is_read', 'sent_at', 'created_at',
        ]
