from django.urls import path
from base_feature_app.views import notification

urlpatterns = [
    path('preferences/', notification.notification_preferences_list, name='notification-preferences-list'),
    path('preferences/init/', notification.notification_preferences_init, name='notification-preferences-init'),
    path('preferences/update/', notification.notification_preferences_update, name='notification-preferences-update'),
    path('logs/', notification.notification_log_list, name='notification-log-list'),
    path('logs/<int:pk>/read/', notification.notification_log_mark_read, name='notification-log-mark-read'),
    path('logs/mark-all-read/', notification.notification_log_mark_all_read, name='notification-log-mark-all-read'),
    path('unread-count/', notification.notification_unread_count, name='notification-unread-count'),
]
