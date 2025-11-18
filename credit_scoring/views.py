from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from .models import CreditScore, LoanEligibility, PaymentHistoryAnalysis, DefaultPrediction
from .serializers import (
    CreditScoreSerializer, LoanEligibilitySerializer,
    PaymentHistoryAnalysisSerializer, DefaultPredictionSerializer
)


class CreditScoreViewSet(viewsets.ModelViewSet):
    queryset = CreditScore.objects.all()
    serializer_class = CreditScoreSerializer
    permission_classes = [IsAuthenticated]
    filterset_fields = ['user', 'group', 'score_grade']
    ordering_fields = ['calculated_at', 'score']


class LoanEligibilityViewSet(viewsets.ModelViewSet):
    queryset = LoanEligibility.objects.all()
    serializer_class = LoanEligibilitySerializer
    permission_classes = [IsAuthenticated]
    filterset_fields = ['user', 'group', 'status']
    ordering_fields = ['checked_at', 'maximum_eligible_amount']


class PaymentHistoryAnalysisViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = PaymentHistoryAnalysis.objects.all()
    serializer_class = PaymentHistoryAnalysisSerializer
    permission_classes = [IsAuthenticated]
    filterset_fields = ['user', 'group']
    ordering_fields = ['analyzed_at', 'payment_consistency_rate']


class DefaultPredictionViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = DefaultPrediction.objects.all()
    serializer_class = DefaultPredictionSerializer
    permission_classes = [IsAuthenticated]
    filterset_fields = ['user', 'risk_level']
    ordering_fields = ['predicted_at', 'default_probability']
