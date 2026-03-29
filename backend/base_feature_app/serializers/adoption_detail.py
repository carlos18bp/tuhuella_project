from rest_framework import serializers
from base_feature_app.models import AdoptionApplication


class AdoptionDetailSerializer(serializers.ModelSerializer):
    user_email = serializers.EmailField(source='user.email', read_only=True)
    animal_name = serializers.CharField(source='animal.name', read_only=True)
    shelter_name = serializers.CharField(source='animal.shelter.name', read_only=True)

    class Meta:
        model = AdoptionApplication
        fields = [
            'id', 'animal', 'animal_name', 'shelter_name',
            'user', 'user_email', 'status', 'form_answers',
            'notes', 'reviewed_at', 'created_at', 'updated_at',
        ]
