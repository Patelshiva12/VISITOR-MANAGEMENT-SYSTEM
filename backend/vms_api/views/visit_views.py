from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework import status
from django.utils import timezone
from vms_api.models import Visit, Person, AuditLog
from vms_api.serializers import (
    VisitResponseSerializer, VisitCreateSerializer, 
    VisitApprovalSerializer, VisitRejectSerializer, CheckInSerializer
)
import uuid

def _get_visit_or_404(visit_id):
    visit = Visit.objects.filter(id=visit_id).first()
    if not visit:
        visit = Visit.objects.filter(pass_number=visit_id).first()
    return visit

@api_view(['GET'])
@permission_classes([AllowAny])
def list_visits(request):
    status_filter = request.query_params.get('status')
    host_filter = request.query_params.get('host_id')

    queryset = Visit.objects.select_related('person').all()
    if status_filter:
        queryset = queryset.filter(status=status_filter.upper())
    if host_filter and host_filter != 'ALL':
        queryset = queryset.filter(host_id=host_filter)

    serializer = VisitResponseSerializer(queryset, many=True)
    return Response(serializer.data)

@api_view(['GET'])
@permission_classes([AllowAny])
def get_visit_detail(request, visit_id):
    visit = _get_visit_or_404(visit_id)
    if not visit:
        return Response({"detail": f"Visit '{visit_id}' not found."}, status=status.HTTP_404_NOT_FOUND)
    
    serializer = VisitResponseSerializer(visit)
    return Response(serializer.data)

@api_view(['POST'])
@permission_classes([AllowAny])
def create_visit(request):
    serializer = VisitCreateSerializer(data=request.data)
    if not serializer.is_valid():
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    data = serializer.validated_data
    person_id = data.get('person_id')
    phone = data.get('visitor_phone', '')

    person = None
    if person_id:
        person = Person.objects.filter(person_id=person_id).first()
    if not person and phone:
        person = Person.objects.filter(phone=phone).first()

    photo_data = data.get('face_image_base64') or data.get('visitor_photo')

    if not person:
        person_id = person_id or f"VIS-{uuid.uuid4().hex[:6].upper()}"
        person = Person.objects.create(
            person_id=person_id,
            service_no=f"SRV-{uuid.uuid4().hex[:6].upper()}",
            name=data.get('visitor_name', 'Visitor'),
            organization=data.get('visitor_company', 'Individual Visitor'),
            phone=phone,
            email=data.get('visitor_email', ''),
            category=data.get('visitor_category', 'Business Client / Partner'),
            declared_laptop_serial=data.get('laptop_serial', 'NONE'),
            photo=photo_data,
            status="ACTIVE"
        )
    elif photo_data and not person.photo:
        person.photo = photo_data
        person.save()

    visit_id = data.get('id') or f"VST-2026-{uuid.uuid4().hex[:4].upper()}"
    pass_number = data.get('pass_number') or f"GP-2026-{uuid.uuid4().hex[:4].upper()}"

    # Ensure uniqueness
    if Visit.objects.filter(id=visit_id).exists():
        visit_id = f"VST-2026-{uuid.uuid4().hex[:4].upper()}"

    host_name = data.get('host_name') or "Dr. Arvind Menon"
    host_dept = data.get('host_department') or "R&D & Engineering"
    visit_status = data.get('status', 'PENDING').upper()
    gate = data.get('gate', 'Main Gate 01')

    visit = Visit.objects.create(
        id=visit_id,
        pass_number=pass_number,
        person=person,
        host_id=data.get('host_id', 'HST-101'),
        host_name=host_name,
        host_department=host_dept,
        purpose=data.get('purpose', 'Official Meeting'),
        scheduled_time=data.get('scheduled_time') or timezone.now(),
        expected_duration_mins=data.get('expected_duration_mins', 60),
        vehicle_number=data.get('vehicle_number', 'N/A'),
        laptop_serial=data.get('laptop_serial', 'NONE'),
        status=visit_status,
        gate=gate,
        allowed_zones=["ZONE-01", "ZONE-02"],
        notes=data.get('notes', 'Spot Walk-In Registration' if visit_status == 'APPROVED' else 'Pre-registered online')
    )

    try:
        AuditLog.objects.create(
            id=f"LOG-{uuid.uuid4().hex[:4].upper()}",
            event_type="WALK_IN_REGISTRATION" if visit_status == "APPROVED" else "VISITOR_REGISTER",
            performed_by=person.name,
            gate=gate,
            description=f"{'Walk-In Spot Entry' if visit_status == 'APPROVED' else 'Pre-registration'} submitted for {person.name} (Host: {host_name} | {host_dept})"
        )
    except Exception:
        pass

    response_serializer = VisitResponseSerializer(visit)
    return Response(response_serializer.data, status=status.HTTP_201_CREATED)

@api_view(['POST'])
@permission_classes([AllowAny])
def approve_visit(request, visit_id):
    visit = _get_visit_or_404(visit_id)
    if not visit:
        return Response({"detail": f"Visit '{visit_id}' not found."}, status=status.HTTP_404_NOT_FOUND)

    serializer = VisitApprovalSerializer(data=request.data)
    if not serializer.is_valid():
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    allowed_zones = serializer.validated_data.get('allowed_zones', ["ZONE-01", "ZONE-02"])
    visit.status = "APPROVED"
    visit.allowed_zones = allowed_zones
    visit.save()

    try:
        AuditLog.objects.create(
            id=f"LOG-{uuid.uuid4().hex[:4].upper()}",
            event_type="HOST_APPROVAL",
            performed_by=visit.host_name or "Host Approver",
            description=f"Visit {visit.id} approved for {visit.person.name}. Granted Zones: {', '.join(allowed_zones)}"
        )
    except Exception:
        pass

    response_serializer = VisitResponseSerializer(visit)
    return Response(response_serializer.data, status=status.HTTP_200_OK)

@api_view(['POST'])
@permission_classes([AllowAny])
def reject_visit(request, visit_id):
    visit = _get_visit_or_404(visit_id)
    if not visit:
        return Response({"detail": f"Visit '{visit_id}' not found."}, status=status.HTTP_404_NOT_FOUND)

    serializer = VisitRejectSerializer(data=request.data)
    if not serializer.is_valid():
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    reason = serializer.validated_data.get('reason', 'Host unavailable')
    visit.status = "REJECTED"
    visit.notes = f"Rejected by Host: {reason}"
    visit.save()

    try:
        AuditLog.objects.create(
            id=f"LOG-{uuid.uuid4().hex[:4].upper()}",
            event_type="HOST_REJECTION",
            performed_by=visit.host_name or "Host Approver",
            description=f"Visit {visit.id} rejected for {visit.person.name} | Reason: {reason}"
        )
    except Exception:
        pass

    response_serializer = VisitResponseSerializer(visit)
    return Response(response_serializer.data, status=status.HTTP_200_OK)

@api_view(['POST'])
@permission_classes([AllowAny])
def check_in_visit(request, visit_id):
    visit = _get_visit_or_404(visit_id)
    if not visit:
        return Response({"detail": f"Visit '{visit_id}' not found."}, status=status.HTTP_404_NOT_FOUND)

    serializer = CheckInSerializer(data=request.data)
    if not serializer.is_valid():
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    gate = serializer.validated_data.get('gate', 'Main Gate 01')
    verified_modes = serializer.validated_data.get('verified_modes', ['FACE'])

    visit.status = "CHECKED_IN"
    visit.check_in_time = timezone.now()
    visit.gate = gate
    visit.verified_biometrics = verified_modes
    visit.save()

    try:
        AuditLog.objects.create(
            id=f"LOG-{uuid.uuid4().hex[:4].upper()}",
            event_type="CHECK_IN",
            performed_by=f"Guard @ {gate}",
            gate=gate,
            description=f"Visitor {visit.person.name} checked in via {', '.join(verified_modes)} at {gate}"
        )
    except Exception:
        pass

    response_serializer = VisitResponseSerializer(visit)
    return Response(response_serializer.data, status=status.HTTP_200_OK)

@api_view(['POST'])
@permission_classes([AllowAny])
def check_out_visit(request, visit_id):
    visit = _get_visit_or_404(visit_id)
    if not visit:
        return Response({"detail": f"Visit '{visit_id}' not found."}, status=status.HTTP_404_NOT_FOUND)

    visit.status = "COMPLETED"
    visit.check_out_time = timezone.now()
    visit.save()

    try:
        AuditLog.objects.create(
            id=f"LOG-{uuid.uuid4().hex[:4].upper()}",
            event_type="CHECK_OUT",
            performed_by="Gate Officer",
            gate=visit.gate or "Main Gate 01",
            description=f"Visitor {visit.person.name} ({visit.pass_number}) completed visit and checked out"
        )
    except Exception:
        pass

    response_serializer = VisitResponseSerializer(visit)
    return Response(response_serializer.data, status=status.HTTP_200_OK)
