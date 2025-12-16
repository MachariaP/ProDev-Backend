"""
App configuration for M-Pesa integration.
"""
from django.apps import AppConfig


class MpesaIntegrationConfig(AppConfig):
    """Configuration for M-Pesa integration app."""
    
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'mpesa_integration'
    verbose_name = 'M-Pesa Integration'
    
    def ready(self):
        """Initialize app when ready."""
        # Import signals
        try:
            import mpesa_integration.signals  # noqa: F401
        except ImportError:
            pass
