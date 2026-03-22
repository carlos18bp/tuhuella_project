from rest_framework import serializers
from base_feature_app.models import Animal


class AnimalDetailSerializer(serializers.ModelSerializer):
    shelter_name = serializers.CharField(source='shelter.name', read_only=True)
    shelter_city = serializers.CharField(source='shelter.city', read_only=True)

    class Meta:
        model = Animal
        fields = [
            'id', 'name', 'species', 'breed', 'age_range', 'gender', 'size',
            'description', 'special_needs', 'status', 'is_vaccinated',
            'is_sterilized', 'shelter', 'shelter_name', 'shelter_city',
            'created_at', 'updated_at',
        ]
