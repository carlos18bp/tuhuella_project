from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework import status
from django.shortcuts import get_object_or_404

from base_feature_app.models import FAQTopic
from base_feature_app.serializers.faq import FAQTopicSerializer


@api_view(['GET'])
@permission_classes([AllowAny])
def list_faqs_by_topic(request, topic_slug):
    """Return a single FAQ topic with its active items."""
    topic = get_object_or_404(FAQTopic, slug=topic_slug, is_active=True)
    serializer = FAQTopicSerializer(topic, context={'request': request})
    return Response(serializer.data)


@api_view(['GET'])
@permission_classes([AllowAny])
def list_all_faqs(request):
    """Return all active FAQ topics with their active items."""
    topics = FAQTopic.objects.filter(is_active=True)
    serializer = FAQTopicSerializer(topics, many=True, context={'request': request})
    return Response(serializer.data)
