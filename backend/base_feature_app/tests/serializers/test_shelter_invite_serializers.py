import pytest

from base_feature_app.serializers.shelter_invite_list import ShelterInviteListSerializer
from base_feature_app.serializers.shelter_invite_create_update import ShelterInviteCreateUpdateSerializer


@pytest.mark.django_db
def test_shelter_invite_list_serializer_fields(shelter_invite):
    """List serializer returns shelter_name and adopter_email."""
    data = ShelterInviteListSerializer(shelter_invite).data

    assert data['id'] == shelter_invite.pk
    assert data['shelter_name'] == 'Happy Paws'
    assert data['adopter_email'] == 'user@example.com'
    assert data['message'] == 'We have the perfect match for you!'
    assert data['status'] == 'pending'
    assert 'created_at' in data


@pytest.mark.django_db
def test_shelter_invite_create_update_serializer_valid(shelter, adopter_intent):
    """Create serializer accepts valid data."""
    serializer = ShelterInviteCreateUpdateSerializer(data={
        'shelter': shelter.pk,
        'adopter_intent': adopter_intent.pk,
        'message': 'Come visit!',
    })

    assert serializer.is_valid(), serializer.errors


@pytest.mark.django_db
def test_shelter_invite_create_update_serializer_rejects_missing_shelter(adopter_intent):
    """Create serializer rejects missing shelter."""
    serializer = ShelterInviteCreateUpdateSerializer(data={
        'adopter_intent': adopter_intent.pk,
        'message': 'Hello',
    })

    assert not serializer.is_valid()
    assert 'shelter' in serializer.errors
