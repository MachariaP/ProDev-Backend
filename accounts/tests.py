from django.test import TestCase
from django.urls import reverse
from rest_framework.test import APITestCase
from rest_framework import status
from django.contrib.auth import get_user_model

User = get_user_model()


class AuthenticationTests(APITestCase):
    """Test authentication flow including registration, login, logout, and re-login."""
    
    def setUp(self):
        """Set up test data."""
        self.test_email = "testuser@example.com"
        self.test_password = "TestPass123!"
        self.register_url = "/api/v1/accounts/users/register/"
        self.login_url = "/api/v1/token/"
        self.refresh_url = "/api/v1/token/refresh/"
        self.logout_url = "/api/v1/accounts/users/logout/"
        self.me_url = "/api/v1/accounts/users/me/"
    
    def test_user_registration(self):
        """Test user registration returns tokens."""
        data = {
            "email": self.test_email,
            "password": self.test_password,
            "password_confirm": self.test_password,
            "first_name": "Test",
            "last_name": "User"
        }
        response = self.client.post(self.register_url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertIn('tokens', response.data)
        self.assertIn('access', response.data['tokens'])
        self.assertIn('refresh', response.data['tokens'])
        self.assertIn('user', response.data)
        self.assertEqual(response.data['user']['email'], self.test_email)
    
    def test_user_login(self):
        """Test user login with correct credentials."""
        # First create a user
        User.objects.create_user(
            email=self.test_email,
            password=self.test_password
        )
        
        # Login
        data = {
            "email": self.test_email,
            "password": self.test_password
        }
        response = self.client.post(self.login_url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('access', response.data)
        self.assertIn('refresh', response.data)
    
    def test_login_with_wrong_credentials(self):
        """Test login fails with wrong credentials."""
        User.objects.create_user(
            email=self.test_email,
            password=self.test_password
        )
        
        data = {
            "email": self.test_email,
            "password": "wrongpassword"
        }
        response = self.client.post(self.login_url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
    
    def test_logout_blacklists_token(self):
        """Test that logout blacklists the refresh token."""
        # Create user and login
        User.objects.create_user(
            email=self.test_email,
            password=self.test_password
        )
        
        login_response = self.client.post(self.login_url, {
            "email": self.test_email,
            "password": self.test_password
        }, format='json')
        
        access_token = login_response.data['access']
        refresh_token = login_response.data['refresh']
        
        # Logout
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {access_token}')
        logout_response = self.client.post(self.logout_url, {
            "refresh": refresh_token
        }, format='json')
        
        self.assertEqual(logout_response.status_code, status.HTTP_200_OK)
        self.assertEqual(logout_response.data['message'], 'Successfully logged out.')
        
        # Try to use the blacklisted token
        refresh_response = self.client.post(self.refresh_url, {
            "refresh": refresh_token
        }, format='json')
        
        self.assertEqual(refresh_response.status_code, status.HTTP_401_UNAUTHORIZED)
    
    def test_relogin_after_logout(self):
        """Test that user can login again after logout."""
        # Create user and login
        User.objects.create_user(
            email=self.test_email,
            password=self.test_password
        )
        
        # First login
        login_response = self.client.post(self.login_url, {
            "email": self.test_email,
            "password": self.test_password
        }, format='json')
        
        access_token = login_response.data['access']
        refresh_token = login_response.data['refresh']
        
        # Logout
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {access_token}')
        self.client.post(self.logout_url, {"refresh": refresh_token}, format='json')
        
        # Clear credentials and login again
        self.client.credentials()
        relogin_response = self.client.post(self.login_url, {
            "email": self.test_email,
            "password": self.test_password
        }, format='json')
        
        self.assertEqual(relogin_response.status_code, status.HTTP_200_OK)
        self.assertIn('access', relogin_response.data)
        self.assertIn('refresh', relogin_response.data)
    
    def test_token_refresh_blacklists_old_token(self):
        """Test that token refresh blacklists the old refresh token (ROTATE_REFRESH_TOKENS)."""
        # Create user and login
        User.objects.create_user(
            email=self.test_email,
            password=self.test_password
        )
        
        login_response = self.client.post(self.login_url, {
            "email": self.test_email,
            "password": self.test_password
        }, format='json')
        
        old_refresh_token = login_response.data['refresh']
        
        # First refresh - should succeed and return new tokens
        refresh_response = self.client.post(self.refresh_url, {
            "refresh": old_refresh_token
        }, format='json')
        
        self.assertEqual(refresh_response.status_code, status.HTTP_200_OK)
        self.assertIn('access', refresh_response.data)
        
        # Try to use the OLD refresh token again - should fail (blacklisted)
        second_refresh_response = self.client.post(self.refresh_url, {
            "refresh": old_refresh_token
        }, format='json')
        
        self.assertEqual(second_refresh_response.status_code, status.HTTP_401_UNAUTHORIZED)
    
    def test_protected_endpoint_requires_auth(self):
        """Test that protected endpoints require authentication."""
        response = self.client.get(self.me_url)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
    
    def test_protected_endpoint_works_with_valid_token(self):
        """Test that protected endpoints work with valid token."""
        user = User.objects.create_user(
            email=self.test_email,
            password=self.test_password,
            first_name="Test",
            last_name="User"
        )
        
        login_response = self.client.post(self.login_url, {
            "email": self.test_email,
            "password": self.test_password
        }, format='json')
        
        access_token = login_response.data['access']
        
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {access_token}')
        me_response = self.client.get(self.me_url)
        
        self.assertEqual(me_response.status_code, status.HTTP_200_OK)
        self.assertEqual(me_response.data['email'], self.test_email)

