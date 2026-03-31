from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response

from base_feature_app.serializers.contact import ContactFormSerializer
from base_feature_app.services.email_service import EmailService
from base_feature_app.views.auth import verify_recaptcha


@api_view(['POST'])
@permission_classes([AllowAny])
def contact_form_submit(request):
    """Accept a public contact form submission and email the team inbox."""
    captcha_token = request.data.get('captcha_token', '')
    if not verify_recaptcha(captcha_token):
        return Response(
            {'error': 'reCAPTCHA verification failed.'},
            status=status.HTTP_400_BAD_REQUEST,
        )

    serializer = ContactFormSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)

    data = serializer.validated_data
    sent = EmailService.send_contact_form_email(
        name=data['name'],
        email=data['email'],
        subject=data['subject'],
        message=data['message'],
    )
    if not sent:
        return Response(
            {'message': 'Could not send your message. Please try again later.'},
            status=status.HTTP_503_SERVICE_UNAVAILABLE,
        )

    return Response(
        {'message': 'Your message was sent successfully.'},
        status=status.HTTP_201_CREATED,
    )
