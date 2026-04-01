from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response

from base_feature_app.models import Shelter
from base_feature_app.serializers.shelter_list import ShelterListSerializer
from base_feature_app.utils.shelter_access import shelters_managed_by_user
from base_feature_app.serializers.shelter_detail import ShelterDetailSerializer
from base_feature_app.serializers.shelter_create_update import ShelterCreateUpdateSerializer


@api_view(['GET'])
@permission_classes([AllowAny])
def shelter_list(request):
    shelters = Shelter.objects.filter(
        verification_status=Shelter.VerificationStatus.VERIFIED,
        archived_at__isnull=True,
    )
    serializer = ShelterListSerializer(shelters, many=True, context={'request': request})
    return Response(serializer.data)


@api_view(['GET'])
@permission_classes([AllowAny])
def shelter_detail(request, pk):
    try:
        shelter = Shelter.objects.get(pk=pk, archived_at__isnull=True)
    except Shelter.DoesNotExist:
        return Response({'error': 'Shelter not found'}, status=status.HTTP_404_NOT_FOUND)
    serializer = ShelterDetailSerializer(shelter, context={'request': request})
    return Response(serializer.data)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def shelter_create(request):
    serializer = ShelterCreateUpdateSerializer(data=request.data, context={'request': request})
    if serializer.is_valid():
        serializer.save(owner=request.user)
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['PUT', 'PATCH'])
@permission_classes([IsAuthenticated])
def shelter_update(request, pk):
    try:
        shelter = shelters_managed_by_user(request.user).get(pk=pk)
    except Shelter.DoesNotExist:
        return Response({'error': 'Shelter not found'}, status=status.HTTP_404_NOT_FOUND)
    serializer = ShelterCreateUpdateSerializer(
        shelter, data=request.data, partial=request.method == 'PATCH', context={'request': request}
    )
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
