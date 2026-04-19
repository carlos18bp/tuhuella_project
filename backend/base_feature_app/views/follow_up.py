import logging

from rest_framework import status as http_status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from base_feature_app.models import (
    Animal,
    ClinicalHistoryEntry,
    PostAdoptionFollowUp,
    User,
)

logger = logging.getLogger(__name__)
from base_feature_app.serializers.follow_up import (
    ClinicalHistoryEntrySerializer,
    FollowUpDetailSerializer,
    FollowUpListSerializer,
)
from base_feature_app.utils.shelter_access import (
    is_admin,
    is_veterinarian,
    is_web_manager_or_admin,
    shelters_managed_by_user,
    user_can_manage_shelter,
)


def _scoped_followups(user):
    base = PostAdoptionFollowUp.objects.filter(archived_at__isnull=True)
    if is_web_manager_or_admin(user):
        return base
    if is_veterinarian(user):
        return base.filter(assigned_veterinarian=user)
    if user.role == 'shelter_admin':
        return base.filter(animal__shelter__in=shelters_managed_by_user(user))
    return base.filter(adopter=user)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def follow_up_list(request):
    qs = _scoped_followups(request.user).select_related(
        'animal', 'animal__shelter', 'adopter', 'assigned_veterinarian',
    ).order_by('-created_at')
    status_filter = request.GET.get('status')
    if status_filter:
        qs = qs.filter(status=status_filter)
    serializer = FollowUpListSerializer(qs, many=True, context={'request': request})
    return Response(serializer.data)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def follow_up_detail(request, pk):
    try:
        follow_up = (
            _scoped_followups(request.user)
            .select_related('animal', 'animal__shelter', 'adopter', 'assigned_veterinarian')
            .prefetch_related('clinical_entries')
            .get(pk=pk)
        )
    except PostAdoptionFollowUp.DoesNotExist:
        return Response({'error': 'Not found'}, status=http_status.HTTP_404_NOT_FOUND)
    serializer = FollowUpDetailSerializer(follow_up, context={'request': request})
    return Response(serializer.data)


@api_view(['PATCH'])
@permission_classes([IsAuthenticated])
def follow_up_assign(request, pk):
    try:
        follow_up = (
            PostAdoptionFollowUp.objects
            .filter(archived_at__isnull=True)
            .select_related('animal__shelter')
            .get(pk=pk)
        )
    except PostAdoptionFollowUp.DoesNotExist:
        return Response({'error': 'Not found'}, status=http_status.HTTP_404_NOT_FOUND)

    can_assign = (
        is_web_manager_or_admin(request.user)
        or user_can_manage_shelter(request.user, follow_up.animal.shelter)
    )
    if not can_assign:
        return Response({'error': 'Permission denied'}, status=http_status.HTTP_403_FORBIDDEN)

    vet_id = request.data.get('veterinarian_id')
    if not vet_id:
        return Response({'error': 'veterinarian_id is required'}, status=http_status.HTTP_400_BAD_REQUEST)
    try:
        vet = User.objects.get(pk=vet_id)
    except User.DoesNotExist:
        return Response({'error': 'Veterinarian not found'}, status=http_status.HTTP_400_BAD_REQUEST)
    if vet.role != 'veterinarian':
        return Response({'error': 'User is not a veterinarian'}, status=http_status.HTTP_400_BAD_REQUEST)

    follow_up.assigned_veterinarian = vet
    if follow_up.status == PostAdoptionFollowUp.Status.PENDING:
        follow_up.status = PostAdoptionFollowUp.Status.IN_PROGRESS
    follow_up.save()

    try:
        from base_feature_app.services.notification_service import dispatch_notification
        dispatch_notification('follow_up_assigned_to_vet', vet, {
            'user_name': vet.first_name or vet.email,
            'animal_name': follow_up.animal.name,
            'scheduled_date': follow_up.scheduled_date.isoformat(),
            'link': '/veterinarian/follow-ups',
        })
    except Exception:
        logger.exception('Failed to dispatch follow_up_assigned_to_vet for follow-up %s', follow_up.pk)

    return Response(FollowUpDetailSerializer(follow_up).data)


@api_view(['PATCH'])
@permission_classes([IsAuthenticated])
def follow_up_complete(request, pk):
    try:
        follow_up = (
            PostAdoptionFollowUp.objects
            .filter(archived_at__isnull=True)
            .select_related('animal__shelter')
            .get(pk=pk)
        )
    except PostAdoptionFollowUp.DoesNotExist:
        return Response({'error': 'Not found'}, status=http_status.HTTP_404_NOT_FOUND)

    can_complete = (
        (follow_up.assigned_veterinarian_id == request.user.id)
        or user_can_manage_shelter(request.user, follow_up.animal.shelter)
        or is_admin(request.user)
    )
    if not can_complete:
        return Response({'error': 'Permission denied'}, status=http_status.HTTP_403_FORBIDDEN)

    from django.utils import timezone as tz
    follow_up.status = PostAdoptionFollowUp.Status.COMPLETED
    follow_up.completed_date = tz.now().date()
    follow_up.save()
    return Response(FollowUpDetailSerializer(follow_up).data)


def _can_view_animal_history(user, animal):
    if is_web_manager_or_admin(user):
        return True
    if user_can_manage_shelter(user, animal.shelter):
        return True
    if animal.adopted_by_id == user.id:
        return True
    if is_veterinarian(user) and animal.follow_ups.filter(assigned_veterinarian=user).exists():
        return True
    return False


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def animal_clinical_history(request, pk):
    try:
        animal = Animal.objects.select_related('shelter').get(pk=pk)
    except Animal.DoesNotExist:
        return Response({'error': 'Animal not found'}, status=http_status.HTTP_404_NOT_FOUND)

    if not _can_view_animal_history(request.user, animal):
        return Response({'error': 'Permission denied'}, status=http_status.HTTP_403_FORBIDDEN)

    qs = animal.clinical_entries.all().order_by('-occurred_at')
    serializer = ClinicalHistoryEntrySerializer(qs, many=True)
    return Response(serializer.data)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def animal_clinical_history_create(request, pk):
    try:
        animal = Animal.objects.select_related('shelter', 'adopted_by').get(pk=pk)
    except Animal.DoesNotExist:
        return Response({'error': 'Animal not found'}, status=http_status.HTTP_404_NOT_FOUND)

    can_add = (
        user_can_manage_shelter(request.user, animal.shelter)
        or (is_veterinarian(request.user) and animal.follow_ups.filter(
            assigned_veterinarian=request.user,
        ).exists())
    )
    if not can_add:
        return Response({'error': 'Permission denied'}, status=http_status.HTTP_403_FORBIDDEN)

    data = {**request.data, 'animal': animal.id}
    serializer = ClinicalHistoryEntrySerializer(data=data)
    if not serializer.is_valid():
        return Response(serializer.errors, status=http_status.HTTP_400_BAD_REQUEST)
    entry = serializer.save(author=request.user)

    try:
        from base_feature_app.services.notification_service import dispatch_notification
        if animal.adopted_by:
            dispatch_notification('clinical_entry_added', animal.adopted_by, {
                'user_name': animal.adopted_by.first_name or animal.adopted_by.email,
                'animal_name': animal.name,
                'entry_title': entry.title,
                'link': f'/my-applications',
            })
    except Exception:
        logger.exception('Failed to dispatch clinical_entry_added for animal %s', animal.pk)

    return Response(
        ClinicalHistoryEntrySerializer(entry).data,
        status=http_status.HTTP_201_CREATED,
    )


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def veterinarians_list(request):
    if not (is_web_manager_or_admin(request.user) or request.user.role == 'shelter_admin'):
        return Response({'error': 'Permission denied'}, status=http_status.HTTP_403_FORBIDDEN)
    vets = User.objects.filter(role='veterinarian', is_active=True).order_by('email')
    data = [{'id': u.id, 'email': u.email, 'first_name': u.first_name, 'last_name': u.last_name} for u in vets]
    return Response(data)
