from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response

from base_feature_app.models import VolunteerPosition
from base_feature_app.serializers.volunteer_position import VolunteerPositionSerializer


@api_view(['GET'])
@permission_classes([AllowAny])
def volunteer_position_list(request):
    queryset = VolunteerPosition.objects.filter(is_active=True)
    serializer = VolunteerPositionSerializer(queryset, many=True, context={'request': request})
    return Response(serializer.data)
