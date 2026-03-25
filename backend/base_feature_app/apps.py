from django.apps import AppConfig


class BaseFeatureAppConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'base_feature_app'

    def ready(self):
        import base_feature_app.signals  # noqa: F401
