import pytest

from base_feature_app.serializers.shelter_application_detail import (
    ShelterApplicationDetailSerializer,
)
from base_feature_app.tests.factories import (
    AdminUserFactory,
    ShelterApplicationFactory,
    UserFactory,
)


@pytest.mark.django_db
def test_detail_serializer_returns_applicant_full_name():
    """Applicant name uses first and last name when present."""
    applicant = UserFactory(first_name='Ana', last_name='López')
    application = ShelterApplicationFactory(applicant=applicant)
    data = ShelterApplicationDetailSerializer(application).data
    assert data['applicant_name'] == 'Ana López'


@pytest.mark.django_db
def test_detail_serializer_falls_back_to_applicant_email():
    """Applicant name falls back to email when both names are blank."""
    applicant = UserFactory(first_name='', last_name='', email='nameless@example.com')
    application = ShelterApplicationFactory(applicant=applicant)
    data = ShelterApplicationDetailSerializer(application).data
    assert data['applicant_name'] == 'nameless@example.com'


@pytest.mark.django_db
def test_detail_serializer_returns_reviewer_email_when_reviewed():
    """A reviewed application exposes the reviewer email."""
    reviewer = AdminUserFactory(email='reviewer@example.com')
    application = ShelterApplicationFactory(reviewed_by=reviewer)
    data = ShelterApplicationDetailSerializer(application).data
    assert data['reviewed_by_email'] == 'reviewer@example.com'


@pytest.mark.django_db
def test_detail_serializer_returns_null_reviewer_email_when_unreviewed():
    """An unreviewed application serializes the reviewer email as null."""
    application = ShelterApplicationFactory(reviewed_by=None)
    data = ShelterApplicationDetailSerializer(application).data
    assert data['reviewed_by_email'] is None


@pytest.mark.django_db
def test_detail_serializer_returns_empty_document_urls_without_documents():
    """An application without a document library serializes an empty url list."""
    application = ShelterApplicationFactory()
    data = ShelterApplicationDetailSerializer(application).data
    assert data['document_urls'] == []
