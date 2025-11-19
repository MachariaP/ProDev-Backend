"""
Test for backward-compatible URL patterns
"""
from django.test import TestCase, Client
from django.urls import reverse, resolve
import json


class BackwardCompatibleURLTest(TestCase):
    """Test that both old and new URL patterns work."""
    
    def setUp(self):
        """Set up test client."""
        self.client = Client()
        
    def test_old_url_pattern_resolves(self):
        """Test that /accounts/users/register/ resolves correctly."""
        match = resolve('/accounts/users/register/')
        self.assertEqual(match.view_name, 'user-register')
        
    def test_new_url_pattern_resolves(self):
        """Test that /api/v1/accounts/users/register/ resolves correctly."""
        match = resolve('/api/v1/accounts/users/register/')
        self.assertEqual(match.view_name, 'user-register')
        
    def test_old_url_registration_endpoint(self):
        """Test that POST to /accounts/users/register/ routes correctly (not 404)."""
        data = {
            'email': 'test@example.com',
            'password': 'TestPass123!',
            'first_name': 'Test',
            'last_name': 'User',
            'phone_number': '+254712345678'
        }
        
        response = self.client.post(
            '/accounts/users/register/',
            data=json.dumps(data),
            content_type='application/json'
        )
        
        # Should NOT return 404 (route exists)
        # May return 400 (validation error) or 201 (success) but not 404
        self.assertNotEqual(response.status_code, 404)
        
    def test_new_url_registration_endpoint(self):
        """Test that POST to /api/v1/accounts/users/register/ routes correctly (not 404)."""
        data = {
            'email': 'test2@example.com',
            'password': 'TestPass123!',
            'first_name': 'Test2',
            'last_name': 'User2',
            'phone_number': '+254712345679'
        }
        
        response = self.client.post(
            '/api/v1/accounts/users/register/',
            data=json.dumps(data),
            content_type='application/json'
        )
        
        # Should NOT return 404 (route exists)
        # May return 400 (validation error) or 201 (success) but not 404
        self.assertNotEqual(response.status_code, 404)
        
    def test_both_urls_point_to_same_view(self):
        """Test that both URLs resolve to the same view function."""
        old_match = resolve('/accounts/users/register/')
        new_match = resolve('/api/v1/accounts/users/register/')
        
        # They should resolve to the same view function
        self.assertEqual(old_match.func.__name__, new_match.func.__name__)
        self.assertEqual(old_match.view_name, new_match.view_name)


class AllBackwardCompatibleURLsTest(TestCase):
    """Test all backward-compatible URL patterns."""
    
    def test_accounts_urls(self):
        """Test accounts app URLs are accessible both ways."""
        urls = [
            ('/accounts/users/', '/api/v1/accounts/users/'),
            ('/accounts/wallets/', '/api/v1/accounts/wallets/'),
        ]
        
        for old_url, new_url in urls:
            with self.subTest(old_url=old_url, new_url=new_url):
                old_match = resolve(old_url)
                new_match = resolve(new_url)
                # Both should resolve successfully
                self.assertIsNotNone(old_match)
                self.assertIsNotNone(new_match)
                # And to the same view
                self.assertEqual(old_match.view_name, new_match.view_name)
                
    def test_groups_urls(self):
        """Test groups app URLs are accessible both ways."""
        urls = [
            ('/groups/chama-groups/', '/api/v1/groups/chama-groups/'),
            ('/groups/memberships/', '/api/v1/groups/memberships/'),
        ]
        
        for old_url, new_url in urls:
            with self.subTest(old_url=old_url, new_url=new_url):
                old_match = resolve(old_url)
                new_match = resolve(new_url)
                self.assertIsNotNone(old_match)
                self.assertIsNotNone(new_match)
                self.assertEqual(old_match.view_name, new_match.view_name)
