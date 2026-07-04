import pytest
from freezegun import freeze_time

from base_feature_app.serializers.adoption_event_create import (
    AdoptionEventCreateUpdateSerializer,
)
from base_feature_app.serializers.adoption_event_detail import (
    AdoptionEventDetailSerializer,
)
from base_feature_app.tests.factories import (
    AdoptionApplicationEventFactory,
    UserFactory,
    WebManagerUserFactory,
)


@freeze_time('2026-06-01T12:00:00Z')
def test_create_serializer_rejects_future_event_date():
    """A future event_date fails validation."""
    ser = AdoptionEventCreateUpdateSerializer(data={
        'event_date': '2026-06-02T12:00:00Z',
        'description': 'Entrevista programada.',
    })
    assert ser.is_valid() is False
    assert 'event_date' in ser.errors


@freeze_time('2026-06-01T12:00:00Z')
def test_create_serializer_accepts_past_event_date():
    """A past event_date passes validation."""
    ser = AdoptionEventCreateUpdateSerializer(data={
        'event_date': '2026-05-31T12:00:00Z',
        'description': 'Entrevista realizada.',
    })
    assert ser.is_valid() is True


@freeze_time('2026-06-01T12:00:00Z')
def test_create_serializer_rejects_blank_description():
    """A whitespace-only description fails validation."""
    ser = AdoptionEventCreateUpdateSerializer(data={
        'event_date': '2026-05-31T12:00:00Z',
        'description': '   ',
    })
    assert ser.is_valid() is False
    assert 'description' in ser.errors


@freeze_time('2026-06-01T12:00:00Z')
def test_create_serializer_strips_description_whitespace():
    """A valid description is trimmed of surrounding whitespace."""
    ser = AdoptionEventCreateUpdateSerializer(data={
        'event_date': '2026-05-31T12:00:00Z',
        'description': '  Llamada inicial.  ',
    })
    assert ser.is_valid() is True
    assert ser.validated_data['description'] == 'Llamada inicial.'


@pytest.mark.django_db
def test_detail_serializer_returns_creator_full_name():
    """Detail serializer combines the creator's first and last name."""
    creator = UserFactory(first_name='Ana', last_name='López')
    event = AdoptionApplicationEventFactory(created_by=creator)
    data = AdoptionEventDetailSerializer(event).data
    assert data['created_by_name'] == 'Ana López'


@pytest.mark.django_db
def test_detail_serializer_falls_back_to_creator_email():
    """Detail serializer falls back to the creator email when names are blank."""
    creator = UserFactory(first_name='', last_name='', email='creator@example.com')
    event = AdoptionApplicationEventFactory(created_by=creator)
    data = AdoptionEventDetailSerializer(event).data
    assert data['created_by_name'] == 'creator@example.com'


@pytest.mark.django_db
def test_detail_serializer_exposes_creator_role():
    """Detail serializer surfaces the creator role."""
    creator = WebManagerUserFactory()
    event = AdoptionApplicationEventFactory(created_by=creator)
    data = AdoptionEventDetailSerializer(event).data
    assert data['created_by_role'] == 'web_manager'
