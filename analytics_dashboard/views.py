# analytics_dashboard/views.py
from typing import Any, List, Dict
from rest_framework import viewsets, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from django.db.models import QuerySet, Sum, Count, Q, Avg
from django.utils import timezone
from datetime import timedelta, datetime
import logging
from decimal import Decimal
from .models import AnalyticsReport, FinancialHealthScore, PredictiveCashFlow
from .serializers import (
    AnalyticsReportSerializer,
    FinancialHealthScoreSerializer,
    PredictiveCashFlowSerializer,
)
from .tasks import compute_dashboard_for_group
from groups.models import ChamaGroup, GroupMembership
from finance.models import Contribution, Loan, Expense, LoanRepayment
from investments.models import Investment

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


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def group_stats(request, group_id: int) -> Response:
    """
    Get comprehensive statistics for a group.
    Returns dashboard stats including balances, members, loans, investments, etc.
    Fixed: monthly_contributions now returns an array of monthly data for the last 12 months
    """
    group = get_object_or_404(ChamaGroup, id=group_id)
    
    # Check if user is a member of the group
    if not group.memberships.filter(user=request.user, status='ACTIVE').exists():
        return Response(
            {"error": "You do not have access to this group's statistics"},
            status=status.HTTP_403_FORBIDDEN
        )
    
    # Calculate total investments
    total_investments = Investment.objects.filter(
        group=group,
        status__in=['ACTIVE', 'MATURED']
    ).aggregate(total=Sum('principal_amount'))['total'] or Decimal('0')
    
    # Count active loans
    active_loans = Loan.objects.filter(
        group=group,
        status__in=['APPROVED', 'DISBURSED', 'ACTIVE']
    ).count()
    
    # Calculate monthly contributions for the last 12 months
    now = timezone.now()
    monthly_contributions_data = []
    
    # Get contributions for the last 12 months
    for i in range(11, -1, -1):  # From 11 months ago to current month
        month_start = (now.replace(day=1) - timedelta(days=30*i)).replace(day=1, hour=0, minute=0, second=0, microsecond=0)
        if i == 0:
            month_end = now
        else:
            next_month = month_start + timedelta(days=32)
            month_end = next_month.replace(day=1) - timedelta(days=1)
        
        monthly_total = Contribution.objects.filter(
            group=group,
            status='COMPLETED',
            created_at__gte=month_start,
            created_at__lte=month_end
        ).aggregate(total=Sum('amount'))['total'] or Decimal('0')
        
        monthly_contributions_data.append({
            'month': month_start.strftime('%b %Y'),
            'amount': float(monthly_total),
            'month_number': month_start.month,
            'year': month_start.year
        })
    
    # Calculate current month's contributions (last 30 days)
    thirty_days_ago = now - timedelta(days=30)
    current_month_contributions = Contribution.objects.filter(
        group=group,
        status='COMPLETED',
        created_at__gte=thirty_days_ago
    ).aggregate(total=Sum('amount'))['total'] or Decimal('0')
    
    # Count pending approvals (pending loans and expenses)
    pending_loans = Loan.objects.filter(group=group, status='PENDING').count()
    pending_expenses = Expense.objects.filter(group=group, status='PENDING').count()
    pending_approvals = pending_loans + pending_expenses
    
    # Calculate growth rates (compare current month to previous month)
    current_month_start = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
    previous_month_start = (current_month_start - timedelta(days=1)).replace(day=1)
    
    # Balance growth
    current_balance = group.total_balance
    previous_balance = Contribution.objects.filter(
        group=group,
        status='COMPLETED',
        created_at__lt=current_month_start
    ).aggregate(total=Sum('amount'))['total'] or Decimal('0')
    
    if previous_balance > Decimal('0'):
        balance_growth = ((current_balance - previous_balance) / previous_balance) * 100
    else:
        balance_growth = 0
    
    # Member growth
    current_members = GroupMembership.objects.filter(group=group, status='ACTIVE').count()
    previous_members = GroupMembership.objects.filter(
        group=group,
        status='ACTIVE',
        joined_at__lt=current_month_start
    ).count()
    
    if previous_members > 0:
        member_growth = ((current_members - previous_members) / previous_members) * 100
    else:
        member_growth = 0
    
    # Loan growth
    current_month_loans = Loan.objects.filter(
        group=group,
        applied_at__gte=current_month_start
    ).count()
    previous_month_loans = Loan.objects.filter(
        group=group,
        applied_at__gte=previous_month_start,
        applied_at__lt=current_month_start
    ).count()
    
    if previous_month_loans > 0:
        loan_growth = ((current_month_loans - previous_month_loans) / previous_month_loans) * 100
    else:
        loan_growth = 0
    
    # Investment growth
    current_investments = total_investments
    previous_investments = Investment.objects.filter(
        group=group,
        status__in=['ACTIVE', 'MATURED'],
        created_at__lt=current_month_start
    ).aggregate(total=Sum('principal_amount'))['total'] or Decimal('0')
    
    if previous_investments > Decimal('0'):
        investment_growth = ((current_investments - previous_investments) / previous_investments) * 100
    else:
        investment_growth = 0
    
    stats = {
        'total_balance': float(group.total_balance),
        'total_members': current_members,
        'active_loans': active_loans,
        'total_investments': float(total_investments),
        'monthly_contributions': monthly_contributions_data,  # Now an array of objects
        'current_month_contributions': float(current_month_contributions),
        'pending_approvals': pending_approvals,
        'growth_rates': {
            'balance': round(float(balance_growth), 1),
            'members': round(float(member_growth), 1),
            'loans': round(float(loan_growth), 1),
            'investments': round(float(investment_growth), 1),
        },
        'quick_stats': {
            'pending_actions': pending_approvals,
            'upcoming_meetings': 0,  # TODO: Implement meetings model
            'unread_notifications': 0,  # TODO: Now available via notifications app
            'loan_approvals': pending_loans,
        }
    }
    
    return Response(stats)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def recent_activity(request, group_id: int) -> Response:
    """
    Get recent activities for a group.
    Returns a list of recent transactions, votes, and other activities.
    """
    group = get_object_or_404(ChamaGroup, id=group_id)
    
    # Check if user is a member of the group
    if not group.memberships.filter(user=request.user, status='ACTIVE').exists():
        return Response(
            {"error": "You do not have access to this group's activities"},
            status=status.HTTP_403_FORBIDDEN
        )
    
    activities = []
    
    # Get recent activities from the last 90 days for better performance
    ninety_days_ago = timezone.now() - timedelta(days=90)
    
    # Get recent contributions
    contributions = Contribution.objects.filter(
        group=group, 
        created_at__gte=ninety_days_ago
    ).select_related('member').order_by('-created_at')[:20]
    
    for contrib in contributions:
        activities.append({
            'id': f'contrib_{contrib.id}',
            'type': 'contribution',
            'description': f'{contrib.member.get_full_name()} contributed KES {contrib.amount:,.2f}',
            'amount': float(contrib.amount),
            'user_id': contrib.member.id,
            'group_id': group.id,
            'timestamp': contrib.created_at.isoformat(),
            'is_positive': True,
            'status': contrib.status.lower(),
            'member_name': contrib.member.get_full_name(),
            'action': 'contributed'
        })
    
    # Get recent loans
    loans = Loan.objects.filter(
        group=group,
        applied_at__gte=ninety_days_ago
    ).select_related('borrower').order_by('-applied_at')[:10]
    
    for loan in loans:
        activities.append({
            'id': f'loan_{loan.id}',
            'type': 'loan',
            'description': f'{loan.borrower.get_full_name()} requested loan of KES {loan.principal_amount:,.2f}',
            'amount': float(loan.principal_amount),
            'user_id': loan.borrower.id,
            'group_id': group.id,
            'timestamp': loan.applied_at.isoformat(),
            'is_positive': False,
            'status': loan.status.lower(),
            'member_name': loan.borrower.get_full_name(),
            'action': 'requested loan'
        })
    
    # Get recent loan repayments
    repayments = LoanRepayment.objects.filter(
        loan__group=group,
        paid_at__gte=ninety_days_ago,
        status='COMPLETED'
    ).select_related('loan__borrower').order_by('-paid_at')[:10]
    
    for repayment in repayments:
        activities.append({
            'id': f'repayment_{repayment.id}',
            'type': 'loan_repayment',
            'description': f'{repayment.loan.borrower.get_full_name()} repaid KES {repayment.amount:,.2f}',
            'amount': float(repayment.amount),
            'user_id': repayment.loan.borrower.id,
            'group_id': group.id,
            'timestamp': repayment.paid_at.isoformat(),
            'is_positive': True,
            'status': repayment.status.lower(),
            'member_name': repayment.loan.borrower.get_full_name(),
            'action': 'repaid loan'
        })
    
    # Get recent expenses
    expenses = Expense.objects.filter(
        group=group,
        requested_at__gte=ninety_days_ago
    ).select_related('requested_by').order_by('-requested_at')[:10]
    
    for expense in expenses:
        activities.append({
            'id': f'expense_{expense.id}',
            'type': 'expense',
            'description': f'Expense: {expense.description} - KES {expense.amount:,.2f}',
            'amount': float(expense.amount),
            'user_id': expense.requested_by.id,
            'group_id': group.id,
            'timestamp': expense.requested_at.isoformat(),
            'is_positive': False,
            'status': expense.status.lower(),
            'member_name': expense.requested_by.get_full_name(),
            'action': 'requested expense'
        })
    
    # Get recent investments
    investments = Investment.objects.filter(
        group=group,
        created_at__gte=ninety_days_ago
    ).select_related('created_by').order_by('-created_at')[:10]
    
    for investment in investments:
        activities.append({
            'id': f'investment_{investment.id}',
            'type': 'investment',
            'description': f'Investment in {investment.investment_type} - KES {investment.principal_amount:,.2f}',
            'amount': float(investment.principal_amount),
            'user_id': investment.created_by.id,
            'group_id': group.id,
            'timestamp': investment.created_at.isoformat(),
            'is_positive': False,
            'status': investment.status.lower(),
            'member_name': investment.created_by.get_full_name(),
            'action': 'created investment'
        })
    
    # Sort all activities by timestamp (most recent first)
    activities.sort(key=lambda x: x['timestamp'], reverse=True)
    
    # Return only the most recent 50 activities
    return Response(activities[:50])
