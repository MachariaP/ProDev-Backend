from django.test import TestCase
from django.contrib.auth import get_user_model
from django.utils import timezone
from decimal import Decimal
from rest_framework.test import APIClient, APITestCase
from rest_framework import status
from finance.models import (
    Contribution, Loan, LoanRepayment, Expense,
    DisbursementApproval, ApprovalSignature
)
from groups.models import ChamaGroup

User = get_user_model()


class ContributionModelTest(TestCase):
    """Test cases for Contribution model."""
    
    def setUp(self):
        """Set up test data."""
        self.user = User.objects.create_user(
            email='test@example.com',
            password='testpass123',
            first_name='Test',
            last_name='User',
            phone_number='+254700000000'
        )
        self.group = ChamaGroup.objects.create(
            name='Test Chama',
            description='Test Description',
            created_by=self.user,
            minimum_contribution=Decimal('1000.00')
        )
    
    def test_create_contribution(self):
        """Test creating a contribution."""
        contribution = Contribution.objects.create(
            group=self.group,
            member=self.user,
            amount=Decimal('5000.00'),
            payment_method='MPESA',
            reference_number='ABC123',
            status='PENDING'
        )
        self.assertEqual(contribution.amount, Decimal('5000.00'))
        self.assertEqual(contribution.status, 'PENDING')
        self.assertEqual(contribution.member, self.user)


class LoanModelTest(TestCase):
    """Test cases for Loan model."""
    
    def setUp(self):
        """Set up test data."""
        self.user = User.objects.create_user(
            email='test@example.com',
            password='testpass123',
            first_name='Test',
            last_name='User',
            phone_number='+254700000000'
        )
        self.group = ChamaGroup.objects.create(
            name='Test Chama',
            description='Test Description',
            created_by=self.user,
            minimum_contribution=Decimal('1000.00')
        )
    
    def test_create_loan(self):
        """Test creating a loan."""
        loan = Loan.objects.create(
            group=self.group,
            borrower=self.user,
            principal_amount=Decimal('50000.00'),
            interest_rate=Decimal('10.00'),
            duration_months=12,
            purpose='Business expansion'
        )
        self.assertEqual(loan.principal_amount, Decimal('50000.00'))
        self.assertEqual(loan.status, 'PENDING')
    
    def test_loan_calculations(self):
        """Test loan calculation methods."""
        loan = Loan.objects.create(
            group=self.group,
            borrower=self.user,
            principal_amount=Decimal('50000.00'),
            interest_rate=Decimal('10.00'),
            duration_months=12,
            purpose='Business expansion'
        )
        
        # Test total amount calculation
        expected_total = Decimal('50000.00') + (Decimal('50000.00') * Decimal('10.00') * 12) / (100 * 12)
        self.assertEqual(loan.total_amount, expected_total)
        
        # Test monthly payment calculation
        expected_monthly = expected_total / 12
        self.assertEqual(loan.monthly_payment, expected_monthly)


class DisbursementApprovalTest(TestCase):
    """Test cases for DisbursementApproval and signals."""
    
    def setUp(self):
        """Set up test data."""
        self.user = User.objects.create_user(
            email='test@example.com',
            password='testpass123',
            first_name='Test',
            last_name='User',
            phone_number='+254700000000'
        )
        self.approver1 = User.objects.create_user(
            email='approver1@example.com',
            password='testpass123',
            first_name='Approver',
            last_name='One',
            phone_number='+254700000001'
        )
        self.approver2 = User.objects.create_user(
            email='approver2@example.com',
            password='testpass123',
            first_name='Approver',
            last_name='Two',
            phone_number='+254700000002'
        )
        self.group = ChamaGroup.objects.create(
            name='Test Chama',
            description='Test Description',
            created_by=self.user,
            minimum_contribution=Decimal('1000.00')
        )
    
    def test_approval_workflow(self):
        """Test multi-signature approval workflow."""
        # Create a loan
        loan = Loan.objects.create(
            group=self.group,
            borrower=self.user,
            principal_amount=Decimal('50000.00'),
            interest_rate=Decimal('10.00'),
            duration_months=12,
            purpose='Business expansion'
        )
        
        # Create disbursement approval
        approval = DisbursementApproval.objects.create(
            group=self.group,
            approval_type='LOAN',
            amount=loan.principal_amount,
            description=loan.purpose,
            loan=loan,
            requested_by=self.user,
            required_approvals=2
        )
        
        self.assertEqual(approval.status, 'PENDING')
        self.assertEqual(approval.approvals_count, 0)
        
        # First signature
        signature1 = ApprovalSignature.objects.create(
            approval=approval,
            approver=self.approver1,
            approved=True,
            comments='Approved'
        )
        
        # Refresh from database
        approval.refresh_from_db()
        self.assertEqual(approval.approvals_count, 1)
        self.assertEqual(approval.status, 'PENDING')
        
        # Second signature - should auto-approve
        signature2 = ApprovalSignature.objects.create(
            approval=approval,
            approver=self.approver2,
            approved=True,
            comments='Approved'
        )
        
        # Refresh from database
        approval.refresh_from_db()
        loan.refresh_from_db()
        
        self.assertEqual(approval.approvals_count, 2)
        self.assertEqual(approval.status, 'APPROVED')
        self.assertEqual(loan.status, 'APPROVED')
        self.assertIsNotNone(loan.approved_at)


class ContributionAPITest(APITestCase):
    """Test cases for Contribution API endpoints."""
    
    def setUp(self):
        """Set up test data."""
        self.user = User.objects.create_user(
            email='api_test@example.com',
            password='testpass123',
            first_name='API',
            last_name='Test',
            phone_number='+254700000010'
        )
        self.group = ChamaGroup.objects.create(
            name='API Test Chama',
            description='Test Description',
            created_by=self.user,
            minimum_contribution=Decimal('1000.00')
        )
        self.client = APIClient()
        self.client.force_authenticate(user=self.user)
    
    def test_create_contribution_without_member_field(self):
        """Test creating a contribution without specifying member field."""
        data = {
            'group': self.group.id,
            'amount': '5000.00',
            'payment_method': 'MPESA',
            'reference_number': 'TEST123'
        }
        response = self.client.post('/api/v1/finance/contributions/', data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['member'], self.user.id)
        self.assertEqual(response.data['amount'], '5000.00')
        self.assertEqual(response.data['payment_method'], 'MPESA')
        
        # Verify in database
        contribution = Contribution.objects.get(id=response.data['id'])
        self.assertEqual(contribution.member, self.user)
        self.assertEqual(contribution.amount, Decimal('5000.00'))
    
    def test_create_contribution_with_minimal_fields(self):
        """Test creating a contribution with only required fields."""
        data = {
            'group': self.group.id,
            'amount': '2000.00',
            'payment_method': 'CASH'
        }
        response = self.client.post('/api/v1/finance/contributions/', data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['member'], self.user.id)
        self.assertEqual(response.data['amount'], '2000.00')
        self.assertEqual(response.data['reference_number'], '')
    
    def test_create_contribution_member_field_ignored_if_provided(self):
        """Test that member field in request is ignored and uses authenticated user."""
        other_user = User.objects.create_user(
            email='other@example.com',
            password='testpass123',
            first_name='Other',
            last_name='User',
            phone_number='+254700000011'
        )
        
        data = {
            'group': self.group.id,
            'member': other_user.id,  # Try to set a different member
            'amount': '3000.00',
            'payment_method': 'BANK'
        }
        response = self.client.post('/api/v1/finance/contributions/', data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        # Should use authenticated user, not the one in request
        self.assertEqual(response.data['member'], self.user.id)
        
        contribution = Contribution.objects.get(id=response.data['id'])
        self.assertEqual(contribution.member, self.user)
    
    def test_create_contribution_requires_authentication(self):
        """Test that creating a contribution requires authentication."""
        self.client.force_authenticate(user=None)
        
        data = {
            'group': self.group.id,
            'amount': '1000.00',
            'payment_method': 'MPESA'
        }
        response = self.client.post('/api/v1/finance/contributions/', data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)


