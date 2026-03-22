from django.urls import path
from base_feature_app.views import payment

urlpatterns = [
    path('create-intent/', payment.create_payment_intent, name='payment-create-intent'),
    path('webhook/', payment.payment_webhook, name='payment-webhook'),
    path('<int:pk>/status/', payment.payment_status, name='payment-status'),
]
