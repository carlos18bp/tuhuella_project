from rest_framework import serializers
from django_attachments.models import Attachment

from base_feature_app.models import ShelterApplication


class ShelterApplicationDetailSerializer(serializers.ModelSerializer):
    applicant_email = serializers.EmailField(source='applicant.email', read_only=True)
    applicant_name = serializers.SerializerMethodField()
    reviewed_by_email = serializers.SerializerMethodField()
    document_urls = serializers.SerializerMethodField()
    created_shelter_id = serializers.IntegerField(source='created_shelter.id', read_only=True, default=None)

    class Meta:
        model = ShelterApplication
        fields = [
            'id',
            'applicant', 'applicant_email', 'applicant_name',
            'shelter_name', 'description_es', 'city', 'address', 'phone', 'email', 'website',
            'legal_name', 'tax_id', 'legal_representative_name', 'legal_representative_id',
            'motivation', 'previous_experience', 'capacity_estimate',
            'status', 'submitted_at', 'reviewed_at', 'reviewed_by', 'reviewed_by_email',
            'rejection_reason', 'created_shelter_id',
            'document_urls',
        ]
        read_only_fields = fields

    def get_applicant_name(self, obj):
        full = f'{obj.applicant.first_name} {obj.applicant.last_name}'.strip()
        return full or obj.applicant.email

    def get_reviewed_by_email(self, obj):
        return obj.reviewed_by.email if obj.reviewed_by else None

    def get_document_urls(self, obj):
        if not obj.documents:
            return []
        return [
            att.file.url
            for att in Attachment.objects.filter(library=obj.documents).order_by('rank')
        ]
