from rest_framework import serializers

from base_feature_app.models import AnimalDiseaseScreening


class DiseaseScreeningSerializer(serializers.ModelSerializer):
    class Meta:
        model = AnimalDiseaseScreening
        fields = ['id', 'disease_key', 'result', 'tested_on', 'notes']
        read_only_fields = ['id']
