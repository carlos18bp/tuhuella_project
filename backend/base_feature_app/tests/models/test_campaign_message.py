from datetime import datetime, timezone as dt_timezone

import pytest

from base_feature_app.models import CampaignMessage
from base_feature_app.tests.factories import CampaignFactory, CampaignMessageFactory


@pytest.mark.django_db
def test_message_persists_linked_to_campaign():
    campaign = CampaignFactory()
    message = CampaignMessageFactory(campaign=campaign, body='Hola refugio')
    assert CampaignMessage.objects.filter(campaign=campaign, pk=message.pk).exists()
    assert message.body == 'Hola refugio'


@pytest.mark.django_db
def test_is_system_defaults_to_false():
    message = CampaignMessageFactory()
    assert message.is_system is False


@pytest.mark.django_db
def test_str_uses_campaign_prefix_for_regular_message():
    message = CampaignMessageFactory(is_system=False)
    assert str(message).startswith('Campaign #')


@pytest.mark.django_db
def test_str_marks_system_message():
    message = CampaignMessageFactory(is_system=True)
    assert str(message).startswith('[system]')


@pytest.mark.django_db
def test_author_can_be_null():
    message = CampaignMessageFactory(author=None)
    assert message.author is None


@pytest.mark.django_db
def test_messages_ordered_by_creation_time():
    campaign = CampaignFactory()
    older = CampaignMessageFactory(campaign=campaign, body='primero')
    CampaignMessageFactory(campaign=campaign, body='segundo')
    CampaignMessage.objects.filter(pk=older.pk).update(
        created_at=datetime(2020, 1, 1, 12, 0, tzinfo=dt_timezone.utc),
    )

    bodies = list(campaign.messages.values_list('body', flat=True))

    assert bodies == ['primero', 'segundo']
