from django.db import models
from django.utils import timezone

class Department(models.Model):
    id = models.CharField(max_length=64, primary_key=True, db_index=True) # e.g. 'DEP-101'
    code = models.CharField(max_length=32, unique=True, db_index=True)   # e.g. 'RND', 'IT_INFRA', 'HR'
    name = models.CharField(max_length=255)                             # e.g. 'R&D Embedded Systems Lab'
    floor = models.CharField(max_length=128, default="Floor 1")
    head_of_dept = models.CharField(max_length=255, null=True, blank=True) # e.g. 'Dr. Arvind Menon'
    head_email = models.CharField(max_length=255, null=True, blank=True)
    head_phone = models.CharField(max_length=64, null=True, blank=True)
    security_clearance_required = models.CharField(max_length=64, default="STANDARD") # STANDARD | RESTRICTED | HIGH_SECURITY | TOP_SECRET
    allowed_zones = models.JSONField(default=list, blank=True)          # e.g. ['ZONE-01', 'ZONE-03']
    description = models.TextField(null=True, blank=True)
    color = models.CharField(max_length=32, default="sky")              # emerald, sky, purple, amber, rose, cyan
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(default=timezone.now)

    class Meta:
        db_table = "vms_department"
        ordering = ['code']

    def __str__(self):
        return f"{self.name} ({self.code})"

class Person(models.Model):
    person_id = models.CharField(max_length=64, primary_key=True, db_index=True) # e.g. 'VIS-334'
    service_no = models.CharField(max_length=64, unique=True, db_index=True)     # e.g. 'SRV-334'
    name = models.CharField(max_length=255)
    status = models.CharField(max_length=32, default="ACTIVE")                   # ACTIVE | REVOKED | BLACKLISTED
    compliance_status = models.CharField(max_length=64, default="COMPLIANT")     # COMPLIANT | PENDING_REVIEW | RESTRICTED
    
    organization = models.CharField(max_length=255, null=True, blank=True)
    phone = models.CharField(max_length=32, db_index=True, null=True, blank=True)
    email = models.CharField(max_length=255, null=True, blank=True)
    address = models.TextField(null=True, blank=True)
    category = models.CharField(max_length=64, default="Business Client / Partner")
    id_proof_type = models.CharField(max_length=64, null=True, blank=True)
    id_proof_number = models.CharField(max_length=128, null=True, blank=True)
    declared_laptop_serial = models.CharField(max_length=128, default="NONE")
    
    # Multi-Department Access Mapping
    allowed_departments = models.JSONField(default=list, blank=True) # e.g. ['RND', 'IT_INFRA', 'HR']

    photo = models.TextField(null=True, blank=True) # Stored Base64 or URL
    photo_gallery = models.JSONField(default=list, blank=True) # 10-shot burst photos stored in DB
    created_at = models.DateTimeField(default=timezone.now)

    class Meta:
        db_table = "vms_person"
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.name} ({self.person_id})"

class BiometricTemplate(models.Model):
    id = models.CharField(max_length=64, primary_key=True, db_index=True)
    person = models.ForeignKey(Person, on_delete=models.CASCADE, related_name="biometric_templates")
    modality = models.CharField(max_length=32) # 'FACE' | 'FINGERPRINT' | 'IRIS'
    template_data = models.TextField()         # AES-256-GCM Encrypted Base64 Template
    template_version = models.CharField(max_length=64, default="arcface-r100-v1.0")
    device_id = models.CharField(max_length=64, default="TERMINAL-01")
    created_at = models.DateTimeField(default=timezone.now)
    revoked_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        db_table = "vms_biometric_template"
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.modality} Template for {self.person_id} ({self.id})"

class Visit(models.Model):
    id = models.CharField(max_length=64, primary_key=True, db_index=True) # e.g. 'VST-2026-334'
    pass_number = models.CharField(max_length=64, unique=True, db_index=True) # e.g. 'GP-2026-334'
    person = models.ForeignKey(Person, on_delete=models.CASCADE, related_name="visits")
    
    host_id = models.CharField(max_length=64)
    host_name = models.CharField(max_length=255, default="Dr. Arvind Menon")
    host_department = models.CharField(max_length=128, default="R&D & Engineering")
    
    purpose = models.CharField(max_length=255)
    scheduled_time = models.DateTimeField(default=timezone.now)
    expected_duration_mins = models.IntegerField(default=60)
    check_in_time = models.DateTimeField(null=True, blank=True)
    check_out_time = models.DateTimeField(null=True, blank=True)
    
    status = models.CharField(max_length=32, default="PENDING") # PENDING | APPROVED | CHECKED_IN | COMPLETED | REJECTED
    gate = models.CharField(max_length=64, default="Main Gate 01")
    vehicle_number = models.CharField(max_length=64, default="N/A")
    laptop_serial = models.CharField(max_length=128, default="NONE")
    
    allowed_zones = models.JSONField(default=list)
    allowed_departments = models.JSONField(default=list, blank=True) # Departments visitor is authorized to access
    verified_biometrics = models.JSONField(default=list)
    notes = models.TextField(null=True, blank=True)
    created_at = models.DateTimeField(default=timezone.now)

    class Meta:
        db_table = "vms_visit"
        ordering = ['-created_at']

    def __str__(self):
        return f"Visit {self.id} - {self.person.name} ({self.status})"

class AuditLog(models.Model):
    id = models.CharField(max_length=64, primary_key=True, db_index=True)
    timestamp = models.DateTimeField(default=timezone.now)
    event_type = models.CharField(max_length=64, db_index=True)
    performed_by = models.CharField(max_length=255, default="System Operator")
    gate = models.CharField(max_length=64, default="Main Gate 01")
    description = models.TextField()
    severity = models.CharField(max_length=32, default="INFO") # INFO | SUCCESS | WARNING | CRITICAL

    class Meta:
        db_table = "vms_audit_log"
        ordering = ['-timestamp']

    def __str__(self):
        return f"[{self.severity}] {self.event_type} - {self.description[:40]}"

class Zone(models.Model):
    id = models.CharField(max_length=32, primary_key=True) # e.g. 'ZONE-01'
    code = models.CharField(max_length=32)
    name = models.CharField(max_length=128)
    security_level = models.CharField(max_length=32, default="STANDARD")
    allowed_roles = models.JSONField(default=list)
    turnstiles = models.JSONField(default=list)

    class Meta:
        db_table = "vms_zone"

    def __str__(self):
        return f"{self.name} ({self.id})"
