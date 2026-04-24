from unittest.mock import patch, PropertyMock

import pytest
from django_attachments.models import Library

from base_feature_app.models import StrategicAlly
from base_feature_app.tests.factories import StrategicAllyFactory


@pytest.mark.django_db
def test_strategic_ally_str_returns_name():
    ally = StrategicAllyFactory(name='Pet Corp')
    assert str(ally) == 'Pet Corp'


@pytest.mark.django_db
def test_strategic_ally_delete_cleans_up_logo():
    ally = StrategicAllyFactory()
    with patch.object(type(ally), 'logo', new_callable=PropertyMock) as logo_prop:
        logo_mock = logo_prop.return_value
        logo_mock.__bool__ = lambda self: True
        ally.delete()
        logo_mock.delete.assert_called_once()
    assert not StrategicAlly.objects.filter(pk=ally.pk).exists()


@pytest.mark.django_db
def test_strategic_ally_delete_handles_missing_logo_library():
    ally = StrategicAllyFactory()
    with patch.object(type(ally), 'logo', new_callable=PropertyMock) as logo_prop:
        logo_prop.side_effect = Library.DoesNotExist
        ally.delete()
    assert not StrategicAlly.objects.filter(pk=ally.pk).exists()
