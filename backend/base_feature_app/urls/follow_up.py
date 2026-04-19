from django.urls import path

from base_feature_app.views import follow_up as views

urlpatterns = [
    path('', views.follow_up_list, name='follow-up-list'),
    path('<int:pk>/', views.follow_up_detail, name='follow-up-detail'),
    path('<int:pk>/assign/', views.follow_up_assign, name='follow-up-assign'),
    path('<int:pk>/complete/', views.follow_up_complete, name='follow-up-complete'),
]
