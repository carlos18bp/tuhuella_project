"""Shelter permission helpers (owner + team memberships)."""
from django.db.models import Q

from base_feature_app.models import Shelter


def shelters_managed_by_user(user):
    """Shelters the user owns or has a team membership for."""
    if not user.is_authenticated:
        return Shelter.objects.none()
    return Shelter.objects.filter(
        Q(owner=user) | Q(team_memberships__user=user),
    ).distinct()


def user_can_manage_shelter(user, shelter) -> bool:
    if not user.is_authenticated or shelter is None:
        return False
    if shelter.owner_id == user.id:
        return True
    return shelter.team_memberships.filter(user=user).exists()
