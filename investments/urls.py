from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    InvestmentViewSet, StockHoldingViewSet,
    PortfolioViewSet, InvestmentTransactionViewSet
)

router = DefaultRouter()
router.register(r'investments', InvestmentViewSet, basename='investment')
router.register(r'stock-holdings', StockHoldingViewSet, basename='stockholding')
router.register(r'portfolios', PortfolioViewSet, basename='portfolio')
router.register(r'investment-transactions', InvestmentTransactionViewSet, basename='investmenttransaction')

urlpatterns = [
    path('', include(router.urls)),
]
