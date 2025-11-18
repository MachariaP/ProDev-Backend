from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    InvestmentRecommendationViewSet, PortfolioRebalanceViewSet,
    AutoInvestmentRuleViewSet, InvestmentPerformanceViewSet
)

router = DefaultRouter()
router.register(r'recommendations', InvestmentRecommendationViewSet, basename='investment-recommendation')
router.register(r'rebalances', PortfolioRebalanceViewSet, basename='portfolio-rebalance')
router.register(r'auto-rules', AutoInvestmentRuleViewSet, basename='auto-investment-rule')
router.register(r'performance', InvestmentPerformanceViewSet, basename='investment-performance')

urlpatterns = [
    path('', include(router.urls)),
]