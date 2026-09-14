from django.contrib import admin
from .models import Person, BiometricTemplate, Visit, AuditLog, Zone

@admin.register(Person)
class PersonAdmin(admin.ModelAdmin):
    list_display = ('person_id', 'name', 'organization', 'phone', 'category', 'status', 'created_at')
    search_fields = ('person_id', 'name', 'organization', 'phone', 'email')
    list_filter = ('status', 'category')

@admin.register(Visit)
class VisitAdmin(admin.ModelAdmin):
    list_display = ('id', 'pass_number', 'person', 'host_name', 'host_department', 'status', 'scheduled_time', 'check_in_time')
    search_fields = ('id', 'pass_number', 'person__name', 'host_name')
    list_filter = ('status', 'host_department')

@admin.register(Zone)
class ZoneAdmin(admin.ModelAdmin):
    list_display = ('id', 'code', 'name', 'security_level')
    search_fields = ('id', 'code', 'name')
    list_filter = ('security_level',)

@admin.register(BiometricTemplate)
class BiometricTemplateAdmin(admin.ModelAdmin):
    list_display = ('id', 'person', 'modality', 'template_version', 'device_id', 'created_at')
    search_fields = ('id', 'person__name', 'person__person_id')
    list_filter = ('modality',)

@admin.register(AuditLog)
class AuditLogAdmin(admin.ModelAdmin):
    list_display = ('id', 'timestamp', 'event_type', 'performed_by', 'gate', 'severity')
    search_fields = ('event_type', 'performed_by', 'gate', 'description')
    list_filter = ('event_type', 'severity')
