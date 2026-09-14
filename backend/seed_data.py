import os
import django
import uuid
from datetime import datetime, timedelta

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'vms_project.settings')
django.setup()

from django.utils import timezone
from vms_api.models import Person, Visit, BiometricTemplate, AuditLog, Department

def seed():
    print("[*] Restoring baseline demonstration data...")

    # Ensure Master Departments exist
    departments_data = [
        {"id": "DEP-101", "code": "RND", "name": "R&D Embedded Systems Lab", "floor": "Floor 3 (Room 301)", "head_of_dept": "Dr. Arvind Menon", "head_email": "arvind.m@ilizien.com", "head_phone": "+91 98765 00101", "security_clearance_required": "RESTRICTED", "allowed_zones": ["ZONE-01", "ZONE-03"], "color": "purple"},
        {"id": "DEP-102", "code": "IT_INFRA", "name": "IT Infrastructure & Data Center", "floor": "Ground Floor (Server Vault)", "head_of_dept": "Neha Kapoor", "head_email": "neha.k@ilizien.com", "head_phone": "+91 98765 00102", "security_clearance_required": "HIGH_SECURITY", "allowed_zones": ["ZONE-01", "ZONE-04"], "color": "rose"},
        {"id": "DEP-103", "code": "SEC_OPS", "name": "Security Command & Facilities", "floor": "Main Gate Control (Room G01)", "head_of_dept": "Rajeshwar Rao", "head_email": "rajeshwar.r@ilizien.com", "head_phone": "+91 98765 00103", "security_clearance_required": "RESTRICTED", "allowed_zones": ["ZONE-01", "ZONE-02"], "color": "amber"},
        {"id": "DEP-104", "code": "HR_TALENT", "name": "Human Resources & Talent Wing", "floor": "Admin Block, 2nd Floor (Room 204)", "head_of_dept": "Pooja Sharma", "head_email": "pooja.s@ilizien.com", "head_phone": "+91 98765 00104", "security_clearance_required": "STANDARD", "allowed_zones": ["ZONE-01", "ZONE-02"], "color": "emerald"},
        {"id": "DEP-105", "code": "LOGISTICS", "name": "Procurement, Supply & Warehouse", "floor": "Logistics Bay 2B, Warehouse", "head_of_dept": "Vikramjit Singh", "head_email": "vikram.s@ilizien.com", "head_phone": "+91 98765 00105", "security_clearance_required": "STANDARD", "allowed_zones": ["ZONE-01", "ZONE-02"], "color": "sky"},
        {"id": "DEP-106", "code": "LEGAL_EXEC", "name": "Executive Boardroom & Legal Suites", "floor": "Executive Tower, 6th Floor", "head_of_dept": "Ananya Deshmukh", "head_email": "ananya.d@ilizien.com", "head_phone": "+91 98765 00106", "security_clearance_required": "RESTRICTED", "allowed_zones": ["ZONE-01", "ZONE-02"], "color": "cyan"},
    ]
    for d in departments_data:
        Department.objects.update_or_create(code=d["code"], defaults=d)

    # 6 Baseline Registered Visitors
    persons_data = [
        {
            "person_id": "VIS-901",
            "service_no": "SRV-901",
            "name": "Rajesh Sharma",
            "organization": "Tata Consultancy Services",
            "phone": "+91 98765 43210",
            "email": "rajesh.sharma@tcs.com",
            "address": "DLF Phase 2, Sector 25, Gurgaon, Haryana 122002",
            "id_proof_type": "Aadhaar Card",
            "id_proof_number": "XXXX-XXXX-4819",
            "declared_laptop_serial": "DELL-LAT-7420-SN9912",
            "photo": "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80",
            "allowed_departments": ["RND", "IT_INFRA"],
            "status": "ACTIVE",
            "compliance_status": "COMPLIANT"
        },
        {
            "person_id": "VIS-902",
            "service_no": "SRV-902",
            "name": "Priya Patel",
            "organization": "Infosys Cyber Defense",
            "phone": "+91 98111 22334",
            "email": "priya.p@infosys.com",
            "address": "Indiranagar 100ft Road, Bangalore, Karnataka 560038",
            "id_proof_type": "Passport",
            "id_proof_number": "Z8924102",
            "declared_laptop_serial": "MBP-M3-MAX-CYBER01",
            "photo": "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=300&auto=format&fit=crop&q=80",
            "allowed_departments": ["IT_INFRA", "SEC_OPS"],
            "status": "ACTIVE",
            "compliance_status": "COMPLIANT"
        },
        {
            "person_id": "VIS-903",
            "service_no": "SRV-903",
            "name": "Amitabh Verma",
            "organization": "Siemens Industrial Automation",
            "phone": "+91 99887 76655",
            "email": "a.verma@siemens.de",
            "address": "Civil Lines, New Delhi 110054",
            "id_proof_type": "Driving License",
            "id_proof_number": "DL-0420190038",
            "declared_laptop_serial": "LENOVO-T14-GEN4",
            "photo": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&auto=format&fit=crop&q=80",
            "allowed_departments": ["RND", "LOGISTICS"],
            "status": "ACTIVE",
            "compliance_status": "COMPLIANT"
        },
        {
            "person_id": "VIS-904",
            "service_no": "SRV-904",
            "name": "Sunita Rao",
            "organization": "Larsen & Toubro Ltd",
            "phone": "+91 94567 81234",
            "email": "sunita.rao@lnt.com",
            "address": "Powai Business District, Mumbai 400076",
            "id_proof_type": "Aadhaar Card",
            "id_proof_number": "XXXX-XXXX-9102",
            "declared_laptop_serial": "HP-ELITEBOOK-840",
            "photo": "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=300&auto=format&fit=crop&q=80",
            "allowed_departments": ["HR_TALENT", "LEGAL_EXEC"],
            "status": "ACTIVE",
            "compliance_status": "COMPLIANT"
        },
        {
            "person_id": "VIS-905",
            "service_no": "SRV-905",
            "name": "Devendra Mehta",
            "organization": "Apex Logistics Ltd",
            "phone": "+91 91234 56780",
            "email": "d.mehta@roguecorp.in",
            "address": "Sector 18, Noida, Uttar Pradesh 201301",
            "id_proof_type": "Voter ID",
            "id_proof_number": "EPIC-882910",
            "declared_laptop_serial": "NONE",
            "photo": "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300&auto=format&fit=crop&q=80",
            "allowed_departments": [],
            "status": "BLACKLISTED",
            "compliance_status": "RESTRICTED"
        },
        {
            "person_id": "VIS-906",
            "service_no": "SRV-906",
            "name": "Kavita Krishnamurthy",
            "organization": "Ernst & Young LLP",
            "phone": "+91 98450 11223",
            "email": "kavita.k@ey.com",
            "address": "Bandra Kurla Complex, Mumbai 400051",
            "id_proof_type": "PAN Card",
            "id_proof_number": "ABCDE1234F",
            "declared_laptop_serial": "THINKPAD-X1-CARBON",
            "photo": "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=300&auto=format&fit=crop&q=80",
            "allowed_departments": ["LEGAL_EXEC", "HR_TALENT"],
            "status": "ACTIVE",
            "compliance_status": "COMPLIANT"
        }
    ]

    now = timezone.now()

    for p in persons_data:
        person, _ = Person.objects.update_or_create(person_id=p["person_id"], defaults=p)

    # Visits
    visits_data = [
        {
            "id": "VST-2026-001",
            "pass_number": "GP-2026-891",
            "person_id": "VIS-901",
            "host_id": "HST-101",
            "host_name": "Dr. Arvind Menon",
            "host_department": "R&D & Engineering",
            "purpose": "Quarterly AI Chip Integration Review & Hardware Verification",
            "scheduled_time": now - timedelta(minutes=90),
            "check_in_time": now - timedelta(minutes=75),
            "status": "CHECKED_IN",
            "gate": "Main Gate 01",
            "vehicle_number": "HR-26-DQ-1092",
            "laptop_serial": "DELL-LAT-7420-SN9912",
            "allowed_zones": ["ZONE-01", "ZONE-02", "ZONE-03"],
            "allowed_departments": ["RND", "IT_INFRA"],
            "verified_biometrics": ["FACE", "FINGERPRINT"]
        },
        {
            "id": "VST-2026-002",
            "pass_number": "GP-2026-892",
            "person_id": "VIS-902",
            "host_id": "HST-102",
            "host_name": "Neha Kapoor",
            "host_department": "IT Infrastructure & Cloud",
            "purpose": "ISO 27001 Physical Data Center Security Audit",
            "scheduled_time": now - timedelta(minutes=200),
            "check_in_time": now - timedelta(minutes=180),
            "status": "CHECKED_IN",
            "gate": "North Gate 02",
            "vehicle_number": "DL-3C-AZ-4411",
            "laptop_serial": "MBP-M3-MAX-CYBER01",
            "allowed_zones": ["ZONE-01", "ZONE-02", "ZONE-04"],
            "allowed_departments": ["IT_INFRA", "SEC_OPS"],
            "verified_biometrics": ["FACE", "IRIS"]
        },
        {
            "id": "VST-2026-003",
            "pass_number": "GP-2026-893",
            "person_id": "VIS-903",
            "host_id": "HST-103",
            "host_name": "Rajeshwar Rao",
            "host_department": "Security & Facilities",
            "purpose": "Biometric Access Turnstile Sensor Calibration & Firmware Update",
            "scheduled_time": now + timedelta(minutes=30),
            "status": "APPROVED",
            "gate": "Main Gate 01",
            "vehicle_number": "HR-51-BK-8800",
            "laptop_serial": "LENOVO-T14-GEN4",
            "allowed_zones": ["ZONE-01", "ZONE-02"],
            "allowed_departments": ["RND", "LOGISTICS"],
            "verified_biometrics": []
        }
    ]

    for v in visits_data:
        Visit.objects.update_or_create(id=v["id"], defaults=v)

    # Audit Logs
    audit_data = [
        {"id": "LOG-8801", "event_type": "BIOMETRIC_VERIFY_SUCCESS", "performed_by": "Security Guard (Officer Sandeep)", "gate": "North Gate 02", "description": "Facial recognition match 98.8% & Anti-spoof 3D Liveness confirmed for Priya Patel", "severity": "SUCCESS"},
        {"id": "LOG-8802", "event_type": "CHECK_IN", "performed_by": "Security Guard (Officer Sandeep)", "gate": "North Gate 02", "description": "Visitor Priya Patel checked in for Host Neha Kapoor. Gate pass GP-2026-892 generated.", "severity": "INFO"},
        {"id": "LOG-8803", "event_type": "BIOMETRIC_VERIFY_SUCCESS", "performed_by": "Security Guard (Officer Sandeep)", "gate": "Main Gate 01", "description": "Multi-modal Face + Fingerprint verified for Rajesh Sharma (SCRFD Latency: 12ms)", "severity": "SUCCESS"},
        {"id": "LOG-8804", "event_type": "SYSTEM_RESTORE", "performed_by": "System Admin", "gate": "Central Command", "description": "System demonstration dataset restored to verified baseline.", "severity": "INFO"}
    ]

    for a in audit_data:
        AuditLog.objects.update_or_create(id=a["id"], defaults=a)

    print(f"[SUCCESS] Restoration complete!")
    print(f"   - Persons: {Person.objects.count()}")
    print(f"   - Visits: {Visit.objects.count()}")
    print(f"   - Departments: {Department.objects.count()}")
    print(f"   - Audit Logs: {AuditLog.objects.count()}")

if __name__ == '__main__':
    seed()
