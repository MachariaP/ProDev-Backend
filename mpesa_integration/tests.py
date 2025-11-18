from django.test import TestCase
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient
from rest_framework import status
from groups.models import ChamaGroup
from .models import MPesaTransaction, MPesaBulkPayment, PaymentReconciliation

User = get_user_model()


class MPesaTransactionTests(TestCase):
    """Tests for M-Pesa transaction endpoints."""
    
    def setUp(self):
        """Set up test data."""
        self.client = APIClient()
        self.user = User.objects.create_user(
            email='test@example.com',
            password='testpass123',
            first_name='Test',
            last_name='User'
        )
        self.client.force_authenticate(user=self.user)
        
        self.group = ChamaGroup.objects.create(
            name='Test Chama',
            group_type='SAVINGS',
            created_by=self.user
        )
    
    def test_list_mpesa_transactions(self):
        """Test listing M-Pesa transactions."""
        response = self.client.get('/api/v1/mpesa/transactions/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
    
    def test_create_mpesa_transaction(self):
        """Test creating a new M-Pesa transaction."""
        data = {
            'transaction_id': 'TEST123456',
            'transaction_type': 'STK_PUSH',
            'amount': '1000.00',
            'phone_number': '254712345678',
            'account_reference': 'TEST001',
            'transaction_desc': 'Test payment',
            'group': self.group.id,
            'user': self.user.id
        }
        response = self.client.post('/api/v1/mpesa/transactions/', data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(MPesaTransaction.objects.count(), 1)
        transaction = MPesaTransaction.objects.first()
        self.assertEqual(transaction.transaction_id, 'TEST123456')
    
    def test_initiate_stk_push(self):
        """Test initiating STK Push."""
        data = {
            'phone_number': '254712345678',
            'amount': '500.00',
            'account_reference': 'CONT001',
            'transaction_desc': 'Monthly contribution',
            'group_id': self.group.id
        }
        response = self.client.post('/api/v1/mpesa/transactions/initiate_stk_push/', data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertIn('transaction_id', response.data)


class MPesaBulkPaymentTests(TestCase):
    """Tests for bulk payment endpoints."""
    
    def setUp(self):
        """Set up test data."""
        self.client = APIClient()
        self.user = User.objects.create_user(
            email='admin@example.com',
            password='adminpass123',
            first_name='Admin',
            last_name='User'
        )
        self.client.force_authenticate(user=self.user)
        
        self.group = ChamaGroup.objects.create(
            name='Test Chama',
            group_type='SAVINGS',
            created_by=self.user
        )
    
    def test_list_bulk_payments(self):
        """Test listing bulk payments."""
        response = self.client.get('/api/v1/mpesa/bulk-payments/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
    
    def test_create_bulk_payment(self):
        """Test creating a bulk payment."""
        data = {
            'batch_id': 'BATCH001',
            'group': self.group.id,
            'total_amount': '10000.00',
            'total_recipients': 10,
            'initiated_by': self.user.id
        }
        response = self.client.post('/api/v1/mpesa/bulk-payments/', data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)


class PaymentReconciliationTests(TestCase):
    """Tests for payment reconciliation."""
    
    def setUp(self):
        """Set up test data."""
        self.client = APIClient()
        self.user = User.objects.create_user(
            email='user@example.com',
            password='userpass123',
            first_name='User',
            last_name='Test'
        )
        self.client.force_authenticate(user=self.user)
        
        self.transaction = MPesaTransaction.objects.create(
            transaction_id='TXN001',
            transaction_type='STK_PUSH',
            amount='1000.00',
            phone_number='254712345678',
            account_reference='TEST',
            transaction_desc='Test',
            user=self.user
        )
    
    def test_list_reconciliations(self):
        """Test listing reconciliations."""
        response = self.client.get('/api/v1/mpesa/reconciliations/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
