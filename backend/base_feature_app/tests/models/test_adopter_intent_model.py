import pytest
from django.db import IntegrityError, transaction

from base_feature_app.models import AdopterIntent


@pytest.mark.django_db
def test_adopter_intent_str_representation(adopter_intent):
    """__str__ contains user email and status display."""
    result = str(adopter_intent)
    assert 'user@example.com' in result
    assert 'Active' in result


@pytest.mark.django_db
def test_adopter_intent_default_status(existing_user):
    """New adopter intent defaults to active status."""
    intent = AdopterIntent.objects.create(
        user=existing_user,
        description='Looking for a cat',
    )
    assert intent.status == AdopterIntent.Status.ACTIVE


@pytest.mark.django_db
def test_adopter_intent_default_visibility(existing_user):
    """New adopter intent defaults to public visibility."""
    intent = AdopterIntent.objects.create(
        user=existing_user,
        description='Looking for a cat',
    )
    assert intent.visibility == AdopterIntent.Visibility.PUBLIC


@pytest.mark.django_db
def test_adopter_intent_one_to_one_constraint(adopter_intent, existing_user):
    """Cannot create two intents for the same user."""
    with transaction.atomic():
        with pytest.raises(IntegrityError):
            AdopterIntent.objects.create(
                user=existing_user,
                description='Duplicate intent',
            )

    assert AdopterIntent.objects.filter(user=existing_user).count() == 1


@pytest.mark.django_db
def test_adopter_intent_user_relationship(adopter_intent, existing_user):
    """Intent is linked to its user via OneToOne."""
    assert adopter_intent.user == existing_user
    assert existing_user.adopter_intent == adopter_intent


@pytest.mark.django_db
def test_adopter_intent_preferences_json(adopter_intent):
    """Preferences field stores JSON data correctly."""
    assert adopter_intent.preferences == {'species': 'dog', 'size': 'medium'}


@pytest.mark.django_db
def test_adopter_intent_status_choices():
    """Status contains expected choices."""
    values = {c.value for c in AdopterIntent.Status}
    assert values == {'active', 'paused', 'matched'}


@pytest.mark.django_db
def test_adopter_intent_visibility_choices():
    """Visibility contains expected choices."""
    values = {c.value for c in AdopterIntent.Visibility}
    assert values == {'public', 'private'}
