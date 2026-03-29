from django.urls import path
from base_feature_app.views import shelter_invite

urlpatterns = [
    path('', shelter_invite.shelter_invite_list, name='shelter-invite-list'),
    path('create/', shelter_invite.shelter_invite_create, name='shelter-invite-create'),
    path('<int:pk>/respond/', shelter_invite.shelter_invite_respond, name='shelter-invite-respond'),
]
