from django.urls import path
from base_feature_app.views import campaign

urlpatterns = [
    path('', campaign.campaign_list, name='campaign-list'),
    path('<int:pk>/', campaign.campaign_detail, name='campaign-detail'),
    path('create/', campaign.campaign_create, name='campaign-create'),
    path('<int:pk>/update/', campaign.campaign_update, name='campaign-update'),
]
