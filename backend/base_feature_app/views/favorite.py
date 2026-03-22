from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from base_feature_app.models import Favorite, Animal
from base_feature_app.serializers.favorite import FavoriteSerializer


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def favorite_list(request):
    favorites = Favorite.objects.filter(user=request.user).select_related('animal', 'animal__shelter')
    serializer = FavoriteSerializer(favorites, many=True, context={'request': request})
    return Response(serializer.data)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def favorite_toggle(request):
    animal_id = request.data.get('animal_id')
    if not animal_id:
        return Response({'error': 'animal_id is required'}, status=status.HTTP_400_BAD_REQUEST)

    try:
        animal = Animal.objects.get(pk=animal_id)
    except Animal.DoesNotExist:
        return Response({'error': 'Animal not found'}, status=status.HTTP_404_NOT_FOUND)

    favorite, created = Favorite.objects.get_or_create(user=request.user, animal=animal)
    if not created:
        favorite.delete()
        return Response({'status': 'removed', 'animal_id': animal_id})

    return Response({'status': 'added', 'animal_id': animal_id}, status=status.HTTP_201_CREATED)
