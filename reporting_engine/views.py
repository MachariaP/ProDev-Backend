from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from .models import GeneratedReport, ScheduledReport
from .serializers import GeneratedReportSerializer, ScheduledReportSerializer


class GeneratedReportViewSet(viewsets.ModelViewSet):
    queryset = GeneratedReport.objects.all()
    serializer_class = GeneratedReportSerializer
    permission_classes = [IsAuthenticated]


class ScheduledReportViewSet(viewsets.ModelViewSet):
    queryset = ScheduledReport.objects.all()
    serializer_class = ScheduledReportSerializer
    permission_classes = [IsAuthenticated]

