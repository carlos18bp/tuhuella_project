from django.urls import path
from base_feature_app.views import animal
from base_feature_app.views import follow_up as follow_up_views

urlpatterns = [
    path('', animal.animal_list, name='animal-list'),
    path('<int:pk>/', animal.animal_detail, name='animal-detail'),
    path('create/', animal.animal_create, name='animal-create'),
    path('<int:pk>/update/', animal.animal_update, name='animal-update'),
    path('<int:pk>/similar/', animal.animal_similar, name='animal-similar'),
    path('<int:pk>/delete/', animal.animal_delete, name='animal-delete'),
    path(
        '<int:pk>/clinical-history/',
        follow_up_views.animal_clinical_history,
        name='animal-clinical-history',
    ),
    path(
        '<int:pk>/clinical-history/create/',
        follow_up_views.animal_clinical_history_create,
        name='animal-clinical-history-create',
    ),
]
