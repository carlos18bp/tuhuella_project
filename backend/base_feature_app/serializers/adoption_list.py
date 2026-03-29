from rest_framework import serializers

from django_attachments.models import Attachment

from base_feature_app.models import AdoptionApplication


class AdoptionListSerializer(serializers.ModelSerializer):
    user_email = serializers.EmailField(source='user.email', read_only=True)
    animal_name = serializers.CharField(source='animal.name', read_only=True)
    animal_species = serializers.CharField(source='animal.species', read_only=True)
    shelter_name = serializers.CharField(source='animal.shelter.name', read_only=True)
    shelter_city = serializers.CharField(source='animal.shelter.city', read_only=True)
    thumbnail_url = serializers.SerializerMethodField()

    class Meta:
        model = AdoptionApplication
        fields = [
            'id', 'animal', 'animal_name', 'animal_species',
            'shelter_name', 'shelter_city', 'thumbnail_url',
            'user', 'user_email',
            'status', 'created_at', 'reviewed_at',
        ]

    def get_thumbnail_url(self, obj):
        gallery = getattr(obj.animal, 'gallery', None)
        if not gallery:
            return None
        first = Attachment.objects.filter(library=gallery).order_by('rank').first()
        return first.file.url if first else None
