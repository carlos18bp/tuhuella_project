import pytest
from django.db import IntegrityError

from base_feature_app.models import ShelterMembership
from base_feature_app.tests.factories import UserFactory, ShelterFactory


@pytest.mark.django_db
def test_shelter_membership_str_shows_user_and_shelter():
    user = UserFactory(email='member@example.com')
    shelter = ShelterFactory(name='Patas Alegres')
    membership = ShelterMembership.objects.create(shelter=shelter, user=user, role='staff')
    result = str(membership)
    assert 'member@example.com' in result
    assert 'Patas Alegres' in result


@pytest.mark.django_db
def test_shelter_membership_unique_per_user_per_shelter():
    user = UserFactory()
    shelter = ShelterFactory()
    first = ShelterMembership.objects.create(shelter=shelter, user=user, role='staff')
    assert first.pk is not None
    with pytest.raises(IntegrityError):
        ShelterMembership.objects.create(shelter=shelter, user=user, role='admin')


@pytest.mark.django_db
def test_shelter_membership_role_defaults_to_staff():
    user = UserFactory()
    shelter = ShelterFactory()
    membership = ShelterMembership.objects.create(shelter=shelter, user=user)
    assert membership.role == ShelterMembership.Role.STAFF


@pytest.mark.django_db
def test_shelter_membership_cascades_on_shelter_delete():
    user = UserFactory()
    shelter = ShelterFactory()
    ShelterMembership.objects.create(shelter=shelter, user=user)
    shelter.delete()
    assert ShelterMembership.objects.count() == 0


@pytest.mark.django_db
def test_shelter_membership_cascades_on_user_delete():
    user = UserFactory()
    shelter = ShelterFactory()
    membership = ShelterMembership.objects.create(shelter=shelter, user=user)
    user.delete()
    assert not ShelterMembership.objects.filter(pk=membership.pk).exists()
