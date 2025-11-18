from django.test import TestCase
from django.contrib.auth import get_user_model
from django.utils import timezone
from decimal import Decimal
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

