from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response

from base_feature_app.models import Payment
from base_feature_app.serializers.payment_detail import PaymentDetailSerializer


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_payment_intent(request):
    """
    Placeholder: Create a payment intent for Wompi.
    In production this would call Wompi's API to create a transaction.
    For now, returns a mock payment intent structure.
    """
    amount = request.data.get('amount')
    payment_type = request.data.get('type')  # 'donation' or 'sponsorship'
    reference_id = request.data.get('reference_id')

    if not amount or not payment_type or not reference_id:
        return Response(
            {'error': 'amount, type, and reference_id are required'},
            status=status.HTTP_400_BAD_REQUEST,
        )

    payment = Payment.objects.create(
        amount=amount,
        provider='wompi',
        provider_reference=f'PLACEHOLDER-{payment_type}-{reference_id}',
        status=Payment.Status.PENDING,
        metadata={'type': payment_type, 'reference_id': reference_id},
    )

    if payment_type == 'donation':
        payment.donation_id = reference_id
    elif payment_type == 'sponsorship':
        payment.sponsorship_id = reference_id
    payment.save()

    return Response({
        'payment_id': payment.pk,
        'provider': 'wompi',
        'status': payment.status,
        'amount': str(payment.amount),
        'redirect_url': None,  # Wompi would provide this
        'message': 'Payment intent created (placeholder — Wompi not integrated yet)',
    }, status=status.HTTP_201_CREATED)


@api_view(['POST'])
@permission_classes([AllowAny])
def payment_webhook(request):
    """
    Placeholder: Receive Wompi webhook for payment status updates.
    In production this would verify the signature and update payment status.
    """
    return Response({
        'received': True,
        'message': 'Webhook received (placeholder — Wompi not integrated yet)',
    })


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def payment_status(request, pk):
    try:
        payment = Payment.objects.get(pk=pk)
    except Payment.DoesNotExist:
        return Response({'error': 'Payment not found'}, status=status.HTTP_404_NOT_FOUND)
    serializer = PaymentDetailSerializer(payment, context={'request': request})
    return Response(serializer.data)
