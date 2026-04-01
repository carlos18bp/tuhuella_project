from rest_framework import serializers

from base_feature_app.models import UpdatePost
from base_feature_app.utils.shelter_access import user_can_manage_shelter


class UpdatePostCreateUpdateSerializer(serializers.ModelSerializer):
    image_url = serializers.SerializerMethodField(read_only=True)

    def validate_shelter(self, value):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            if not user_can_manage_shelter(request.user, value):
                raise serializers.ValidationError('You cannot manage this shelter.')
        return value

    class Meta:
        model = UpdatePost
        fields = [
            'id', 'shelter', 'campaign', 'animal',
            'title_es', 'title_en', 'content_es', 'content_en',
            'image', 'image_url',
        ]
        extra_kwargs = {
            'image': {'required': False},
        }

    def get_image_url(self, obj):
        if obj.image:
            return obj.image.url
        return None
