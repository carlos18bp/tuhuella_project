from rest_framework import serializers
from base_feature_app.models import UpdatePost


class UpdatePostCreateUpdateSerializer(serializers.ModelSerializer):
    image_url = serializers.SerializerMethodField(read_only=True)

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
