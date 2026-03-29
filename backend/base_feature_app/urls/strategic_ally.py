from django.urls import path
from base_feature_app.views import strategic_ally

urlpatterns = [
    path('', strategic_ally.strategic_ally_list, name='strategic-ally-list'),
]
