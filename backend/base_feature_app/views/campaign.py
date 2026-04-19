from django.utils import timezone
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response

from base_feature_app.models import Campaign
from base_feature_app.serializers.campaign_list import CampaignListSerializer
from base_feature_app.utils.shelter_access import (
    is_web_manager_or_admin,
    shelters_managed_by_user,
    user_can_manage_shelter,
)
from base_feature_app.serializers.campaign_detail import CampaignDetailSerializer
from base_feature_app.serializers.campaign_create_update import CampaignCreateUpdateSerializer


@api_view(['GET'])
@permission_classes([AllowAny])
def campaign_list(request):
    status_filter = request.query_params.get('status', 'active')
    target_status = Campaign.Status.COMPLETED if status_filter == 'completed' else Campaign.Status.ACTIVE
    queryset = Campaign.objects.filter(
        status=target_status,
        approval_status=Campaign.ApprovalStatus.APPROVED,
        archived_at__isnull=True,
    ).select_related('shelter', 'cover_image__primary_attachment')
    serializer = CampaignListSerializer(queryset, many=True, context={'request': request})
    return Response(serializer.data)


@api_view(['GET'])
@permission_classes([AllowAny])
def campaign_detail(request, pk):
    try:
        campaign = Campaign.objects.get(pk=pk)
    except Campaign.DoesNotExist:
        return Response({'error': 'Campaign not found'}, status=status.HTTP_404_NOT_FOUND)

    user = request.user if request.user.is_authenticated else None
    if campaign.approval_status != Campaign.ApprovalStatus.APPROVED:
        if user is None or not (
            is_web_manager_or_admin(user) or user_can_manage_shelter(user, campaign.shelter)
        ):
            return Response({'error': 'Campaign not found'}, status=status.HTTP_404_NOT_FOUND)

    serializer = CampaignDetailSerializer(campaign, context={'request': request})
    return Response(serializer.data)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def campaign_create(request):
    serializer = CampaignCreateUpdateSerializer(data=request.data, context={'request': request})
    if not serializer.is_valid():
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    user = request.user
    is_admin = is_web_manager_or_admin(user)
    shelter = serializer.validated_data.get('shelter')

    if not is_admin and not user_can_manage_shelter(user, shelter):
        return Response({'error': 'Permission denied'}, status=status.HTTP_403_FORBIDDEN)

    now = timezone.now()
    if is_admin:
        campaign = serializer.save(
            approval_status=Campaign.ApprovalStatus.APPROVED,
            reviewed_by=user,
            reviewed_at=now,
            submitted_at=now,
        )
    else:
        campaign = serializer.save(
            approval_status=Campaign.ApprovalStatus.PENDING,
            submitted_at=now,
        )
    return Response(CampaignDetailSerializer(campaign, context={'request': request}).data,
                    status=status.HTTP_201_CREATED)


@api_view(['PUT', 'PATCH'])
@permission_classes([IsAuthenticated])
def campaign_update(request, pk):
    try:
        campaign = Campaign.objects.get(pk=pk)
    except Campaign.DoesNotExist:
        return Response({'error': 'Campaign not found'}, status=status.HTTP_404_NOT_FOUND)

    if not (user_can_manage_shelter(request.user, campaign.shelter)
            or is_web_manager_or_admin(request.user)):
        return Response({'error': 'Permission denied'}, status=status.HTTP_403_FORBIDDEN)

    serializer = CampaignCreateUpdateSerializer(
        campaign, data=request.data, partial=request.method == 'PATCH', context={'request': request}
    )
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def my_shelter_campaigns(request):
    """Campaigns of every shelter the authenticated user manages,
    regardless of approval_status (so shelter admins can see pending/rejected)."""
    shelters_qs = shelters_managed_by_user(request.user)
    queryset = (
        Campaign.objects
        .filter(shelter__in=shelters_qs, archived_at__isnull=True)
        .select_related('shelter', 'cover_image__primary_attachment')
        .order_by('-created_at')
    )
    serializer = CampaignListSerializer(queryset, many=True, context={'request': request})
    return Response(serializer.data)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def campaign_submit(request, pk):
    try:
        campaign = Campaign.objects.get(pk=pk)
    except Campaign.DoesNotExist:
        return Response({'error': 'Campaign not found'}, status=status.HTTP_404_NOT_FOUND)

    if not user_can_manage_shelter(request.user, campaign.shelter):
        return Response({'error': 'Permission denied'}, status=status.HTTP_403_FORBIDDEN)

    if campaign.approval_status == Campaign.ApprovalStatus.APPROVED:
        return Response({'error': 'Campaign is already approved'}, status=status.HTTP_400_BAD_REQUEST)

    campaign.approval_status = Campaign.ApprovalStatus.PENDING
    campaign.submitted_at = timezone.now()
    campaign.reviewed_by = None
    campaign.reviewed_at = None
    campaign.save(update_fields=['approval_status', 'submitted_at', 'reviewed_by', 'reviewed_at'])

    return Response(CampaignDetailSerializer(campaign, context={'request': request}).data)
