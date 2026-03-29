from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from django.utils.translation import gettext_lazy as _
from django_attachments.admin import AttachmentsAdminMixin

from .models import (
    User, PasswordCode, Shelter, Animal, AdoptionApplication,
    Campaign, Donation, Sponsorship, Payment, UpdatePost,
    AdopterIntent, ShelterInvite, Subscription, Favorite,
    NotificationPreference, NotificationLog, BlogPost,
    FAQTopic, FAQItem, DonationAmountOption, SponsorshipAmountOption,
    VolunteerPosition, VolunteerApplication, StrategicAlly,
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
        (_('Important dates'), {'fields': ('last_login', 'date_joined', 'terms_accepted_at', 'terms_version')}),
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
    readonly_fields = ('date_joined', 'terms_accepted_at')
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
    list_display = ('name', 'species', 'breed', 'age_range', 'size', 'status', 'energy_level', 'shelter')
    search_fields = ('name', 'breed', 'shelter__name', 'microchip_id')
    list_filter = (
        'species', 'age_range', 'size', 'status', 'gender',
        'is_vaccinated', 'is_sterilized', 'is_house_trained',
        'energy_level', 'good_with_kids', 'good_with_dogs', 'good_with_cats',
    )
    readonly_fields = ('created_at', 'updated_at')
    fieldsets = (
        (None, {
            'fields': ('shelter', 'name', 'species', 'breed', 'age_range', 'gender', 'size', 'status'),
        }),
        (_('Descriptions'), {
            'fields': ('description_es', 'description_en', 'special_needs_es', 'special_needs_en'),
        }),
        (_('Health & traits'), {
            'fields': (
                'is_vaccinated', 'is_sterilized', 'weight', 'is_house_trained',
                'energy_level', 'coat_color', 'microchip_id',
            ),
        }),
        (_('Compatibility'), {
            'fields': ('good_with_kids', 'good_with_dogs', 'good_with_cats'),
        }),
        (_('Dates'), {
            'fields': ('intake_date', 'created_at', 'updated_at'),
        }),
    )

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
    list_display = ('title_es', 'shelter', 'status', 'goal_amount', 'raised_amount', 'progress_percentage')
    search_fields = ('title_es', 'title_en', 'shelter__name')
    list_filter = ('status',)
    readonly_fields = ('created_at', 'updated_at')

    def delete_queryset(self, request, queryset):
        for obj in queryset:
            obj.delete()


class DonationAdmin(admin.ModelAdmin):
    list_display = ('user', 'amount', 'status', 'shelter', 'campaign', 'paid_at')
    search_fields = ('user__email', 'shelter__name', 'campaign__title_es')
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
    list_display = ('title_es', 'shelter', 'campaign', 'animal', 'created_at')
    search_fields = ('title_es', 'title_en', 'shelter__name')
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


class BlogPostAdmin(admin.ModelAdmin):
    list_display = ('title_es', 'slug', 'category', 'author', 'is_published', 'is_featured', 'published_at', 'created_at')
    list_filter = ('is_published', 'is_featured', 'category', 'author')
    search_fields = ('title_es', 'title_en', 'slug', 'excerpt_es', 'excerpt_en')
    prepopulated_fields = {'slug': ('title_es',)}
    readonly_fields = ('created_at', 'updated_at')
    fieldsets = (
        ('Español', {
            'fields': ('title_es', 'excerpt_es', 'content_es', 'content_json_es'),
        }),
        ('English', {
            'fields': ('title_en', 'excerpt_en', 'content_en', 'content_json_en'),
        }),
        (None, {
            'fields': ('slug', 'cover_image', 'cover_image_url', 'cover_image_credit', 'cover_image_credit_url',
                       'sources', 'category', 'read_time_minutes', 'is_featured', 'author'),
        }),
        ('SEO', {
            'fields': ('meta_title_es', 'meta_title_en', 'meta_description_es', 'meta_description_en',
                       'meta_keywords_es', 'meta_keywords_en'),
        }),
        ('Publication', {
            'fields': ('is_published', 'published_at'),
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
        }),
    )


# ============================================================================
# FAQ MANAGEMENT
# ============================================================================

class FAQItemInline(admin.TabularInline):
    model = FAQItem
    extra = 1
    fields = ('question_es', 'question_en', 'answer_es', 'answer_en', 'order', 'is_active')
    ordering = ('order',)


class FAQTopicAdmin(admin.ModelAdmin):
    list_display = ('display_name_es', 'slug', 'order', 'is_active', 'created_at')
    search_fields = ('display_name_es', 'display_name_en', 'slug')
    list_filter = ('is_active',)
    prepopulated_fields = {'slug': ('display_name_es',)}
    readonly_fields = ('created_at', 'updated_at')
    inlines = [FAQItemInline]


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
                    if m['object_name'] in ['Campaign', 'Donation', 'Sponsorship', 'Payment', 'Subscription', 'DonationAmountOption', 'SponsorshipAmountOption']
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
            {
                'name': _('📝 Blog'),
                'app_label': 'blog',
                'models': [
                    m for m in base_app_models
                    if m['object_name'] in ['BlogPost']
                ],
            },
            {
                'name': _('❓ FAQ'),
                'app_label': 'faq',
                'models': [
                    m for m in base_app_models
                    if m['object_name'] in ['FAQTopic', 'FAQItem']
                ],
            },
            {
                'name': _('🤝 Voluntariado y Aliados'),
                'app_label': 'volunteers',
                'models': [
                    m for m in base_app_models
                    if m['object_name'] in ['VolunteerPosition', 'VolunteerApplication', 'StrategicAlly']
                ],
            },
        ]

        return [s for s in custom_app_list if s['models']]


# ============================================================================
# VOLUNTEER & ALLY MANAGEMENT
# ============================================================================

class VolunteerPositionAdmin(admin.ModelAdmin):
    list_display = ('title_es', 'category', 'is_active', 'order')
    list_filter = ('category', 'is_active')
    search_fields = ('title_es', 'title_en')
    ordering = ('order',)
    fieldsets = (
        (_('Spanish'), {'fields': ('title_es', 'description_es', 'requirements_es')}),
        (_('English'), {'fields': ('title_en', 'description_en', 'requirements_en')}),
        (_('Settings'), {'fields': ('category', 'icon', 'is_active', 'order')}),
    )


class VolunteerApplicationAdmin(admin.ModelAdmin):
    list_display = ('first_name', 'last_name', 'email', 'position', 'city', 'country', 'status', 'created_at')
    list_filter = ('status', 'position', 'country')
    search_fields = ('first_name', 'last_name', 'email', 'city')
    readonly_fields = ('created_at', 'updated_at')
    fieldsets = (
        (_('Applicant'), {'fields': ('user', 'first_name', 'last_name', 'email', 'phone')}),
        (_('Location'), {'fields': ('city', 'country')}),
        (_('Application'), {'fields': ('position', 'motivation', 'status')}),
        (_('Timestamps'), {'fields': ('created_at', 'updated_at')}),
    )


class StrategicAllyAdmin(AttachmentsAdminMixin, admin.ModelAdmin):
    list_display = ('name', 'ally_type', 'is_active', 'order')
    list_filter = ('ally_type', 'is_active')
    search_fields = ('name',)
    ordering = ('order',)
    fieldsets = (
        (None, {'fields': ('name', 'ally_type', 'website', 'logo')}),
        (_('Spanish'), {'fields': ('description_es',)}),
        (_('English'), {'fields': ('description_en',)}),
        (_('Settings'), {'fields': ('is_active', 'order')}),
    )

    def delete_model(self, request, obj):
        obj.delete()

    def delete_queryset(self, request, queryset):
        for obj in queryset:
            obj.delete()


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
admin_site.register(BlogPost, BlogPostAdmin)
admin_site.register(FAQTopic, FAQTopicAdmin)
admin_site.register(DonationAmountOption)
admin_site.register(SponsorshipAmountOption)
admin_site.register(VolunteerPosition, VolunteerPositionAdmin)
admin_site.register(VolunteerApplication, VolunteerApplicationAdmin)
admin_site.register(StrategicAlly, StrategicAllyAdmin)