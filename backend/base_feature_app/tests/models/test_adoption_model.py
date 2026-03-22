import pytest
from django.db import IntegrityError

from base_feature_app.models import AdoptionApplication


@pytest.mark.django_db
def test_adoption_str_representation(adoption_application):
    """__str__ contains user email and animal name."""
    result = str(adoption_application)
    assert 'user@example.com' in result
    assert 'Luna' in result


@pytest.mark.django_db
def test_adoption_default_status_is_submitted(existing_user, animal):
    """New application defaults to submitted status."""
    app = AdoptionApplication.objects.create(
        animal=animal,
        user=existing_user,
    )

    assert app.status == AdoptionApplication.Status.SUBMITTED


@pytest.mark.django_db
def test_adoption_unique_together(adoption_application, existing_user, animal):
    """Cannot create two applications for the same user + animal."""
    with pytest.raises(IntegrityError):
        AdoptionApplication.objects.create(
            animal=animal,
            user=existing_user,
        )


@pytest.mark.django_db
def test_adoption_form_answers_json(adoption_application):
    """form_answers stores JSON correctly."""
    assert adoption_application.form_answers == {'reason': 'I love dogs'}


@pytest.mark.django_db
def test_adoption_status_choices():
    """Status contains expected values."""
    values = {c.value for c in AdoptionApplication.Status}
    assert 'submitted' in values
    assert 'approved' in values
    assert 'rejected' in values
