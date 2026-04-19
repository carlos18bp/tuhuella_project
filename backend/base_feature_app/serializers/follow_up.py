from rest_framework import serializers

from base_feature_app.models import ClinicalHistoryEntry, PostAdoptionFollowUp


class ClinicalHistoryEntrySerializer(serializers.ModelSerializer):
    author_email = serializers.EmailField(source='author.email', read_only=True)

    class Meta:
        model = ClinicalHistoryEntry
        fields = [
            'id', 'animal', 'follow_up', 'author', 'author_email',
            'entry_type', 'title', 'body_es', 'body_en',
            'occurred_at', 'attachment_urls', 'created_at',
        ]
        read_only_fields = ['id', 'author', 'author_email', 'created_at']


class FollowUpListSerializer(serializers.ModelSerializer):
    animal_name = serializers.CharField(source='animal.name', read_only=True)
    shelter_name = serializers.CharField(source='animal.shelter.name', read_only=True)
    adopter_email = serializers.EmailField(source='adopter.email', read_only=True)
    veterinarian_email = serializers.EmailField(source='assigned_veterinarian.email', read_only=True)

    class Meta:
        model = PostAdoptionFollowUp
        fields = [
            'id', 'adoption_application', 'animal', 'animal_name', 'shelter_name',
            'adopter', 'adopter_email', 'assigned_veterinarian', 'veterinarian_email',
            'status', 'scheduled_date', 'completed_date', 'created_at',
        ]


class FollowUpDetailSerializer(FollowUpListSerializer):
    clinical_entries = ClinicalHistoryEntrySerializer(many=True, read_only=True)

    class Meta(FollowUpListSerializer.Meta):
        fields = FollowUpListSerializer.Meta.fields + ['notes', 'updated_at', 'clinical_entries']
