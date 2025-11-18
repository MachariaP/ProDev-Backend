from django.db import models
from django.conf import settings
from django.utils.translation import gettext_lazy as _


class ExternalAPIConnection(models.Model):
    """External API service connections."""
    
    SERVICE_TYPE_CHOICES = [
        ('BANK', 'Banking API'),
        ('CREDIT_BUREAU', 'Credit Bureau'),
        ('GOVERNMENT', 'Government Registry'),
        ('PAYMENT_GATEWAY', 'Payment Gateway'),
        ('OTHER', 'Other Service'),
    ]
    
    STATUS_CHOICES = [
        ('ACTIVE', 'Active'),
        ('INACTIVE', 'Inactive'),
        ('ERROR', 'Error'),
        ('SUSPENDED', 'Suspended'),
    ]
    
    name = models.CharField(_('name'), max_length=200)
    service_type = models.CharField(_('service type'), max_length=30, choices=SERVICE_TYPE_CHOICES)
    api_endpoint = models.URLField(_('API endpoint'))
    
    api_key = models.CharField(_('API key'), max_length=500, blank=True)
    credentials = models.JSONField(_('credentials'), default=dict, help_text=_('Encrypted credentials'))
    
    status = models.CharField(_('status'), max_length=20, choices=STATUS_CHOICES, default='ACTIVE')
    health_check_url = models.URLField(_('health check URL'), blank=True)
    last_health_check = models.DateTimeField(_('last health check'), blank=True, null=True)
    
    rate_limit_per_minute = models.PositiveIntegerField(_('rate limit per minute'), default=60)
    
    created_at = models.DateTimeField(_('created at'), auto_now_add=True)
    updated_at = models.DateTimeField(_('updated at'), auto_now=True)
    
    class Meta:
        verbose_name = _('external API connection')
        verbose_name_plural = _('external API connections')
        ordering = ['name']
    
    def __str__(self):
        return f"{self.name} ({self.service_type})"


class APIRequest(models.Model):
    """Log of API requests to external services."""
    
    STATUS_CHOICES = [
        ('SUCCESS', 'Success'),
        ('FAILED', 'Failed'),
        ('TIMEOUT', 'Timeout'),
        ('RATE_LIMITED', 'Rate Limited'),
    ]
    
    connection = models.ForeignKey(ExternalAPIConnection, on_delete=models.CASCADE, related_name='api_requests')
    endpoint = models.CharField(_('endpoint'), max_length=500)
    method = models.CharField(_('method'), max_length=10)
    
    request_data = models.JSONField(_('request data'), blank=True, null=True)
    response_data = models.JSONField(_('response data'), blank=True, null=True)
    
    status = models.CharField(_('status'), max_length=20, choices=STATUS_CHOICES)
    status_code = models.PositiveIntegerField(_('status code'), null=True, blank=True)
    response_time_ms = models.PositiveIntegerField(_('response time (ms)'), null=True, blank=True)
    
    error_message = models.TextField(_('error message'), blank=True)
    
    requested_at = models.DateTimeField(_('requested at'), auto_now_add=True)
    
    class Meta:
        verbose_name = _('API request')
        verbose_name_plural = _('API requests')
        ordering = ['-requested_at']
    
    def __str__(self):
        return f"{self.connection.name} - {self.method} {self.endpoint} - {self.status}"


class WebhookEndpoint(models.Model):
    """Webhook management."""
    
    STATUS_CHOICES = [
        ('ACTIVE', 'Active'),
        ('INACTIVE', 'Inactive'),
        ('FAILED', 'Failed'),
    ]
    
    name = models.CharField(_('name'), max_length=200)
    url = models.URLField(_('URL'))
    secret = models.CharField(_('secret'), max_length=100, help_text=_('Webhook signature secret'))
    
    events = models.JSONField(_('events'), help_text=_('List of events to subscribe to'))
    headers = models.JSONField(_('headers'), default=dict, blank=True)
    
    status = models.CharField(_('status'), max_length=20, choices=STATUS_CHOICES, default='ACTIVE')
    retry_count = models.PositiveIntegerField(_('retry count'), default=3)
    
    last_triggered_at = models.DateTimeField(_('last triggered at'), blank=True, null=True)
    success_count = models.PositiveIntegerField(_('success count'), default=0)
    failure_count = models.PositiveIntegerField(_('failure count'), default=0)
    
    created_at = models.DateTimeField(_('created at'), auto_now_add=True)
    
    class Meta:
        verbose_name = _('webhook endpoint')
        verbose_name_plural = _('webhook endpoints')
        ordering = ['name']
    
    def __str__(self):
        return f"{self.name} - {self.url}"
