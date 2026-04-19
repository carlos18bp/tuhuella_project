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


def is_web_manager(user) -> bool:
    return bool(user and user.is_authenticated and getattr(user, 'role', None) == 'web_manager')


def is_veterinarian(user) -> bool:
    return bool(user and user.is_authenticated and getattr(user, 'role', None) == 'veterinarian')


def is_admin(user) -> bool:
    return bool(user and user.is_authenticated and (getattr(user, 'role', None) == 'admin' or user.is_superuser))


def is_web_manager_or_admin(user) -> bool:
    return is_web_manager(user) or is_admin(user)
