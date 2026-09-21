from django.urls import path, re_path
from vms_api.views import (
    auth_views, person_views, visit_views,
    biometric_views, zone_views, audit_views,
    department_views
)

urlpatterns = [
    # SecuGen & VMS Direct Aliases
    re_path(r'^vms/biometrics/secugen-status/?$', biometric_views.secugen_device_status, name='vms-secugen-status'),
    re_path(r'^vms/biometrics/secugen-capture/?$', biometric_views.secugen_custom_capture, name='vms-secugen-capture'),
    re_path(r'^vms/biometrics/verify-fingerprint/?$', biometric_views.verify_fingerprint, name='vms-verify-fingerprint'),
    re_path(r'^vms/biometrics/enroll/?$', biometric_views.enroll_biometric, name='vms-enroll'),
    re_path(r'^vms/biometrics/mfs110-status/?$', biometric_views.mfs110_device_status, name='vms-mfs110-status'),
    re_path(r'^vms/biometrics/custom-capture/?$', biometric_views.mfs110_custom_capture, name='vms-custom-capture'),

    # 1. Authentication
    re_path(r'^auth/login/?$', auth_views.login_view, name='auth-login'),

    # 2. Persons Directory
    re_path(r'^persons/?$', person_views.list_persons, name='persons-list'),
    re_path(r'^persons/register/?$', person_views.register_person, name='persons-register'),
    re_path(r'^persons/(?P<person_id>[^/]+)/?$', person_views.person_detail, name='persons-detail'),

    # 3. Department Master & User Multi-Department Mapping
    re_path(r'^departments/?$', department_views.list_departments, name='departments-list'),
    re_path(r'^departments/create/?$', department_views.create_department, name='departments-create'),
    re_path(r'^departments/map-user/?$', department_views.map_user_departments, name='departments-map-user'),
    re_path(r'^departments/users/(?P<dept_code>[^/]+)/?$', department_views.list_department_users, name='departments-user-roster'),
    re_path(r'^departments/(?P<dept_id>[^/]+)/?$', department_views.department_detail, name='departments-detail'),

    # 4. Visits & Gate Passes
    re_path(r'^visits/?$', visit_views.list_visits, name='visits-list'),
    re_path(r'^visits/create/?$', visit_views.create_visit, name='visits-create'),
    re_path(r'^visits/(?P<visit_id>[^/]+)/approve/?$', visit_views.approve_visit, name='visits-approve'),
    re_path(r'^visits/(?P<visit_id>[^/]+)/reject/?$', visit_views.reject_visit, name='visits-reject'),
    re_path(r'^visits/(?P<visit_id>[^/]+)/check-in/?$', visit_views.check_in_visit, name='visits-check-in'),
    re_path(r'^visits/(?P<visit_id>[^/]+)/check-out/?$', visit_views.check_out_visit, name='visits-check-out'),
    re_path(r'^visits/(?P<visit_id>[^/]+)/?$', visit_views.get_visit_detail, name='visits-detail'),

    # 5. Biometric Pipeline (OpenCV + SCRFD + ArcFace + Mantra Fingerprint)
    re_path(r'^biometrics/enroll/?$', biometric_views.enroll_biometric, name='biometrics-enroll'),
    re_path(r'^biometrics/detect-face/?$', biometric_views.detect_face_view, name='biometrics-detect-face'),
    re_path(r'^biometrics/verify-face/?$', biometric_views.verify_face, name='biometrics-verify-face'),
    re_path(r'^biometrics/verify-fingerprint/?$', biometric_views.verify_fingerprint, name='biometrics-verify-fingerprint'),
    re_path(r'^biometrics/recognize-stream-faces/?$', biometric_views.recognize_stream_faces_view, name='biometrics-recognize-stream-faces'),
    re_path(r'^biometrics/mfs110-status/?$', biometric_views.mfs110_device_status, name='biometrics-mfs110-status'),
    re_path(r'^biometrics/custom-capture/?$', biometric_views.mfs110_custom_capture, name='biometrics-custom-capture'),
    re_path(r'^biometrics/toggle-led/?$', biometric_views.mfs110_toggle_led, name='biometrics-toggle-led'),
    re_path(r'^biometrics/secugen-status/?$', biometric_views.secugen_device_status, name='biometrics-secugen-status'),
    re_path(r'^biometrics/secugen-capture/?$', biometric_views.secugen_custom_capture, name='biometrics-secugen-capture'),

    # 6. Zone Turnstiles
    re_path(r'^zones/scan-door/?$', zone_views.scan_zone_door, name='zones-scan-door'),

    # 7. Audit Logs & Reports
    re_path(r'^audit/?$', audit_views.list_audit_logs, name='audit-list'),
    re_path(r'^audit/export-csv/?$', audit_views.export_audit_csv, name='audit-export-csv'),

    # 8. System Clear & Reset
    re_path(r'^system/clear-all-data/?$', person_views.clear_all_visitor_data, name='system-clear-all-data'),
]
