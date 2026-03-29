from django.urls import path
from base_feature_app.views import adopter_intent

urlpatterns = [
    path('', adopter_intent.adopter_intent_list, name='adopter-intent-list'),
    path('me/', adopter_intent.adopter_intent_me, name='adopter-intent-me'),
    path('create/', adopter_intent.adopter_intent_create, name='adopter-intent-create'),
]
