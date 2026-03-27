from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from base_feature_app.views.auth import verify_recaptcha
from base_feature_app.serializers.volunteer_application import VolunteerApplicationCreateSerializer
from base_feature_app.utils.email_utils import send_volunteer_application_notification


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def volunteer_application_create(request):
    """Create a new volunteer application."""
    captcha_token = request.data.get('captcha_token', '')
    if not verify_recaptcha(captcha_token):
        return Response(
            {'error': 'reCAPTCHA verification failed.'},
            status=status.HTTP_400_BAD_REQUEST,
        )

    serializer = VolunteerApplicationCreateSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)

    application = serializer.save(user=request.user)

    send_volunteer_application_notification(application)

    return Response(
        {'message': 'Application submitted successfully', 'id': application.id},
        status=status.HTTP_201_CREATED,
    )
