from rest_framework import serializers
from base_feature_app.models import Animal


class AnimalCreateUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Animal
        fields = [
            'id', 'shelter', 'name', 'species', 'breed', 'age_range',
            'gender', 'size', 'description_es', 'description_en',
            'special_needs_es', 'special_needs_en', 'status',
            'is_vaccinated', 'is_sterilized', 'weight', 'is_house_trained',
            'good_with_kids', 'good_with_dogs', 'good_with_cats',
            'energy_level', 'coat_color', 'intake_date', 'microchip_id',
        ]
