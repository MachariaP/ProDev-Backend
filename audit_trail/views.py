from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from .models import AuditLog, ComplianceReport, SuspiciousActivityAlert
from .serializers import AuditLogSerializer, ComplianceReportSerializer, SuspiciousActivityAlertSerializer


class AuditLogViewSet(viewsets.ModelViewSet):
    queryset = AuditLog.objects.all()
    serializer_class = AuditLogSerializer
    permission_classes = [IsAuthenticated]


class ComplianceReportViewSet(viewsets.ModelViewSet):
    queryset = ComplianceReport.objects.all()
    serializer_class = ComplianceReportSerializer
    permission_classes = [IsAuthenticated]


class SuspiciousActivityAlertViewSet(viewsets.ModelViewSet):
    queryset = SuspiciousActivityAlert.objects.all()
    serializer_class = SuspiciousActivityAlertSerializer
    permission_classes = [IsAuthenticated]

