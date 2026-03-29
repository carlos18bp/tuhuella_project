from django.urls import path
from base_feature_app.views import favorite

urlpatterns = [
    path('', favorite.favorite_list, name='favorite-list'),
    path('toggle/', favorite.favorite_toggle, name='favorite-toggle'),
    path('<int:pk>/', favorite.favorite_update, name='favorite-update'),
]
