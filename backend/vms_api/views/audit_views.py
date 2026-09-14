import csv
from django.http import HttpResponse
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from vms_api.models import AuditLog
from vms_api.serializers import AuditLogSerializer

@api_view(['GET'])
@permission_classes([AllowAny])
def list_audit_logs(request):
    logs = AuditLog.objects.all().order_by('-timestamp')[:200]
    serializer = AuditLogSerializer(logs, many=True)
    return Response(serializer.data)

@api_view(['GET'])
@permission_classes([AllowAny])
def export_audit_csv(request):
    response = HttpResponse(content_type='text/csv')
    response['Content-Disposition'] = 'attachment; filename="vms_security_audit_logs.csv"'

    writer = csv.writer(response)
    writer.writerow(['Log ID', 'Timestamp', 'Event Type', 'Performed By', 'Gate Terminal', 'Severity', 'Description'])

    logs = AuditLog.objects.all().order_by('-timestamp')
    for log in logs:
        writer.writerow([
            log.id,
            log.timestamp.isoformat() if log.timestamp else '',
            log.event_type,
            log.performed_by,
            log.gate,
            log.severity,
            log.description
        ])

    return response
