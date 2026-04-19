import pytest
from django.contrib.auth.models import AnonymousUser

from base_feature_app.models import ShelterMembership
from base_feature_app.tests.factories import UserFactory, ShelterFactory, ShelterAdminUserFactory
from base_feature_app.utils.shelter_access import (
    shelters_managed_by_user,
    user_can_manage_shelter,
    is_web_manager,
    is_veterinarian,
    is_admin,
    is_web_manager_or_admin,
)


@pytest.mark.django_db
def test_shelters_managed_by_user_returns_owned_shelter():
    user = ShelterAdminUserFactory()
    shelter = ShelterFactory(owner=user)
    assert shelter in shelters_managed_by_user(user)


@pytest.mark.django_db
def test_shelters_managed_by_user_returns_membership_shelter():
    user = UserFactory()
    shelter = ShelterFactory()
    ShelterMembership.objects.create(shelter=shelter, user=user, role='staff')
    assert shelter in shelters_managed_by_user(user)


@pytest.mark.django_db
def test_shelters_managed_by_user_excludes_unrelated_shelters():
    user = UserFactory()
    ShelterFactory()
    assert shelters_managed_by_user(user).count() == 0


@pytest.mark.django_db
def test_shelters_managed_by_user_unauthenticated_returns_empty():
    anon = AnonymousUser()
    assert shelters_managed_by_user(anon).count() == 0


@pytest.mark.django_db
def test_user_can_manage_shelter_owner_returns_true():
    user = ShelterAdminUserFactory()
    shelter = ShelterFactory(owner=user)
    assert user_can_manage_shelter(user, shelter) is True


@pytest.mark.django_db
def test_user_can_manage_shelter_member_returns_true():
    user = UserFactory()
    shelter = ShelterFactory()
    ShelterMembership.objects.create(shelter=shelter, user=user, role='staff')
    assert user_can_manage_shelter(user, shelter) is True


@pytest.mark.django_db
def test_user_can_manage_shelter_non_member_returns_false():
    user = UserFactory()
    shelter = ShelterFactory()
    assert user_can_manage_shelter(user, shelter) is False


@pytest.mark.django_db
def test_user_can_manage_shelter_none_shelter_returns_false():
    user = UserFactory()
    assert user_can_manage_shelter(user, None) is False


@pytest.mark.django_db
def test_is_web_manager_returns_true_for_web_manager_role():
    user = UserFactory(role='web_manager')
    assert is_web_manager(user) is True


@pytest.mark.django_db
def test_is_veterinarian_returns_true_for_vet_role():
    user = UserFactory(role='veterinarian')
    assert is_veterinarian(user) is True


@pytest.mark.django_db
def test_is_admin_returns_true_for_admin_role():
    user = UserFactory(role='admin')
    assert is_admin(user) is True


@pytest.mark.django_db
def test_is_admin_returns_true_for_superuser():
    user = UserFactory(is_superuser=True)
    assert is_admin(user) is True


@pytest.mark.django_db
def test_is_web_manager_or_admin_returns_true_for_web_manager():
    user = UserFactory(role='web_manager')
    assert is_web_manager_or_admin(user) is True


@pytest.mark.django_db
def test_is_web_manager_or_admin_returns_true_for_admin():
    user = UserFactory(role='admin')
    assert is_web_manager_or_admin(user) is True


@pytest.mark.django_db
def test_is_web_manager_or_admin_returns_false_for_adopter():
    user = UserFactory(role='adopter')
    assert is_web_manager_or_admin(user) is False
