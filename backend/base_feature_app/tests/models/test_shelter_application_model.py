import pytest
from django.db import IntegrityError

from base_feature_app.models import ShelterApplication
from base_feature_app.tests.factories import UserFactory


def _make_app(user, **overrides):
    defaults = dict(
        applicant=user,
        shelter_name='Patitas Felices',
        description_es='Refugio de prueba',
        city='Bogotá',
        phone='3001234567',
        legal_name='Patitas Felices SAS',
        tax_id='900123456-7',
        legal_representative_name='Juan Pérez',
        legal_representative_id='1020304050',
        motivation='Llevamos 5 años rescatando perros en la comunidad',
    )
    defaults.update(overrides)
    return ShelterApplication.objects.create(**defaults)


@pytest.mark.django_db
def test_create_shelter_application_defaults_to_submitted():
    user = UserFactory()
    application = _make_app(user)
    assert application.status == ShelterApplication.Status.SUBMITTED
    assert application.submitted_at is not None
    assert application.created_shelter is None
    assert application.archived_at is None


@pytest.mark.django_db
def test_unique_active_application_per_user():
    # quality: disable no_assertions (pytest.raises IS the assertion — verifies IntegrityError on duplicate active application)
    user = UserFactory()
    _make_app(user)
    with pytest.raises(IntegrityError):
        _make_app(user)


@pytest.mark.django_db
def test_user_can_reapply_after_rejection():
    user = UserFactory()
    first = _make_app(user)
    first.status = ShelterApplication.Status.REJECTED
    first.rejection_reason = 'Documentos incompletos'
    first.save(update_fields=['status', 'rejection_reason'])

    # Now a new active application should be allowed
    second = _make_app(user)
    assert second.pk != first.pk
    assert second.status == ShelterApplication.Status.SUBMITTED
