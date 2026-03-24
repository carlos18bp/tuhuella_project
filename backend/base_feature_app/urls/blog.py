from django.urls import path

from base_feature_app.views.blog import (
    blog_calendar,
    create_blog_post,
    create_blog_post_from_json,
    delete_blog_post,
    duplicate_blog_post,
    get_blog_json_template,
    list_admin_blog_posts,
    list_blog_posts,
    retrieve_admin_blog_post,
    retrieve_blog_post,
    update_blog_post,
    upload_blog_cover_image,
)

urlpatterns = [
    # Admin CRUD (must come before slug catch-all)
    path('admin/', list_admin_blog_posts, name='list-admin-blog-posts'),
    path('admin/create/', create_blog_post, name='create-blog-post'),
    path('admin/create-from-json/', create_blog_post_from_json, name='create-blog-post-from-json'),
    path('admin/json-template/', get_blog_json_template, name='blog-json-template'),
    path('admin/<int:post_id>/detail/', retrieve_admin_blog_post, name='retrieve-admin-blog-post'),
    path('admin/<int:post_id>/update/', update_blog_post, name='update-blog-post'),
    path('admin/<int:post_id>/delete/', delete_blog_post, name='delete-blog-post'),
    path('admin/<int:post_id>/duplicate/', duplicate_blog_post, name='duplicate-blog-post'),
    path('admin/<int:post_id>/upload-cover/', upload_blog_cover_image, name='upload-blog-cover-image'),
    path('admin/calendar/', blog_calendar, name='blog-calendar'),

    # Public
    path('', list_blog_posts, name='list-blog-posts'),
    path('<slug:slug>/', retrieve_blog_post, name='retrieve-blog-post'),
]
