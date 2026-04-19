"""Admin-facing views for moderating campaign requests."""
from django.utils import timezone
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from base_feature_app.models import Campaign, CampaignMessage
from base_feature_app.serializers.campaign_detail import CampaignDetailSerializer
from base_feature_app.serializers.campaign_list import CampaignListSerializer
from base_feature_app.services.notification_service import dispatch_notification
from base_feature_app.utils.shelter_access import is_web_manager_or_admin
from base_feature_app.views.web_manager_views import _paginate

_SYSTEM_APPROVED_BODY = 'Solicitud aprobada. La campaña puede publicarse.'
_SYSTEM_REJECTED_BODY = 'Solicitud rechazada. Motivo: {reason}'


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def admin_campaigns_list(request):
    if not is_web_manager_or_admin(request.user):
        return Response({'error': 'Permission denied'}, status=status.HTTP_403_FORBIDDEN)

    qs = (
        Campaign.objects
        .filter(archived_at__isnull=True)
        .select_related('shelter', 'reviewed_by', 'cover_image__primary_attachment')
        .order_by('-submitted_at', '-created_at')
    )
    approval_status = request.GET.get('approval_status')
    if approval_status:
        qs = qs.filter(approval_status=approval_status)
    shelter_id = request.GET.get('shelter')
    if shelter_id:
        qs = qs.filter(shelter_id=shelter_id)

    meta, items = _paginate(qs, request)
    serializer = CampaignListSerializer(items, many=True, context={'request': request})
    return Response({**meta, 'results': serializer.data})


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def admin_campaign_approve(request, pk):
    if not is_web_manager_or_admin(request.user):
        return Response({'error': 'Permission denied'}, status=status.HTTP_403_FORBIDDEN)

    try:
        campaign = Campaign.objects.select_related('shelter', 'shelter__owner').get(pk=pk)
    except Campaign.DoesNotExist:
        return Response({'error': 'Campaign not found'}, status=status.HTTP_404_NOT_FOUND)

    now = timezone.now()
    campaign.approval_status = Campaign.ApprovalStatus.APPROVED
    campaign.reviewed_by = request.user
    campaign.reviewed_at = now
    if campaign.status == Campaign.Status.DRAFT:
        # Keep as draft so the shelter can activate it explicitly.
        pass
    campaign.save(update_fields=['approval_status', 'reviewed_by', 'reviewed_at'])

    CampaignMessage.objects.create(
        campaign=campaign,
        author=request.user,
        body=_SYSTEM_APPROVED_BODY,
        is_system=True,
    )

    if campaign.shelter and campaign.shelter.owner:
        dispatch_notification(
            'campaign_approved',
            campaign.shelter.owner,
            {
                'campaign_title': campaign.title_es or campaign.title_en,
                'shelter_name': campaign.shelter.name,
            },
        )

    return Response(CampaignDetailSerializer(campaign, context={'request': request}).data)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def admin_campaign_reject(request, pk):
    if not is_web_manager_or_admin(request.user):
        return Response({'error': 'Permission denied'}, status=status.HTTP_403_FORBIDDEN)

    try:
        campaign = Campaign.objects.select_related('shelter', 'shelter__owner').get(pk=pk)
    except Campaign.DoesNotExist:
        return Response({'error': 'Campaign not found'}, status=status.HTTP_404_NOT_FOUND)

    reason = (request.data.get('reason') or '').strip()
    if not reason:
        return Response({'error': 'reason is required'}, status=status.HTTP_400_BAD_REQUEST)

    now = timezone.now()
    campaign.approval_status = Campaign.ApprovalStatus.REJECTED
    campaign.reviewed_by = request.user
    campaign.reviewed_at = now
    campaign.save(update_fields=['approval_status', 'reviewed_by', 'reviewed_at'])

    CampaignMessage.objects.create(
        campaign=campaign,
        author=request.user,
        body=_SYSTEM_REJECTED_BODY.format(reason=reason),
        is_system=True,
    )

    if campaign.shelter and campaign.shelter.owner:
        dispatch_notification(
            'campaign_rejected',
            campaign.shelter.owner,
            {
                'campaign_title': campaign.title_es or campaign.title_en,
                'shelter_name': campaign.shelter.name,
                'reason': reason,
            },
        )

    return Response(CampaignDetailSerializer(campaign, context={'request': request}).data)
