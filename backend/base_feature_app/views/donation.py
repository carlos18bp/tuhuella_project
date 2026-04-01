from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from django.db.models import Q

from base_feature_app.models import Donation
from base_feature_app.serializers.donation_list import DonationListSerializer
from base_feature_app.utils.shelter_access import shelters_managed_by_user, user_can_manage_shelter
from base_feature_app.serializers.donation_detail import DonationDetailSerializer
from base_feature_app.serializers.donation_create_update import DonationCreateUpdateSerializer


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def donation_list(request):
    user = request.user
    if user.role == 'shelter_admin':
        shelters = shelters_managed_by_user(user)
        shelter_ids = list(shelters.values_list('id', flat=True))
        queryset = Donation.objects.filter(
            archived_at__isnull=True,
        ).filter(
            Q(shelter_id__in=shelter_ids) | Q(campaign__shelter_id__in=shelter_ids),
        ).select_related('user', 'shelter', 'campaign')
    else:
        queryset = Donation.objects.filter(
            user=user,
            archived_at__isnull=True,
        ).select_related('user', 'shelter', 'campaign')
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

    can_see = donation.user_id == request.user.id
    if donation.shelter_id and user_can_manage_shelter(request.user, donation.shelter):
        can_see = True
    if donation.campaign_id and user_can_manage_shelter(request.user, donation.campaign.shelter):
        can_see = True
    if not can_see:
        return Response({'error': 'Permission denied'}, status=status.HTTP_403_FORBIDDEN)

    serializer = DonationDetailSerializer(donation, context={'request': request})
    return Response(serializer.data)
