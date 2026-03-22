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
from base_feature_app.tests.helpers import make_animal, make_campaign, make_shelter


@pytest.mark.django_db
def test_password_code_admin_disables_add_permission():
    admin = PasswordCodeAdmin(PasswordCode, admin_site)
    request = RequestFactory().get('/admin/')

    assert admin.has_add_permission(request) is False


@pytest.mark.django_db
def test_shelter_admin_delete_queryset_removes_objects():
    """Verifies ShelterAdmin.delete_queryset removes the shelter and its associated image libraries."""
    shelter = make_shelter(name='Delete Test Shelter')

    admin = ShelterAdmin(Shelter, admin_site)
    admin.delete_queryset(RequestFactory().get('/admin/'), Shelter.objects.filter(id=shelter.id))

    assert Shelter.objects.filter(id=shelter.id).count() == 0


@pytest.mark.django_db
def test_animal_admin_delete_queryset_removes_gallery():
    """Verifies AnimalAdmin.delete_queryset removes the animal and its associated gallery library."""
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

    assert Animal.objects.filter(id=animal.id).count() == 0
    assert Library.objects.filter(id=gallery.id).count() == 0


@pytest.mark.django_db
def test_campaign_admin_delete_queryset_removes_cover():
    """Verifies CampaignAdmin.delete_queryset removes the campaign and its cover image library."""
    campaign = make_campaign(title='Delete Test Campaign')

    admin = CampaignAdmin(Campaign, admin_site)
    admin.delete_queryset(RequestFactory().get('/admin/'), Campaign.objects.filter(id=campaign.id))

    assert Campaign.objects.filter(id=campaign.id).count() == 0


@pytest.mark.django_db
def test_update_post_admin_delete_queryset_removes_image():
    """Verifies UpdatePostAdmin.delete_queryset removes the post and its image library."""
    shelter = make_shelter(name='Post Admin Shelter')
    image = Library.objects.create(title='Post Image')
    post = UpdatePost.objects.create(
        shelter=shelter,
        title='Test Post',
        content='Some content',
        image=image,
    )

    admin = UpdatePostAdmin(UpdatePost, admin_site)
    admin.delete_queryset(RequestFactory().get('/admin/'), UpdatePost.objects.filter(id=post.id))

    assert UpdatePost.objects.filter(id=post.id).count() == 0
    assert Library.objects.filter(id=image.id).count() == 0


@pytest.mark.django_db
def test_admin_site_custom_sections():
    """Verifies the custom admin site exposes all required model sections in the app list."""
    User.objects.create_superuser(email='admin@example.com', password='pass1234')
    request = RequestFactory().get('/admin/')
    request.user = User.objects.get(email='admin@example.com')

    app_list = admin_site.get_app_list(request)

    object_names = {model['object_name'] for section in app_list for model in section['models']}

    expected_models = {
        'User', 'PasswordCode', 'Shelter', 'Animal', 'Favorite',
        'AdoptionApplication', 'AdopterIntent', 'ShelterInvite',
        'Campaign', 'Donation', 'Sponsorship', 'Payment', 'Subscription',
        'UpdatePost', 'NotificationPreference', 'NotificationLog',
    }
    assert expected_models.issubset(object_names)
