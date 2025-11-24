# analytics_dashboard/urls.py
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'reports', views.AnalyticsReportViewSet, basename='analyticsreport')
router.register(r'health-scores', views.FinancialHealthScoreViewSet)
router.register(r'cashflow-predictions', views.PredictiveCashFlowViewSet)

urlpatterns = [
    path('', include(router.urls)),
    path('dashboard/', views.dashboard_analytics, name='dashboard-analytics'),
    path('groups/<int:group_id>/stats/', views.group_stats, name='group-stats'),
    path('groups/<int:group_id>/recent-activity/', views.recent_activity, name='recent-activity'),
]
