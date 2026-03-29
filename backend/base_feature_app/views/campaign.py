from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response

from base_feature_app.models import Campaign
from base_feature_app.serializers.campaign_list import CampaignListSerializer
from base_feature_app.serializers.campaign_detail import CampaignDetailSerializer
from base_feature_app.serializers.campaign_create_update import CampaignCreateUpdateSerializer


@api_view(['GET'])
@permission_classes([AllowAny])
def campaign_list(request):
    status_filter = request.query_params.get('status', 'active')
    if status_filter == 'completed':
        queryset = Campaign.objects.filter(status=Campaign.Status.COMPLETED)
    else:
        queryset = Campaign.objects.filter(status=Campaign.Status.ACTIVE)
    serializer = CampaignListSerializer(queryset, many=True, context={'request': request})
    return Response(serializer.data)


@api_view(['GET'])
@permission_classes([AllowAny])
def campaign_detail(request, pk):
    try:
        campaign = Campaign.objects.get(pk=pk)
    except Campaign.DoesNotExist:
        return Response({'error': 'Campaign not found'}, status=status.HTTP_404_NOT_FOUND)
    serializer = CampaignDetailSerializer(campaign, context={'request': request})
    return Response(serializer.data)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def campaign_create(request):
    serializer = CampaignCreateUpdateSerializer(data=request.data, context={'request': request})
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['PUT', 'PATCH'])
@permission_classes([IsAuthenticated])
def campaign_update(request, pk):
    try:
        campaign = Campaign.objects.get(pk=pk)
    except Campaign.DoesNotExist:
        return Response({'error': 'Campaign not found'}, status=status.HTTP_404_NOT_FOUND)

    if campaign.shelter.owner != request.user:
        return Response({'error': 'Permission denied'}, status=status.HTTP_403_FORBIDDEN)

    serializer = CampaignCreateUpdateSerializer(
        campaign, data=request.data, partial=request.method == 'PATCH', context={'request': request}
    )
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
