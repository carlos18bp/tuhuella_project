import math

from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response

from django.utils import timezone

from base_feature_app.models import Animal
from base_feature_app.serializers.animal_list import AnimalListSerializer
from base_feature_app.utils.shelter_access import user_can_manage_shelter
from base_feature_app.serializers.animal_detail import AnimalDetailSerializer
from base_feature_app.serializers.animal_create_update import AnimalCreateUpdateSerializer


@api_view(['GET'])
@permission_classes([AllowAny])
def animal_list(request):
    queryset = Animal.objects.filter(
        status=Animal.Status.PUBLISHED,
        archived_at__isnull=True,
    )

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
    energy_level = request.query_params.get('energy_level')
    if energy_level:
        values = [v.strip() for v in energy_level.split(',') if v.strip()]
        queryset = queryset.filter(energy_level__in=values) if len(values) > 1 else queryset.filter(energy_level=values[0])
    good_with_kids = request.query_params.get('good_with_kids')
    if good_with_kids:
        queryset = queryset.filter(good_with_kids=good_with_kids.strip())
    good_with_dogs = request.query_params.get('good_with_dogs')
    if good_with_dogs:
        queryset = queryset.filter(good_with_dogs=good_with_dogs.strip())
    good_with_cats = request.query_params.get('good_with_cats')
    if good_with_cats:
        queryset = queryset.filter(good_with_cats=good_with_cats.strip())

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

    if not user_can_manage_shelter(request.user, animal.shelter):
        return Response({'error': 'Permission denied'}, status=status.HTTP_403_FORBIDDEN)

    serializer = AnimalCreateUpdateSerializer(
        animal, data=request.data, partial=request.method == 'PATCH', context={'request': request}
    )
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET'])
@permission_classes([AllowAny])
def animal_similar(request, pk):
    from django.core.cache import cache

    cache_key = f'animal_similar_{pk}'
    cached = cache.get(cache_key)
    if cached is not None:
        return Response(cached)

    try:
        animal = Animal.objects.get(pk=pk)
    except Animal.DoesNotExist:
        return Response({'error': 'Animal not found'}, status=status.HTTP_404_NOT_FOUND)

    similar = Animal.objects.filter(
        species=animal.species,
        size=animal.size,
        status=Animal.Status.PUBLISHED,
        archived_at__isnull=True,
    ).exclude(pk=pk).select_related('shelter')

    # Prioritize same shelter by ordering: same shelter first, then by created_at
    from django.db.models import Case, When, Value, IntegerField
    similar = similar.annotate(
        same_shelter=Case(
            When(shelter=animal.shelter, then=Value(0)),
            default=Value(1),
            output_field=IntegerField(),
        )
    ).order_by('same_shelter', '-created_at')[:4]

    serializer = AnimalListSerializer(similar, many=True, context={'request': request})
    data = serializer.data
    cache.set(cache_key, data, timeout=300)  # 5 minutes
    return Response(data)


@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def animal_delete(request, pk):
    try:
        animal = Animal.objects.get(pk=pk)
    except Animal.DoesNotExist:
        return Response({'error': 'Animal not found'}, status=status.HTTP_404_NOT_FOUND)

    if not user_can_manage_shelter(request.user, animal.shelter):
        return Response({'error': 'Permission denied'}, status=status.HTTP_403_FORBIDDEN)

    animal.archived_at = timezone.now()
    animal.status = Animal.Status.ARCHIVED
    animal.save(update_fields=['archived_at', 'status', 'updated_at'])
    return Response(status=status.HTTP_204_NO_CONTENT)
