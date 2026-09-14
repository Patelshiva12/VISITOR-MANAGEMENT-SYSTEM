from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework import status
from vms_api.models import Person, BiometricTemplate, Visit, AuditLog
from vms_api.serializers import PersonSerializer
import uuid

@api_view(['GET'])
@permission_classes([AllowAny])
def list_persons(request):
    persons = Person.objects.all()
    serializer = PersonSerializer(persons, many=True)
    return Response(serializer.data)

@api_view(['GET', 'PUT'])
@permission_classes([AllowAny])
def person_detail(request, person_id):
    try:
        person = Person.objects.get(person_id=person_id)
    except Person.DoesNotExist:
        return Response({"detail": f"Person '{person_id}' not found."}, status=status.HTTP_404_NOT_FOUND)

    if request.method == 'GET':
        serializer = PersonSerializer(person)
        return Response(serializer.data)

    elif request.method == 'PUT':
        serializer = PersonSerializer(person, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
@permission_classes([AllowAny])
def register_person(request):
    data = request.data
    phone = data.get('phone', '')
    service_no = data.get('service_no')

    # Check for existing person by phone or service_no
    existing_person = None
    if phone:
        existing_person = Person.objects.filter(phone=phone).first()
    if not existing_person and service_no:
        existing_person = Person.objects.filter(service_no=service_no).first()

    if existing_person:
        serializer = PersonSerializer(existing_person, data=data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    # Create new person
    person_id = data.get('person_id') or f"VIS-{uuid.uuid4().hex[:6].upper()}"
    service_no = service_no or f"SRV-{uuid.uuid4().hex[:6].upper()}"
    
    person = Person.objects.create(
        person_id=person_id,
        service_no=service_no,
        name=data.get('name', 'Visitor'),
        organization=data.get('organization', 'Individual Visitor'),
        phone=phone,
        email=data.get('email', ''),
        category=data.get('category', 'Business Client / Partner'),
        declared_laptop_serial=data.get('declared_laptop_serial', 'NONE'),
        status="ACTIVE"
    )

    try:
        AuditLog.objects.create(
            id=f"LOG-{uuid.uuid4().hex[:4].upper()}",
            event_type="PERSON_ENROLLED",
            performed_by=person.name,
            description=f"Person profile created for {person.name} ({person.organization})"
        )
    except Exception:
        pass

    serializer = PersonSerializer(person)
    return Response(serializer.data, status=status.HTTP_201_CREATED)

@api_view(['POST', 'DELETE'])
@permission_classes([AllowAny])
def clear_all_visitor_data(request):
    """
    Deletes all visitor records, visits, enrolled biometric templates, and audit logs.
    """
    BiometricTemplate.objects.all().delete()
    Visit.objects.all().delete()
    Person.objects.all().delete()
    AuditLog.objects.all().delete()
    return Response({
        "status": "SUCCESS",
        "message": "All visitor records, visits, biometric templates, and audit logs deleted successfully."
    }, status=status.HTTP_200_OK)
