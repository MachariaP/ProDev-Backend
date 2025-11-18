from django.contrib import admin
from .models import AuditLog, ComplianceReport, SuspiciousActivityAlert


@admin.register(AuditLog)
class AuditLogAdmin(admin.ModelAdmin):
    list_display = ['id']
    search_fields = []


@admin.register(ComplianceReport)
class ComplianceReportAdmin(admin.ModelAdmin):
    list_display = ['id']
    search_fields = []


@admin.register(SuspiciousActivityAlert)
class SuspiciousActivityAlertAdmin(admin.ModelAdmin):
    list_display = ['id']
    search_fields = []

