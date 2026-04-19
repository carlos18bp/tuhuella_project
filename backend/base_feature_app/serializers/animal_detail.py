from rest_framework import serializers
from base_feature_app.models import Animal
from base_feature_app.serializers.animal_disease import DiseaseScreeningSerializer
from base_feature_app.serializers.utils import get_lang


class AnimalDetailSerializer(serializers.ModelSerializer):
    shelter_name = serializers.CharField(source='shelter.name', read_only=True)
    shelter_city = serializers.CharField(source='shelter.city', read_only=True)
    description = serializers.SerializerMethodField()
    special_needs = serializers.SerializerMethodField()
    gallery_urls = serializers.SerializerMethodField()
    disease_screenings = DiseaseScreeningSerializer(many=True, read_only=True)

    class Meta:
        model = Animal
        fields = [
            'id', 'name', 'species', 'breed', 'age_range', 'gender', 'size',
            'description', 'special_needs', 'status', 'is_vaccinated',
            'is_sterilized', 'is_dewormed', 'vaccinated_at', 'sterilized_at',
            'last_vet_checkup', 'medical_notes_es', 'medical_notes_en',
            'weight', 'is_house_trained',
            'good_with_kids', 'good_with_dogs', 'good_with_cats',
            'energy_level', 'coat_color', 'intake_date', 'microchip_id',
            'shelter', 'shelter_name', 'shelter_city',
            'adopted_at', 'adoption_application', 'archived_at',
            'gallery_urls', 'disease_screenings', 'created_at', 'updated_at',
        ]

    def get_description(self, obj):
        return getattr(obj, f'description_{get_lang(self)}')

    def get_special_needs(self, obj):
        return getattr(obj, f'special_needs_{get_lang(self)}')

    def get_gallery_urls(self, obj):
        if not obj.gallery:
            return []
        return [att.file.url for att in obj.gallery.attachment_set.order_by('rank')]
