from rest_framework import serializers
from base_feature_app.models import Favorite


class FavoriteSerializer(serializers.ModelSerializer):
    animal_name = serializers.CharField(source='animal.name', read_only=True)
    animal_species = serializers.CharField(source='animal.species', read_only=True)
    shelter_name = serializers.CharField(source='animal.shelter.name', read_only=True)

    class Meta:
        model = Favorite
        fields = [
            'id', 'animal', 'animal_name', 'animal_species',
            'shelter_name', 'created_at',
        ]
