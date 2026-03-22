from rest_framework import serializers
from base_feature_app.models import UpdatePost


class UpdatePostCreateUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = UpdatePost
        fields = ['id', 'shelter', 'campaign', 'animal', 'title', 'content']
