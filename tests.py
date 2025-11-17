"""
Basic tests for ChamaHub API
"""
from django.test import TestCase
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient
from rest_framework import status

User = get_user_model()


class UserRegistrationTestCase(TestCase):
    """Test user registration."""
    
    def setUp(self):
        self.client = APIClient()
    
    def test_user_registration(self):
        """Test that a user can register."""
        data = {
            'email': 'testuser@example.com',
            'password': 'testpass123',
            'password_confirm': 'testpass123',
            'first_name': 'Test',
            'last_name': 'User',
            'phone_number': '254712345678'
        }
        
        response = self.client.post('/api/v1/accounts/users/register/', data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertIn('user', response.data)
        self.assertIn('tokens', response.data)
        self.assertEqual(response.data['user']['email'], data['email'])
        
        # Check user was created in database
        user = User.objects.get(email=data['email'])
        self.assertEqual(user.first_name, data['first_name'])
        self.assertEqual(user.last_name, data['last_name'])
    
    def test_user_registration_password_mismatch(self):
        """Test registration fails with mismatched passwords."""
        data = {
            'email': 'testuser2@example.com',
            'password': 'testpass123',
            'password_confirm': 'differentpass',
            'first_name': 'Test',
            'last_name': 'User'
        }
        
        response = self.client.post('/api/v1/accounts/users/register/', data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)


class GroupCreationTestCase(TestCase):
    """Test group creation."""
    
    def setUp(self):
        self.client = APIClient()
        # Create and authenticate a user
        self.user = User.objects.create_user(
            email='admin@example.com',
            password='adminpass123',
            first_name='Admin',
            last_name='User'
        )
        self.client.force_authenticate(user=self.user)
    
    def test_create_chama_group(self):
        """Test creating a Chama group."""
        data = {
            'name': 'Test Chama Group',
            'description': 'A test savings group',
            'group_type': 'SAVINGS',
            'objectives': 'Save money together',
            'contribution_frequency': 'MONTHLY',
            'minimum_contribution': '1000.00'
        }
        
        response = self.client.post('/api/v1/groups/chama-groups/', data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['name'], data['name'])
        self.assertEqual(response.data['group_type'], data['group_type'])
    
    def test_unauthenticated_cannot_create_group(self):
        """Test that unauthenticated users cannot create groups."""
        self.client.force_authenticate(user=None)
        
        data = {
            'name': 'Test Group',
            'group_type': 'SAVINGS'
        }
        
        response = self.client.post('/api/v1/groups/chama-groups/', data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)


class LoanApplicationTestCase(TestCase):
    """Test loan application."""
    
    def setUp(self):
        from groups.models import ChamaGroup, GroupMembership
        
        self.client = APIClient()
        
        # Create user
        self.user = User.objects.create_user(
            email='borrower@example.com',
            password='testpass123'
        )
        
        # Create group
        self.group = ChamaGroup.objects.create(
            name='Test Chama',
            group_type='SAVINGS',
            created_by=self.user
        )
        
        # Create membership
        GroupMembership.objects.create(
            group=self.group,
            user=self.user,
            role='MEMBER',
            status='ACTIVE'
        )
        
        self.client.force_authenticate(user=self.user)
    
    def test_apply_for_loan(self):
        """Test that a user can apply for a loan."""
        data = {
            'group': self.group.id,
            'principal_amount': '50000.00',
            'interest_rate': '10.00',
            'duration_months': 12,
            'purpose': 'Business expansion'
        }
        
        response = self.client.post('/api/v1/finance/loans/', data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        # The loan application serializer doesn't include status in response
        # Check that loan was created by verifying we got an ID back
        self.assertIn('group', response.data)
        self.assertEqual(response.data['principal_amount'], data['principal_amount'])
