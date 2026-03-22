from django.urls import path
from base_feature_app.views import animal

urlpatterns = [
    path('', animal.animal_list, name='animal-list'),
    path('<int:pk>/', animal.animal_detail, name='animal-detail'),
    path('create/', animal.animal_create, name='animal-create'),
    path('<int:pk>/update/', animal.animal_update, name='animal-update'),
    path('<int:pk>/delete/', animal.animal_delete, name='animal-delete'),
]
