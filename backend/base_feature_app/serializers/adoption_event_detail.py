from rest_framework import serializers

from base_feature_app.models import AdoptionApplicationEvent


class AdoptionEventDetailSerializer(serializers.ModelSerializer):
    created_by_name = serializers.SerializerMethodField()
    created_by_role = serializers.CharField(source='created_by.role', read_only=True)
    created_by_email = serializers.EmailField(source='created_by.email', read_only=True)

    class Meta:
        model = AdoptionApplicationEvent
        fields = [
            'id', 'application', 'event_date', 'description',
            'created_by', 'created_by_name', 'created_by_role', 'created_by_email',
            'created_at', 'updated_at',
        ]

    def get_created_by_name(self, obj):
        full = f'{obj.created_by.first_name} {obj.created_by.last_name}'.strip()
        return full or obj.created_by.email
