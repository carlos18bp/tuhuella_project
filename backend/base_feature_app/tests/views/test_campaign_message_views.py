from unittest.mock import patch

import pytest
from django.urls import reverse

from base_feature_app.models import CampaignMessage, User
from base_feature_app.tests.factories import CampaignMessageFactory, UserFactory


@pytest.fixture
def web_manager(db):
    return UserFactory(email='wm-msg@example.com', role=User.Role.WEB_MANAGER)


@pytest.fixture
def web_manager_client(api_client, web_manager):
    api_client.force_authenticate(user=web_manager)
    return api_client


@pytest.fixture
def outsider_client(api_client, db):
    user = UserFactory(email='outsider-msg@example.com', role=User.Role.ADOPTER)
    api_client.force_authenticate(user=user)
    return api_client


def messages_url(campaign):
    return reverse('campaign-messages', args=[campaign.id])


# ---------- GET (thread read) ----------

@pytest.mark.django_db
def test_thread_requires_authentication(api_client, campaign):
    response = api_client.get(messages_url(campaign))
    assert response.status_code in (401, 403)


@pytest.mark.django_db
def test_thread_returns_404_for_missing_campaign(web_manager_client):
    response = web_manager_client.get(reverse('campaign-messages', args=[999999]))
    assert response.status_code == 404


@pytest.mark.django_db
def test_thread_forbidden_for_unrelated_user(outsider_client, campaign):
    response = outsider_client.get(messages_url(campaign))
    assert response.status_code == 403


@pytest.mark.django_db
def test_thread_lists_messages_for_shelter_owner(shelter_admin_client, campaign):
    CampaignMessageFactory(campaign=campaign, body='Primera nota', is_system=False)
    CampaignMessageFactory(campaign=campaign, body='Segunda nota', is_system=False)

    response = shelter_admin_client.get(messages_url(campaign))

    assert response.status_code == 200
    bodies = [m['body'] for m in response.data]
    assert bodies == ['Primera nota', 'Segunda nota']


@pytest.mark.django_db
def test_thread_readable_by_web_manager(web_manager_client, campaign):
    CampaignMessageFactory(campaign=campaign, body='Hola refugio')

    response = web_manager_client.get(messages_url(campaign))

    assert response.status_code == 200
    assert len(response.data) == 1


# ---------- POST (send message) ----------

@pytest.mark.django_db
@patch('base_feature_app.views.campaign_messages.dispatch_notification')
def test_shelter_owner_can_post_message(mock_dispatch, shelter_admin_client, campaign):
    response = shelter_admin_client.post(
        messages_url(campaign), {'body': 'Adjunto los soportes.'}, format='json',
    )

    assert response.status_code == 201, response.data
    assert response.data['body'] == 'Adjunto los soportes.'
    assert response.data['is_system'] is False
    assert CampaignMessage.objects.filter(campaign=campaign).count() == 1


@pytest.mark.django_db
@patch('base_feature_app.views.campaign_messages.dispatch_notification')
def test_post_rejects_blank_body(mock_dispatch, shelter_admin_client, campaign):
    response = shelter_admin_client.post(messages_url(campaign), {'body': ''}, format='json')

    assert response.status_code == 400
    assert CampaignMessage.objects.filter(campaign=campaign).count() == 0


@pytest.mark.django_db
@patch('base_feature_app.views.campaign_messages.dispatch_notification')
def test_post_rejects_whitespace_body(mock_dispatch, shelter_admin_client, campaign):
    response = shelter_admin_client.post(messages_url(campaign), {'body': '   '}, format='json')

    assert response.status_code == 400
    assert CampaignMessage.objects.filter(campaign=campaign).count() == 0


@pytest.mark.django_db
@patch('base_feature_app.views.campaign_messages.dispatch_notification')
def test_post_forbidden_for_unrelated_user(mock_dispatch, outsider_client, campaign):
    response = outsider_client.post(messages_url(campaign), {'body': 'hola'}, format='json')

    assert response.status_code == 403
    assert CampaignMessage.objects.filter(campaign=campaign).count() == 0


@pytest.mark.django_db
@patch('base_feature_app.views.campaign_messages.dispatch_notification')
def test_web_manager_post_notifies_shelter_owner(mock_dispatch, web_manager_client, campaign):
    response = web_manager_client.post(
        messages_url(campaign), {'body': 'Necesitamos más información.'}, format='json',
    )

    assert response.status_code == 201, response.data
    mock_dispatch.assert_called_once()
    assert mock_dispatch.call_args.args[0] == 'campaign_new_message'
    assert mock_dispatch.call_args.args[1] == campaign.shelter.owner
