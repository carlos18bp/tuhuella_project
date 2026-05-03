from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from django.utils import timezone

from base_feature_app.models import AdoptionApplication, AdoptionApplicationEvent
from base_feature_app.serializers.adoption_list import AdoptionListSerializer
from base_feature_app.utils.shelter_access import (
    is_web_manager_or_admin,
    shelters_managed_by_user,
    user_can_manage_shelter,
)
from base_feature_app.serializers.adoption_detail import AdoptionDetailSerializer
from base_feature_app.serializers.adoption_create_update import AdoptionCreateUpdateSerializer
from base_feature_app.serializers.adoption_event_create import AdoptionEventCreateUpdateSerializer
from base_feature_app.serializers.adoption_event_detail import AdoptionEventDetailSerializer


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def application_list(request):
    user = request.user
    if is_web_manager_or_admin(user):
        queryset = AdoptionApplication.objects.filter(
            archived_at__isnull=True,
        ).select_related('animal', 'animal__shelter', 'user')
    elif user.role == 'shelter_admin':
        shelters = shelters_managed_by_user(user)
        queryset = AdoptionApplication.objects.filter(
            animal__shelter__in=shelters,
            archived_at__isnull=True,
        ).select_related('animal', 'animal__shelter', 'user')
    else:
        queryset = AdoptionApplication.objects.filter(
            user=user,
            archived_at__isnull=True,
        ).select_related('animal', 'animal__shelter', 'user')

    serializer = AdoptionListSerializer(queryset, many=True, context={'request': request})
    return Response(serializer.data)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def application_detail(request, pk):
    try:
        application = AdoptionApplication.objects.get(pk=pk)
    except AdoptionApplication.DoesNotExist:
        return Response({'error': 'Application not found'}, status=status.HTTP_404_NOT_FOUND)

    if (
        application.user != request.user
        and not user_can_manage_shelter(request.user, application.animal.shelter)
        and not is_web_manager_or_admin(request.user)
    ):
        return Response({'error': 'Permission denied'}, status=status.HTTP_403_FORBIDDEN)

    serializer = AdoptionDetailSerializer(application, context={'request': request})
    return Response(serializer.data)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def application_create(request):
    serializer = AdoptionCreateUpdateSerializer(data=request.data, context={'request': request})
    if serializer.is_valid():
        serializer.save(user=request.user)
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['PATCH'])
@permission_classes([IsAuthenticated])
def application_update_status(request, pk):
    try:
        application = AdoptionApplication.objects.get(pk=pk)
    except AdoptionApplication.DoesNotExist:
        return Response({'error': 'Application not found'}, status=status.HTTP_404_NOT_FOUND)

    if not user_can_manage_shelter(request.user, application.animal.shelter):
        return Response({'error': 'Permission denied'}, status=status.HTTP_403_FORBIDDEN)

    new_status = request.data.get('status')
    if new_status not in dict(AdoptionApplication.Status.choices):
        return Response({'error': 'Invalid status'}, status=status.HTTP_400_BAD_REQUEST)

    Status = AdoptionApplication.Status
    application.status = new_status
    update_fields = ['status', 'updated_at']
    if new_status in (Status.APPROVED, Status.REJECTED):
        application.reviewed_at = timezone.now()
        application.clear_follow_up()
        update_fields += ['reviewed_at', 'next_follow_up_due_at']
    elif new_status == Status.INTERVIEW:
        application.schedule_follow_up()
        update_fields += ['next_follow_up_due_at']
    application.save(update_fields=update_fields)

    serializer = AdoptionDetailSerializer(application, context={'request': request})
    return Response(serializer.data)


def _get_application_or_404(pk):
    try:
        return AdoptionApplication.objects.select_related('animal__shelter', 'user').get(pk=pk)
    except AdoptionApplication.DoesNotExist:
        return None


def _can_view_application(user, application) -> bool:
    return (
        application.user_id == user.id
        or user_can_manage_shelter(user, application.animal.shelter)
        or is_web_manager_or_admin(user)
    )


def _can_write_event(user, application) -> bool:
    return (
        user_can_manage_shelter(user, application.animal.shelter)
        or is_web_manager_or_admin(user)
    )


@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def application_events(request, pk):
    application = _get_application_or_404(pk)
    if application is None:
        return Response({'error': 'Application not found'}, status=status.HTTP_404_NOT_FOUND)

    if request.method == 'GET':
        if not _can_view_application(request.user, application):
            return Response({'error': 'Permission denied'}, status=status.HTTP_403_FORBIDDEN)
        qs = application.events.filter(archived_at__isnull=True).select_related('created_by')
        serializer = AdoptionEventDetailSerializer(qs, many=True, context={'request': request})
        return Response(serializer.data)

    if not _can_write_event(request.user, application):
        return Response({'error': 'Permission denied'}, status=status.HTTP_403_FORBIDDEN)

    serializer = AdoptionEventCreateUpdateSerializer(data=request.data)
    if not serializer.is_valid():
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    event = serializer.save(application=application, created_by=request.user)
    _bump_follow_up(application)

    detail = AdoptionEventDetailSerializer(event, context={'request': request})
    return Response(detail.data, status=status.HTTP_201_CREATED)


def _bump_follow_up(application):
    application.schedule_follow_up()
    application.save(update_fields=['next_follow_up_due_at', 'updated_at'])


@api_view(['PATCH', 'DELETE'])
@permission_classes([IsAuthenticated])
def application_event_detail(request, pk, event_pk):
    application = _get_application_or_404(pk)
    if application is None:
        return Response({'error': 'Application not found'}, status=status.HTTP_404_NOT_FOUND)
    try:
        event = application.events.get(pk=event_pk, archived_at__isnull=True)
    except AdoptionApplicationEvent.DoesNotExist:
        return Response({'error': 'Event not found'}, status=status.HTTP_404_NOT_FOUND)

    is_author = event.created_by_id == request.user.id

    if request.method == 'PATCH':
        if not (is_author or is_web_manager_or_admin(request.user)
                or user_can_manage_shelter(request.user, application.animal.shelter)):
            return Response({'error': 'Permission denied'}, status=status.HTTP_403_FORBIDDEN)
        serializer = AdoptionEventCreateUpdateSerializer(event, data=request.data, partial=True)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        event = serializer.save()
        _bump_follow_up(application)
        detail = AdoptionEventDetailSerializer(event, context={'request': request})
        return Response(detail.data)

    if not (is_author or is_web_manager_or_admin(request.user)):
        return Response({'error': 'Permission denied'}, status=status.HTTP_403_FORBIDDEN)
    event.archived_at = timezone.now()
    event.save(update_fields=['archived_at'])
    return Response(status=status.HTTP_204_NO_CONTENT)
