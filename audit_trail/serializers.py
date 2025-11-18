from rest_framework import serializers
from .models import AuditLog, ComplianceReport, SuspiciousActivityAlert


class AuditLogSerializer(serializers.ModelSerializer):
    class Meta:
        model = AuditLog
        fields = '__all__'
        read_only_fields = ['id']


class ComplianceReportSerializer(serializers.ModelSerializer):
    class Meta:
        model = ComplianceReport
        fields = '__all__'
        read_only_fields = ['id']


class SuspiciousActivityAlertSerializer(serializers.ModelSerializer):
    class Meta:
        model = SuspiciousActivityAlert
        fields = '__all__'
        read_only_fields = ['id']

