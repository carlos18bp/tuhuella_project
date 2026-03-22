from django.urls import path
from base_feature_app.views import admin_views

urlpatterns = [
    path('dashboard/', admin_views.admin_dashboard, name='admin-dashboard'),
    path('shelters/approve/<int:pk>/', admin_views.approve_shelter, name='admin-approve-shelter'),
    path('shelters/pending/', admin_views.pending_shelters, name='admin-pending-shelters'),
    path('metrics/', admin_views.admin_metrics, name='admin-metrics'),
]
