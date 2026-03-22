from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from base_feature_app.models import AdoptionApplication
from base_feature_app.serializers.adoption_list import AdoptionListSerializer
from base_feature_app.serializers.adoption_detail import AdoptionDetailSerializer
from base_feature_app.serializers.adoption_create_update import AdoptionCreateUpdateSerializer


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def application_list(request):
    user = request.user
    if user.role == 'shelter_admin':
        shelters = user.shelters.all()
        queryset = AdoptionApplication.objects.filter(animal__shelter__in=shelters)
    else:
        queryset = AdoptionApplication.objects.filter(user=user)

    serializer = AdoptionListSerializer(queryset, many=True, context={'request': request})
    return Response(serializer.data)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def application_detail(request, pk):
    try:
        application = AdoptionApplication.objects.get(pk=pk)
    except AdoptionApplication.DoesNotExist:
        return Response({'error': 'Application not found'}, status=status.HTTP_404_NOT_FOUND)

    if application.user != request.user and application.animal.shelter.owner != request.user:
        return Response({'error': 'Permission denied'}, status=status.HTTP_403_FORBIDDEN)

    serializer = AdoptionDetailSerializer(application, context={'request': request})
    return Response(serializer.data)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def application_create(request):
    serializer = AdoptionCreateUpdateSerializer(data=request.data, context={'request': request})
    if serializer.is_valid():
        serializer.save(user=request.user)
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['PATCH'])
@permission_classes([IsAuthenticated])
def application_update_status(request, pk):
    try:
        application = AdoptionApplication.objects.get(pk=pk)
    except AdoptionApplication.DoesNotExist:
        return Response({'error': 'Application not found'}, status=status.HTTP_404_NOT_FOUND)

    if application.animal.shelter.owner != request.user:
        return Response({'error': 'Permission denied'}, status=status.HTTP_403_FORBIDDEN)

    new_status = request.data.get('status')
    if new_status not in dict(AdoptionApplication.Status.choices):
        return Response({'error': 'Invalid status'}, status=status.HTTP_400_BAD_REQUEST)

    application.status = new_status
    if new_status in ('approved', 'rejected'):
        from django.utils import timezone
        application.reviewed_at = timezone.now()
    application.save()

    serializer = AdoptionDetailSerializer(application, context={'request': request})
    return Response(serializer.data)
