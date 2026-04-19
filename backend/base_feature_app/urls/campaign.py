from django.urls import path
from base_feature_app.views import campaign
from base_feature_app.views.campaign_messages import campaign_messages

urlpatterns = [
    path('', campaign.campaign_list, name='campaign-list'),
    path('mine/', campaign.my_shelter_campaigns, name='campaign-mine'),
    path('<int:pk>/', campaign.campaign_detail, name='campaign-detail'),
    path('create/', campaign.campaign_create, name='campaign-create'),
    path('<int:pk>/update/', campaign.campaign_update, name='campaign-update'),
    path('<int:pk>/submit/', campaign.campaign_submit, name='campaign-submit'),
    path('<int:pk>/messages/', campaign_messages, name='campaign-messages'),
]
