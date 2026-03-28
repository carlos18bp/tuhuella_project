from django.urls import path
from base_feature_app.views import profile

urlpatterns = [
    path('profile-stats/', profile.profile_stats, name='profile-stats'),
    path('activity/', profile.user_activity, name='user-activity'),
    path('profile/', profile.update_profile, name='update-profile'),
]
