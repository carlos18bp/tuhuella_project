from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from django.utils.translation import gettext_lazy as _
from django_attachments.admin import AttachmentsAdminMixin

from .models import (
    User, PasswordCode, Shelter, Animal, AdoptionApplication,
    Campaign, Donation, Sponsorship, Payment, UpdatePost,
    AdopterIntent, ShelterInvite, Subscription, Favorite,
    NotificationPreference, NotificationLog,
)


# ============================================================================
# USER MANAGEMENT
# ============================================================================

class MiHuellaUserAdmin(UserAdmin):
    ordering = ('email',)
    list_display = ('email', 'first_name', 'last_name', 'role', 'city', 'is_staff', 'is_active')
    list_filter = ('role', 'is_staff', 'is_active')
    search_fields = ('email', 'first_name', 'last_name')
    fieldsets = (
        (None, {'fields': ('email', 'password')}),
        (_('Personal info'), {'fields': ('first_name', 'last_name', 'phone', 'city')}),
        (_('Role'), {'fields': ('role',)}),
        (
            _('Permissions'),
            {'fields': ('is_active', 'is_staff', 'is_superuser', 'groups', 'user_permissions')},
        ),
        (_('Important dates'), {'fields': ('last_login', 'date_joined')}),
    )
    add_fieldsets = (
        (
            None,
            {
                'classes': ('wide',),
                'fields': ('email', 'password1', 'password2', 'role'),
            },
        ),
    )
    readonly_fields = ('date_joined',)
    filter_horizontal = ('groups', 'user_permissions')


class PasswordCodeAdmin(admin.ModelAdmin):
    list_display = ('user', 'code', 'created_at', 'used')
    search_fields = ('user__email', 'code')
    list_filter = ('used', 'created_at')
    readonly_fields = ('created_at',)

    def has_add_permission(self, request):
        return False


# ============================================================================
# SHELTER MANAGEMENT
# ============================================================================

class ShelterAdmin(AttachmentsAdminMixin, admin.ModelAdmin):
    list_display = ('name', 'city', 'verification_status', 'owner', 'created_at')
    search_fields = ('name', 'legal_name', 'city', 'owner__email')
    list_filter = ('verification_status', 'city')
    readonly_fields = ('created_at', 'updated_at', 'verified_at')

    def delete_queryset(self, request, queryset):
        for obj in queryset:
            obj.delete()


# ============================================================================
# ANIMAL MANAGEMENT
# ============================================================================

class AnimalAdmin(AttachmentsAdminMixin, admin.ModelAdmin):
    list_display = ('name', 'species', 'breed', 'age_range', 'size', 'status', 'shelter')
    search_fields = ('name', 'breed', 'shelter__name')
    list_filter = ('species', 'age_range', 'size', 'status', 'gender', 'is_vaccinated', 'is_sterilized')
    readonly_fields = ('created_at', 'updated_at')

    def delete_queryset(self, request, queryset):
        for obj in queryset:
            obj.delete()


class FavoriteAdmin(admin.ModelAdmin):
    list_display = ('user', 'animal', 'created_at')
    search_fields = ('user__email', 'animal__name')
    readonly_fields = ('created_at',)


# ============================================================================
# ADOPTION MANAGEMENT
# ============================================================================

class AdoptionApplicationAdmin(admin.ModelAdmin):
    list_display = ('user', 'animal', 'status', 'created_at', 'reviewed_at')
    search_fields = ('user__email', 'animal__name')
    list_filter = ('status',)
    readonly_fields = ('created_at', 'updated_at')


class AdopterIntentAdmin(admin.ModelAdmin):
    list_display = ('user', 'status', 'visibility', 'created_at')
    search_fields = ('user__email',)
    list_filter = ('status', 'visibility')
    readonly_fields = ('created_at', 'updated_at')


class ShelterInviteAdmin(admin.ModelAdmin):
    list_display = ('shelter', 'adopter_intent', 'status', 'created_at')
    search_fields = ('shelter__name', 'adopter_intent__user__email')
    list_filter = ('status',)
    readonly_fields = ('created_at', 'updated_at')


# ============================================================================
# CAMPAIGN & DONATIONS
# ============================================================================

class CampaignAdmin(AttachmentsAdminMixin, admin.ModelAdmin):
    list_display = ('title', 'shelter', 'status', 'goal_amount', 'raised_amount', 'progress_percentage')
    search_fields = ('title', 'shelter__name')
    list_filter = ('status',)
    readonly_fields = ('created_at', 'updated_at')

    def delete_queryset(self, request, queryset):
        for obj in queryset:
            obj.delete()


class DonationAdmin(admin.ModelAdmin):
    list_display = ('user', 'amount', 'status', 'shelter', 'campaign', 'paid_at')
    search_fields = ('user__email', 'shelter__name', 'campaign__title')
    list_filter = ('status',)
    readonly_fields = ('created_at', 'updated_at')


class SponsorshipAdmin(admin.ModelAdmin):
    list_display = ('user', 'animal', 'amount', 'frequency', 'status', 'started_at')
    search_fields = ('user__email', 'animal__name')
    list_filter = ('status', 'frequency')
    readonly_fields = ('created_at', 'updated_at')


class PaymentAdmin(admin.ModelAdmin):
    list_display = ('provider', 'provider_reference', 'amount', 'status', 'paid_at')
    search_fields = ('provider_reference',)
    list_filter = ('status', 'provider')
    readonly_fields = ('created_at', 'updated_at')


class SubscriptionAdmin(admin.ModelAdmin):
    list_display = ('sponsorship', 'provider', 'interval', 'status', 'next_payment_at')
    search_fields = ('provider_reference',)
    list_filter = ('status', 'interval')
    readonly_fields = ('created_at', 'updated_at')


# ============================================================================
# CONTENT & NOTIFICATIONS
# ============================================================================

class UpdatePostAdmin(AttachmentsAdminMixin, admin.ModelAdmin):
    list_display = ('title', 'shelter', 'campaign', 'animal', 'created_at')
    search_fields = ('title', 'shelter__name')
    readonly_fields = ('created_at', 'updated_at')

    def delete_queryset(self, request, queryset):
        for obj in queryset:
            obj.delete()


class NotificationPreferenceAdmin(admin.ModelAdmin):
    list_display = ('user', 'event_key', 'channel', 'enabled')
    search_fields = ('user__email', 'event_key')
    list_filter = ('channel', 'enabled')


class NotificationLogAdmin(admin.ModelAdmin):
    list_display = ('recipient', 'event_key', 'channel', 'status', 'sent_at')
    search_fields = ('recipient__email', 'event_key')
    list_filter = ('status', 'channel')
    readonly_fields = ('created_at',)


# ============================================================================
# CUSTOM ADMIN SITE - ORGANIZED BY SECTIONS
# ============================================================================

class MiHuellaAdminSite(admin.AdminSite):
    site_header = 'Mi Huella Administration'
    site_title = 'Mi Huella Admin'
    index_title = 'Welcome to Mi Huella Control Panel'

    def get_app_list(self, request):
        app_dict = self._build_app_dict(request)
        base_app_models = app_dict.get('base_feature_app', {}).get('models', [])

        custom_app_list = [
            {
                'name': _('👥 User Management'),
                'app_label': 'user_management',
                'models': [
                    m for m in base_app_models
                    if m['object_name'] in ['User', 'PasswordCode']
                ],
            },
            {
                'name': _('🏠 Shelter Management'),
                'app_label': 'shelter_management',
                'models': [
                    m for m in base_app_models
                    if m['object_name'] in ['Shelter']
                ],
            },
            {
                'name': _('� Animal Management'),
                'app_label': 'animal_management',
                'models': [
                    m for m in base_app_models
                    if m['object_name'] in ['Animal', 'Favorite']
                ],
            },
            {
                'name': _('� Adoption Management'),
                'app_label': 'adoption_management',
                'models': [
                    m for m in base_app_models
                    if m['object_name'] in ['AdoptionApplication', 'AdopterIntent', 'ShelterInvite']
                ],
            },
            {
                'name': _('💰 Campaigns & Donations'),
                'app_label': 'campaigns_donations',
                'models': [
                    m for m in base_app_models
                    if m['object_name'] in ['Campaign', 'Donation', 'Sponsorship', 'Payment', 'Subscription']
                ],
            },
            {
                'name': _('📢 Content & Notifications'),
                'app_label': 'content_notifications',
                'models': [
                    m for m in base_app_models
                    if m['object_name'] in ['UpdatePost', 'NotificationPreference', 'NotificationLog']
                ],
            },
        ]

        return [s for s in custom_app_list if s['models']]


# ============================================================================
# REGISTER MODELS
# ============================================================================

admin_site = MiHuellaAdminSite(name='myadmin')

admin_site.register(User, MiHuellaUserAdmin)
admin_site.register(PasswordCode, PasswordCodeAdmin)
admin_site.register(Shelter, ShelterAdmin)
admin_site.register(Animal, AnimalAdmin)
admin_site.register(Favorite, FavoriteAdmin)
admin_site.register(AdoptionApplication, AdoptionApplicationAdmin)
admin_site.register(AdopterIntent, AdopterIntentAdmin)
admin_site.register(ShelterInvite, ShelterInviteAdmin)
admin_site.register(Campaign, CampaignAdmin)
admin_site.register(Donation, DonationAdmin)
admin_site.register(Sponsorship, SponsorshipAdmin)
admin_site.register(Payment, PaymentAdmin)
admin_site.register(Subscription, SubscriptionAdmin)
admin_site.register(UpdatePost, UpdatePostAdmin)
admin_site.register(NotificationPreference, NotificationPreferenceAdmin)
admin_site.register(NotificationLog, NotificationLogAdmin)