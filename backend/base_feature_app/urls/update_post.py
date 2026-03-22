from django.urls import path
from base_feature_app.views import update_post

urlpatterns = [
    path('', update_post.update_post_list, name='update-post-list'),
    path('<int:pk>/', update_post.update_post_detail, name='update-post-detail'),
    path('create/', update_post.update_post_create, name='update-post-create'),
]
