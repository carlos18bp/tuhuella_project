from rest_framework import serializers

from base_feature_app.models import VolunteerApplication, VolunteerPosition


class VolunteerApplicationCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = VolunteerApplication
        fields = ['position', 'motivation']

    def validate_position(self, value):
        if not value.is_active:
            raise serializers.ValidationError('This volunteer position is no longer active.')
        return value

    def validate_motivation(self, value):
        if len(value.strip()) < 20:
            raise serializers.ValidationError('Please provide a more detailed motivation (at least 20 characters).')
        return value
