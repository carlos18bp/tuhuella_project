from django.urls import path
from base_feature_app.views import volunteer_position

urlpatterns = [
    path('', volunteer_position.volunteer_position_list, name='volunteer-position-list'),
]
