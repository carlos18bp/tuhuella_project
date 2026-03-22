import pytest
from django.db import IntegrityError

from base_feature_app.models import ShelterInvite


@pytest.mark.django_db
def test_shelter_invite_str_representation(shelter_invite):
    """__str__ contains shelter name, user email and status."""
    result = str(shelter_invite)
    assert 'Happy Paws' in result
    assert 'user@example.com' in result
    assert 'Pending' in result


@pytest.mark.django_db
def test_shelter_invite_default_status(shelter, adopter_intent):
    """New invite defaults to pending status."""
    invite = ShelterInvite.objects.create(
        shelter=shelter,
        adopter_intent=adopter_intent,
        message='Come visit us!',
    )
    assert invite.status == ShelterInvite.Status.PENDING


@pytest.mark.django_db
def test_shelter_invite_unique_together(shelter_invite, shelter, adopter_intent):
    """Cannot create duplicate invites for the same shelter + adopter_intent."""
    with pytest.raises(IntegrityError):
        ShelterInvite.objects.create(
            shelter=shelter,
            adopter_intent=adopter_intent,
            message='Duplicate invite',
        )


@pytest.mark.django_db
def test_shelter_invite_shelter_relationship(shelter_invite, shelter):
    """Invite is linked to its shelter."""
    assert shelter_invite.shelter == shelter
    assert shelter_invite in shelter.invites_sent.all()


@pytest.mark.django_db
def test_shelter_invite_adopter_intent_relationship(shelter_invite, adopter_intent):
    """Invite is linked to its adopter intent."""
    assert shelter_invite.adopter_intent == adopter_intent
    assert shelter_invite in adopter_intent.invites_received.all()


@pytest.mark.django_db
def test_shelter_invite_status_choices():
    """Status contains expected choices."""
    values = {c.value for c in ShelterInvite.Status}
    assert values == {'pending', 'accepted', 'rejected'}
