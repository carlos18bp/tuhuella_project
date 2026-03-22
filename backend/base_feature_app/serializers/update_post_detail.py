from rest_framework import serializers
from base_feature_app.models import UpdatePost


class UpdatePostDetailSerializer(serializers.ModelSerializer):
    shelter_name = serializers.CharField(source='shelter.name', read_only=True)

    class Meta:
        model = UpdatePost
        fields = [
            'id', 'title', 'content', 'shelter', 'shelter_name',
            'campaign', 'animal', 'created_at', 'updated_at',
        ]
