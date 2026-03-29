from rest_framework import serializers
from base_feature_app.models import AdopterIntent


class AdopterIntentDetailSerializer(serializers.ModelSerializer):
    user_email = serializers.EmailField(source='user.email', read_only=True)

    class Meta:
        model = AdopterIntent
        fields = [
            'id', 'user', 'user_email', 'preferences',
            'description', 'status', 'visibility',
            'created_at', 'updated_at',
        ]
