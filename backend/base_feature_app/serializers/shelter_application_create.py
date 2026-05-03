from rest_framework import serializers

from base_feature_app.models import ShelterApplication, User


class ShelterApplicationCreateSerializer(serializers.ModelSerializer):
    website = serializers.URLField(required=False, allow_blank=True)
    address = serializers.CharField(required=False, allow_blank=True)
    email = serializers.EmailField(required=False, allow_blank=True)
    previous_experience = serializers.CharField(required=False, allow_blank=True)
    capacity_estimate = serializers.IntegerField(required=False, allow_null=True, min_value=0)

    class Meta:
        model = ShelterApplication
        fields = [
            'id',
            'shelter_name', 'description_es', 'city', 'address', 'phone', 'email', 'website',
            'legal_name', 'tax_id', 'legal_representative_name', 'legal_representative_id',
            'motivation', 'previous_experience', 'capacity_estimate',
        ]

    def validate(self, attrs):
        request = self.context.get('request')
        user = getattr(request, 'user', None)
        if user is None or not user.is_authenticated:
            raise serializers.ValidationError('Authentication required.')

        if user.role == User.Role.SHELTER_ADMIN:
            raise serializers.ValidationError(
                'Tu cuenta ya es administradora de refugio.'
            )

        active_exists = ShelterApplication.objects.filter(
            applicant=user,
            archived_at__isnull=True,
            status__in=[
                ShelterApplication.Status.SUBMITTED,
                ShelterApplication.Status.UNDER_REVIEW,
            ],
        ).exists()
        if active_exists:
            raise serializers.ValidationError(
                'Ya tienes una postulación de refugio en proceso de revisión.'
            )
        return attrs
