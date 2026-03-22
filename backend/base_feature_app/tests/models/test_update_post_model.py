import pytest

from base_feature_app.models import UpdatePost


@pytest.mark.django_db
def test_update_post_str_returns_title(update_post):
    """__str__ returns the post title."""
    assert str(update_post) == 'Luna recovered!'


@pytest.mark.django_db
def test_update_post_shelter_relationship(update_post, shelter):
    """Post is linked to its shelter."""
    assert update_post.shelter == shelter
    assert update_post in shelter.update_posts.all()


@pytest.mark.django_db
def test_update_post_campaign_relationship(update_post, campaign):
    """Post is linked to its campaign."""
    assert update_post.campaign == campaign
    assert update_post in campaign.update_posts.all()


@pytest.mark.django_db
def test_update_post_animal_relationship(update_post, animal):
    """Post is linked to its animal."""
    assert update_post.animal == animal
    assert update_post in animal.update_posts.all()


@pytest.mark.django_db
def test_update_post_nullable_campaign(shelter):
    """Campaign is optional for update posts."""
    post = UpdatePost.objects.create(
        shelter=shelter,
        title='General update',
        content='No campaign attached',
    )
    assert post.campaign is None


@pytest.mark.django_db
def test_update_post_nullable_animal(shelter):
    """Animal is optional for update posts."""
    post = UpdatePost.objects.create(
        shelter=shelter,
        title='Shelter news',
        content='No animal attached',
    )
    assert post.animal is None
