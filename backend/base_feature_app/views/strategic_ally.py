from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response

from base_feature_app.models import StrategicAlly
from base_feature_app.serializers.strategic_ally import StrategicAllySerializer


@api_view(['GET'])
@permission_classes([AllowAny])
def strategic_ally_list(request):
    queryset = StrategicAlly.objects.filter(is_active=True)
    serializer = StrategicAllySerializer(queryset, many=True, context={'request': request})
    return Response(serializer.data)
