import math

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
        values = [v.strip() for v in species.split(',') if v.strip()]
        queryset = queryset.filter(species__in=values) if len(values) > 1 else queryset.filter(species=values[0])
    size = request.query_params.get('size')
    if size:
        values = [v.strip() for v in size.split(',') if v.strip()]
        queryset = queryset.filter(size__in=values) if len(values) > 1 else queryset.filter(size=values[0])
    age_range = request.query_params.get('age_range')
    if age_range:
        values = [v.strip() for v in age_range.split(',') if v.strip()]
        queryset = queryset.filter(age_range__in=values) if len(values) > 1 else queryset.filter(age_range=values[0])
    shelter_id = request.query_params.get('shelter')
    if shelter_id:
        queryset = queryset.filter(shelter_id=shelter_id)
    gender = request.query_params.get('gender')
    if gender:
        values = [v.strip() for v in gender.split(',') if v.strip()]
        queryset = queryset.filter(gender__in=values) if len(values) > 1 else queryset.filter(gender=values[0])

    page = int(request.query_params.get('page', 1))
    page_size = int(request.query_params.get('page_size', 20))
    page = max(1, page)
    page_size = max(1, min(page_size, 100))

    total = queryset.count()
    total_pages = math.ceil(total / page_size) if total > 0 else 1
    start = (page - 1) * page_size
    end = start + page_size

    serializer = AnimalListSerializer(queryset[start:end], many=True, context={'request': request})
    return Response({
        'count': total,
        'page': page,
        'page_size': page_size,
        'total_pages': total_pages,
        'results': serializer.data,
    })


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
