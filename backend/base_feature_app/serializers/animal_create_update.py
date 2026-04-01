from rest_framework import serializers

from base_feature_app.models import Animal
from base_feature_app.utils.shelter_access import user_can_manage_shelter


class AnimalCreateUpdateSerializer(serializers.ModelSerializer):
    def validate_shelter(self, value):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            if not user_can_manage_shelter(request.user, value):
                raise serializers.ValidationError('You cannot manage this shelter.')
        return value

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
