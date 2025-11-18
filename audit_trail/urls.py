from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import AuditLogViewSet, ComplianceReportViewSet, SuspiciousActivityAlertViewSet

router = DefaultRouter()
router.register(r'audit-logs', AuditLogViewSet, basename='audit-log')
router.register(r'compliance-reports', ComplianceReportViewSet, basename='compliance-report')
router.register(r'suspicious-activity-alerts', SuspiciousActivityAlertViewSet, basename='suspicious-activity-alert')

urlpatterns = [
    path('', include(router.urls)),
]
