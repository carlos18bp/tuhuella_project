from django.urls import path
from base_feature_app.views import shelter_application as views

urlpatterns = [
    path('', views.shelter_application_create_or_list, name='shelter-application-list-create'),
    path('me/', views.my_shelter_application, name='shelter-application-mine'),
    path('<int:pk>/', views.shelter_application_detail, name='shelter-application-detail'),
    path('<int:pk>/approve/', views.shelter_application_approve, name='shelter-application-approve'),
    path('<int:pk>/reject/', views.shelter_application_reject, name='shelter-application-reject'),
]
