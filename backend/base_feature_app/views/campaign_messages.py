"""Chat thread between shelter and web_manager for a campaign."""
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from base_feature_app.models import Campaign, CampaignMessage, User
from base_feature_app.serializers.campaign_message import CampaignMessageSerializer
from base_feature_app.services.notification_service import dispatch_notification
from base_feature_app.utils.shelter_access import (
    is_web_manager_or_admin,
    user_can_manage_shelter,
)


def _can_access_thread(user, campaign):
    if not user or not user.is_authenticated:
        return False
    return is_web_manager_or_admin(user) or user_can_manage_shelter(user, campaign.shelter)


@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def campaign_messages(request, pk):
    try:
        campaign = Campaign.objects.select_related('shelter', 'shelter__owner').get(pk=pk)
    except Campaign.DoesNotExist:
        return Response({'error': 'Campaign not found'}, status=status.HTTP_404_NOT_FOUND)

    if not _can_access_thread(request.user, campaign):
        return Response({'error': 'Permission denied'}, status=status.HTTP_403_FORBIDDEN)

    if request.method == 'GET':
        qs = campaign.messages.select_related('author').order_by('created_at')
        data = CampaignMessageSerializer(qs, many=True, context={'request': request}).data
        return Response(data)

    body = (request.data.get('body') or '').strip()
    if not body:
        return Response({'error': 'body is required'}, status=status.HTTP_400_BAD_REQUEST)

    message = CampaignMessage.objects.create(
        campaign=campaign,
        author=request.user,
        body=body,
        is_system=False,
    )

    context = {
        'campaign_title': campaign.title_es or campaign.title_en,
        'shelter_name': campaign.shelter.name if campaign.shelter else '',
        'author_name': (f'{request.user.first_name} {request.user.last_name}'.strip()
                        or request.user.email),
        'body_preview': body[:200],
    }

    if is_web_manager_or_admin(request.user):
        if campaign.shelter and campaign.shelter.owner:
            dispatch_notification('campaign_new_message', campaign.shelter.owner, context)
    else:
        for manager in User.objects.filter(role='web_manager'):
            dispatch_notification('campaign_new_message', manager, context)

    return Response(
        CampaignMessageSerializer(message, context={'request': request}).data,
        status=status.HTTP_201_CREATED,
    )
