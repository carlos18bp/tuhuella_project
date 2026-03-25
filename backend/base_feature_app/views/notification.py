from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from base_feature_app.models import NotificationPreference, NotificationLog
from base_feature_app.serializers.notification import (
    NotificationPreferenceSerializer,
    NotificationLogSerializer,
)

# All 12 planned event keys
EVENT_KEYS = [
    'adoption_submitted',
    'adoption_status_changed',
    'adoption_info_requested',
    'adoption_interview_scheduled',
    'shelter_invite_sent',
    'shelter_invite_responded',
    'donation_paid',
    'donation_failed',
    'sponsorship_paid',
    'sponsorship_failed',
    'campaign_update_published',
    'campaign_goal_reached',
]

DEFAULT_CHANNELS = ['email', 'in_app']


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def notification_preferences_list(request):
    """List all notification preferences for the authenticated user."""
    prefs = NotificationPreference.objects.filter(user=request.user)
    serializer = NotificationPreferenceSerializer(prefs, many=True)
    return Response(serializer.data)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def notification_preferences_init(request):
    """
    Initialize default preferences for all events and channels.
    Creates preferences only for combinations that don't exist yet.
    """
    created_count = 0
    for event_key in EVENT_KEYS:
        for channel in DEFAULT_CHANNELS:
            _, was_created = NotificationPreference.objects.get_or_create(
                user=request.user,
                event_key=event_key,
                channel=channel,
                defaults={'enabled': True},
            )
            if was_created:
                created_count += 1

    prefs = NotificationPreference.objects.filter(user=request.user)
    serializer = NotificationPreferenceSerializer(prefs, many=True)
    return Response({
        'created': created_count,
        'preferences': serializer.data,
    }, status=status.HTTP_201_CREATED if created_count > 0 else status.HTTP_200_OK)


@api_view(['PATCH'])
@permission_classes([IsAuthenticated])
def notification_preferences_update(request):
    """
    Bulk update notification preferences.
    Expects: [{ "id": 1, "enabled": false }, ...]
    """
    updates = request.data
    if not isinstance(updates, list):
        return Response({'error': 'Expected a list of preference updates'}, status=status.HTTP_400_BAD_REQUEST)

    updated_ids = []
    for item in updates:
        pref_id = item.get('id')
        enabled = item.get('enabled')
        if pref_id is not None and enabled is not None:
            updated = NotificationPreference.objects.filter(
                pk=pref_id, user=request.user,
            ).update(enabled=enabled)
            if updated:
                updated_ids.append(pref_id)

    prefs = NotificationPreference.objects.filter(user=request.user)
    serializer = NotificationPreferenceSerializer(prefs, many=True)
    return Response({
        'updated': len(updated_ids),
        'preferences': serializer.data,
    })


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def notification_log_list(request):
    """List notification logs for the authenticated user (paginated)."""
    logs = NotificationLog.objects.filter(recipient=request.user)

    # Optional channel filter
    channel = request.query_params.get('channel')
    if channel:
        logs = logs.filter(channel=channel)

    # Simple pagination
    page_size = 20
    page = int(request.query_params.get('page', 1))
    offset = (page - 1) * page_size
    total = logs.count()

    logs_page = logs[offset:offset + page_size]
    serializer = NotificationLogSerializer(logs_page, many=True)
    return Response({
        'results': serializer.data,
        'total': total,
        'page': page,
        'page_size': page_size,
    })


@api_view(['PATCH'])
@permission_classes([IsAuthenticated])
def notification_log_mark_read(request, pk):
    """Mark a single notification as read."""
    try:
        log = NotificationLog.objects.get(pk=pk, recipient=request.user)
    except NotificationLog.DoesNotExist:
        return Response({'error': 'Not found'}, status=status.HTTP_404_NOT_FOUND)

    log.is_read = True
    log.save(update_fields=['is_read'])
    return Response(NotificationLogSerializer(log).data)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def notification_log_mark_all_read(request):
    """Mark all in-app notifications as read."""
    updated = NotificationLog.objects.filter(
        recipient=request.user, channel='in_app', is_read=False,
    ).update(is_read=True)
    return Response({'marked_read': updated})


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def notification_unread_count(request):
    """Get count of unread in-app notifications."""
    count = NotificationLog.objects.filter(
        recipient=request.user, channel='in_app', is_read=False,
    ).count()
    return Response({'unread_count': count})
