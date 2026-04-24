import pytest

from base_feature_app.models import Campaign, CampaignMessage
from base_feature_app.tests.factories import (
    CampaignFactory,
    ShelterFactory,
    UserFactory,
)


@pytest.fixture
def web_manager(db):
    return UserFactory(email='wm@example.com', role='web_manager')


@pytest.fixture
def web_manager_client(api_client, web_manager):
    api_client.force_authenticate(user=web_manager)
    return api_client


@pytest.fixture
def pending_campaign(shelter):
    return CampaignFactory(
        shelter=shelter,
        status=Campaign.Status.DRAFT,
        approval_status=Campaign.ApprovalStatus.PENDING,
    )


@pytest.mark.django_db
def test_shelter_admin_create_campaign_marks_pending(shelter_admin_client, shelter):
    response = shelter_admin_client.post('/api/campaigns/create/', {
        'shelter': shelter.id,
        'title_es': 'Ayuda a Rex',
        'title_en': 'Help Rex',
        'goal_amount': '100000',
        'status': 'draft',
    }, format='json')
    assert response.status_code == 201, response.data
    assert response.data['approval_status'] == 'pending'
    assert response.data['submitted_at'] is not None


@pytest.mark.django_db
def test_public_campaigns_list_hides_non_approved(api_client, shelter):
    """Public campaigns endpoint returns only approved campaigns, hiding pending and rejected ones."""
    CampaignFactory(
        shelter=shelter,
        status=Campaign.Status.ACTIVE,
        approval_status=Campaign.ApprovalStatus.APPROVED,
    )
    CampaignFactory(
        shelter=shelter,
        status=Campaign.Status.ACTIVE,
        approval_status=Campaign.ApprovalStatus.PENDING,
    )
    CampaignFactory(
        shelter=shelter,
        status=Campaign.Status.ACTIVE,
        approval_status=Campaign.ApprovalStatus.REJECTED,
    )
    response = api_client.get('/api/campaigns/')
    assert response.status_code == 200
    assert len(response.data) == 1
    assert response.data[0]['approval_status'] == 'approved'


@pytest.mark.django_db
def test_web_manager_lists_pending_campaigns(web_manager_client, pending_campaign):
    CampaignFactory(approval_status=Campaign.ApprovalStatus.APPROVED)
    response = web_manager_client.get('/api/admin/campaigns/?approval_status=pending')
    assert response.status_code == 200
    assert response.data['count'] == 1
    assert response.data['results'][0]['id'] == pending_campaign.id


@pytest.mark.django_db
def test_shelter_admin_cannot_access_admin_campaigns(shelter_admin_client):
    response = shelter_admin_client.get('/api/admin/campaigns/')
    assert response.status_code == 403


@pytest.mark.django_db
def test_approve_campaign_creates_system_message(web_manager_client, web_manager, pending_campaign):
    response = web_manager_client.post(f'/api/admin/campaigns/{pending_campaign.id}/approve/')
    assert response.status_code == 200
    pending_campaign.refresh_from_db()
    assert pending_campaign.approval_status == 'approved'
    assert pending_campaign.reviewed_by_id == web_manager.id
    assert pending_campaign.reviewed_at is not None
    msgs = CampaignMessage.objects.filter(campaign=pending_campaign, is_system=True)
    assert msgs.count() == 1


@pytest.mark.django_db
def test_reject_campaign_requires_reason_and_creates_message(web_manager_client, pending_campaign):
    """Rejection without a reason returns 400; with a reason it sets status to rejected and creates a system message."""
    no_reason = web_manager_client.post(
        f'/api/admin/campaigns/{pending_campaign.id}/reject/',
        {}, format='json',
    )
    assert no_reason.status_code == 400

    ok = web_manager_client.post(
        f'/api/admin/campaigns/{pending_campaign.id}/reject/',
        {'reason': 'Falta imagen de portada.'}, format='json',
    )
    assert ok.status_code == 200
    pending_campaign.refresh_from_db()
    assert pending_campaign.approval_status == 'rejected'
    system_msg = CampaignMessage.objects.filter(campaign=pending_campaign, is_system=True).first()
    assert system_msg is not None
    assert 'Falta imagen de portada' in system_msg.body


@pytest.mark.django_db
def test_shelter_can_resubmit_rejected_campaign(shelter_admin_client, shelter):
    rejected = CampaignFactory(
        shelter=shelter,
        approval_status=Campaign.ApprovalStatus.REJECTED,
    )
    response = shelter_admin_client.post(f'/api/campaigns/{rejected.id}/submit/')
    assert response.status_code == 200
    rejected.refresh_from_db()
    assert rejected.approval_status == 'pending'
    assert rejected.reviewed_by is None
    assert rejected.reviewed_at is None
    assert rejected.submitted_at is not None


@pytest.mark.django_db
def test_messages_thread_access_and_post(shelter_admin_client, web_manager_client,
                                          web_manager, pending_campaign):
    """Campaign message thread is readable/writable by owner and web manager but blocked for strangers."""
    # shelter_admin (owner) can GET
    r1 = shelter_admin_client.get(f'/api/campaigns/{pending_campaign.id}/messages/')
    assert r1.status_code == 200

    # shelter_admin can POST
    r2 = shelter_admin_client.post(
        f'/api/campaigns/{pending_campaign.id}/messages/',
        {'body': 'Aquí está la info adicional'}, format='json',
    )
    assert r2.status_code == 201
    assert r2.data['body'] == 'Aquí está la info adicional'

    # web_manager can POST
    r3 = web_manager_client.post(
        f'/api/campaigns/{pending_campaign.id}/messages/',
        {'body': 'Gracias, revisamos hoy'}, format='json',
    )
    assert r3.status_code == 201

    # stranger cannot
    stranger = UserFactory(email='stranger@example.com', role='adopter')
    from rest_framework.test import APIClient
    stranger_client = APIClient()
    stranger_client.force_authenticate(user=stranger)
    r4 = stranger_client.get(f'/api/campaigns/{pending_campaign.id}/messages/')
    assert r4.status_code == 403


@pytest.mark.django_db
def test_web_manager_creates_campaign_auto_approved(web_manager_client):
    other_shelter = ShelterFactory()
    response = web_manager_client.post('/api/campaigns/create/', {
        'shelter': other_shelter.id,
        'title_es': 'Campaña directa',
        'title_en': 'Direct campaign',
        'goal_amount': '200000',
        'status': 'draft',
    }, format='json')
    assert response.status_code == 201, response.data
    assert response.data['approval_status'] == 'approved'
    assert response.data['reviewed_at'] is not None


@pytest.mark.django_db
def test_shelter_sees_own_pending_campaigns_in_mine(shelter_admin_client, shelter):
    CampaignFactory(shelter=shelter, approval_status=Campaign.ApprovalStatus.APPROVED)
    CampaignFactory(shelter=shelter, approval_status=Campaign.ApprovalStatus.PENDING)
    CampaignFactory(shelter=shelter, approval_status=Campaign.ApprovalStatus.REJECTED)

    response = shelter_admin_client.get('/api/campaigns/mine/')
    assert response.status_code == 200
    statuses = sorted(c['approval_status'] for c in response.data)
    assert statuses == ['approved', 'pending', 'rejected']
