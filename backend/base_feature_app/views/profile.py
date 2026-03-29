"""
Profile views: stats aggregation, activity timeline, and profile updates.
"""
from itertools import chain
from operator import attrgetter

from django.db.models import Count, Sum, Q, Value, CharField
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from django_attachments.models import Attachment

from base_feature_app.models import (
    AdoptionApplication,
    Animal,
    Donation,
    Shelter,
    Sponsorship,
    User,
    Favorite,
    AdopterIntent,
    ShelterInvite,
)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def profile_stats(request):
    """
    Aggregated profile statistics for the authenticated user.
    Returns counts for applications, sponsorships, donations, favorites,
    adopter intent status, and pending shelter invites.
    """
    user = request.user

    # Applications — total + breakdown by status
    app_qs = AdoptionApplication.objects.filter(user=user)
    app_total = app_qs.count()
    app_by_status = dict(
        app_qs.values_list('status')
        .annotate(c=Count('id'))
        .values_list('status', 'c')
    )

    # Sponsorships
    sp_qs = Sponsorship.objects.filter(user=user)
    sp_total = sp_qs.count()
    sp_active = sp_qs.filter(status='active').count()

    # Donations (only paid)
    don_agg = Donation.objects.filter(user=user, status='paid').aggregate(
        total_amount=Sum('amount'),
        count=Count('id'),
    )

    # Favorites — count + preview of first 4 with thumbnail
    fav_qs = Favorite.objects.filter(user=user).select_related('animal', 'animal__shelter')
    fav_count = fav_qs.count()
    fav_preview = []
    for fav in fav_qs[:4]:
        animal = fav.animal
        thumb = None
        gallery = getattr(animal, 'gallery', None)
        if gallery:
            att = Attachment.objects.filter(library=gallery).order_by('rank').first()
            if att:
                thumb = att.file.url
        fav_preview.append({
            'id': animal.id,
            'name': animal.name,
            'species': animal.species,
            'thumbnail_url': thumb,
        })

    # Adopter intent
    intent_data = None
    try:
        intent = AdopterIntent.objects.get(user=user)
        intent_data = {
            'status': intent.status,
            'visibility': intent.visibility,
        }
    except AdopterIntent.DoesNotExist:
        pass

    # Shelter invites — count pending only if user has public intent
    pending_invites = 0
    if intent_data and intent_data['visibility'] == 'public':
        try:
            intent_obj = AdopterIntent.objects.get(user=user)
            pending_invites = ShelterInvite.objects.filter(
                adopter_intent=intent_obj,
                status='pending',
            ).count()
        except AdopterIntent.DoesNotExist:
            pass

    return Response({
        'applications': {
            'total': app_total,
            'by_status': {
                'submitted': app_by_status.get('submitted', 0),
                'reviewing': app_by_status.get('reviewing', 0),
                'interview': app_by_status.get('interview', 0),
                'approved': app_by_status.get('approved', 0),
                'rejected': app_by_status.get('rejected', 0),
            },
        },
        'sponsorships': {
            'active_count': sp_active,
            'total_count': sp_total,
        },
        'donations': {
            'total_amount': str(don_agg['total_amount'] or '0.00'),
            'count': don_agg['count'],
        },
        'favorites': {
            'count': fav_count,
            'preview': fav_preview,
        },
        'adopter_intent': intent_data,
        'shelter_invites': {
            'pending_count': pending_invites,
        },
    })


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def user_activity(request):
    """
    Combined activity timeline for the authenticated user.
    Returns the 10 most recent actions across applications, donations,
    sponsorships, and favorites, ordered by date descending.
    """
    user = request.user

    # Gather recent items from each model (max 10 each)
    events = []

    for app in (
        AdoptionApplication.objects
        .filter(user=user)
        .select_related('animal')
        .order_by('-created_at')[:10]
    ):
        events.append({
            'type': 'application',
            'animal_name': app.animal.name,
            'status': app.status,
            'date': app.created_at.isoformat(),
        })

    for don in (
        Donation.objects
        .filter(user=user, status='paid')
        .select_related('shelter')
        .order_by('-created_at')[:10]
    ):
        events.append({
            'type': 'donation',
            'shelter_name': don.shelter.name if don.shelter else '',
            'amount': str(don.amount),
            'date': (don.paid_at or don.created_at).isoformat(),
        })

    for sp in (
        Sponsorship.objects
        .filter(user=user)
        .select_related('animal')
        .order_by('-created_at')[:10]
    ):
        events.append({
            'type': 'sponsorship',
            'animal_name': sp.animal.name,
            'date': (sp.started_at or sp.created_at).isoformat(),
        })

    for fav in (
        Favorite.objects
        .filter(user=user)
        .select_related('animal')
        .order_by('-created_at')[:10]
    ):
        events.append({
            'type': 'favorite',
            'animal_name': fav.animal.name,
            'date': fav.created_at.isoformat(),
        })

    # Sort by date descending and limit to 10
    events.sort(key=lambda e: e['date'], reverse=True)
    return Response(events[:10])


@api_view(['GET', 'PATCH'])
@permission_classes([IsAuthenticated])
def update_profile(request):
    """
    GET  — Return the authenticated user's full profile (role-aware).
    PATCH — Update the authenticated user's profile fields.
    """
    if request.method == 'GET':
        return _get_profile(request)
    return _patch_profile(request)


def _get_profile(request):
    """Return profile data enriched by role."""
    user = request.user
    data = {
        'id': user.id,
        'email': user.email,
        'first_name': user.first_name,
        'last_name': user.last_name,
        'phone': user.phone,
        'city': user.city,
        'role': user.role,
        'is_staff': user.is_staff,
        'date_joined': user.date_joined.isoformat(),
    }

    if user.role == User.Role.SHELTER_ADMIN:
        shelter = (
            Shelter.objects
            .filter(owner=user)
            .only(
                'id', 'name', 'legal_name', 'description_es', 'city',
                'address', 'phone', 'email', 'website', 'verification_status',
            )
            .first()
        )
        if shelter:
            data['shelter'] = {
                'id': shelter.id,
                'name': shelter.name,
                'legal_name': shelter.legal_name,
                'description_es': shelter.description_es,
                'city': shelter.city,
                'address': shelter.address,
                'phone': shelter.phone,
                'email': shelter.email,
                'website': shelter.website,
                'verification_status': shelter.verification_status,
            }

    elif user.role == User.Role.ADMIN:
        data['admin_stats'] = {
            'total_users': User.objects.count(),
            'total_shelters': Shelter.objects.count(),
            'total_animals': Animal.objects.count(),
        }

    return Response(data)


def _patch_profile(request):
    """Update editable profile fields."""
    user = request.user
    allowed = {'first_name', 'last_name', 'phone', 'city'}
    updated_fields = []

    for field in allowed:
        if field in request.data:
            setattr(user, field, request.data[field])
            updated_fields.append(field)

    if not updated_fields:
        return Response(
            {'error': 'No valid fields provided'},
            status=status.HTTP_400_BAD_REQUEST,
        )

    user.save(update_fields=updated_fields)

    return Response({
        'id': user.id,
        'email': user.email,
        'first_name': user.first_name,
        'last_name': user.last_name,
        'phone': user.phone,
        'city': user.city,
        'role': user.role,
        'is_staff': user.is_staff,
        'date_joined': user.date_joined.isoformat(),
    })
