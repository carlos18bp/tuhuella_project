import pytest

from base_feature_app.serializers.adopter_intent_list import AdopterIntentListSerializer
from base_feature_app.serializers.adopter_intent_detail import AdopterIntentDetailSerializer
from base_feature_app.serializers.adopter_intent_create_update import AdopterIntentCreateUpdateSerializer


@pytest.mark.django_db
def test_adopter_intent_list_serializer_fields(adopter_intent):
    """List serializer returns user_name and key fields."""
    data = AdopterIntentListSerializer(adopter_intent).data

    assert data['id'] == adopter_intent.pk
    assert data['user_name'] == 'Test User'
    assert data['status'] == 'active'
    assert data['visibility'] == 'public'
    assert 'created_at' in data


@pytest.mark.django_db
def test_adopter_intent_detail_serializer_includes_email(adopter_intent):
    """Detail serializer exposes user_email."""
    data = AdopterIntentDetailSerializer(adopter_intent).data

    assert data['user_email'] == 'user@example.com'
    assert data['description'] == 'Looking for a friendly dog'
    assert 'updated_at' in data


@pytest.mark.django_db
def test_adopter_intent_create_update_serializer_valid():
    """Create serializer accepts valid data."""
    serializer = AdopterIntentCreateUpdateSerializer(data={
        'preferences': {'species': 'cat'},
        'description': 'I want a cat',
        'status': 'active',
        'visibility': 'public',
    })

    assert serializer.is_valid(), serializer.errors


@pytest.mark.django_db
def test_adopter_intent_create_update_serializer_rejects_invalid_status():
    """Create serializer rejects invalid status value."""
    serializer = AdopterIntentCreateUpdateSerializer(data={
        'preferences': {},
        'description': 'test',
        'status': 'nonexistent',
        'visibility': 'public',
    })

    assert not serializer.is_valid()
    assert 'status' in serializer.errors
