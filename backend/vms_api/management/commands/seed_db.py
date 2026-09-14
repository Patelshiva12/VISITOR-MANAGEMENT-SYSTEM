from django.core.management.base import BaseCommand
from django.contrib.auth.models import User
from django.utils import timezone
from datetime import timedelta
import numpy as np
import uuid
from vms_api.models import Person, BiometricTemplate, Visit, AuditLog, Zone
from vms_api.services.template_protection import template_protection

class Command(BaseCommand):
    help = 'Seeds initial demonstration records (Persons, Visits, Biometrics, Zones)'

    def handle(self, *args, **options):
        self.stdout.write(self.style.NOTICE(">> Checking VMS database seed state..."))

        # 0. Seed Superuser Admin
        if not User.objects.filter(username="admin").exists():
            User.objects.create_superuser("admin", "admin@vms.com", "password123")
            self.stdout.write(self.style.SUCCESS(">> Superuser created: admin / password123"))
        else:
            u = User.objects.get(username="admin")
            u.set_password("password123")
            u.save()

        # 1. Seed Zones

        zones_data = [
            {"id": "ZONE-01", "code": "Z-01", "name": "Public Lobby & Visitor Lounge", "security_level": "STANDARD", "allowed_roles": ["visitor", "guard", "host", "admin"], "turnstiles": ["TURNSTILE-01", "TURNSTILE-02"]},
            {"id": "ZONE-02", "code": "Z-02", "name": "General Office & Meeting Rooms", "security_level": "RESTRICTED", "allowed_roles": ["host", "admin"], "turnstiles": ["TURNSTILE-03"]},
            {"id": "ZONE-03", "code": "Z-03", "name": "R&D Labs & Engineering Floor", "security_level": "HIGH", "allowed_roles": ["admin"], "turnstiles": ["TURNSTILE-04"]},
            {"id": "ZONE-04", "code": "Z-04", "name": "Server Vault & Defense Comm Center", "security_level": "CRITICAL", "allowed_roles": ["admin"], "turnstiles": ["TURNSTILE-05"]},
        ]
        for z in zones_data:
            Zone.objects.get_or_create(id=z["id"], defaults=z)

        # 2. Seed Demo Persons
        demo_persons = [
            {
                "person_id": "VIS-101",
                "service_no": "SRV-101",
                "name": "Rajesh Khanna",
                "organization": "Tata Consultancy Services",
                "phone": "+91 98112 34567",
                "email": "rajesh.khanna@tcs.com",
                "category": "Contractor / Vendor",
                "declared_laptop_serial": "TCS-LT-9021",
                "photo": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&auto=format&fit=crop&q=80",
                "status": "ACTIVE"
            },
            {
                "person_id": "VIS-102",
                "service_no": "SRV-102",
                "name": "Priya Sundaram",
                "organization": "Larsen & Toubro",
                "phone": "+91 98223 45678",
                "email": "priya.sundaram@lntecc.com",
                "category": "Official Government / Defense Auditor",
                "declared_laptop_serial": "LT-DELL-552",
                "photo": "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=300&auto=format&fit=crop&q=80",
                "status": "ACTIVE"
            },
            {
                "person_id": "VIS-103",
                "service_no": "SRV-103",
                "name": "Vikram Malhotra",
                "organization": "Siemens Energy",
                "phone": "+91 98334 56789",
                "email": "vikram.m@siemens.com",
                "category": "Contractor / Vendor",
                "declared_laptop_serial": "SM-THINK-882",
                "photo": "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300&auto=format&fit=crop&q=80",
                "status": "ACTIVE"
            },
            {
                "person_id": "VIS-104",
                "service_no": "SRV-104",
                "name": "Ananya Roy",
                "organization": "CyberSec Solutions India",
                "phone": "+91 98445 67890",
                "email": "ananya.roy@cybersec.in",
                "category": "Official Government / Defense Auditor",
                "declared_laptop_serial": "CS-MAC-1402",
                "photo": "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80",
                "status": "ACTIVE"
            },
            {
                "person_id": "VIS-334",
                "service_no": "SRV-334",
                "name": "Rahul Varma",
                "organization": "Hexaware Technologies",
                "phone": "+91 98765 12345",
                "email": "rahul.varma@hexaware.com",
                "category": "Business Client / Partner",
                "declared_laptop_serial": "HEX-LEN-991",
                "photo": "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=300&auto=format&fit=crop&q=80",
                "status": "ACTIVE"
            }
        ]

        for p_data in demo_persons:
            p, created = Person.objects.get_or_create(person_id=p_data["person_id"], defaults=p_data)
            # Create encrypted demo face template if not exists
            if not BiometricTemplate.objects.filter(person=p, modality="FACE").exists():
                sample_embedding = np.random.randn(512).astype(np.float32)
                sample_embedding = sample_embedding / np.linalg.norm(sample_embedding)
                enc_data = template_protection.enroll_and_protect_template("FACE", sample_embedding.tobytes())
                BiometricTemplate.objects.create(
                    id=f"TMP-{p.person_id}",
                    person=p,
                    modality="FACE",
                    template_data=enc_data,
                    template_version="arcface-r100-v1.0",
                    device_id="ENROLL-KIOSK-01"
                )

        # 3. Seed Demo Visits
        now = timezone.now()
        demo_visits = [
            {
                "id": "VST-2026-101",
                "pass_number": "GP-2026-101",
                "person_id": "VIS-101",
                "host_id": "HST-101",
                "host_name": "Dr. Arvind Menon",
                "host_department": "R&D & Engineering",
                "purpose": "Biometric Sensor Hardware Installation Review",
                "scheduled_time": now - timedelta(hours=2),
                "expected_duration_mins": 180,
                "check_in_time": now - timedelta(hours=1, minutes=45),
                "status": "CHECKED_IN",
                "gate": "Main Gate 01",
                "vehicle_number": "MH-02-CB-1122",
                "laptop_serial": "TCS-LT-9021",
                "allowed_zones": ["ZONE-01", "ZONE-02"],
                "verified_biometrics": ["FACE"],
                "notes": "Contractor pass issued"
            },
            {
                "id": "VST-2026-102",
                "pass_number": "GP-2026-102",
                "person_id": "VIS-102",
                "host_id": "HST-102",
                "host_name": "Col. R. K. Nair",
                "host_department": "Defense Security Division",
                "purpose": "Zone 4 High-Security Compliance Audit",
                "scheduled_time": now + timedelta(minutes=15),
                "expected_duration_mins": 120,
                "status": "APPROVED",
                "gate": "VIP Lobby",
                "vehicle_number": "DL-01-AX-9988",
                "laptop_serial": "LT-DELL-552",
                "allowed_zones": ["ZONE-01", "ZONE-02", "ZONE-04"],
                "verified_biometrics": [],
                "notes": "Approved by Col. Nair"
            },
            {
                "id": "VST-2026-103",
                "pass_number": "GP-2026-103",
                "person_id": "VIS-103",
                "host_id": "HST-103",
                "host_name": "Meera Iyer",
                "host_department": "IT & Cloud Infrastructure",
                "purpose": "Server Room Air Cooling System Check",
                "scheduled_time": now + timedelta(hours=1),
                "expected_duration_mins": 90,
                "status": "PENDING",
                "gate": "North Gate 02",
                "vehicle_number": "MH-12-DE-4433",
                "laptop_serial": "SM-THINK-882",
                "allowed_zones": ["ZONE-01"],
                "verified_biometrics": [],
                "notes": "Pre-registered online"
            },
            {
                "id": "VST-2026-104",
                "pass_number": "GP-2026-104",
                "person_id": "VIS-104",
                "host_id": "HST-101",
                "host_name": "Dr. Arvind Menon",
                "host_department": "R&D & Engineering",
                "purpose": "Quarterly Defense Security Audit Meeting",
                "scheduled_time": now + timedelta(hours=3),
                "expected_duration_mins": 60,
                "status": "PENDING",
                "gate": "Main Gate 01",
                "vehicle_number": "KA-03-MN-7766",
                "laptop_serial": "CS-MAC-1402",
                "allowed_zones": ["ZONE-01", "ZONE-02"],
                "verified_biometrics": [],
                "notes": "Pre-registered online"
            },
            {
                "id": "VST-2026-334",
                "pass_number": "GP-2026-334",
                "person_id": "VIS-334",
                "host_id": "HST-101",
                "host_name": "Dr. Arvind Menon",
                "host_department": "R&D & Engineering",
                "purpose": "Vendor Biometric Integration Review & Gate Clearance",
                "scheduled_time": now + timedelta(minutes=30),
                "expected_duration_mins": 60,
                "status": "PENDING",
                "gate": "Main Gate 01",
                "vehicle_number": "MH-01-AB-1234",
                "laptop_serial": "HEX-LEN-991",
                "allowed_zones": ["ZONE-01", "ZONE-02"],
                "verified_biometrics": [],
                "notes": "Pre-registered online"
            }
        ]

        for v_data in demo_visits:
            person_id = v_data.pop("person_id")
            person = Person.objects.get(person_id=person_id)
            v_id = v_data["id"]
            Visit.objects.get_or_create(id=v_id, defaults={**v_data, "person": person})

        self.stdout.write(self.style.SUCCESS(">> Successfully verified/seeded VMS database."))
