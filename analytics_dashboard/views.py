from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from .models import AnalyticsReport, FinancialHealthScore, PredictiveCashFlow
from .serializers import AnalyticsReportSerializer, FinancialHealthScoreSerializer, PredictiveCashFlowSerializer


class AnalyticsReportViewSet(viewsets.ModelViewSet):
    queryset = AnalyticsReport.objects.all()
    serializer_class = AnalyticsReportSerializer
    permission_classes = [IsAuthenticated]


class FinancialHealthScoreViewSet(viewsets.ModelViewSet):
    queryset = FinancialHealthScore.objects.all()
    serializer_class = FinancialHealthScoreSerializer
    permission_classes = [IsAuthenticated]


class PredictiveCashFlowViewSet(viewsets.ModelViewSet):
    queryset = PredictiveCashFlow.objects.all()
    serializer_class = PredictiveCashFlowSerializer
    permission_classes = [IsAuthenticated]

