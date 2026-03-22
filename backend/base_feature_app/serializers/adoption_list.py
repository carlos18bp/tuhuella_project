from rest_framework import serializers
from base_feature_app.models import AdoptionApplication


class AdoptionListSerializer(serializers.ModelSerializer):
    user_email = serializers.EmailField(source='user.email', read_only=True)
    animal_name = serializers.CharField(source='animal.name', read_only=True)

    class Meta:
        model = AdoptionApplication
        fields = [
            'id', 'animal', 'animal_name', 'user', 'user_email',
            'status', 'created_at', 'reviewed_at',
        ]
