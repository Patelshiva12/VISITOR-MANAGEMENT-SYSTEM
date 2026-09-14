from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework import status
from vms_api.serializers import LoginSerializer
from vms_api.services.security import create_access_token
from vms_api.models import AuditLog
import uuid

@api_view(['POST'])
@permission_classes([AllowAny])
def login_view(request):
    serializer = LoginSerializer(data=request.data)
    if not serializer.is_valid():
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    data = serializer.validated_data
    username = data['username']
    role = data['role']
    gate = data['gate']

    # Issue signed JWT Bearer Token
    token = create_access_token(subject=username, role=role)

    # Log audit entry
    try:
        AuditLog.objects.create(
            id=f"LOG-{uuid.uuid4().hex[:4].upper()}",
            event_type="USER_LOGIN",
            performed_by=username,
            gate=gate if role == "guard" else "Main Gate 01",
            description=f"User {username} authenticated as {role.upper()}",
            severity="INFO"
        )
    except Exception:
        pass

    return Response({
        "access_token": token,
        "token_type": "bearer",
        "user": {
            "name": username if username else f"Officer {role.capitalize()}",
            "role": role,
            "gate": gate if role == "guard" else None
        }
    })
