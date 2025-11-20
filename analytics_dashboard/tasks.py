# analytics_dashboard/tasks.py
import logging
from datetime import timedelta
from typing import Dict, Any
from django.utils import timezone
from django.db.models import Sum, Count
from django.db.models.functions import TruncDate
from celery import shared_task, group
from groups.models import ChamaGroup
from finance.models import Contribution, Expense, Loan, LoanRepayment
from .models import AnalyticsReport

logger = logging.getLogger(__name__)

@shared_task(bind=True, autoretry_for=(Exception,), retry_backoff=True, max_retries=3)
def compute_dashboard_for_group(self, group_id: int) -> None:
    """
    Compute and store DASHBOARD_SUMMARY report for a single chama.
    Designed to be run in parallel via Celery group().
    """
    try:
        group_obj = ChamaGroup.objects.get(id=group_id)
    except ChamaGroup.DoesNotExist:
        logger.warning(f"ChamaGroup {group_id} not found during dashboard computation")
        return

    end_date = timezone.now().date()
    start_date = end_date - timedelta(days=365)

    # 1. Daily contributions (fill missing dates)
    daily_qs = (
        Contribution.objects
        .filter(group=group_obj, created_at__date__gte=start_date)
        .annotate(date=TruncDate('created_at'))
        .values('date')
        .annotate(amount=Sum('amount'))
        .order_by('date')
    )
    contrib_map = {item['date']: item['amount'] for item in daily_qs}
    
    contributions_over_time = []
    current = start_date
    while current <= end_date:
        contributions_over_time.append({
            "date": current.isoformat(),
            "amount": float(contrib_map.get(current, 0))
        })
        current += timedelta(days=1)

    # 2. Top 10 active members (aggregate from contributions)
    # Get member contributions count
    member_contributions = (
        Contribution.objects
        .filter(group=group_obj, created_at__date__gte=start_date)
        .values('member__id', 'member__first_name', 'member__last_name')
        .annotate(transactions=Count('id'))
        .order_by('-transactions')[:10]
    )
    
    member_activity = []
    for mc in member_contributions:
        name = f"{mc['member__first_name']} {mc['member__last_name']}".strip() or "Unknown"
        member_activity.append({
            "member_name": name,
            "transactions": mc['transactions']
        })
    
    if not member_activity:
        member_activity = [{"member_name": "No activity", "transactions": 0}]

    # 3. Category breakdown (from expenses)
    category_breakdown = list(
        Expense.objects
        .filter(group=group_obj, requested_at__date__gte=start_date, status='APPROVED')
        .values('category')
        .annotate(value=Sum('amount'))
        .values('category', 'value')
    ) or [{"category": "No expenses", "value": 0}]

    # 4. Monthly growth (last 12 months)
    growth_trends = []
    for i in range(11, -1, -1):
        month_date = end_date.replace(day=1) - timedelta(days=32 * i)
        month_start = month_date.replace(day=1)
        next_month = month_start.replace(day=28) + timedelta(days=4)
        month_end = next_month - timedelta(days=next_month.day)

        total = Contribution.objects.filter(
            group=group_obj,
            created_at__date__gte=month_start,
            created_at__date__lte=month_end
        ).aggregate(total=Sum('amount'))['total'] or 0

        growth_trends.append({
            "month": month_start.strftime("%B %Y"),
            "growth": float(total)
        })

    dashboard_data = {
        "contributions_over_time": contributions_over_time,
        "member_activity": member_activity,
        "category_breakdown": [{"name": c['category'], "value": float(c['value'])} for c in category_breakdown],
        "growth_trends": growth_trends,
        "generated_at": timezone.now().isoformat(),
    }

    AnalyticsReport.objects.update_or_create(
        group=group_obj,
        report_type=AnalyticsReport.ReportType.DASHBOARD_SUMMARY,
        defaults={
            'report_data': dashboard_data,
            'insights': 'Dashboard updated automatically',
            'recommendations': '',
            'generated_by': None,
        }
    )
    logger.info(f"Dashboard computed for group: {group_obj.name} ({group_obj.id})")


@shared_task
def compute_all_dashboards() -> None:
    """
    Entry point for Celery Beat. Spawns parallel tasks per group.
    """
    group_ids = ChamaGroup.objects.values_list('id', flat=True)
    job = group(compute_dashboard_for_group.s(gid) for gid in group_ids)
    job.apply_async()
    logger.info(f"Started parallel dashboard computation for {len(group_ids)} groups")
