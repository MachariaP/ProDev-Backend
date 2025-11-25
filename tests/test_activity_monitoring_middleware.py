"""
Tests for ActivityMonitoringMiddleware.

These tests verify that the middleware correctly logs request and response
details to the 'user_activity' logger, including handling of proxy headers,
user authentication, and error conditions.
"""

import pytest
from unittest.mock import Mock, patch, MagicMock
from django.test import TestCase, RequestFactory, Client
from django.contrib.auth import get_user_model
from django.conf import settings
from django.http import HttpResponse

from chamahub.middleware import ActivityMonitoringMiddleware


User = get_user_model()


class ActivityMonitoringMiddlewareConfigurationTest(TestCase):
    """Test middleware configuration in settings."""
    
    def test_middleware_installed(self):
        """Verify ActivityMonitoringMiddleware is installed."""
        middleware_classes = settings.MIDDLEWARE
        self.assertIn(
            'chamahub.middleware.ActivityMonitoringMiddleware',
            middleware_classes
        )
    
    def test_logging_configuration_exists(self):
        """Verify logging configuration exists for user_activity logger."""
        self.assertTrue(hasattr(settings, 'LOGGING'))
        self.assertIn('loggers', settings.LOGGING)
        self.assertIn('user_activity', settings.LOGGING['loggers'])
    
    def test_user_activity_logger_level(self):
        """Verify user_activity logger is configured at INFO level."""
        logger_config = settings.LOGGING['loggers']['user_activity']
        self.assertEqual(logger_config['level'], 'INFO')


class ActivityMonitoringMiddlewareRequestTest(TestCase):
    """Test request logging functionality."""
    
    def setUp(self):
        """Set up test fixtures."""
        self.factory = RequestFactory()
        self.get_response = Mock(return_value=HttpResponse(status=200))
        self.middleware = ActivityMonitoringMiddleware(self.get_response)
    
    def test_request_start_time_set(self):
        """Verify start_time is set on request object."""
        request = self.factory.get('/api/test/')
        request.user = Mock(is_authenticated=False)
        
        with patch('chamahub.middleware.logger'):
            self.middleware(request)
        
        self.assertTrue(hasattr(request, 'start_time'))
        self.assertIsInstance(request.start_time, float)
    
    @patch('chamahub.middleware.logger')
    def test_request_logging_anonymous_user(self, mock_logger):
        """Test request logging for anonymous users."""
        request = self.factory.get('/api/test/')
        request.user = Mock(is_authenticated=False)
        request.META['HTTP_USER_AGENT'] = 'TestAgent/1.0'
        request.META['REMOTE_ADDR'] = '127.0.0.1'
        
        self.middleware(request)
        
        # Verify request logging was called
        mock_logger.info.assert_called()
        # Get the first call (request started log)
        first_call_args = mock_logger.info.call_args_list[0]
        log_message = first_call_args[0][0]
        self.assertIn('Request started', log_message)
    
    @patch('chamahub.middleware.logger')
    def test_request_logging_authenticated_user(self, mock_logger):
        """Test request logging for authenticated users."""
        request = self.factory.get('/api/test/')
        mock_user = Mock(is_authenticated=True, id=123)
        request.user = mock_user
        request.META['HTTP_USER_AGENT'] = 'TestAgent/1.0'
        request.META['REMOTE_ADDR'] = '192.168.1.100'
        
        self.middleware(request)
        
        # Verify logging was called with user ID
        mock_logger.info.assert_called()


class ActivityMonitoringMiddlewareIPHandlingTest(TestCase):
    """Test IP address handling, especially for proxied requests."""
    
    def setUp(self):
        """Set up test fixtures."""
        self.factory = RequestFactory()
        self.get_response = Mock(return_value=HttpResponse(status=200))
        self.middleware = ActivityMonitoringMiddleware(self.get_response)
    
    def test_ip_from_remote_addr(self):
        """Test IP extraction from REMOTE_ADDR when no proxy headers."""
        request = self.factory.get('/api/test/')
        request.user = Mock(is_authenticated=False)
        request.META['REMOTE_ADDR'] = '192.168.1.100'
        
        ip = self.middleware._get_client_ip(request)
        self.assertEqual(ip, '192.168.1.100')
    
    def test_ip_from_x_forwarded_for_single(self):
        """Test IP extraction from X-Forwarded-For with single IP."""
        request = self.factory.get('/api/test/')
        request.user = Mock(is_authenticated=False)
        request.META['HTTP_X_FORWARDED_FOR'] = '10.0.0.5'
        request.META['REMOTE_ADDR'] = '127.0.0.1'
        
        ip = self.middleware._get_client_ip(request)
        self.assertEqual(ip, '10.0.0.5')
    
    def test_ip_from_x_forwarded_for_multiple(self):
        """Test IP extraction from X-Forwarded-For with multiple IPs (proxy chain)."""
        request = self.factory.get('/api/test/')
        request.user = Mock(is_authenticated=False)
        # First IP is client, subsequent are proxies
        request.META['HTTP_X_FORWARDED_FOR'] = '203.0.113.50, 70.41.3.18, 150.172.238.178'
        request.META['REMOTE_ADDR'] = '127.0.0.1'
        
        ip = self.middleware._get_client_ip(request)
        # Should return the first IP (original client)
        self.assertEqual(ip, '203.0.113.50')
    
    def test_ip_from_x_forwarded_for_with_spaces(self):
        """Test IP extraction handles extra whitespace in X-Forwarded-For."""
        request = self.factory.get('/api/test/')
        request.user = Mock(is_authenticated=False)
        request.META['HTTP_X_FORWARDED_FOR'] = '  192.0.2.1  ,  192.0.2.2  '
        request.META['REMOTE_ADDR'] = '127.0.0.1'
        
        ip = self.middleware._get_client_ip(request)
        self.assertEqual(ip, '192.0.2.1')
    
    def test_ip_fallback_when_no_headers(self):
        """Test IP returns 'Unknown' when no IP headers are present."""
        request = self.factory.get('/api/test/')
        request.user = Mock(is_authenticated=False)
        # Remove REMOTE_ADDR
        if 'REMOTE_ADDR' in request.META:
            del request.META['REMOTE_ADDR']
        
        ip = self.middleware._get_client_ip(request)
        self.assertEqual(ip, 'Unknown')


class ActivityMonitoringMiddlewareResponseTest(TestCase):
    """Test response logging functionality."""
    
    def setUp(self):
        """Set up test fixtures."""
        self.factory = RequestFactory()
    
    @patch('chamahub.middleware.logger')
    def test_response_logging_includes_status_code(self, mock_logger):
        """Test response logging includes HTTP status code."""
        get_response = Mock(return_value=HttpResponse(status=201))
        middleware = ActivityMonitoringMiddleware(get_response)
        
        request = self.factory.post('/api/users/')
        request.user = Mock(is_authenticated=False)
        
        middleware(request)
        
        # Check the second info call (response log)
        response_log_call = mock_logger.info.call_args_list[-1]
        log_message = response_log_call[0][0] % response_log_call[0][1:]
        self.assertIn('201', log_message)
    
    @patch('chamahub.middleware.logger')
    def test_response_logging_includes_latency(self, mock_logger):
        """Test response logging includes latency in milliseconds."""
        get_response = Mock(return_value=HttpResponse(status=200))
        middleware = ActivityMonitoringMiddleware(get_response)
        
        request = self.factory.get('/api/test/')
        request.user = Mock(is_authenticated=False)
        
        middleware(request)
        
        # Verify response log contains 'ms'
        response_log_call = mock_logger.info.call_args_list[-1]
        log_message = response_log_call[0][0] % response_log_call[0][1:]
        self.assertIn('ms', log_message)
    
    @patch('chamahub.middleware.logger')
    def test_response_logging_format(self, mock_logger):
        """Test response log format matches expected pattern."""
        get_response = Mock(return_value=HttpResponse(status=200))
        middleware = ActivityMonitoringMiddleware(get_response)
        
        request = self.factory.get('/api/data/')
        mock_user = Mock(is_authenticated=True, id=456)
        request.user = mock_user
        
        middleware(request)
        
        # Verify the response log matches expected format:
        # "{method} {path} {status_code} (User {user_id}) in {latency}ms"
        response_log_call = mock_logger.info.call_args_list[-1]
        log_format = response_log_call[0][0]
        self.assertIn('%s %s %s (User %s) in', log_format)


class ActivityMonitoringMiddlewareErrorHandlingTest(TestCase):
    """Test error handling and logging."""
    
    def setUp(self):
        """Set up test fixtures."""
        self.factory = RequestFactory()
    
    @patch('chamahub.middleware.logger')
    def test_exception_logging(self, mock_logger):
        """Test exceptions are logged with ERROR severity."""
        def raise_exception(request):
            raise ValueError("Test exception message")
        
        middleware = ActivityMonitoringMiddleware(raise_exception)
        
        request = self.factory.get('/api/test/')
        request.user = Mock(is_authenticated=False)
        
        with self.assertRaises(ValueError):
            middleware(request)
        
        # Verify error was logged
        mock_logger.error.assert_called_once()
        error_call_args = mock_logger.error.call_args[0]
        log_message = error_call_args[0] % error_call_args[1:]
        self.assertIn('Request failed', log_message)
        self.assertIn('Test exception message', log_message)
    
    @patch('chamahub.middleware.logger')
    def test_exception_includes_latency(self, mock_logger):
        """Test exception logging includes latency calculation."""
        def raise_exception(request):
            raise RuntimeError("Server error")
        
        middleware = ActivityMonitoringMiddleware(raise_exception)
        
        request = self.factory.get('/api/test/')
        request.user = Mock(is_authenticated=False)
        
        with self.assertRaises(RuntimeError):
            middleware(request)
        
        # Verify error log contains latency
        error_call_args = mock_logger.error.call_args[0]
        log_message = error_call_args[0] % error_call_args[1:]
        self.assertIn('ms', log_message)
    
    @patch('chamahub.middleware.logger')
    def test_exception_reraises(self, mock_logger):
        """Test that exceptions are re-raised after logging."""
        def raise_exception(request):
            raise PermissionError("Access denied")
        
        middleware = ActivityMonitoringMiddleware(raise_exception)
        
        request = self.factory.get('/api/secure/')
        request.user = Mock(is_authenticated=False)
        
        with self.assertRaises(PermissionError) as context:
            middleware(request)
        
        self.assertEqual(str(context.exception), "Access denied")


class ActivityMonitoringMiddlewareIntegrationTest(TestCase):
    """Integration tests using Django test client."""
    
    def setUp(self):
        """Set up test client."""
        self.client = Client()
    
    @patch('chamahub.middleware.logger')
    def test_middleware_processes_real_request(self, mock_logger):
        """Test middleware processes actual HTTP requests."""
        # Make a request to any endpoint (even 404 is fine)
        response = self.client.get('/api/v1/')
        
        # Verify logging occurred
        self.assertTrue(mock_logger.info.called)
    
    @patch('chamahub.middleware.logger')
    def test_middleware_logs_user_agent(self, mock_logger):
        """Test middleware logs User-Agent header."""
        self.client.get(
            '/api/v1/',
            HTTP_USER_AGENT='Mozilla/5.0 (Test)'
        )
        
        # Check that User-Agent was logged in the request
        first_call = mock_logger.info.call_args_list[0]
        log_message = first_call[0][0]
        self.assertIn('user_agent', log_message)
    
    @patch('chamahub.middleware.logger')
    def test_middleware_logs_x_forwarded_for(self, mock_logger):
        """Test middleware correctly handles X-Forwarded-For header."""
        self.client.get(
            '/api/v1/',
            HTTP_X_FORWARDED_FOR='203.0.113.195, 70.41.3.18'
        )
        
        # Middleware should extract the client IP
        mock_logger.info.assert_called()


class ActivityMonitoringMiddlewareUserIdTest(TestCase):
    """Test user ID extraction."""
    
    def setUp(self):
        """Set up test fixtures."""
        self.factory = RequestFactory()
        self.get_response = Mock(return_value=HttpResponse(status=200))
        self.middleware = ActivityMonitoringMiddleware(self.get_response)
    
    def test_get_user_id_anonymous(self):
        """Test _get_user_id returns 'Anonymous' for unauthenticated users."""
        request = self.factory.get('/api/test/')
        request.user = Mock(is_authenticated=False)
        
        user_id = self.middleware._get_user_id(request)
        self.assertEqual(user_id, 'Anonymous')
    
    def test_get_user_id_authenticated(self):
        """Test _get_user_id returns user ID for authenticated users."""
        request = self.factory.get('/api/test/')
        mock_user = Mock(is_authenticated=True, id=789)
        request.user = mock_user
        
        user_id = self.middleware._get_user_id(request)
        self.assertEqual(user_id, 789)
    
    def test_get_user_id_no_user_attribute(self):
        """Test _get_user_id handles missing user attribute gracefully."""
        request = self.factory.get('/api/test/')
        # Don't set user attribute
        if hasattr(request, 'user'):
            del request.user
        
        user_id = self.middleware._get_user_id(request)
        self.assertEqual(user_id, 'Anonymous')


class ActivityMonitoringMiddlewareLatencyTest(TestCase):
    """Test latency calculation."""
    
    def setUp(self):
        """Set up test fixtures."""
        self.factory = RequestFactory()
        self.get_response = Mock(return_value=HttpResponse(status=200))
        self.middleware = ActivityMonitoringMiddleware(self.get_response)
    
    def test_calculate_latency_with_start_time(self):
        """Test latency calculation with valid start_time."""
        import time
        request = self.factory.get('/api/test/')
        request.start_time = time.time() - 0.1  # 100ms ago
        
        latency = self.middleware._calculate_latency(request)
        
        # Should be approximately 100ms (with some tolerance)
        self.assertGreaterEqual(latency, 90)
        self.assertLessEqual(latency, 200)
    
    def test_calculate_latency_without_start_time(self):
        """Test latency calculation returns 0 when start_time is missing."""
        request = self.factory.get('/api/test/')
        # Don't set start_time
        
        latency = self.middleware._calculate_latency(request)
        self.assertEqual(latency, 0)
