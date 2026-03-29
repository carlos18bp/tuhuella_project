from django.urls import path
from base_feature_app.views import donation

urlpatterns = [
    path('', donation.donation_list, name='donation-list'),
    path('create/', donation.donation_create, name='donation-create'),
    path('<int:pk>/', donation.donation_detail, name='donation-detail'),
]
