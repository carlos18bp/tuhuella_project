"""
Signal handlers that trigger notifications on model changes.

Connected in apps.py via ready().
"""

import logging

from django.db.models.signals import post_save, pre_save
from django.dispatch import receiver

from base_feature_app.models import (
    AdoptionApplication, Campaign, Donation, ShelterInvite,
    Sponsorship, UpdatePost,
)

logger = logging.getLogger(__name__)


def _dispatch(event_key, recipient, context):
    """Lazy import to avoid circular imports."""
    from base_feature_app.services.notification_service import dispatch_notification
    try:
        dispatch_notification(event_key, recipient, context)
    except Exception:
        logger.exception('Failed to dispatch %s to %s', event_key, recipient)


# --- Track previous status for status-change detection ---

@receiver(pre_save, sender=AdoptionApplication)
def adoption_track_prev_status(sender, instance, **kwargs):
    if instance.pk:
        try:
            instance._prev_status = AdoptionApplication.objects.values_list(
                'status', flat=True,
            ).get(pk=instance.pk)
        except AdoptionApplication.DoesNotExist:
            instance._prev_status = None
    else:
        instance._prev_status = None


@receiver(pre_save, sender=Donation)
def donation_track_prev_status(sender, instance, **kwargs):
    if instance.pk:
        try:
            instance._prev_status = Donation.objects.values_list(
                'status', flat=True,
            ).get(pk=instance.pk)
        except Donation.DoesNotExist:
            instance._prev_status = None
    else:
        instance._prev_status = None


@receiver(pre_save, sender=Sponsorship)
def sponsorship_track_prev_status(sender, instance, **kwargs):
    if instance.pk:
        try:
            instance._prev_status = Sponsorship.objects.values_list(
                'status', flat=True,
            ).get(pk=instance.pk)
        except Sponsorship.DoesNotExist:
            instance._prev_status = None
    else:
        instance._prev_status = None


@receiver(pre_save, sender=Campaign)
def campaign_track_prev_raised(sender, instance, **kwargs):
    if instance.pk:
        try:
            prev = Campaign.objects.values_list(
                'raised_amount', 'goal_amount',
            ).get(pk=instance.pk)
            instance._prev_raised = prev[0]
            instance._prev_goal = prev[1]
        except Campaign.DoesNotExist:
            instance._prev_raised = None
            instance._prev_goal = None
    else:
        instance._prev_raised = None
        instance._prev_goal = None


# --- Post-save handlers ---

@receiver(post_save, sender=AdoptionApplication)
def on_adoption_application_save(sender, instance, created, **kwargs):
    app = instance
    animal = app.animal
    shelter = animal.shelter if animal else None

    if created:
        # Notify shelter owner
        if shelter and shelter.owner:
            _dispatch('adoption_submitted', shelter.owner, {
                'user_name': shelter.owner.first_name or shelter.owner.email,
                'animal_name': animal.name if animal else '',
                'shelter_name': shelter.name,
                'link': f'/shelter/applications',
            })
    else:
        prev = getattr(app, '_prev_status', None)
        if prev and prev != app.status:
            event_map = {
                'interview': 'adoption_interview_scheduled',
                'approved': 'adoption_status_changed',
                'rejected': 'adoption_status_changed',
                'reviewing': 'adoption_status_changed',
            }
            event_key = event_map.get(app.status)
            if event_key and app.user:
                _dispatch(event_key, app.user, {
                    'user_name': app.user.first_name or app.user.email,
                    'animal_name': animal.name if animal else '',
                    'shelter_name': shelter.name if shelter else '',
                    'status': app.status,
                    'link': f'/my-applications',
                })


@receiver(post_save, sender=UpdatePost)
def on_update_post_created(sender, instance, created, **kwargs):
    if not created:
        return
    post = instance
    campaign = post.campaign
    if not campaign:
        return

    # Notify all donors to this campaign
    donors = set()
    for donation in campaign.donations.filter(status='paid').select_related('user'):
        if donation.user:
            donors.add(donation.user)

    for donor in donors:
        _dispatch('campaign_update_published', donor, {
            'user_name': donor.first_name or donor.email,
            'campaign_title': campaign.title_es,
            'shelter_name': post.shelter.name if post.shelter else '',
            'link': f'/campaigns/{campaign.pk}',
        })


@receiver(post_save, sender=Donation)
def on_donation_save(sender, instance, created, **kwargs):
    donation = instance
    prev = getattr(donation, '_prev_status', None)

    if donation.status == 'paid' and prev != 'paid' and donation.user:
        campaign_title = ''
        if donation.campaign:
            campaign_title = donation.campaign.title_es
        _dispatch('donation_paid', donation.user, {
            'user_name': donation.user.first_name or donation.user.email,
            'amount': str(donation.amount),
            'campaign_title': campaign_title,
            'shelter_name': donation.shelter.name if donation.shelter else '',
            'link': f'/my-donations',
        })
        # Also notify shelter owner
        if donation.shelter and donation.shelter.owner:
            _dispatch('donation_paid', donation.shelter.owner, {
                'user_name': donation.shelter.owner.first_name or donation.shelter.owner.email,
                'amount': str(donation.amount),
                'campaign_title': campaign_title,
                'shelter_name': donation.shelter.name,
                'link': f'/shelter/donations',
            })

    elif donation.status == 'failed' and prev != 'failed' and donation.user:
        _dispatch('donation_failed', donation.user, {
            'user_name': donation.user.first_name or donation.user.email,
            'amount': str(donation.amount),
            'link': f'/checkout/donation',
        })


@receiver(post_save, sender=Sponsorship)
def on_sponsorship_save(sender, instance, created, **kwargs):
    sp = instance
    prev = getattr(sp, '_prev_status', None)

    if sp.status == 'active' and prev != 'active' and sp.user:
        animal_name = sp.animal.name if sp.animal else ''
        _dispatch('sponsorship_paid', sp.user, {
            'user_name': sp.user.first_name or sp.user.email,
            'amount': str(sp.amount),
            'animal_name': animal_name,
            'link': f'/my-sponsorships',
        })

    elif sp.status == 'failed' and prev != 'failed' and sp.user:
        animal_name = sp.animal.name if sp.animal else ''
        _dispatch('sponsorship_failed', sp.user, {
            'user_name': sp.user.first_name or sp.user.email,
            'amount': str(sp.amount),
            'animal_name': animal_name,
            'link': f'/my-sponsorships',
        })


@receiver(post_save, sender=ShelterInvite)
def on_shelter_invite_save(sender, instance, created, **kwargs):
    invite = instance
    if created and invite.adopter_intent and invite.adopter_intent.user:
        user = invite.adopter_intent.user
        shelter_name = invite.shelter.name if invite.shelter else ''
        _dispatch('shelter_invite_sent', user, {
            'user_name': user.first_name or user.email,
            'shelter_name': shelter_name,
            'link': f'/my-intent',
        })


@receiver(post_save, sender=Campaign)
def on_campaign_goal_reached(sender, instance, created, **kwargs):
    if created:
        return
    campaign = instance
    prev_raised = getattr(campaign, '_prev_raised', None)
    if prev_raised is None:
        return

    # Check if goal was just reached
    if (
        campaign.goal_amount
        and campaign.raised_amount >= campaign.goal_amount
        and prev_raised < campaign.goal_amount
    ):
        # Notify shelter owner
        if campaign.shelter and campaign.shelter.owner:
            _dispatch('campaign_goal_reached', campaign.shelter.owner, {
                'user_name': campaign.shelter.owner.first_name or campaign.shelter.owner.email,
                'campaign_title': campaign.title_es,
                'shelter_name': campaign.shelter.name,
                'link': f'/campaigns/{campaign.pk}',
            })

        # Notify donors
        donors = set()
        for donation in campaign.donations.filter(status='paid').select_related('user'):
            if donation.user:
                donors.add(donation.user)
        for donor in donors:
            _dispatch('campaign_goal_reached', donor, {
                'user_name': donor.first_name or donor.email,
                'campaign_title': campaign.title_es,
                'shelter_name': campaign.shelter.name if campaign.shelter else '',
                'link': f'/campaigns/{campaign.pk}',
            })
