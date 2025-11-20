# analytics_dashboard/views.py
from typing import Any
from rest_framework import viewsets, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from django.db.models import QuerySet
import logging
from .models import AnalyticsReport, FinancialHealthScore, PredictiveCashFlow
from .serializers import (
    AnalyticsReportSerializer,
    FinancialHealthScoreSerializer,
    PredictiveCashFlowSerializer,
)
from .tasks import compute_dashboard_for_group
from groups.models import ChamaGroup

logger = logging.getLogger(__name__)


class BaseAnalyticsViewSet(viewsets.ReadOnlyModelViewSet):
    """All analytics endpoints inherit from this: secure + group-filtered."""
    permission_classes = [IsAuthenticated]

    def get_queryset(self) -> QuerySet:
        # Filter to groups where the user has an active membership
        return self.queryset.filter(
            group__memberships__user=self.request.user,
            group__memberships__status='ACTIVE'
        ).distinct()


class AnalyticsReportViewSet(BaseAnalyticsViewSet):
    queryset = AnalyticsReport.objects.all()
    serializer_class = AnalyticsReportSerializer


class FinancialHealthScoreViewSet(BaseAnalyticsViewSet):
    queryset = FinancialHealthScore.objects.all()
    serializer_class = FinancialHealthScoreSerializer


class PredictiveCashFlowViewSet(BaseAnalyticsViewSet):
    queryset = PredictiveCashFlow.objects.all()
    serializer_class = PredictiveCashFlowSerializer


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def dashboard_analytics(request) -> Response:
    """
    Fast dashboard endpoint used by React frontend.
    Returns pre-computed JSON. Requires group_id.
    If no analytics exist, generates them on-the-fly.
    """
    group_id = request.query_params.get('group_id')
    if not group_id:
        return Response(
            {"error": "query parameter 'group_id' is required"},
            status=status.HTTP_400_BAD_REQUEST
        )

    group = get_object_or_404(ChamaGroup, id=group_id)

    # Check if user is a member of the group
    if not group.memberships.filter(user=request.user, status='ACTIVE').exists():
        return Response(
            {"error": "You do not have access to this group's analytics"},
            status=status.HTTP_403_FORBIDDEN
        )

    report = AnalyticsReport.objects.filter(
        group=group,
        report_type=AnalyticsReport.ReportType.DASHBOARD_SUMMARY
    ).order_by('-generated_at').first()

    if not report:
        # Auto-generate analytics if they don't exist (fallback for when Celery isn't running)
        try:
            logger.info(f"Auto-generating analytics for group {group_id}")
            compute_dashboard_for_group(group_id)
            
            # Fetch the newly created report
            report = AnalyticsReport.objects.filter(
                group=group,
                report_type=AnalyticsReport.ReportType.DASHBOARD_SUMMARY
            ).order_by('-generated_at').first()
            
            if report:
                return Response(report.report_data)
        except Exception as e:
            logger.error(f"Failed to auto-generate analytics for group {group_id}: {str(e)}")
            return Response(
                {"error": f"Failed to generate analytics: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
        
        return Response(
            {"error": "Dashboard could not be generated. Please try again later."},
            status=status.HTTP_503_SERVICE_UNAVAILABLE
        )

    return Response(report.report_data)
