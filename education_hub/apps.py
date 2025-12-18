"""
App Configuration for Education Hub.

This module defines the Django AppConfig for the education hub application.
It configures the app with appropriate metadata and sets up signal handlers
when the app is ready.
"""

from django.apps import AppConfig


class EducationHubConfig(AppConfig):
    """
    AppConfig for Education Hub application.
    
    Attributes:
        default_auto_field: Default primary key field type
        name: Application name
    """
    
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'education_hub'
    
    def ready(self):
        """
        Initialize the app when it's ready.
        
        This method is called when Django starts. It imports signals
        to ensure they are registered and active.
        """
        import education_hub.signals  # noqa: F401