from django.urls import path
from base_feature_app.views import shelter

urlpatterns = [
    path('', shelter.shelter_list, name='shelter-list'),
    path('<int:pk>/', shelter.shelter_detail, name='shelter-detail'),
    path('create/', shelter.shelter_create, name='shelter-create'),
    path('<int:pk>/update/', shelter.shelter_update, name='shelter-update'),
]
