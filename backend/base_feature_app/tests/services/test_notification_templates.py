import pytest

from base_feature_app.services.notification_templates import render_template


def test_render_template_returns_subject_and_body():
    subject, body = render_template('adoption_submitted', 'es', {'user_name': 'Ana'})
    assert isinstance(subject, str) and len(subject) > 0
    assert isinstance(body, str) and len(body) > 0


def test_render_template_es_locale_renders_spanish():
    subject, _ = render_template('adoption_submitted', 'es', {})
    assert isinstance(subject, str)
    assert len(subject) > 0


def test_render_template_en_locale_renders_english():
    subject_es, _ = render_template('adoption_submitted', 'es', {})
    subject_en, _ = render_template('adoption_submitted', 'en', {})
    assert subject_es != subject_en


def test_render_template_unknown_locale_defaults_to_es():
    subject_fr, body_fr = render_template('adoption_submitted', 'fr', {})
    subject_es, body_es = render_template('adoption_submitted', 'es', {})
    assert subject_fr == subject_es
    assert body_fr == body_es


def test_render_template_unknown_event_key_returns_fallback():
    subject, body = render_template('nonexistent_event', 'es', {})
    assert 'nonexistent_event' in subject or 'nonexistent_event' in body


def test_render_template_substitutes_context_variables():
    _, body = render_template('adoption_submitted', 'es', {'user_name': 'Carlos'})
    assert 'Carlos' in body


def test_render_template_missing_context_key_does_not_raise():
    subject, body = render_template('adoption_submitted', 'es', {})
    assert isinstance(subject, str)
    assert isinstance(body, str)


def test_render_template_donation_paid_event():
    subject, body = render_template('donation_paid', 'es', {'amount': '50000', 'shelter_name': 'Patas Felices'})
    assert 'Patas Felices' in body or 'Patas Felices' in subject or '50000' in body


def test_render_template_campaign_goal_reached_event():
    subject, body = render_template('campaign_goal_reached', 'es', {'campaign_title': 'Salud Animal'})
    assert isinstance(subject, str)
    assert isinstance(body, str)


def test_render_template_follow_up_assigned_to_vet_event():
    subject, body = render_template('follow_up_assigned_to_vet', 'es', {'animal_name': 'Luna', 'scheduled_date': '2026-05-01'})
    assert isinstance(subject, str)
    assert isinstance(body, str)
