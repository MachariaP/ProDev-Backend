from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from .models import InvestmentRecommendation, PortfolioRebalance, AutoInvestmentRule, InvestmentPerformance
from .serializers import (
    InvestmentRecommendationSerializer, PortfolioRebalanceSerializer,
    AutoInvestmentRuleSerializer, InvestmentPerformanceSerializer
)


class InvestmentRecommendationViewSet(viewsets.ModelViewSet):
    queryset = InvestmentRecommendation.objects.all()
    serializer_class = InvestmentRecommendationSerializer
    permission_classes = [IsAuthenticated]
    filterset_fields = ['status', 'investment_type', 'risk_level', 'group']
    ordering_fields = ['created_at', 'confidence_score', 'expected_return']
    
    @action(detail=True, methods=['post'])
    def accept(self, request, pk=None):
        """Accept investment recommendation."""
        recommendation = self.get_object()
        recommendation.status = 'ACCEPTED'
        recommendation.reviewed_by = request.user
        recommendation.save()
        return Response({'message': 'Recommendation accepted'})
    
    @action(detail=True, methods=['post'])
    def reject(self, request, pk=None):
        """Reject investment recommendation."""
        recommendation = self.get_object()
        recommendation.status = 'REJECTED'
        recommendation.reviewed_by = request.user
        recommendation.save()
        return Response({'message': 'Recommendation rejected'})


class PortfolioRebalanceViewSet(viewsets.ModelViewSet):
    queryset = PortfolioRebalance.objects.all()
    serializer_class = PortfolioRebalanceSerializer
    permission_classes = [IsAuthenticated]
    filterset_fields = ['status', 'group']
    ordering_fields = ['created_at', 'expected_improvement']


class AutoInvestmentRuleViewSet(viewsets.ModelViewSet):
    queryset = AutoInvestmentRule.objects.all()
    serializer_class = AutoInvestmentRuleSerializer
    permission_classes = [IsAuthenticated]
    filterset_fields = ['is_active', 'frequency', 'group']
    
    @action(detail=True, methods=['post'])
    def toggle_active(self, request, pk=None):
        """Toggle rule active status."""
        rule = self.get_object()
        rule.is_active = not rule.is_active
        rule.save()
        return Response({'is_active': rule.is_active})


class InvestmentPerformanceViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = InvestmentPerformance.objects.all()
    serializer_class = InvestmentPerformanceSerializer
    permission_classes = [IsAuthenticated]
    filterset_fields = ['group', 'investment']
    ordering_fields = ['recorded_at', 'return_percentage']
