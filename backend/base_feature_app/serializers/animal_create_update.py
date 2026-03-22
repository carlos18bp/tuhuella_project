from rest_framework import serializers
from base_feature_app.models import Animal


class AnimalCreateUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Animal
        fields = [
            'id', 'shelter', 'name', 'species', 'breed', 'age_range',
            'gender', 'size', 'description', 'special_needs', 'status',
            'is_vaccinated', 'is_sterilized',
        ]
