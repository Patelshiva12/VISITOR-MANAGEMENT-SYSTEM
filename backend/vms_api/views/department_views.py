from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework import status
from vms_api.models import Department, Person, Visit, AuditLog
from vms_api.serializers import DepartmentSerializer, PersonSerializer, MapUserDepartmentSerializer
import uuid

@api_view(['GET'])
@permission_classes([AllowAny])
def list_departments(request):
    """
    List all master departments with mapped visitor counts.
    """
    departments = Department.objects.all().order_by('code')
    serializer = DepartmentSerializer(departments, many=True)
    return Response(serializer.data)

@api_view(['POST'])
@permission_classes([AllowAny])
def create_department(request):
    """
    Create a new Master Department.
    """
    data = request.data
    dept_id = data.get('id') or f"DEP-{uuid.uuid4().hex[:4].upper()}"
    code = (data.get('code') or '').strip().upper()
    name = (data.get('name') or '').strip()

    if not code or not name:
        return Response({"detail": "Department Code and Name are required."}, status=status.HTTP_400_BAD_REQUEST)

    if Department.objects.filter(code=code).exists():
        return Response({"detail": f"Department with code '{code}' already exists."}, status=status.HTTP_400_BAD_REQUEST)

    dept = Department.objects.create(
        id=dept_id,
        code=code,
        name=name,
        floor=data.get('floor', 'Floor 1'),
        head_of_dept=data.get('head_of_dept', ''),
        head_email=data.get('head_email', ''),
        head_phone=data.get('head_phone', ''),
        security_clearance_required=data.get('security_clearance_required', 'STANDARD'),
        allowed_zones=data.get('allowed_zones', ['ZONE-01', 'ZONE-02']),
        description=data.get('description', ''),
        color=data.get('color', 'sky'),
        is_active=data.get('is_active', True)
    )

    try:
        AuditLog.objects.create(
            id=f"LOG-{uuid.uuid4().hex[:4].upper()}",
            event_type="DEPARTMENT_CREATED",
            performed_by="System Administrator",
            description=f"Master Department created: {dept.name} ({dept.code}) on {dept.floor}"
        )
    except Exception:
        pass

    serializer = DepartmentSerializer(dept)
    return Response(serializer.data, status=status.HTTP_201_CREATED)

@api_view(['GET', 'PUT', 'DELETE'])
@permission_classes([AllowAny])
def department_detail(request, dept_id):
    """
    Retrieve, Update, or Delete a Master Department.
    """
    dept = Department.objects.filter(id=dept_id).first() or Department.objects.filter(code__iexact=dept_id).first()
    if not dept:
        return Response({"detail": f"Department '{dept_id}' not found."}, status=status.HTTP_404_NOT_FOUND)

    if request.method == 'GET':
        serializer = DepartmentSerializer(dept)
        return Response(serializer.data)

    elif request.method == 'PUT':
        serializer = DepartmentSerializer(dept, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    elif request.method == 'DELETE':
        dept_name = dept.name
        dept_code = dept.code
        dept.delete()
        try:
            AuditLog.objects.create(
                id=f"LOG-{uuid.uuid4().hex[:4].upper()}",
                event_type="DEPARTMENT_DELETED",
                performed_by="System Administrator",
                description=f"Department removed: {dept_name} ({dept_code})"
            )
        except Exception:
            pass
        return Response({"status": "DELETED", "message": f"Department '{dept_name}' deleted."}, status=status.HTTP_200_OK)

@api_view(['POST'])
@permission_classes([AllowAny])
def map_user_departments(request):
    """
    Map multiple authorized departments to a registered Person / Visitor.
    Payload: { "person_id": "VIS-334", "departments": ["RND", "IT_INFRA", "HR"] }
    """
    serializer = MapUserDepartmentSerializer(data=request.data)
    if not serializer.is_valid():
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    person_id = serializer.validated_data['person_id']
    dept_codes = serializer.validated_data['departments']

    person = (
        Person.objects.filter(person_id=person_id).first() or
        Person.objects.filter(service_no=person_id).first() or
        Person.objects.filter(phone=person_id).first()
    )

    if not person:
        return Response({"detail": f"Person '{person_id}' not found."}, status=status.HTTP_404_NOT_FOUND)

    # Clean & validate department codes
    clean_depts = [d.strip().upper() for d in dept_codes if d.strip()]
    person.allowed_departments = clean_depts
    person.compliance_status = "COMPLIANT"
    person.save()

    # Also update any active / pending visits for this person
    visits = Visit.objects.filter(person=person)
    for v in visits:
        v.allowed_departments = clean_depts
        v.save()

    try:
        AuditLog.objects.create(
            id=f"LOG-{uuid.uuid4().hex[:4].upper()}",
            event_type="DEPARTMENT_ACCESS_MAPPED",
            performed_by="Security Compliance Officer",
            description=f"Mapped {len(clean_depts)} authorized department(s) [{', '.join(clean_depts)}] for {person.name} ({person.person_id})"
        )
    except Exception:
        pass

    return Response({
        "status": "SUCCESS",
        "person_id": person.person_id,
        "name": person.name,
        "allowed_departments": clean_depts,
        "compliance_status": person.compliance_status,
        "message": f"Successfully mapped {len(clean_depts)} department(s) to {person.name}."
    }, status=status.HTTP_200_OK)

@api_view(['GET'])
@permission_classes([AllowAny])
def list_department_users(request, dept_code):
    """
    List all registered visitors / persons who are mapped with access to a specific department.
    """
    dept_code = dept_code.strip().upper()
    persons = Person.objects.filter(allowed_departments__contains=dept_code)
    serializer = PersonSerializer(persons, many=True)
    return Response({
        "department_code": dept_code,
        "total_authorized_users": persons.count(),
        "users": serializer.data
    })
