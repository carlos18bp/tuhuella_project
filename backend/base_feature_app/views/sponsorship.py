from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from base_feature_app.models import Sponsorship
from base_feature_app.serializers.sponsorship_list import SponsorshipListSerializer
from base_feature_app.serializers.sponsorship_detail import SponsorshipDetailSerializer
from base_feature_app.serializers.sponsorship_create_update import SponsorshipCreateUpdateSerializer


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def sponsorship_list(request):
    queryset = Sponsorship.objects.filter(user=request.user)
    serializer = SponsorshipListSerializer(queryset, many=True, context={'request': request})
    return Response(serializer.data)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def sponsorship_create(request):
    serializer = SponsorshipCreateUpdateSerializer(data=request.data, context={'request': request})
    if serializer.is_valid():
        serializer.save(user=request.user)
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def sponsorship_detail(request, pk):
    try:
        sponsorship = Sponsorship.objects.get(pk=pk, user=request.user)
    except Sponsorship.DoesNotExist:
        return Response({'error': 'Sponsorship not found'}, status=status.HTTP_404_NOT_FOUND)
    serializer = SponsorshipDetailSerializer(sponsorship, context={'request': request})
    return Response(serializer.data)


@api_view(['PATCH'])
@permission_classes([IsAuthenticated])
def sponsorship_update_status(request, pk):
    try:
        sponsorship = Sponsorship.objects.get(pk=pk, user=request.user)
    except Sponsorship.DoesNotExist:
        return Response({'error': 'Sponsorship not found'}, status=status.HTTP_404_NOT_FOUND)

    new_status = request.data.get('status')
    if new_status not in dict(Sponsorship.Status.choices):
        return Response({'error': 'Invalid status'}, status=status.HTTP_400_BAD_REQUEST)

    sponsorship.status = new_status
    sponsorship.save()
    serializer = SponsorshipDetailSerializer(sponsorship, context={'request': request})
    return Response(serializer.data)
