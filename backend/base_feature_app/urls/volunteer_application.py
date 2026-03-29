from django.urls import path

from base_feature_app.views import volunteer_application

urlpatterns = [
    path('', volunteer_application.volunteer_application_create, name='volunteer-application-create'),
]
