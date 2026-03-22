from rest_framework import serializers
from base_feature_app.models import Animal


class AnimalListSerializer(serializers.ModelSerializer):
    shelter_name = serializers.CharField(source='shelter.name', read_only=True)

    class Meta:
        model = Animal
        fields = [
            'id', 'name', 'species', 'breed', 'age_range', 'gender',
            'size', 'status', 'is_vaccinated', 'is_sterilized',
            'shelter', 'shelter_name', 'created_at',
        ]
