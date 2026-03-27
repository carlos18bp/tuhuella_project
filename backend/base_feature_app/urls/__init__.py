from django.urls import include, path
from base_feature_app.views import auth as auth_views
from base_feature_app.views import amount_option as amount_views

urlpatterns = [
    path('google-captcha/site-key/', auth_views.get_captcha_site_key, name='captcha-site-key'),
    path('auth/', include('base_feature_app.urls.auth')),
    path('shelters/', include('base_feature_app.urls.shelter')),
    path('animals/', include('base_feature_app.urls.animal')),
    path('adoptions/', include('base_feature_app.urls.adoption')),
    path('campaigns/', include('base_feature_app.urls.campaign')),
    path('donations/', include('base_feature_app.urls.donation')),
    path('sponsorships/', include('base_feature_app.urls.sponsorship')),
    path('payments/', include('base_feature_app.urls.payment')),
    path('updates/', include('base_feature_app.urls.update_post')),
    path('adopter-intents/', include('base_feature_app.urls.adopter_intent')),
    path('shelter-invites/', include('base_feature_app.urls.shelter_invite')),
    path('admin/', include('base_feature_app.urls.admin_urls')),
    path('notifications/', include('base_feature_app.urls.notification')),
    path('favorites/', include('base_feature_app.urls.favorite')),
    path('blog/', include('base_feature_app.urls.blog')),
    path('faqs/', include('base_feature_app.urls.faq')),
    path('donation-amounts/', amount_views.donation_amount_list, name='donation-amount-list'),
    path('sponsorship-amounts/', amount_views.sponsorship_amount_list, name='sponsorship-amount-list'),
    path('volunteer-positions/', include('base_feature_app.urls.volunteer_position')),
    path('volunteer-applications/', include('base_feature_app.urls.volunteer_application')),
    path('strategic-allies/', include('base_feature_app.urls.strategic_ally')),
]
