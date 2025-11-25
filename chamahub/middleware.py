"""
Activity Monitoring Middleware

This middleware logs critical details of every user request and response
to the 'user_activity' logger. It captures request metadata including
timestamp, HTTP method, path, user agent, IP address, and user ID.
For responses, it logs status code and processing latency.
"""

import logging
import time
from datetime import datetime


# Get the user_activity logger
logger = logging.getLogger('user_activity')


class ActivityMonitoringMiddleware:
    """
    Class-based middleware to monitor and log user activity.
    
    This middleware:
    1. Logs incoming request details (timestamp, method, path, user_agent, ip_address, user_id)
    2. Logs response details (status_code, latency_ms)
    3. Handles errors by logging with ERROR severity
    
    The middleware follows Django's class-based middleware pattern using __init__ and __call__.
    """
    
    def __init__(self, get_response):
        """
        Initialize the middleware with the get_response callable.
        
        Args:
            get_response: A callable that takes a request and returns a response.
        """
        self.get_response = get_response
    
    def __call__(self, request):
        """
        Process the request and response, logging activity details.
        
        Args:
            request: The incoming HTTP request object.
            
        Returns:
            The HTTP response object.
        """
        # Store start time in the request object for later latency calculation
        request.start_time = time.time()
        
        # Get request details
        timestamp = datetime.now().isoformat()
        method = request.method
        path = request.get_full_path()
        user_agent = request.META.get('HTTP_USER_AGENT', 'Unknown')
        ip_address = self._get_client_ip(request)
        user_id = self._get_user_id(request)
        
        # Log the incoming request
        logger.info(
            "Request started: timestamp=%s method=%s path=%s user_agent=%s ip_address=%s user_id=%s",
            timestamp, method, path, user_agent, ip_address, user_id
        )
        
        try:
            # Get the response from the view
            response = self.get_response(request)
            
            # Calculate latency
            latency_ms = self._calculate_latency(request)
            
            # Re-fetch user_id in case authentication happened during request processing
            user_id = self._get_user_id(request)
            
            # Log the response
            logger.info(
                "%s %s %s (User %s) in %.0fms",
                method, path, response.status_code, user_id, latency_ms
            )
            
            return response
            
        except Exception as e:
            # Calculate latency even for exceptions
            latency_ms = self._calculate_latency(request)
            
            # Log the error with ERROR severity
            logger.error(
                "Request failed: %s %s (User %s) in %.0fms - Exception: %s",
                method, path, user_id, latency_ms, str(e)
            )
            
            # Re-raise the exception so Django can handle it
            raise
    
    def _get_client_ip(self, request):
        """
        Get the client IP address, handling proxy servers.
        
        IP Address Handling:
        - First, check 'HTTP_X_FORWARDED_FOR' header which is set by proxies/load balancers.
          This header can contain multiple IPs (client, proxy1, proxy2, ...).
          The first IP in the list is the original client IP.
        - If 'HTTP_X_FORWARDED_FOR' is not present, fall back to 'REMOTE_ADDR'
          which is the direct connection IP (may be the proxy IP if behind a proxy).
        
        Args:
            request: The HTTP request object.
            
        Returns:
            The client IP address as a string.
        """
        x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded_for:
            # Take the first IP from the comma-separated list
            # This is the original client IP
            ip = x_forwarded_for.split(',')[0].strip()
        else:
            # Fall back to REMOTE_ADDR if no proxy header
            ip = request.META.get('REMOTE_ADDR', 'Unknown')
        return ip
    
    def _get_user_id(self, request):
        """
        Get the user ID from the request.
        
        Args:
            request: The HTTP request object.
            
        Returns:
            The user ID if authenticated, otherwise 'Anonymous'.
        """
        if hasattr(request, 'user') and request.user.is_authenticated:
            return request.user.id
        return 'Anonymous'
    
    def _calculate_latency(self, request):
        """
        Calculate the request processing latency in milliseconds.
        
        Args:
            request: The HTTP request object with start_time attribute.
            
        Returns:
            The latency in milliseconds.
        """
        if hasattr(request, 'start_time'):
            return (time.time() - request.start_time) * 1000
        return 0
