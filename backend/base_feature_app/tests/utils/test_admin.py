import pytest
from django.test import RequestFactory
from django_attachments.models import Library

from base_feature_app.admin import (
    AnimalAdmin,
    CampaignAdmin,
    PasswordCodeAdmin,
    ShelterAdmin,
    UpdatePostAdmin,
    admin_site,
)
from base_feature_app.models import (
    Animal,
    Campaign,
    PasswordCode,
    Shelter,
    UpdatePost,
    User,
)
from base_feature_app.tests.helpers import make_campaign, make_shelter


@pytest.mark.django_db
def test_password_code_admin_disables_add_permission():
    admin = PasswordCodeAdmin(PasswordCode, admin_site)
    request = RequestFactory().get('/admin/')

    assert admin.has_add_permission(request) is False


@pytest.mark.django_db
def test_shelter_admin_delete_queryset_archives_objects():
    """ShelterAdmin.delete_queryset soft-archives shelters (no CASCADE)."""
    shelter = make_shelter(name='Delete Test Shelter')

    admin = ShelterAdmin(Shelter, admin_site)
    admin.delete_queryset(RequestFactory().get('/admin/'), Shelter.objects.filter(id=shelter.id))

    shelter.refresh_from_db()
    assert shelter.archived_at is not None


@pytest.mark.django_db
def test_animal_admin_delete_queryset_archives_animal():
    """AnimalAdmin.delete_queryset archives animals without deleting gallery libraries."""
    shelter = make_shelter(name='Animal Admin Shelter')
    gallery = Library.objects.create(title='Animal Gallery')
    animal = Animal.objects.create(
        shelter=shelter,
        name='Test Animal',
        species='dog',
        breed='Mestizo',
        age_range='adult',
        gender='female',
        size='medium',
        status='published',
        gallery=gallery,
    )

    admin = AnimalAdmin(Animal, admin_site)
    admin.delete_queryset(RequestFactory().get('/admin/'), Animal.objects.filter(id=animal.id))

    animal.refresh_from_db()
    assert animal.archived_at is not None
    assert animal.status == Animal.Status.ARCHIVED
    assert Library.objects.filter(id=gallery.id).count() == 1


@pytest.mark.django_db
def test_campaign_admin_delete_queryset_archives_campaign():
    """CampaignAdmin.delete_queryset soft-archives campaigns."""
    campaign = make_campaign(title='Delete Test Campaign')

    admin = CampaignAdmin(Campaign, admin_site)
    admin.delete_queryset(RequestFactory().get('/admin/'), Campaign.objects.filter(id=campaign.id))

    campaign.refresh_from_db()
    assert campaign.archived_at is not None


@pytest.mark.django_db
def test_update_post_admin_delete_queryset_archives_post():
    """UpdatePostAdmin.delete_queryset archives posts without removing image libraries."""
    shelter = make_shelter(name='Post Admin Shelter')
    image = Library.objects.create(title='Post Image')
    post = UpdatePost.objects.create(
        shelter=shelter,
        title_es='Test Post',
        content_es='Some content',
        image=image,
    )

    admin = UpdatePostAdmin(UpdatePost, admin_site)
    admin.delete_queryset(RequestFactory().get('/admin/'), UpdatePost.objects.filter(id=post.id))

    post.refresh_from_db()
    assert post.archived_at is not None
    assert Library.objects.filter(id=image.id).count() == 1


@pytest.mark.django_db
def test_admin_site_custom_sections():
    """Verifies the custom admin site exposes all required model sections in the app list."""
    User.objects.create_superuser(email='admin@example.com', password='pass1234')
    request = RequestFactory().get('/admin/')
    request.user = User.objects.get(email='admin@example.com')

    app_list = admin_site.get_app_list(request)

    object_names = {model['object_name'] for section in app_list for model in section['models']}

    expected_models = {
        'User', 'PasswordCode', 'Shelter', 'ShelterMembership', 'Animal', 'Favorite',
        'AnimalStatusHistory',
        'AdoptionApplication', 'AdopterIntent', 'ShelterInvite',
        'Campaign', 'Donation', 'Sponsorship', 'Payment', 'PaymentHistory', 'Subscription',
        'UpdatePost', 'NotificationPreference', 'NotificationLog',
        'BlogPost',
    }
    assert expected_models.issubset(object_names)
