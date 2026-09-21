from rest_framework import serializers
from vms_api.models import Person, BiometricTemplate, Visit, AuditLog, Zone, Department

class DepartmentSerializer(serializers.ModelSerializer):
    visitor_count = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = Department
        fields = '__all__'

    def get_visitor_count(self, obj):
        # Count all persons mapped to this department
        return Person.objects.filter(allowed_departments__contains=obj.code).count()

class PersonSerializer(serializers.ModelSerializer):
    class Meta:
        model = Person
        fields = '__all__'

class BiometricTemplateSerializer(serializers.ModelSerializer):
    class Meta:
        model = BiometricTemplate
        fields = '__all__'

class AuditLogSerializer(serializers.ModelSerializer):
    class Meta:
        model = AuditLog
        fields = '__all__'

class ZoneSerializer(serializers.ModelSerializer):
    class Meta:
        model = Zone
        fields = '__all__'

class VisitResponseSerializer(serializers.ModelSerializer):
    enrolled_fingers = serializers.SerializerMethodField()
    visitor_name = serializers.SerializerMethodField()
    visitor_company = serializers.SerializerMethodField()
    visitor_phone = serializers.SerializerMethodField()
    visitor_email = serializers.SerializerMethodField()
    visitor_category = serializers.SerializerMethodField()
    visitor_photo = serializers.SerializerMethodField()
    person_id = serializers.CharField(source='person.person_id', read_only=True)

    class Meta:
        model = Visit
        fields = [
            'id',
            'pass_number',
            'person_id',
            'visitor_name',
            'visitor_company',
            'visitor_phone',
            'visitor_email',
            'visitor_category',
            'visitor_photo',
            'host_id',
            'host_name',
            'host_department',
            'purpose',
            'scheduled_time',
            'expected_duration_mins',
            'check_in_time',
            'check_out_time',
            'status',
            'gate',
            'vehicle_number',
            'laptop_serial',
            'allowed_zones',
            'allowed_departments',
            'verified_biometrics',
            'enrolled_fingers',
            'notes',
        ]

    def get_visitor_name(self, obj):
        return obj.person.name if obj.person else "Visitor"

    def get_visitor_company(self, obj):
        return obj.person.organization if (obj.person and obj.person.organization) else "Individual Visitor"

    def get_visitor_phone(self, obj):
        return obj.person.phone if (obj.person and obj.person.phone) else ""

    def get_visitor_email(self, obj):
        return obj.person.email if (obj.person and obj.person.email) else None

    def get_visitor_category(self, obj):
        return obj.person.category if (obj.person and obj.person.category) else "Business Client"

    def get_enrolled_fingers(self, obj):
        if obj.person:
            tmpls = BiometricTemplate.objects.filter(person=obj.person, modality="FINGERPRINT", revoked_at__isnull=True)
            fingers = []
            for t in tmpls:
                code = t.template_version.replace('fingerprint-', '').replace('-v1.0', '').upper()
                if code and code not in fingers:
                    fingers.append(code)
            return fingers if fingers else (["LT"] if "FINGERPRINT" in obj.verified_biometrics else [])
        return []

    def get_visitor_photo(self, obj):
        if obj.person and obj.person.photo:
            return obj.person.photo
        return ""

class VisitCreateSerializer(serializers.Serializer):
    id = serializers.CharField(required=False, allow_blank=True, allow_null=True)
    pass_number = serializers.CharField(required=False, allow_blank=True, allow_null=True)
    person_id = serializers.CharField(required=False, allow_blank=True, allow_null=True)
    visitor_name = serializers.CharField(max_length=255)
    visitor_phone = serializers.CharField(max_length=32)
    visitor_email = serializers.CharField(max_length=255, required=False, allow_blank=True, allow_null=True)
    visitor_company = serializers.CharField(max_length=255, required=False, default="Individual Visitor")
    visitor_category = serializers.CharField(max_length=64, required=False, default="Business Client / Partner")
    visitor_photo = serializers.CharField(required=False, allow_blank=True, allow_null=True)
    host_id = serializers.CharField(max_length=64, default="HST-101")
    host_name = serializers.CharField(max_length=255, required=False, default="Dr. Arvind Menon")
    host_department = serializers.CharField(max_length=128, required=False, default="R&D & Engineering")
    purpose = serializers.CharField(max_length=255)
    scheduled_time = serializers.DateTimeField(required=False)
    expected_duration_mins = serializers.IntegerField(default=60)
    vehicle_number = serializers.CharField(max_length=64, default="N/A", required=False)
    laptop_serial = serializers.CharField(max_length=128, default="NONE", required=False)
    status = serializers.CharField(max_length=32, default="PENDING", required=False)
    gate = serializers.CharField(max_length=64, default="Main Gate 01", required=False)
    allowed_departments = serializers.ListField(child=serializers.CharField(), required=False, default=list)
    notes = serializers.CharField(required=False, allow_blank=True, allow_null=True)
    face_image_base64 = serializers.CharField(required=False, allow_blank=True, allow_null=True)
    enrolled_fingers = serializers.ListField(child=serializers.CharField(), required=False, default=list)
    verified_biometrics = serializers.ListField(child=serializers.CharField(), required=False, default=list)

class VisitApprovalSerializer(serializers.Serializer):
    allowed_zones = serializers.ListField(child=serializers.CharField(), default=["ZONE-01", "ZONE-02"])
    allowed_departments = serializers.ListField(child=serializers.CharField(), required=False, default=list)
    validity_mins = serializers.IntegerField(default=60, required=False)

class VisitRejectSerializer(serializers.Serializer):
    reason = serializers.CharField(default="Host unavailable")

class CheckInSerializer(serializers.Serializer):
    gate = serializers.CharField(default="Main Gate 01")
    verified_modes = serializers.ListField(child=serializers.CharField(), default=["FACE"])
    laptop_verified = serializers.BooleanField(default=True)

class LoginSerializer(serializers.Serializer):
    username = serializers.CharField(max_length=255)
    password = serializers.CharField(max_length=255)
    role = serializers.CharField(default="guard")
    gate = serializers.CharField(default="Main Gate 01")

class BiometricEnrollSerializer(serializers.Serializer):
    person_id = serializers.CharField(max_length=64)
    modality = serializers.CharField(max_length=32)
    raw_payload_base64 = serializers.CharField()
    device_id = serializers.CharField(max_length=64, default="TERMINAL-01")
    finger_code = serializers.CharField(max_length=16, required=False, default="")

class FaceVerifySerializer(serializers.Serializer):
    live_frame_base64 = serializers.CharField()
    visit_id = serializers.CharField(max_length=64, required=False, allow_null=True, allow_blank=True)
    person_id = serializers.CharField(max_length=64, required=False, allow_null=True, allow_blank=True)

class DoorScanSerializer(serializers.Serializer):
    visit_id = serializers.CharField(max_length=64)
    zone_id = serializers.CharField(max_length=32)
    door_id = serializers.CharField(max_length=64, default="TURNSTILE-01")

class MapUserDepartmentSerializer(serializers.Serializer):
    person_id = serializers.CharField(max_length=64)
    departments = serializers.ListField(child=serializers.CharField())
