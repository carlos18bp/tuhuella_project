from django.urls import path
from base_feature_app.views import admin_views, web_manager_views, campaign_admin
from base_feature_app.views import follow_up as follow_up_views

urlpatterns = [
    path('dashboard/', admin_views.admin_dashboard, name='admin-dashboard'),
    path('shelters/approve/<int:pk>/', admin_views.approve_shelter, name='admin-approve-shelter'),
    path('shelters/pending/', admin_views.pending_shelters, name='admin-pending-shelters'),
    path('metrics/', admin_views.admin_metrics, name='admin-metrics'),
    path('shelter/metrics/', admin_views.shelter_metrics, name='shelter-metrics'),
    path('applications/', web_manager_views.admin_applications_list, name='admin-applications-list'),
    path('shelters/all/', web_manager_views.admin_shelters_list, name='admin-shelters-list'),
    path('shelters/<int:pk>/applications/', web_manager_views.shelter_applications_list, name='admin-shelter-applications'),
    path('campaigns/', campaign_admin.admin_campaigns_list, name='admin-campaigns-list'),
    path('campaigns/<int:pk>/approve/', campaign_admin.admin_campaign_approve, name='admin-campaign-approve'),
    path('campaigns/<int:pk>/reject/', campaign_admin.admin_campaign_reject, name='admin-campaign-reject'),
    path(
        'users/veterinarians/',
        follow_up_views.veterinarians_list,
        name='admin-veterinarians-list',
    ),
]
