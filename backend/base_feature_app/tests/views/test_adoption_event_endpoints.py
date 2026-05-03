from datetime import timedelta

import pytest
from django.urls import reverse
from django.utils import timezone
from rest_framework import status

from base_feature_app.models import AdoptionApplication, AdoptionApplicationEvent
from base_feature_app.tests.factories import (
    AdoptionApplicationEventFactory,
    WebManagerUserFactory,
)


@pytest.mark.django_db
def test_status_change_to_interview_schedules_follow_up(
    shelter_admin_client, adoption_application,
):
    response = shelter_admin_client.patch(
        reverse('adoption-update-status', args=[adoption_application.pk]),
        {'status': 'interview'},
        format='json',
    )

    assert response.status_code == status.HTTP_200_OK
    adoption_application.refresh_from_db()
    assert adoption_application.next_follow_up_due_at is not None
    delta = adoption_application.next_follow_up_due_at - timezone.now()
    assert timedelta(days=4, hours=23) <= delta <= timedelta(days=5, hours=1)


@pytest.mark.django_db
def test_status_change_to_approved_clears_follow_up(
    shelter_admin_client, adoption_application,
):
    adoption_application.schedule_follow_up()
    adoption_application.save()

    response = shelter_admin_client.patch(
        reverse('adoption-update-status', args=[adoption_application.pk]),
        {'status': 'approved'},
        format='json',
    )

    assert response.status_code == status.HTTP_200_OK
    adoption_application.refresh_from_db()
    assert adoption_application.next_follow_up_due_at is None


@pytest.mark.django_db
def test_event_list_visible_to_applicant(authenticated_client, adoption_application):
    AdoptionApplicationEventFactory(application=adoption_application)

    response = authenticated_client.get(
        reverse('adoption-events', args=[adoption_application.pk]),
    )

    assert response.status_code == status.HTTP_200_OK
    assert len(response.json()) == 1


@pytest.mark.django_db
def test_event_create_denied_for_applicant(authenticated_client, adoption_application):
    response = authenticated_client.post(
        reverse('adoption-events', args=[adoption_application.pk]),
        {'event_date': timezone.now().isoformat(), 'description': 'No deberia poder'},
        format='json',
    )

    assert response.status_code == status.HTTP_403_FORBIDDEN
    assert not adoption_application.events.exists()


@pytest.mark.django_db
def test_event_create_by_shelter_admin_resets_follow_up(
    shelter_admin_client, adoption_application,
):
    adoption_application.status = AdoptionApplication.Status.INTERVIEW
    adoption_application.next_follow_up_due_at = timezone.now() - timedelta(days=1)
    adoption_application.save()

    response = shelter_admin_client.post(
        reverse('adoption-events', args=[adoption_application.pk]),
        {
            'event_date': timezone.now().isoformat(),
            'description': 'Hablamos con el adoptante.',
        },
        format='json',
    )

    assert response.status_code == status.HTTP_201_CREATED
    adoption_application.refresh_from_db()
    assert adoption_application.next_follow_up_due_at > timezone.now()


@pytest.mark.django_db
def test_event_create_by_web_manager(api_client, adoption_application):
    web_manager = WebManagerUserFactory()
    api_client.force_authenticate(user=web_manager)

    response = api_client.post(
        reverse('adoption-events', args=[adoption_application.pk]),
        {
            'event_date': (timezone.now() - timedelta(hours=1)).isoformat(),
            'description': 'Llamada al refugio.',
        },
        format='json',
    )

    assert response.status_code == status.HTTP_201_CREATED
    assert AdoptionApplicationEvent.objects.filter(
        application=adoption_application, created_by=web_manager,
    ).exists()


@pytest.mark.django_db
def test_event_create_rejects_future_date(shelter_admin_client, adoption_application):
    response = shelter_admin_client.post(
        reverse('adoption-events', args=[adoption_application.pk]),
        {
            'event_date': (timezone.now() + timedelta(days=1)).isoformat(),
            'description': 'Futuro',
        },
        format='json',
    )

    assert response.status_code == status.HTTP_400_BAD_REQUEST
    assert 'event_date' in response.json()


@pytest.mark.django_db
def test_event_create_rejects_blank_description(shelter_admin_client, adoption_application):
    response = shelter_admin_client.post(
        reverse('adoption-events', args=[adoption_application.pk]),
        {
            'event_date': timezone.now().isoformat(),
            'description': '   ',
        },
        format='json',
    )

    assert response.status_code == status.HTTP_400_BAD_REQUEST
    assert 'description' in response.json()


@pytest.mark.django_db
def test_event_archive_by_author(api_client, adoption_application):
    web_manager = WebManagerUserFactory()
    event = AdoptionApplicationEventFactory(
        application=adoption_application, created_by=web_manager,
    )
    api_client.force_authenticate(user=web_manager)

    response = api_client.delete(
        reverse('adoption-event-detail', args=[adoption_application.pk, event.pk]),
    )

    assert response.status_code == status.HTTP_204_NO_CONTENT
    event.refresh_from_db()
    assert event.archived_at is not None


@pytest.mark.django_db
def test_detail_exposes_shelter_whatsapp_in_interview(
    authenticated_client, adoption_application,
):
    adoption_application.status = AdoptionApplication.Status.INTERVIEW
    adoption_application.save()
    adoption_application.animal.shelter.phone = '573009998877'
    adoption_application.animal.shelter.save()

    response = authenticated_client.get(
        reverse('adoption-detail', args=[adoption_application.pk]),
    )

    assert response.status_code == status.HTTP_200_OK
    body = response.json()
    assert body['shelter_whatsapp'] == '573009998877'
    # Adopter should not see their own number echoed back.
    assert body['applicant_whatsapp'] is None


@pytest.mark.django_db
def test_detail_hides_shelter_whatsapp_when_submitted(
    authenticated_client, adoption_application,
):
    adoption_application.animal.shelter.phone = '573009998877'
    adoption_application.animal.shelter.save()

    response = authenticated_client.get(
        reverse('adoption-detail', args=[adoption_application.pk]),
    )

    assert response.status_code == status.HTTP_200_OK
    assert response.json()['shelter_whatsapp'] is None


@pytest.mark.django_db
def test_detail_exposes_applicant_whatsapp_to_shelter_admin(
    shelter_admin_client, adoption_application, existing_user,
):
    adoption_application.status = AdoptionApplication.Status.INTERVIEW
    adoption_application.save()
    existing_user.phone = '573001112233'
    existing_user.save()

    response = shelter_admin_client.get(
        reverse('adoption-detail', args=[adoption_application.pk]),
    )

    assert response.status_code == status.HTTP_200_OK
    assert response.json()['applicant_whatsapp'] == '573001112233'
