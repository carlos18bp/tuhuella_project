"""Views for the formal shelter application workflow.

An adopter submits a `ShelterApplication`. Admins/web managers review and
either approve (creates a verified `Shelter` and promotes the user to
`shelter_admin`) or reject (with reason). All transitions notify the
relevant parties via `dispatch_notification`.
"""
from django.db import transaction
from django.utils import timezone
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from base_feature_app.models import Shelter, ShelterApplication, User
from base_feature_app.serializers.shelter_application_create import (
    ShelterApplicationCreateSerializer,
)
from base_feature_app.serializers.shelter_application_detail import (
    ShelterApplicationDetailSerializer,
)
from base_feature_app.services.notification_service import dispatch_notification
from base_feature_app.utils.shelter_access import is_web_manager_or_admin


def _notify_admins(event_key: str, context: dict) -> None:
    admins = User.objects.filter(
        role__in=[User.Role.ADMIN, User.Role.WEB_MANAGER],
        is_active=True,
        archived_at__isnull=True,
    )
    for admin in admins:
        dispatch_notification(event_key, admin, context)


def _applicant_full_name(user) -> str:
    full = f'{user.first_name} {user.last_name}'.strip()
    return full or user.email


@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def shelter_application_create_or_list(request):
    if request.method == 'POST':
        serializer = ShelterApplicationCreateSerializer(
            data=request.data, context={'request': request},
        )
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        application = serializer.save(
            applicant=request.user,
            status=ShelterApplication.Status.SUBMITTED,
        )

        _notify_admins(
            'shelter_application_submitted',
            {
                'user_name': _applicant_full_name(request.user),
                'shelter_name': application.shelter_name,
            },
        )

        detail = ShelterApplicationDetailSerializer(application, context={'request': request})
        return Response(detail.data, status=status.HTTP_201_CREATED)

    if not is_web_manager_or_admin(request.user):
        return Response({'error': 'Permission denied'}, status=status.HTTP_403_FORBIDDEN)

    qs = ShelterApplication.objects.filter(archived_at__isnull=True).select_related(
        'applicant', 'reviewed_by', 'created_shelter',
    )
    status_filter = request.GET.get('status')
    if status_filter:
        qs = qs.filter(status=status_filter)
    serializer = ShelterApplicationDetailSerializer(qs, many=True, context={'request': request})
    return Response(serializer.data)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def my_shelter_application(request):
    application = (
        ShelterApplication.objects
        .filter(applicant=request.user, archived_at__isnull=True)
        .order_by('-submitted_at')
        .first()
    )
    if application is None:
        return Response({'detail': 'No application found'}, status=status.HTTP_404_NOT_FOUND)
    serializer = ShelterApplicationDetailSerializer(application, context={'request': request})
    return Response(serializer.data)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def shelter_application_detail(request, pk):
    try:
        application = ShelterApplication.objects.select_related(
            'applicant', 'reviewed_by', 'created_shelter',
        ).get(pk=pk, archived_at__isnull=True)
    except ShelterApplication.DoesNotExist:
        return Response({'error': 'Application not found'}, status=status.HTTP_404_NOT_FOUND)

    if application.applicant_id != request.user.id and not is_web_manager_or_admin(request.user):
        return Response({'error': 'Permission denied'}, status=status.HTTP_403_FORBIDDEN)

    serializer = ShelterApplicationDetailSerializer(application, context={'request': request})
    return Response(serializer.data)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def shelter_application_approve(request, pk):
    if not is_web_manager_or_admin(request.user):
        return Response({'error': 'Permission denied'}, status=status.HTTP_403_FORBIDDEN)

    try:
        application = ShelterApplication.objects.select_related('applicant').get(
            pk=pk, archived_at__isnull=True,
        )
    except ShelterApplication.DoesNotExist:
        return Response({'error': 'Application not found'}, status=status.HTTP_404_NOT_FOUND)

    if application.status not in (
        ShelterApplication.Status.SUBMITTED,
        ShelterApplication.Status.UNDER_REVIEW,
    ):
        return Response(
            {'error': 'Application is not pending review'},
            status=status.HTTP_400_BAD_REQUEST,
        )

    now = timezone.now()
    with transaction.atomic():
        shelter = Shelter.objects.create(
            owner=application.applicant,
            name=application.shelter_name,
            legal_name=application.legal_name,
            description_es=application.description_es,
            city=application.city,
            address=application.address,
            phone=application.phone,
            email=application.email,
            website=application.website,
            verification_status=Shelter.VerificationStatus.VERIFIED,
            verified_at=now,
        )
        application.status = ShelterApplication.Status.APPROVED
        application.reviewed_by = request.user
        application.reviewed_at = now
        application.created_shelter = shelter
        application.save(update_fields=[
            'status', 'reviewed_by', 'reviewed_at', 'created_shelter',
        ])

        applicant = application.applicant
        if applicant.role != User.Role.SHELTER_ADMIN:
            applicant.role = User.Role.SHELTER_ADMIN
            applicant.save(update_fields=['role'])

    dispatch_notification(
        'shelter_application_approved',
        application.applicant,
        {
            'user_name': _applicant_full_name(application.applicant),
            'shelter_name': application.shelter_name,
        },
    )

    serializer = ShelterApplicationDetailSerializer(application, context={'request': request})
    return Response(serializer.data)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def shelter_application_reject(request, pk):
    if not is_web_manager_or_admin(request.user):
        return Response({'error': 'Permission denied'}, status=status.HTTP_403_FORBIDDEN)

    reason = (request.data.get('reason') or '').strip()
    if not reason:
        return Response({'error': 'reason is required'}, status=status.HTTP_400_BAD_REQUEST)

    try:
        application = ShelterApplication.objects.select_related('applicant').get(
            pk=pk, archived_at__isnull=True,
        )
    except ShelterApplication.DoesNotExist:
        return Response({'error': 'Application not found'}, status=status.HTTP_404_NOT_FOUND)

    if application.status not in (
        ShelterApplication.Status.SUBMITTED,
        ShelterApplication.Status.UNDER_REVIEW,
    ):
        return Response(
            {'error': 'Application is not pending review'},
            status=status.HTTP_400_BAD_REQUEST,
        )

    now = timezone.now()
    application.status = ShelterApplication.Status.REJECTED
    application.reviewed_by = request.user
    application.reviewed_at = now
    application.rejection_reason = reason
    application.save(update_fields=[
        'status', 'reviewed_by', 'reviewed_at', 'rejection_reason',
    ])

    dispatch_notification(
        'shelter_application_rejected',
        application.applicant,
        {
            'user_name': _applicant_full_name(application.applicant),
            'shelter_name': application.shelter_name,
            'reason': reason,
        },
    )

    serializer = ShelterApplicationDetailSerializer(application, context={'request': request})
    return Response(serializer.data)
