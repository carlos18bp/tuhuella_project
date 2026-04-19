from rest_framework import serializers

from base_feature_app.models import CampaignMessage


class CampaignMessageSerializer(serializers.ModelSerializer):
    author_name = serializers.SerializerMethodField()
    author_role = serializers.CharField(source='author.role', read_only=True, default='')

    class Meta:
        model = CampaignMessage
        fields = [
            'id', 'campaign', 'author', 'author_name', 'author_role',
            'body', 'is_system', 'created_at',
        ]
        read_only_fields = ['author', 'is_system', 'created_at']

    def get_author_name(self, obj):
        if not obj.author:
            return 'Sistema' if obj.is_system else ''
        full = f'{obj.author.first_name} {obj.author.last_name}'.strip()
        return full or obj.author.email
