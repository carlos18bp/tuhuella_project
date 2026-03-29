import pytest

from base_feature_app.serializers.user_list import UserListSerializer


@pytest.mark.django_db
def test_user_list_serializer_returns_expected_fields(existing_user):
    """Serializer output contains all declared Meta.fields."""
    data = UserListSerializer(existing_user).data

    assert set(data.keys()) == {
        'id', 'email', 'first_name', 'last_name',
        'role', 'is_active', 'is_staff',
    }


@pytest.mark.django_db
def test_user_list_serializer_values_match_instance(existing_user):
    """Serializer values correspond to the user instance attributes."""
    data = UserListSerializer(existing_user).data

    assert data['id'] == existing_user.pk
    assert data['email'] == 'user@example.com'
    assert data['is_active'] is True
