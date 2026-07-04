from types import SimpleNamespace

import pytest
from django.contrib.auth.models import AnonymousUser

from base_feature_app.models import ShelterApplication
from base_feature_app.serializers.shelter_application_create import (
    ShelterApplicationCreateSerializer,
)
from base_feature_app.tests.factories import (
    RejectedShelterApplicationFactory,
    ShelterAdminUserFactory,
    ShelterApplicationFactory,
    UserFactory,
)

VALID_PAYLOAD = {
    'shelter_name': 'Refugio Esperanza',
    'description_es': 'Cuidamos animales rescatados.',
    'city': 'Bogotá',
    'phone': '+57 300 123 4567',
    'legal_name': 'Refugio Esperanza SAS',
    'tax_id': '900123456-7',
    'legal_representative_name': 'Ana López',
    'legal_representative_id': 'CC 1234567',
    'motivation': 'Queremos ampliar nuestra red de adopción.',
}


def _context_for(user):
    return {'request': SimpleNamespace(user=user)}


@pytest.mark.django_db
def test_create_serializer_accepts_valid_payload_for_adopter():
    """An authenticated adopter with no active application passes validation."""
    adopter = UserFactory()
    ser = ShelterApplicationCreateSerializer(data=VALID_PAYLOAD, context=_context_for(adopter))
    assert ser.is_valid() is True


@pytest.mark.django_db
def test_create_serializer_rejects_unauthenticated_user():
    """An anonymous request fails validation."""
    ser = ShelterApplicationCreateSerializer(data=VALID_PAYLOAD, context=_context_for(AnonymousUser()))
    assert ser.is_valid() is False


@pytest.mark.django_db
def test_create_serializer_rejects_shelter_admin():
    """A shelter admin account cannot apply again."""
    admin = ShelterAdminUserFactory()
    ser = ShelterApplicationCreateSerializer(data=VALID_PAYLOAD, context=_context_for(admin))
    assert ser.is_valid() is False


@pytest.mark.django_db
@pytest.mark.parametrize(
    'status',
    [ShelterApplication.Status.SUBMITTED, ShelterApplication.Status.UNDER_REVIEW],
)
def test_create_serializer_rejects_when_active_application_exists(status):
    """An in-review application blocks a new submission."""
    adopter = UserFactory()
    ShelterApplicationFactory(applicant=adopter, status=status)
    ser = ShelterApplicationCreateSerializer(data=VALID_PAYLOAD, context=_context_for(adopter))
    assert ser.is_valid() is False


@pytest.mark.django_db
def test_create_serializer_accepts_when_prior_application_rejected():
    """A rejected prior application does not block a new submission."""
    adopter = UserFactory()
    RejectedShelterApplicationFactory(applicant=adopter)
    ser = ShelterApplicationCreateSerializer(data=VALID_PAYLOAD, context=_context_for(adopter))
    assert ser.is_valid() is True
