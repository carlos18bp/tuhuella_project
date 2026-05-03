from rest_framework import serializers

from base_feature_app.models import AdoptionApplication
from base_feature_app.serializers.adoption_event_detail import AdoptionEventDetailSerializer
from base_feature_app.utils.shelter_access import (
    is_web_manager_or_admin,
    user_can_manage_shelter,
)


class AdoptionDetailSerializer(serializers.ModelSerializer):
    user_email = serializers.EmailField(source='user.email', read_only=True)
    animal_name = serializers.CharField(source='animal.name', read_only=True)
    shelter_name = serializers.CharField(source='animal.shelter.name', read_only=True)
    events = serializers.SerializerMethodField()
    shelter_whatsapp = serializers.SerializerMethodField()
    applicant_whatsapp = serializers.SerializerMethodField()

    class Meta:
        model = AdoptionApplication
        fields = [
            'id', 'animal', 'animal_name', 'shelter_name',
            'user', 'user_email', 'status', 'form_answers',
            'notes', 'reviewed_at', 'next_follow_up_due_at',
            'created_at', 'updated_at',
            'events', 'shelter_whatsapp', 'applicant_whatsapp',
        ]

    def get_events(self, obj):
        qs = obj.events.filter(archived_at__isnull=True).select_related('created_by')
        return AdoptionEventDetailSerializer(qs, many=True, context=self.context).data

    def _whatsapp_visible_status(self, obj):
        return obj.status in (
            AdoptionApplication.Status.INTERVIEW,
            AdoptionApplication.Status.APPROVED,
        )

    def get_shelter_whatsapp(self, obj):
        if not self._whatsapp_visible_status(obj):
            return None
        phone = getattr(obj.animal.shelter, 'phone', '') or ''
        return phone or None

    def get_applicant_whatsapp(self, obj):
        if not self._whatsapp_visible_status(obj):
            return None
        request = self.context.get('request')
        if not request:
            return None
        viewer = request.user
        # Adopter does not see their own number echoed back here.
        if obj.user_id == viewer.id:
            return None
        if not (
            user_can_manage_shelter(viewer, obj.animal.shelter)
            or is_web_manager_or_admin(viewer)
        ):
            return None
        phone = getattr(obj.user, 'phone', '') or ''
        return phone or None
