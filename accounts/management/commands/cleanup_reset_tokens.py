# accounts/management/commands/cleanup_reset_tokens.py
from django.core.management.base import BaseCommand
from django.utils import timezone
from datetime import timedelta
from accounts.models import PasswordResetToken


class Command(BaseCommand):
    help = 'Clean up expired password reset tokens'
    
    def handle(self, *args, **options):
        """Delete expired password reset tokens."""
        # Delete tokens older than 48 hours
        expired_tokens = PasswordResetToken.objects.filter(
            created_at__lt=timezone.now() - timedelta(hours=48)
        )
        
        count = expired_tokens.count()
        expired_tokens.delete()
        
        self.stdout.write(
            self.style.SUCCESS(f'Successfully deleted {count} expired password reset tokens.')
        )
