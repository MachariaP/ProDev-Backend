from django.apps import AppConfig


class NotificationsConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'notifications'
    
    def ready(self):
        """Import signals when app is ready"""
        # Import signals module to register signal handlers
        try:
            import notifications.signals
        except ImportError:
            # Signals module might not exist yet, which is fine
            pass
