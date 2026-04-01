from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from base_feature_app.models import ShelterInvite
from base_feature_app.serializers.shelter_invite_list import ShelterInviteListSerializer
from base_feature_app.utils.shelter_access import shelters_managed_by_user
from base_feature_app.serializers.shelter_invite_create_update import ShelterInviteCreateUpdateSerializer


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def shelter_invite_list(request):
    user = request.user
    if user.role == 'shelter_admin':
        shelters = shelters_managed_by_user(user)
        queryset = ShelterInvite.objects.filter(shelter__in=shelters)
    else:
        queryset = ShelterInvite.objects.filter(adopter_intent__user=user)
    serializer = ShelterInviteListSerializer(queryset, many=True, context={'request': request})
    return Response(serializer.data)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def shelter_invite_create(request):
    serializer = ShelterInviteCreateUpdateSerializer(data=request.data, context={'request': request})
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['PATCH'])
@permission_classes([IsAuthenticated])
def shelter_invite_respond(request, pk):
    try:
        invite = ShelterInvite.objects.get(pk=pk, adopter_intent__user=request.user)
    except ShelterInvite.DoesNotExist:
        return Response({'error': 'Invite not found'}, status=status.HTTP_404_NOT_FOUND)

    new_status = request.data.get('status')
    if new_status not in ('accepted', 'rejected'):
        return Response({'error': 'Status must be accepted or rejected'}, status=status.HTTP_400_BAD_REQUEST)

    invite.status = new_status
    invite.save()
    serializer = ShelterInviteListSerializer(invite, context={'request': request})
    return Response(serializer.data)
