from rest_framework import serializers
from base_feature_app.models import AdoptionApplication


class AdoptionCreateUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = AdoptionApplication
        fields = ['id', 'animal', 'form_answers', 'notes']
