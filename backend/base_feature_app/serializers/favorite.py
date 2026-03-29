from rest_framework import serializers

from django_attachments.models import Attachment

from base_feature_app.models import Favorite


class FavoriteSerializer(serializers.ModelSerializer):
    animal_name = serializers.CharField(source='animal.name', read_only=True)
    animal_species = serializers.CharField(source='animal.species', read_only=True)
    breed = serializers.CharField(source='animal.breed', read_only=True)
    age_range = serializers.CharField(source='animal.age_range', read_only=True)
    size = serializers.CharField(source='animal.size', read_only=True)
    gender = serializers.CharField(source='animal.gender', read_only=True)
    is_vaccinated = serializers.BooleanField(source='animal.is_vaccinated', read_only=True)
    is_sterilized = serializers.BooleanField(source='animal.is_sterilized', read_only=True)
    status = serializers.CharField(source='animal.status', read_only=True)
    shelter_name = serializers.CharField(source='animal.shelter.name', read_only=True)
    shelter_city = serializers.CharField(source='animal.shelter.city', read_only=True)
    thumbnail_url = serializers.SerializerMethodField()

    class Meta:
        model = Favorite
        fields = [
            'id', 'animal', 'animal_name', 'animal_species',
            'breed', 'age_range', 'size', 'gender',
            'is_vaccinated', 'is_sterilized', 'status',
            'shelter_name', 'shelter_city', 'thumbnail_url',
            'note', 'created_at',
        ]

    def get_thumbnail_url(self, obj):
        gallery = getattr(obj.animal, 'gallery', None)
        if not gallery:
            return None
        first = Attachment.objects.filter(library=gallery).order_by('rank').first()
        return first.file.url if first else None
