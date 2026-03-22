from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response

from base_feature_app.models import Animal
from base_feature_app.serializers.animal_list import AnimalListSerializer
from base_feature_app.serializers.animal_detail import AnimalDetailSerializer
from base_feature_app.serializers.animal_create_update import AnimalCreateUpdateSerializer


@api_view(['GET'])
@permission_classes([AllowAny])
def animal_list(request):
    queryset = Animal.objects.filter(status=Animal.Status.PUBLISHED)

    species = request.query_params.get('species')
    if species:
        queryset = queryset.filter(species=species)
    size = request.query_params.get('size')
    if size:
        queryset = queryset.filter(size=size)
    age_range = request.query_params.get('age_range')
    if age_range:
        queryset = queryset.filter(age_range=age_range)
    shelter_id = request.query_params.get('shelter')
    if shelter_id:
        queryset = queryset.filter(shelter_id=shelter_id)
    gender = request.query_params.get('gender')
    if gender:
        queryset = queryset.filter(gender=gender)

    serializer = AnimalListSerializer(queryset, many=True, context={'request': request})
    return Response(serializer.data)


@api_view(['GET'])
@permission_classes([AllowAny])
def animal_detail(request, pk):
    try:
        animal = Animal.objects.get(pk=pk)
    except Animal.DoesNotExist:
        return Response({'error': 'Animal not found'}, status=status.HTTP_404_NOT_FOUND)
    serializer = AnimalDetailSerializer(animal, context={'request': request})
    return Response(serializer.data)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def animal_create(request):
    serializer = AnimalCreateUpdateSerializer(data=request.data, context={'request': request})
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['PUT', 'PATCH'])
@permission_classes([IsAuthenticated])
def animal_update(request, pk):
    try:
        animal = Animal.objects.get(pk=pk)
    except Animal.DoesNotExist:
        return Response({'error': 'Animal not found'}, status=status.HTTP_404_NOT_FOUND)

    if animal.shelter.owner != request.user:
        return Response({'error': 'Permission denied'}, status=status.HTTP_403_FORBIDDEN)

    serializer = AnimalCreateUpdateSerializer(
        animal, data=request.data, partial=request.method == 'PATCH', context={'request': request}
    )
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def animal_delete(request, pk):
    try:
        animal = Animal.objects.get(pk=pk)
    except Animal.DoesNotExist:
        return Response({'error': 'Animal not found'}, status=status.HTTP_404_NOT_FOUND)

    if animal.shelter.owner != request.user:
        return Response({'error': 'Permission denied'}, status=status.HTTP_403_FORBIDDEN)

    animal.delete()
    return Response(status=status.HTTP_204_NO_CONTENT)
