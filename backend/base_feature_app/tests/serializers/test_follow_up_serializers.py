import pytest

from base_feature_app.serializers.follow_up import (
    ClinicalHistoryEntrySerializer,
    FollowUpDetailSerializer,
    FollowUpListSerializer,
)
from base_feature_app.tests.factories import (
    ClinicalHistoryEntryFactory,
    PostAdoptionFollowUpFactory,
    VeterinarianUserFactory,
)


@pytest.mark.django_db
def test_follow_up_list_serializer_exposes_animal_name():
    """List serializer surfaces the related animal name."""
    follow_up = PostAdoptionFollowUpFactory()
    data = FollowUpListSerializer(follow_up).data
    assert data['animal_name'] == follow_up.animal.name


@pytest.mark.django_db
def test_follow_up_list_serializer_exposes_shelter_name():
    """List serializer surfaces the animal's shelter name."""
    follow_up = PostAdoptionFollowUpFactory()
    data = FollowUpListSerializer(follow_up).data
    assert data['shelter_name'] == follow_up.animal.shelter.name


@pytest.mark.django_db
def test_follow_up_list_serializer_returns_null_veterinarian_email_when_unassigned():
    """Unassigned follow-up serializes veterinarian_email as null."""
    follow_up = PostAdoptionFollowUpFactory(assigned_veterinarian=None)
    data = FollowUpListSerializer(follow_up).data
    assert data.get('veterinarian_email') is None


@pytest.mark.django_db
def test_follow_up_list_serializer_exposes_veterinarian_email_when_assigned():
    """Assigned veterinarian email is serialized."""
    vet = VeterinarianUserFactory(email='vet@example.com')
    follow_up = PostAdoptionFollowUpFactory(assigned_veterinarian=vet)
    data = FollowUpListSerializer(follow_up).data
    assert data['veterinarian_email'] == 'vet@example.com'


@pytest.mark.django_db
def test_follow_up_detail_serializer_nests_clinical_entries():
    """Detail serializer nests clinical history entries for the follow-up."""
    follow_up = PostAdoptionFollowUpFactory()
    ClinicalHistoryEntryFactory(
        follow_up=follow_up, animal=follow_up.animal, title='Revisión inicial',
    )
    data = FollowUpDetailSerializer(follow_up).data
    assert len(data['clinical_entries']) == 1
    assert data['clinical_entries'][0]['title'] == 'Revisión inicial'


@pytest.mark.django_db
def test_clinical_history_entry_serializer_exposes_author_email():
    """Clinical entry serializer surfaces the author's email."""
    vet = VeterinarianUserFactory(email='author@example.com')
    entry = ClinicalHistoryEntryFactory(author=vet)
    data = ClinicalHistoryEntrySerializer(entry).data
    assert data['author_email'] == 'author@example.com'
