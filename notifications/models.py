from django.db import models
from django.conf import settings
from django.utils import timezone
from django.core.exceptions import ValidationError


class Notification(models.Model):
    """Model for user notifications"""
    
    NOTIFICATION_TYPES = (
        ('SYSTEM', 'System'),
        ('FINANCE', 'Finance'),
        ('LOAN', 'Loan'),
        ('CONTRIBUTION', 'Contribution'),
        ('MEETING', 'Meeting'),
        ('INVESTMENT', 'Investment'),
        ('GENERAL', 'General'),
    )
    
    PRIORITY_LEVELS = (
        ('LOW', 'Low'),
        ('MEDIUM', 'Medium'),
        ('HIGH', 'High'),
        ('URGENT', 'Urgent'),
    )
    
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='notifications'
    )
    title = models.CharField(max_length=255)
    message = models.TextField()
    notification_type = models.CharField(
        max_length=20,
        choices=NOTIFICATION_TYPES,
        default='GENERAL'
    )
    priority = models.CharField(
        max_length=10,
        choices=PRIORITY_LEVELS,
        default='MEDIUM'
    )
    is_read = models.BooleanField(default=False)
    is_archived = models.BooleanField(default=False)
    
    # Optional: link to related objects
    group = models.ForeignKey(
        'groups.ChamaGroup',
        on_delete=models.SET_NULL,
        null=True,
        blank=True
    )
    related_object_type = models.CharField(max_length=50, blank=True)
    related_object_id = models.PositiveIntegerField(null=True, blank=True)
    
    # Metadata
    created_at = models.DateTimeField(auto_now_add=True)
    read_at = models.DateTimeField(null=True, blank=True)
    expires_at = models.DateTimeField(null=True, blank=True)
    
    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['user', 'is_read']),
            models.Index(fields=['user', 'created_at']),
            models.Index(fields=['group', 'created_at']),
        ]
    
    def __str__(self):
        return f"{self.title} - {self.user.email}"
    
    def mark_as_read(self):
        """Mark notification as read"""
        if not self.is_read:
            self.is_read = True
            self.read_at = timezone.now()
            self.save()
    
    def mark_as_unread(self):
        """Mark notification as unread"""
        self.is_read = False
        self.read_at = None
        self.save()
    
    def archive(self):
        """Archive the notification"""
        self.is_archived = True
        self.save()
    
    def is_expired(self):
        """Check if notification is expired"""
        if self.expires_at:
            return timezone.now() > self.expires_at
        return False
    
    @property
    def related_object_url(self):
        """Get URL for related object if applicable"""
        if self.related_object_type and self.related_object_id:
            # This would be implemented based on your URL patterns
            return None
        return None


class NotificationPreference(models.Model):
    """Model for user notification preferences"""
    
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='notification_preferences'
    )
    
    # Email notifications
    email_contributions = models.BooleanField(default=True)
    email_loans = models.BooleanField(default=True)
    email_investments = models.BooleanField(default=True)
    email_meetings = models.BooleanField(default=True)
    email_system = models.BooleanField(default=True)
    
    # In-app notifications
    inapp_contributions = models.BooleanField(default=True)
    inapp_loans = models.BooleanField(default=True)
    inapp_investments = models.BooleanField(default=True)
    inapp_meetings = models.BooleanField(default=True)
    inapp_system = models.BooleanField(default=True)
    
    # Push notifications
    push_contributions = models.BooleanField(default=False)
    push_loans = models.BooleanField(default=False)
    push_investments = models.BooleanField(default=False)
    push_meetings = models.BooleanField(default=False)
    push_system = models.BooleanField(default=False)
    
    # Digest settings
    daily_digest = models.BooleanField(default=True)
    weekly_digest = models.BooleanField(default=False)
    digest_time = models.TimeField(default='18:00')
    
    # Do not disturb
    quiet_hours_start = models.TimeField(null=True, blank=True)
    quiet_hours_end = models.TimeField(null=True, blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"Notification preferences for {self.user.email}"
    
    def clean(self):
        """Validate quiet hours"""
        if self.quiet_hours_start and self.quiet_hours_end:
            if self.quiet_hours_start >= self.quiet_hours_end:
                raise ValidationError("Quiet hours start must be before end time.")


class BulkNotification(models.Model):
    """Model for sending bulk notifications to multiple users"""
    
    sender = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='sent_bulk_notifications'
    )
    title = models.CharField(max_length=255)
    message = models.TextField()
    notification_type = models.CharField(
        max_length=20,
        choices=Notification.NOTIFICATION_TYPES,
        default='GENERAL'
    )
    
    # Target users (could be all, group members, specific users)
    target_all_users = models.BooleanField(default=False)
    groups = models.ManyToManyField('groups.ChamaGroup', blank=True)
    
    # Statistics
    total_recipients = models.PositiveIntegerField(default=0)
    sent_count = models.PositiveIntegerField(default=0)
    read_count = models.PositiveIntegerField(default=0)
    
    scheduled_for = models.DateTimeField(null=True, blank=True)
    is_sent = models.BooleanField(default=False)
    sent_at = models.DateTimeField(null=True, blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-created_at']
    
    def __str__(self):
        return f"Bulk: {self.title} - {self.sent_count}/{self.total_recipients}"
