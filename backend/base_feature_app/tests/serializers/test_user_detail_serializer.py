import pytest

from base_feature_app.serializers.user_detail import UserDetailSerializer


@pytest.mark.django_db
def test_user_detail_serializer_returns_expected_fields(existing_user):
    """Serializer output contains all declared Meta.fields."""
    data = UserDetailSerializer(existing_user).data

    assert set(data.keys()) == {
        'id', 'email', 'first_name', 'last_name',
        'phone', 'role', 'is_active', 'is_staff', 'date_joined',
    }


@pytest.mark.django_db
def test_user_detail_serializer_values_match_instance(existing_user):
    """Serializer values correspond to the user instance attributes."""
    data = UserDetailSerializer(existing_user).data

    assert data['id'] == existing_user.pk
    assert data['email'] == 'user@example.com'
    assert data['first_name'] == 'Test'
    assert data['last_name'] == 'User'
