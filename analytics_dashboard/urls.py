from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    AnalyticsReportViewSet,
    FinancialHealthScoreViewSet,
    PredictiveCashFlowViewSet,
    dashboard_analytics,
    group_stats,
    recent_activity
)

router = DefaultRouter()
router.register(r'reports', AnalyticsReportViewSet, basename='analytics-report')
router.register(r'health-scores', FinancialHealthScoreViewSet, basename='financial-health-score')
router.register(r'cashflow-predictions', PredictiveCashFlowViewSet, basename='predictive-cashflow')

urlpatterns = [
    path('', include(router.urls)),
    
    # Dashboard endpoints
    path('dashboard/', dashboard_analytics, name='dashboard-analytics'),
    
    # Group-specific endpoints (these need to come after the router)
    path('groups/<int:group_id>/stats/', group_stats, name='group-stats'),
    path('groups/<int:group_id>/recent-activity/', recent_activity, name='recent-activity'),
]
