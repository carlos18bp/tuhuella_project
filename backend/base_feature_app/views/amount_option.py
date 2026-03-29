from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response

from base_feature_app.models import DonationAmountOption, SponsorshipAmountOption
from base_feature_app.serializers.amount_option import (
    DonationAmountOptionSerializer,
    SponsorshipAmountOptionSerializer,
)


@api_view(['GET'])
@permission_classes([AllowAny])
def donation_amount_list(request):
    options = DonationAmountOption.objects.filter(is_active=True)
    serializer = DonationAmountOptionSerializer(options, many=True)
    return Response(serializer.data)


@api_view(['GET'])
@permission_classes([AllowAny])
def sponsorship_amount_list(request):
    options = SponsorshipAmountOption.objects.filter(is_active=True)
    serializer = SponsorshipAmountOptionSerializer(options, many=True)
    return Response(serializer.data)
