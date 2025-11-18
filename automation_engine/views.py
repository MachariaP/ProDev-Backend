from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from .models import AutomationRule, ExecutionLog, NotificationTemplate
from .serializers import AutomationRuleSerializer, ExecutionLogSerializer, NotificationTemplateSerializer


class AutomationRuleViewSet(viewsets.ModelViewSet):
    queryset = AutomationRule.objects.all()
    serializer_class = AutomationRuleSerializer
    permission_classes = [IsAuthenticated]


class ExecutionLogViewSet(viewsets.ModelViewSet):
    queryset = ExecutionLog.objects.all()
    serializer_class = ExecutionLogSerializer
    permission_classes = [IsAuthenticated]


class NotificationTemplateViewSet(viewsets.ModelViewSet):
    queryset = NotificationTemplate.objects.all()
    serializer_class = NotificationTemplateSerializer
    permission_classes = [IsAuthenticated]

