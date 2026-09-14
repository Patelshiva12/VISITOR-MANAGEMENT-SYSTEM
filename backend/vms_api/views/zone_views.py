from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework import status
from vms_api.models import Visit, AuditLog
from vms_api.serializers import DoorScanSerializer
import uuid

@api_view(['POST'])
@permission_classes([AllowAny])
def scan_zone_door(request):
    serializer = DoorScanSerializer(data=request.data)
    if not serializer.is_valid():
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    data = serializer.validated_data
    visit_id = data['visit_id']
    zone_id = data['zone_id']
    door_id = data['door_id']

    visit = Visit.objects.filter(id=visit_id).first() or Visit.objects.filter(pass_number=visit_id).first()
    if not visit:
        return Response({"detail": f"Visit '{visit_id}' not found."}, status=status.HTTP_404_NOT_FOUND)

    allowed_zones = visit.allowed_zones or []
    is_allowed = zone_id in allowed_zones

    if is_allowed:
        try:
            AuditLog.objects.create(
                id=f"LOG-{uuid.uuid4().hex[:4].upper()}",
                event_type="ZONE_ACCESS_GRANTED",
                performed_by=visit.person.name if visit.person else visit_id,
                description=f"Turnstile {door_id} unlocked for {visit.id} into {zone_id}",
                severity="SUCCESS"
            )
        except Exception:
            pass
        return Response({
            "granted": True,
            "status": "GRANTED",
            "message": f"Access granted to {zone_id}. Turnstile {door_id} unlocked."
        })
    else:
        try:
            AuditLog.objects.create(
                id=f"LOG-{uuid.uuid4().hex[:4].upper()}",
                event_type="SECURITY_BREACH_UNAUTHORIZED_ZONE",
                performed_by=visit.person.name if visit.person else visit_id,
                description=f"SECURITY BREACH: Unauthorized entry attempt into {zone_id} by {visit.id}!",
                severity="CRITICAL"
            )
        except Exception:
            pass
        return Response({
            "granted": False,
            "status": "DENIED",
            "message": f"ACCESS DENIED! Unauthorized for {zone_id}. Security breach alarm triggered."
        })
