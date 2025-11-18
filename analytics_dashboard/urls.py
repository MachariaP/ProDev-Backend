from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import AnalyticsReportViewSet, FinancialHealthScoreViewSet, PredictiveCashFlowViewSet

router = DefaultRouter()
router.register(r'analytics-reports', AnalyticsReportViewSet, basename='analytics-report')
router.register(r'financial-health-scores', FinancialHealthScoreViewSet, basename='financial-health-score')
router.register(r'predictive-cash-flows', PredictiveCashFlowViewSet, basename='predictive-cash-flow')

urlpatterns = [
    path('', include(router.urls)),
]
