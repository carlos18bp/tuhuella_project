from django.utils import timezone
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from base_feature_app.models import (
    Animal, Shelter, AdoptionApplication, Campaign, Donation, Sponsorship, User,
)


def is_superadmin(user):
    return user.role == 'admin' or user.is_superuser


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def admin_dashboard(request):
    if not is_superadmin(request.user):
        return Response({'error': 'Permission denied'}, status=status.HTTP_403_FORBIDDEN)

    return Response({
        'total_users': User.objects.count(),
        'total_shelters': Shelter.objects.count(),
        'verified_shelters': Shelter.objects.filter(verification_status='verified').count(),
        'pending_shelters': Shelter.objects.filter(verification_status='pending').count(),
        'total_animals': Animal.objects.count(),
        'published_animals': Animal.objects.filter(status='published').count(),
        'adopted_animals': Animal.objects.filter(status='adopted').count(),
        'total_applications': AdoptionApplication.objects.count(),
        'active_campaigns': Campaign.objects.filter(status='active').count(),
        'total_donations': Donation.objects.filter(status='paid').count(),
        'total_sponsorships': Sponsorship.objects.filter(status='active').count(),
    })


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def approve_shelter(request, pk):
    if not is_superadmin(request.user):
        return Response({'error': 'Permission denied'}, status=status.HTTP_403_FORBIDDEN)

    try:
        shelter = Shelter.objects.get(pk=pk)
    except Shelter.DoesNotExist:
        return Response({'error': 'Shelter not found'}, status=status.HTTP_404_NOT_FOUND)

    action = request.data.get('action')  # 'approve' or 'reject'
    if action == 'approve':
        shelter.verification_status = Shelter.VerificationStatus.VERIFIED
        shelter.verified_at = timezone.now()
    elif action == 'reject':
        shelter.verification_status = Shelter.VerificationStatus.REJECTED
    else:
        return Response({'error': 'action must be approve or reject'}, status=status.HTTP_400_BAD_REQUEST)

    shelter.save()
    return Response({
        'id': shelter.pk,
        'name': shelter.name,
        'verification_status': shelter.verification_status,
    })


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def pending_shelters(request):
    if not is_superadmin(request.user):
        return Response({'error': 'Permission denied'}, status=status.HTTP_403_FORBIDDEN)

    shelters = Shelter.objects.filter(verification_status='pending')
    data = [
        {
            'id': s.pk,
            'name': s.name,
            'legal_name': s.legal_name,
            'city': s.city,
            'owner_email': s.owner.email,
            'created_at': s.created_at,
        }
        for s in shelters
    ]
    return Response(data)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def admin_metrics(request):
    if not is_superadmin(request.user):
        return Response({'error': 'Permission denied'}, status=status.HTTP_403_FORBIDDEN)

    from django.db.models import Sum, Count

    donation_stats = Donation.objects.filter(status='paid').aggregate(
        total_amount=Sum('amount'),
        total_count=Count('id'),
    )
    sponsorship_stats = Sponsorship.objects.filter(status='active').aggregate(
        total_amount=Sum('amount'),
        total_count=Count('id'),
    )

    return Response({
        'donations': {
            'total_amount': str(donation_stats['total_amount'] or 0),
            'total_count': donation_stats['total_count'],
        },
        'sponsorships': {
            'total_amount': str(sponsorship_stats['total_amount'] or 0),
            'total_count': sponsorship_stats['total_count'],
        },
        'adoption_rate': {
            'total_published': Animal.objects.filter(status='published').count(),
            'total_adopted': Animal.objects.filter(status='adopted').count(),
        },
    })
