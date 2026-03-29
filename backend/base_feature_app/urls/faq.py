from django.urls import path
from base_feature_app.views import faq

urlpatterns = [
    path('', faq.list_all_faqs, name='faq-list-all'),
    path('<slug:topic_slug>/', faq.list_faqs_by_topic, name='faq-by-topic'),
]
