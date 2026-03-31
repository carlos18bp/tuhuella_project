from django.urls import path

from base_feature_app.views import contact

urlpatterns = [
    path('', contact.contact_form_submit, name='contact-form-submit'),
]
