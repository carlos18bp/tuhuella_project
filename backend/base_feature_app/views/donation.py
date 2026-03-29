from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from base_feature_app.models import Donation
from base_feature_app.serializers.donation_list import DonationListSerializer
from base_feature_app.serializers.donation_detail import DonationDetailSerializer
from base_feature_app.serializers.donation_create_update import DonationCreateUpdateSerializer


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def donation_list(request):
    user = request.user
    if user.role == 'shelter_admin':
        shelters = user.shelters.all()
        queryset = Donation.objects.filter(shelter__in=shelters).select_related('user', 'shelter', 'campaign')
    else:
        queryset = Donation.objects.filter(user=user).select_related('user', 'shelter', 'campaign')
    serializer = DonationListSerializer(queryset, many=True, context={'request': request})
    return Response(serializer.data)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def donation_create(request):
    serializer = DonationCreateUpdateSerializer(data=request.data, context={'request': request})
    if serializer.is_valid():
        serializer.save(user=request.user)
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def donation_detail(request, pk):
    try:
        donation = Donation.objects.get(pk=pk)
    except Donation.DoesNotExist:
        return Response({'error': 'Donation not found'}, status=status.HTTP_404_NOT_FOUND)

    if donation.user != request.user and (not hasattr(donation.shelter, 'owner') or donation.shelter.owner != request.user):
        return Response({'error': 'Permission denied'}, status=status.HTTP_403_FORBIDDEN)

    serializer = DonationDetailSerializer(donation, context={'request': request})
    return Response(serializer.data)
