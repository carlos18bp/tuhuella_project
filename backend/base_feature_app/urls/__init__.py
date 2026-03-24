from django.urls import include, path

urlpatterns = [
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
    path('favorites/', include('base_feature_app.urls.favorite')),
    path('blog/', include('base_feature_app.urls.blog')),
]
