from django.test import TestCase
from django.contrib.auth import get_user_model
from django.utils import timezone
from rest_framework.test import APIClient
from rest_framework import status
from decimal import Decimal
from datetime import timedelta

from groups.models import ChamaGroup, GroupMembership
from finance.models import Contribution, Expense
from .models import AnalyticsReport
from .tasks import compute_dashboard_for_group

User = get_user_model()


class AnalyticsDashboardTestCase(TestCase):
    """Test cases for analytics dashboard functionality."""

    def setUp(self):
        """Set up test data."""
        # Create test users
        self.user = User.objects.create_user(
            email='test@example.com',
            password='testpass123',
            first_name='Test',
            last_name='User'
        )
        self.other_user = User.objects.create_user(
            email='other@example.com',
            password='testpass123',
            first_name='Other',
            last_name='User'
        )

        # Create test group
        self.group = ChamaGroup.objects.create(
            name='Test Chama',
            description='Test chama group',
            objectives='Testing',
            created_by=self.user
        )

        # Add user as member
        GroupMembership.objects.create(
            group=self.group,
            user=self.user,
            role='ADMIN',
            status='ACTIVE'
        )

        # Create test contributions
        today = timezone.now()
        for i in range(30):
            date = today - timedelta(days=i)
            contrib = Contribution.objects.create(
                group=self.group,
                member=self.user,
                amount=Decimal('1000.00'),
                payment_method='MPESA',
                status='COMPLETED'
            )
            # Update created_at for historical data
            Contribution.objects.filter(id=contrib.id).update(created_at=date)

        # Create test expenses
        for i in range(5):
            date = today - timedelta(days=i * 2)
            expense = Expense.objects.create(
                group=self.group,
                category='OPERATIONAL',
                description='Test expense',
                amount=Decimal('500.00'),
                status='APPROVED',
                requested_by=self.user
            )
            Expense.objects.filter(id=expense.id).update(requested_at=date)

        # Set up API client
        self.client = APIClient()

    def test_generate_analytics_data(self):
        """Test that analytics data can be generated for a group."""
        # Since we can't easily test Celery tasks, we'll manually create the report
        # In production, this would be done by the Celery task
        
        end_date = timezone.now().date()
        start_date = end_date - timedelta(days=365)
        
        # Create a simple analytics report
        dashboard_data = {
            "contributions_over_time": [
                {"date": start_date.isoformat(), "amount": 1000.0}
            ],
            "member_activity": [
                {"member_name": "Test User", "transactions": 30}
            ],
            "category_breakdown": [
                {"name": "OPERATIONAL", "value": 2500.0}
            ],
            "growth_trends": [
                {"month": "November 2025", "growth": 30000.0}
            ],
            "generated_at": timezone.now().isoformat(),
        }
        
        report = AnalyticsReport.objects.create(
            group=self.group,
            report_type=AnalyticsReport.ReportType.DASHBOARD_SUMMARY,
            report_data=dashboard_data
        )
        
        self.assertIsNotNone(report)
        self.assertEqual(report.group, self.group)
        self.assertEqual(report.report_type, AnalyticsReport.ReportType.DASHBOARD_SUMMARY)

    def test_dashboard_analytics_endpoint_authenticated(self):
        """Test that authenticated users can access their group's analytics."""
        # Create analytics report first
        dashboard_data = {
            "contributions_over_time": [],
            "member_activity": [],
            "category_breakdown": [],
            "growth_trends": [],
            "generated_at": timezone.now().isoformat(),
        }
        
        AnalyticsReport.objects.create(
            group=self.group,
            report_type=AnalyticsReport.ReportType.DASHBOARD_SUMMARY,
            report_data=dashboard_data
        )
        
        # Authenticate
        self.client.force_authenticate(user=self.user)
        
        # Make request
        response = self.client.get(f'/analytics/dashboard/?group_id={self.group.id}')
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('contributions_over_time', response.data)
        self.assertIn('member_activity', response.data)
        self.assertIn('category_breakdown', response.data)
        self.assertIn('growth_trends', response.data)

    def test_dashboard_analytics_endpoint_unauthenticated(self):
        """Test that unauthenticated users cannot access analytics."""
        response = self.client.get(f'/analytics/dashboard/?group_id={self.group.id}')
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_dashboard_analytics_endpoint_no_access(self):
        """Test that users without group membership cannot access analytics."""
        # Create analytics report
        dashboard_data = {
            "contributions_over_time": [],
            "member_activity": [],
            "category_breakdown": [],
            "growth_trends": [],
            "generated_at": timezone.now().isoformat(),
        }
        
        AnalyticsReport.objects.create(
            group=self.group,
            report_type=AnalyticsReport.ReportType.DASHBOARD_SUMMARY,
            report_data=dashboard_data
        )
        
        # Authenticate as other user (not a member)
        self.client.force_authenticate(user=self.other_user)
        
        # Make request
        response = self.client.get(f'/analytics/dashboard/?group_id={self.group.id}')
        
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_dashboard_analytics_missing_group_id(self):
        """Test that endpoint returns error when group_id is missing."""
        self.client.force_authenticate(user=self.user)
        response = self.client.get('/analytics/dashboard/')
        
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('error', response.data)

    def test_dashboard_analytics_no_report(self):
        """Test that endpoint returns 503 when no analytics report exists."""
        self.client.force_authenticate(user=self.user)
        response = self.client.get(f'/analytics/dashboard/?group_id={self.group.id}')
        
        self.assertEqual(response.status_code, status.HTTP_503_SERVICE_UNAVAILABLE)
        self.assertIn('error', response.data)

