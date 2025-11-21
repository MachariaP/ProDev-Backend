"""
Test loan application API endpoint.
"""
from django.test import TestCase
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient
from rest_framework import status
from decimal import Decimal
from groups.models import ChamaGroup

User = get_user_model()


class LoanApplicationAPITest(TestCase):
    """Test the loan application API endpoint."""
    
    def setUp(self):
        """Set up test data."""
        self.client = APIClient()
        
        # Create a test user
        self.user = User.objects.create_user(
            email='testuser@example.com',
            password='testpass123',
            first_name='Test',
            last_name='User',
            phone_number='+254700000000'
        )
        
        # Create a test group
        self.group = ChamaGroup.objects.create(
            name='Test Chama',
            description='Test Description',
            created_by=self.user,
            minimum_contribution=Decimal('1000.00')
        )
        
        # Authenticate the user
        self.client.force_authenticate(user=self.user)
    
    def test_loan_application_create(self):
        """Test creating a loan application via API."""
        data = {
            'group': self.group.id,
            'principal_amount': 50000.00,
            'duration_months': 12,
            'purpose': 'Business expansion',
        }
        
        response = self.client.post('/finance/loans/', data, format='json')
        
        print(f"Status Code: {response.status_code}")
        print(f"Response Data: {response.data}")
        
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        # Verify the loan was created in the database
        from finance.models import Loan
        self.assertEqual(Loan.objects.count(), 1)
        loan = Loan.objects.first()
        self.assertEqual(loan.borrower, self.user)
        self.assertEqual(loan.principal_amount, Decimal('50000.00'))
        self.assertEqual(loan.status, 'PENDING')
    
    def test_loan_application_with_interest_rate(self):
        """Test creating a loan application with custom interest rate."""
        data = {
            'group': self.group.id,
            'principal_amount': 50000.00,
            'interest_rate': 12.0,
            'duration_months': 12,
            'purpose': 'Business expansion',
        }
        
        response = self.client.post('/finance/loans/', data, format='json')
        
        print(f"Status Code: {response.status_code}")
        print(f"Response Data: {response.data}")
        
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        # Verify the loan was created with the correct interest rate
        from finance.models import Loan
        loan = Loan.objects.first()
        self.assertEqual(loan.interest_rate, Decimal('12.00'))
