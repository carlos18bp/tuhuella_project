from datetime import timedelta

from django.db.models import Avg, Count, F, Sum
from django.utils import timezone
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from base_feature_app.models import (
    Animal, Shelter, AdoptionApplication, Campaign, Donation, Sponsorship,
    UpdatePost, User,
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

    donation_stats = Donation.objects.filter(status='paid').aggregate(
        total_amount=Sum('amount'),
        total_count=Count('id'),
        avg_amount=Avg('amount'),
    )
    sponsorship_stats = Sponsorship.objects.filter(status='active').aggregate(
        total_amount=Sum('amount'),
        total_count=Count('id'),
        avg_amount=Avg('amount'),
    )

    published_count = Animal.objects.filter(status='published').count()
    adopted_count = Animal.objects.filter(status='adopted').count()
    total_applications = AdoptionApplication.objects.count()

    avg_apps_per_animal = 0
    if published_count + adopted_count > 0:
        avg_apps_per_animal = round(total_applications / (published_count + adopted_count), 1)

    # Average adoption time: days from animal creation to application approval
    approved_apps = AdoptionApplication.objects.filter(
        status='approved',
    ).select_related('animal')
    adoption_times = []
    for app in approved_apps:
        if app.reviewed_at and app.animal:
            delta = (app.reviewed_at - app.animal.created_at).days
            if delta >= 0:
                adoption_times.append(delta)
    avg_adoption_days = round(sum(adoption_times) / len(adoption_times), 1) if adoption_times else None

    # User retention: users with 2+ logins in last 30 days
    thirty_days_ago = timezone.now() - timedelta(days=30)
    active_users = User.objects.filter(last_login__gte=thirty_days_ago).count()
    total_users = User.objects.count()
    retention_rate = round((active_users / total_users) * 100, 1) if total_users > 0 else 0

    return Response({
        'donations': {
            'total_amount': str(donation_stats['total_amount'] or 0),
            'total_count': donation_stats['total_count'],
            'avg_amount': str(round(float(donation_stats['avg_amount'] or 0), 2)),
        },
        'sponsorships': {
            'total_amount': str(sponsorship_stats['total_amount'] or 0),
            'total_count': sponsorship_stats['total_count'],
            'avg_amount': str(round(float(sponsorship_stats['avg_amount'] or 0), 2)),
        },
        'adoption_rate': {
            'total_published': published_count,
            'total_adopted': adopted_count,
        },
        'avg_applications_per_animal': avg_apps_per_animal,
        'avg_adoption_time_days': avg_adoption_days,
        'user_retention_30d': retention_rate,
    })


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def shelter_metrics(request):
    """Metrics for shelter dashboard — accessible by shelter_admin only."""
    user = request.user
    if user.role != 'shelter_admin':
        return Response({'error': 'Permission denied'}, status=status.HTTP_403_FORBIDDEN)

    shelters = Shelter.objects.filter(owner=user)
    if not shelters.exists():
        return Response({'error': 'No shelter found'}, status=status.HTTP_404_NOT_FOUND)

    shelter_ids = list(shelters.values_list('id', flat=True))

    animals = Animal.objects.filter(shelter_id__in=shelter_ids)
    total_animals = animals.count()
    published_animals = animals.filter(status='published').count()
    adopted_animals = animals.filter(status='adopted').count()

    animal_ids = list(animals.values_list('id', flat=True))
    applications = AdoptionApplication.objects.filter(animal_id__in=animal_ids)
    total_applications = applications.count()

    avg_apps = 0
    active_animals = published_animals + adopted_animals
    if active_animals > 0:
        avg_apps = round(total_applications / active_animals, 1)

    donation_stats = Donation.objects.filter(
        shelter_id__in=shelter_ids, status='paid',
    ).aggregate(
        total_amount=Sum('amount'),
        total_count=Count('id'),
        avg_amount=Avg('amount'),
    )

    sponsorship_stats = Sponsorship.objects.filter(
        animal_id__in=animal_ids, status='active',
    ).aggregate(
        total_amount=Sum('amount'),
        total_count=Count('id'),
    )

    # Avg adoption time for this shelter
    approved_apps = applications.filter(status='approved').select_related('animal')
    adoption_times = []
    for app in approved_apps:
        if app.reviewed_at and app.animal:
            delta = (app.reviewed_at - app.animal.created_at).days
            if delta >= 0:
                adoption_times.append(delta)
    avg_adoption_days = round(sum(adoption_times) / len(adoption_times), 1) if adoption_times else None

    update_posts_count = UpdatePost.objects.filter(shelter_id__in=shelter_ids).count()
    active_campaigns = Campaign.objects.filter(shelter_id__in=shelter_ids, status='active').count()

    return Response({
        'total_animals': total_animals,
        'published_animals': published_animals,
        'adopted_animals': adopted_animals,
        'total_applications': total_applications,
        'avg_applications_per_animal': avg_apps,
        'donations': {
            'total_amount': str(donation_stats['total_amount'] or 0),
            'total_count': donation_stats['total_count'],
            'avg_amount': str(round(float(donation_stats['avg_amount'] or 0), 2)),
        },
        'sponsorships': {
            'total_amount': str(sponsorship_stats['total_amount'] or 0),
            'total_count': sponsorship_stats['total_count'],
        },
        'avg_adoption_time_days': avg_adoption_days,
        'update_posts_count': update_posts_count,
        'active_campaigns': active_campaigns,
    })
