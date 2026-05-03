import pytest
from django.core.exceptions import ValidationError
from django.core.files.uploadedfile import SimpleUploadedFile

from base_feature_app.models import Shelter


@pytest.mark.django_db
def test_shelter_str_returns_name(shelter):
    """__str__ returns the shelter name."""
    assert str(shelter) == 'Happy Paws'


@pytest.mark.django_db
def test_shelter_default_verification_status(shelter_admin_user):
    """New shelter defaults to pending verification."""
    s = Shelter.objects.create(
        name='New Place',
        city='Cali',
        owner=shelter_admin_user,
    )

    assert s.verification_status == Shelter.VerificationStatus.PENDING


@pytest.mark.django_db
def test_shelter_owner_relationship(shelter, shelter_admin_user):
    """Shelter is linked to its owner user."""
    assert shelter.owner == shelter_admin_user
    assert shelter in shelter_admin_user.shelters.all()


@pytest.mark.django_db
def test_shelter_verification_choices():
    """VerificationStatus contains expected choices."""
    values = {c.value for c in Shelter.VerificationStatus}
    assert 'pending' in values
    assert 'verified' in values
    assert 'rejected' in values


@pytest.mark.django_db
def test_shelter_video_field_optional_and_upload_path(shelter_admin_user):
    """Shelter.video is optional and uploads to shelters/videos/."""
    s = Shelter.objects.create(
        name='Videoless Place',
        city='Cali',
        owner=shelter_admin_user,
    )

    assert not s.video

    field = Shelter._meta.get_field('video')
    assert field.upload_to == 'shelters/videos/'
    assert field.null is True
    assert field.blank is True


@pytest.mark.django_db
def test_shelter_video_rejects_disallowed_extension(shelter):
    """FileExtensionValidator rejects extensions outside mp4/webm/mov/ogg."""
    shelter.video = SimpleUploadedFile(
        'note.txt', b'not a video', content_type='text/plain'
    )

    with pytest.raises(ValidationError) as excinfo:
        shelter.full_clean()

    assert 'video' in excinfo.value.message_dict
