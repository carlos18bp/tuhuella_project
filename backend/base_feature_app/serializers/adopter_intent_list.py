from rest_framework import serializers
from base_feature_app.models import AdopterIntent


class AdopterIntentListSerializer(serializers.ModelSerializer):
    user_name = serializers.SerializerMethodField()

    class Meta:
        model = AdopterIntent
        fields = [
            'id', 'user', 'user_name', 'preferences',
            'description', 'status', 'visibility', 'created_at',
        ]

    def get_user_name(self, obj):
        return f'{obj.user.first_name} {obj.user.last_name}'.strip() or obj.user.email
