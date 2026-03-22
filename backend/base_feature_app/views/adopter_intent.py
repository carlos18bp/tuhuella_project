from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response

from base_feature_app.models import AdopterIntent
from base_feature_app.serializers.adopter_intent_list import AdopterIntentListSerializer
from base_feature_app.serializers.adopter_intent_detail import AdopterIntentDetailSerializer
from base_feature_app.serializers.adopter_intent_create_update import AdopterIntentCreateUpdateSerializer


@api_view(['GET'])
@permission_classes([AllowAny])
def adopter_intent_list(request):
    queryset = AdopterIntent.objects.filter(
        status=AdopterIntent.Status.ACTIVE,
        visibility=AdopterIntent.Visibility.PUBLIC,
    )
    serializer = AdopterIntentListSerializer(queryset, many=True, context={'request': request})
    return Response(serializer.data)


@api_view(['GET', 'PUT', 'PATCH'])
@permission_classes([IsAuthenticated])
def adopter_intent_me(request):
    try:
        intent = AdopterIntent.objects.get(user=request.user)
    except AdopterIntent.DoesNotExist:
        if request.method == 'GET':
            return Response({'error': 'No adopter intent found'}, status=status.HTTP_404_NOT_FOUND)
        return Response({'error': 'Create an intent first'}, status=status.HTTP_404_NOT_FOUND)

    if request.method == 'GET':
        serializer = AdopterIntentDetailSerializer(intent, context={'request': request})
        return Response(serializer.data)

    serializer = AdopterIntentCreateUpdateSerializer(
        intent, data=request.data, partial=request.method == 'PATCH', context={'request': request}
    )
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def adopter_intent_create(request):
    if AdopterIntent.objects.filter(user=request.user).exists():
        return Response(
            {'error': 'You already have an adopter intent. Use PUT to update.'},
            status=status.HTTP_400_BAD_REQUEST,
        )
    serializer = AdopterIntentCreateUpdateSerializer(data=request.data, context={'request': request})
    if serializer.is_valid():
        serializer.save(user=request.user)
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
