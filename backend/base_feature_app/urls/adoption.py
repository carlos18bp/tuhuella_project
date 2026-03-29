from django.urls import path
from base_feature_app.views import adoption

urlpatterns = [
    path('', adoption.application_list, name='adoption-list'),
    path('<int:pk>/', adoption.application_detail, name='adoption-detail'),
    path('create/', adoption.application_create, name='adoption-create'),
    path('<int:pk>/status/', adoption.application_update_status, name='adoption-update-status'),
]
