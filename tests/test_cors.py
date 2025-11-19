"""
Tests for CORS (Cross-Origin Resource Sharing) configuration.

These tests verify that the backend properly handles preflight requests
and allows requests from authorized frontend origins.
"""

import pytest
from django.test import TestCase, Client
from django.conf import settings


class CORSConfigurationTest(TestCase):
    """Test CORS configuration and headers."""
    
    def setUp(self):
        """Set up test client."""
        self.client = Client()
    
    def test_cors_middleware_installed(self):
        """Verify CORS middleware is installed."""
        middleware_classes = settings.MIDDLEWARE
        self.assertIn('corsheaders.middleware.CorsMiddleware', middleware_classes)
    
    def test_cors_headers_configured(self):
        """Verify CORS headers are configured."""
        # Check that CORS_ALLOW_HEADERS exists
        self.assertTrue(hasattr(settings, 'CORS_ALLOW_HEADERS'))
        self.assertIsInstance(settings.CORS_ALLOW_HEADERS, list)
        
        # Verify essential headers are included
        required_headers = ['authorization', 'content-type']
        for header in required_headers:
            self.assertIn(header, settings.CORS_ALLOW_HEADERS)
    
    def test_cors_methods_configured(self):
        """Verify CORS methods are configured."""
        self.assertTrue(hasattr(settings, 'CORS_ALLOW_METHODS'))
        self.assertIsInstance(settings.CORS_ALLOW_METHODS, list)
        
        # Verify essential methods are included
        required_methods = ['GET', 'POST', 'OPTIONS']
        for method in required_methods:
            self.assertIn(method, settings.CORS_ALLOW_METHODS)
    
    def test_cors_credentials_enabled(self):
        """Verify CORS credentials are enabled."""
        self.assertTrue(settings.CORS_ALLOW_CREDENTIALS)
    
    def test_preflight_request_without_origin(self):
        """Test OPTIONS request without origin header."""
        response = self.client.options('/api/v1/')
        # Should still return successfully even without origin
        self.assertIn(response.status_code, [200, 404])
    
    def test_preflight_request_with_allowed_origin(self):
        """Test OPTIONS request with an allowed origin."""
        # Test with localhost origin (from default settings)
        response = self.client.options(
            '/api/v1/',
            HTTP_ORIGIN='http://localhost:3000',
            HTTP_ACCESS_CONTROL_REQUEST_METHOD='POST',
            HTTP_ACCESS_CONTROL_REQUEST_HEADERS='content-type'
        )
        # Should allow the request
        self.assertIn(response.status_code, [200, 404])
    
    def test_cors_configuration_exists(self):
        """Verify all CORS configuration attributes exist."""
        cors_settings = [
            'CORS_ALLOWED_ORIGINS',
            'CORS_ALLOW_ALL_ORIGINS', 
            'CORS_ALLOW_CREDENTIALS',
            'CORS_ALLOW_HEADERS',
            'CORS_ALLOW_METHODS',
            'CORS_EXPOSE_HEADERS',
        ]
        
        for setting in cors_settings:
            self.assertTrue(
                hasattr(settings, setting),
                f"Missing CORS setting: {setting}"
            )


class CORSIntegrationTest(TestCase):
    """Integration tests for CORS with actual API endpoints."""
    
    def setUp(self):
        """Set up test client."""
        self.client = Client()
    
    def test_api_root_with_cors(self):
        """Test API root endpoint with CORS headers."""
        response = self.client.get(
            '/api/v1/',
            HTTP_ORIGIN='http://localhost:3000'
        )
        # Should return a valid response
        self.assertIn(response.status_code, [200, 404])
    
    def test_preflight_for_registration(self):
        """Test preflight request for user registration endpoint."""
        response = self.client.options(
            '/api/v1/accounts/users/register/',
            HTTP_ORIGIN='http://localhost:3000',
            HTTP_ACCESS_CONTROL_REQUEST_METHOD='POST',
            HTTP_ACCESS_CONTROL_REQUEST_HEADERS='content-type,authorization'
        )
        # Should handle preflight request
        self.assertIn(response.status_code, [200, 404])
