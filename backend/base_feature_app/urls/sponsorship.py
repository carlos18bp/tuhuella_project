from django.urls import path
from base_feature_app.views import sponsorship

urlpatterns = [
    path('', sponsorship.sponsorship_list, name='sponsorship-list'),
    path('create/', sponsorship.sponsorship_create, name='sponsorship-create'),
    path('<int:pk>/', sponsorship.sponsorship_detail, name='sponsorship-detail'),
    path('<int:pk>/status/', sponsorship.sponsorship_update_status, name='sponsorship-update-status'),
]
