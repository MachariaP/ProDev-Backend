from rest_framework import viewsets, permissions
from django_filters.rest_framework import DjangoFilterBackend
from .models import Investment, StockHolding, Portfolio, InvestmentTransaction
from .serializers import (
    InvestmentSerializer, StockHoldingSerializer,
    PortfolioSerializer, InvestmentTransactionSerializer
)


class InvestmentViewSet(viewsets.ModelViewSet):
    """ViewSet for Investments."""
    
    queryset = Investment.objects.all()
    serializer_class = InvestmentSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['group', 'investment_type', 'status']
    
    def perform_create(self, serializer):
        """Set created_by to current user."""
        serializer.save(created_by=self.request.user)


class StockHoldingViewSet(viewsets.ModelViewSet):
    """ViewSet for Stock Holdings."""
    
    queryset = StockHolding.objects.all()
    serializer_class = StockHoldingSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['group', 'stock_symbol', 'exchange']


class PortfolioViewSet(viewsets.ModelViewSet):
    """ViewSet for Portfolios."""
    
    queryset = Portfolio.objects.all()
    serializer_class = PortfolioSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['group']


class InvestmentTransactionViewSet(viewsets.ModelViewSet):
    """ViewSet for Investment Transactions."""
    
    queryset = InvestmentTransaction.objects.all()
    serializer_class = InvestmentTransactionSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['investment', 'transaction_type']
    
    def perform_create(self, serializer):
        """Set created_by to current user."""
        serializer.save(created_by=self.request.user)

