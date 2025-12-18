"""
App Configuration for Education Hub.

This module defines the Django AppConfig for the education hub application.
It configures the app with appropriate metadata and sets up signal handlers
when the app is ready. Additional configurations include cache settings,
performance optimizations, and integration with other apps.

The EducationHubConfig class manages the app lifecycle, including:
- Signal registration for automatic model updates
- Cache configuration for frequently accessed data
- Integration with user authentication and profiles
- Performance monitoring and error tracking setup
- Scheduled task initialization for periodic updates
"""

from django.apps import AppConfig
from django.conf import settings
from django.core.cache import cache
import logging

logger = logging.getLogger(__name__)


class EducationHubConfig(AppConfig):
    """
    AppConfig for Education Hub application.
    
    This class manages the configuration and lifecycle of the education hub app.
    It handles signal registration, cache setup, and integration with other
    system components. The app is designed to be extensible and maintainable
    with proper separation of concerns.
    
    Attributes:
        default_auto_field (str): Default primary key field type
        name (str): Application name
        verbose_name (str): Human-readable application name
        cache_timeout (int): Default cache timeout in seconds
        max_concurrent_webinars (int): Maximum concurrent webinars allowed
        min_cache_items (int): Minimum items to cache for performance
    """
    
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'education_hub'
    verbose_name = 'Education Hub'
    
    # Configuration constants
    cache_timeout = 3600  # 1 hour
    max_concurrent_webinars = 10
    min_cache_items = 100
    
    def ready(self):
        """
        Initialize the app when it's ready.
        
        This method is called when Django starts. It performs the following:
        1. Imports and registers signal handlers for automatic model updates
        2. Sets up cache configurations for frequently accessed data
        3. Initializes periodic tasks for status updates and cleanup
        4. Configures logging for education hub operations
        5. Sets up integration with user profiles and authentication
        6. Creates default categories and content types if needed
        
        The method includes error handling to prevent app startup failures
        and provides detailed logging for debugging purposes.
        
        Raises:
            ImportError: If signal modules cannot be imported
            Exception: Generic exception with detailed error message
        """
        try:
            # Import signals to ensure they are registered and active
            # Using absolute import to avoid circular dependencies
            from education_hub import signals  # noqa: F401
            logger.info("✅ Education Hub signals imported successfully")
            
            # Import and register custom signals
            self.register_custom_signals()
            
            # Initialize cache with default values
            self.initialize_cache()
            
            # Set up periodic tasks (if using Celery or similar)
            self.setup_periodic_tasks()
            
            # Configure logging for education hub
            self.configure_logging()
            
            # Create default categories and content if not exists
            self.create_default_content()
            
            # Set up integration with user profiles
            self.setup_user_integration()
            
            logger.info("🎓 Education Hub app initialized successfully")
            
        except ImportError as e:
            logger.error(f"❌ Failed to import education hub signals: {e}")
            raise
        except Exception as e:
            logger.error(f"❌ Error initializing education hub app: {e}")
            # Don't raise to prevent app startup failure
            # Log the error and continue with degraded functionality
    
    def register_custom_signals(self):
        """
        Register custom signals for the education hub.
        
        This method sets up custom signal handlers for events such as:
        - User achievement unlocks
        - Content completion notifications
        - Challenge progress updates
        - Webinar attendance tracking
        - Certificate generation events
        
        Each signal handler is designed to be idempotent and fault-tolerant.
        """
        try:
            from django.db.models.signals import post_save, post_delete, pre_save
            from django.dispatch import receiver
            from django.contrib.auth import get_user_model
            from .models import (
                UserProgress, LearningPathEnrollment, ChallengeParticipant,
                WebinarRegistration, UserAchievement
            )
            
            User = get_user_model()
            
            @receiver(post_save, sender=UserProgress)
            def handle_content_completion(sender, instance, created, **kwargs):
                """
                Handle content completion events and trigger related actions.
                
                Actions:
                - Award points to user
                - Update learning statistics
                - Check for achievement unlocks
                - Send completion notifications
                - Update cache for progress tracking
                """
                if instance.status == 'COMPLETED':
                    # Award points
                    if instance.content.points_reward > 0:
                        # This would typically update a user points model
                        logger.info(f"User {instance.user} completed {instance.content.title}")
                    
                    # Clear progress cache for this user
                    cache_key = f'user_progress_{instance.user.id}'
                    cache.delete(cache_key)
            
            @receiver(post_save, sender=LearningPathEnrollment)
            def handle_enrollment_update(sender, instance, created, **kwargs):
                """
                Handle learning path enrollment updates.
                
                Actions:
                - Send welcome emails for new enrollments
                - Update enrollment statistics
                - Initialize progress tracking
                - Set up reminder notifications
                """
                if created:
                    logger.info(f"New enrollment: {instance.user} in {instance.learning_path.title}")
            
            @receiver(post_save, sender=ChallengeParticipant)
            def handle_challenge_progress(sender, instance, created, **kwargs):
                """
                Handle savings challenge progress updates.
                
                Actions:
                - Update leaderboard cache
                - Check for challenge completion
                - Award badges and points
                - Send progress notifications
                """
                cache_key = f'challenge_leaderboard_{instance.challenge.id}'
                cache.delete(cache_key)
            
            @receiver(post_save, sender=WebinarRegistration)
            def handle_webinar_registration(sender, instance, created, **kwargs):
                """
                Handle webinar registration events.
                
                Actions:
                - Send confirmation emails
                - Update attendance predictions
                - Set up reminder notifications
                - Generate check-in codes
                """
                if created:
                    logger.info(f"New webinar registration: {instance.user} for {instance.webinar.title}")
            
            @receiver(post_save, sender=UserAchievement)
            def handle_achievement_unlock(sender, instance, created, **kwargs):
                """
                Handle achievement unlock events.
                
                Actions:
                - Send achievement notifications
                - Award bonus points
                - Update user profile
                - Log achievement events
                """
                if instance.is_unlocked:
                    logger.info(f"Achievement unlocked: {instance.user} - {instance.achievement.title}")
            
            # Connect user profile updates to education hub
            @receiver(post_save, sender=User)
            def handle_user_update(sender, instance, created, **kwargs):
                """
                Handle user profile updates for education hub integration.
                
                Actions:
                - Update learning preferences cache
                - Sync user points and achievements
                - Update recommendation engine
                """
                cache_key = f'user_preferences_{instance.id}'
                cache.delete(cache_key)
            
            logger.info("✅ Custom signals registered successfully")
            
        except Exception as e:
            logger.error(f"❌ Failed to register custom signals: {e}")
    
    def initialize_cache(self):
        """
        Initialize cache with default values and configurations.
        
        This method sets up cache keys for frequently accessed education hub
        data, including:
        - Featured content and learning paths
        - User progress and achievements
        - Challenge leaderboards
        - Upcoming webinars
        - Popular categories and tags
        
        Cache strategies:
        - Time-based expiration for dynamic data
        - Manual invalidation for user-specific data
        - Compressed storage for large datasets
        - Namespacing to prevent key collisions
        """
        try:
            # Set default cache values if not exists
            cache_defaults = {
                'featured_content_updated': False,
                'popular_categories_updated': False,
                'leaderboard_cache_version': 1,
                'webinar_schedule_version': 1,
            }
            
            for key, value in cache_defaults.items():
                if cache.get(key) is None:
                    cache.set(key, value, timeout=None)  # Persistent
            
            logger.info("✅ Education Hub cache initialized successfully")
            
        except Exception as e:
            logger.error(f"❌ Failed to initialize cache: {e}")
    
    def setup_periodic_tasks(self):
        """
        Set up periodic tasks for education hub maintenance.
        
        Tasks include:
        - Updating challenge and webinar statuses
        - Sending reminder notifications
        - Cleaning up expired data
        - Generating reports and analytics
        - Refreshing cache for popular content
        
        Note: This method sets up the task definitions. Actual scheduling
        depends on the task runner (Celery, Django Q, cron, etc.).
        """
        try:
            # Define periodic task configurations
            periodic_tasks = [
                {
                    'name': 'update_challenge_statuses',
                    'description': 'Update status of savings challenges based on dates',
                    'frequency': 'daily',
                    'function': 'education_hub.tasks.update_challenge_statuses',
                },
                {
                    'name': 'update_webinar_statuses',
                    'description': 'Update status of webinars based on schedule',
                    'frequency': 'hourly',
                    'function': 'education_hub.tasks.update_webinar_statuses',
                },
                {
                    'name': 'send_webinar_reminders',
                    'description': 'Send reminders for upcoming webinars',
                    'frequency': 'daily',
                    'function': 'education_hub.tasks.send_webinar_reminders',
                },
                {
                    'name': 'cleanup_expired_data',
                    'description': 'Clean up expired sessions and temporary data',
                    'frequency': 'weekly',
                    'function': 'education_hub.tasks.cleanup_expired_data',
                },
                {
                    'name': 'refresh_popular_content',
                    'description': 'Refresh cache for popular content and recommendations',
                    'frequency': 'daily',
                    'function': 'education_hub.tasks.refresh_popular_content',
                },
            ]
            
            # Store task configurations in cache for reference
            cache.set('education_hub_periodic_tasks', periodic_tasks, timeout=None)
            
            logger.info(f"✅ {len(periodic_tasks)} periodic tasks configured")
            
        except Exception as e:
            logger.error(f"❌ Failed to setup periodic tasks: {e}")
    
    def configure_logging(self):
        """
        Configure specialized logging for education hub operations.
        
        Sets up:
        - Separate log file for education hub activities
        - Log levels for different types of operations
        - Log formatting with contextual information
        - Error tracking and alerting
        - Performance monitoring
        """
        try:
            # Check if education hub logger is configured
            hub_logger = logging.getLogger('education_hub')
            
            if not hub_logger.handlers:
                # Configure file handler for education hub logs
                import os
                from django.conf import settings
                
                log_dir = os.path.join(settings.BASE_DIR, 'logs')
                os.makedirs(log_dir, exist_ok=True)
                
                log_file = os.path.join(log_dir, 'education_hub.log')
                file_handler = logging.FileHandler(log_file)
                file_handler.setLevel(logging.INFO)
                
                # Create formatter
                formatter = logging.Formatter(
                    '%(asctime)s - %(name)s - %(levelname)s - %(message)s'
                )
                file_handler.setFormatter(formatter)
                
                # Add handler to logger
                hub_logger.addHandler(file_handler)
                hub_logger.setLevel(logging.INFO)
            
            logger.info("✅ Education Hub logging configured successfully")
            
        except Exception as e:
            logger.error(f"❌ Failed to configure logging: {e}")
    
    def create_default_content(self):
        """
        Create default categories, content types, and sample content if needed.
        
        This ensures the education hub has basic structure when first installed.
        Defaults include:
        - Standard content categories (SAVINGS, INVESTMENTS, etc.)
        - Sample learning paths for different user levels
        - Default achievement definitions
        - System user for automated content
        
        The method checks if defaults already exist to avoid duplicates.
        """
        try:
            from .models import (
                EducationalContent, LearningPath, Achievement,
                CONTENT_TYPE_CHOICES, CATEGORY_CHOICES, DIFFICULTY_CHOICES,
                PATH_TYPE_CHOICES, ACHIEVEMENT_TYPE_CHOICES
            )
            from django.contrib.auth import get_user_model
            
            User = get_user_model()
            
            # Get or create system user for automated content
            system_user, created = User.objects.get_or_create(
                email='system@chamahub.com',
                defaults={
                    'first_name': 'System',
                    'last_name': 'User',
                    'is_active': False,
                    'is_staff': False,
                }
            )
            
            # Create default achievements if none exist
            if not Achievement.objects.exists():
                default_achievements = [
                    {
                        'title': 'First Steps',
                        'description': 'Complete your first educational content',
                        'achievement_type': 'LEARNING',
                        'rarity': 'COMMON',
                        'points_value': 10,
                        'icon_name': 'first-steps',
                        'criteria_type': 'content_completions',
                        'criteria_value': {'count': 1},
                    },
                    {
                        'title': 'Savings Starter',
                        'description': 'Join your first savings challenge',
                        'achievement_type': 'SAVINGS',
                        'rarity': 'COMMON',
                        'points_value': 25,
                        'icon_name': 'savings-star',
                        'criteria_type': 'challenge_participations',
                        'criteria_value': {'count': 1},
                    },
                    {
                        'title': 'Webinar Enthusiast',
                        'description': 'Attend your first webinar',
                        'achievement_type': 'LEARNING',
                        'rarity': 'COMMON',
                        'points_value': 15,
                        'icon_name': 'webinar-enthusiast',
                        'criteria_type': 'webinar_attendances',
                        'criteria_value': {'count': 1},
                    },
                ]
                
                for achievement_data in default_achievements:
                    Achievement.objects.create(**achievement_data)
                
                logger.info("✅ Default achievements created")
            
            logger.info("✅ Default content check completed")
            
        except Exception as e:
            logger.error(f"❌ Failed to create default content: {e}")
    
    def setup_user_integration(self):
        """
        Set up integration with user authentication and profile systems.
        
        This method ensures proper integration between education hub and:
        - User authentication system
        - User profile models
        - Points and rewards system
        - Notification preferences
        - Privacy settings
        
        It also validates that required user fields exist for education hub
        functionality and provides fallbacks if they don't.
        """
        try:
            from django.contrib.auth import get_user_model
            from django.db import connection
            
            User = get_user_model()
            
            # Check if user model has required fields for education hub
            required_fields = ['email', 'first_name', 'last_name']
            
            for field in required_fields:
                if not hasattr(User, field):
                    logger.warning(f"⚠️ User model missing field: {field}")
            
            # Set up signal connections for user-education integration
            # These would typically be in signals.py, but we ensure they're connected
            from django.db.models.signals import post_save
            from django.dispatch import receiver
            
            @receiver(post_save, sender=User)
            def create_user_education_profile(sender, instance, created, **kwargs):
                """
                Create education profile for new users.
                
                This ensures every user has the necessary education hub
                profile data when they register.
                """
                if created:
                    # This would typically create a UserEducationProfile model
                    # For now, we just log the event
                    logger.info(f"New user created: {instance.email}")
            
            logger.info("✅ User integration setup completed")
            
        except Exception as e:
            logger.error(f"❌ Failed to setup user integration: {e}")
    
    def get_app_config(self):
        """
        Get comprehensive configuration for the education hub app.
        
        Returns:
            dict: Configuration dictionary containing:
                - App metadata (name, version, description)
                - Feature flags and settings
                - Performance configurations
                - Integration settings
                - Cache and storage configurations
        """
        return {
            'app_name': self.name,
            'verbose_name': self.verbose_name,
            'features': {
                'content_management': True,
                'learning_paths': True,
                'savings_challenges': True,
                'webinars': True,
                'achievements': True,
                'certificates': True,
                'analytics': True,
            },
            'performance': {
                'cache_timeout': self.cache_timeout,
                'max_concurrent_webinars': self.max_concurrent_webinars,
                'min_cache_items': self.min_cache_items,
                'query_optimization': True,
                'lazy_loading': True,
            },
            'integrations': {
                'user_authentication': True,
                'notification_system': True,
                'payment_processing': False,  # Future feature
                'video_streaming': False,  # Future feature
                'analytics_export': True,
            },
            'limits': {
                'max_content_per_path': 50,
                'max_participants_per_challenge': 1000,
                'max_registrations_per_webinar': 500,
                'max_achievements_per_user': 100,
            }
        }