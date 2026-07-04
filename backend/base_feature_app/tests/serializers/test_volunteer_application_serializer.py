import pytest

from base_feature_app.serializers.volunteer_application import (
    VolunteerApplicationCreateSerializer,
)
from base_feature_app.tests.factories import VolunteerPositionFactory


@pytest.mark.django_db
def test_serializer_rejects_inactive_position():
    """An application to an inactive position fails validation."""
    position = VolunteerPositionFactory(is_active=False)
    ser = VolunteerApplicationCreateSerializer(data={
        'position': position.id,
        'motivation': 'Tengo experiencia cuidando animales rescatados.',
    })
    assert ser.is_valid() is False
    assert 'position' in ser.errors


@pytest.mark.django_db
def test_serializer_accepts_active_position_with_detailed_motivation():
    """An active position with a detailed motivation passes validation."""
    position = VolunteerPositionFactory(is_active=True)
    ser = VolunteerApplicationCreateSerializer(data={
        'position': position.id,
        'motivation': 'Quiero ayudar en las jornadas de adopción cada fin de semana.',
    })
    assert ser.is_valid() is True


@pytest.mark.django_db
def test_serializer_rejects_short_motivation():
    """A motivation shorter than 20 characters fails validation."""
    position = VolunteerPositionFactory(is_active=True)
    ser = VolunteerApplicationCreateSerializer(data={
        'position': position.id,
        'motivation': 'Quiero ayudar',
    })
    assert ser.is_valid() is False
    assert 'motivation' in ser.errors


@pytest.mark.django_db
def test_serializer_rejects_whitespace_padded_short_motivation():
    """A motivation that is short after trimming fails validation."""
    position = VolunteerPositionFactory(is_active=True)
    ser = VolunteerApplicationCreateSerializer(data={
        'position': position.id,
        'motivation': '   Ayudar   ',
    })
    assert ser.is_valid() is False
    assert 'motivation' in ser.errors
