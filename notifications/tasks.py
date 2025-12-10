# notifications/tasks.py
"""
Celery tasks for notifications app.

This module contains background tasks for sending notifications
asynchronously to avoid blocking the main request/response cycle.
"""

from celery import shared_task
from django.utils import timezone
from django.contrib.auth import get_user_model
import logging
from .models import BulkNotification, Notification

logger = logging.getLogger(__name__)
User = get_user_model()


@shared_task
def send_bulk_notification_emails(bulk_notification_id):
    """
    Send email notifications for a bulk notification.
    
    Args:
        bulk_notification_id: ID of the BulkNotification instance
    """
    try:
        bulk_notification = BulkNotification.objects.get(id=bulk_notification_id)
        
        # This is a placeholder for actual email sending logic
        # In production, you would integrate with an email service
        # like SendGrid, Mailgun, or AWS SES
        
        logger.info(f"Would send emails for bulk notification: {bulk_notification.title}")
        logger.info(f"Total recipients: {bulk_notification.total_recipients}")
        
        # Mark as processed (in a real implementation, you'd track individual sends)
        bulk_notification.sent_count = bulk_notification.total_recipients
        bulk_notification.save()
        
        return {
            'status': 'success',
            'message': f'Processed bulk notification {bulk_notification_id}',
            'sent_count': bulk_notification.sent_count
        }
        
    except BulkNotification.DoesNotExist:
        logger.error(f"Bulk notification {bulk_notification_id} not found")
        return {
            'status': 'error',
            'message': f'Bulk notification {bulk_notification_id} not found'
        }
    except Exception as e:
        logger.error(f"Failed to process bulk notification {bulk_notification_id}: {str(e)}")
        return {
            'status': 'error',
            'message': str(e)
        }


@shared_task
def send_daily_digest():
    """
    Send daily digest notifications to users who have opted in.
    Runs daily (can be scheduled via Celery beat).
    """
    try:
        users = User.objects.filter(
            notification_preferences__daily_digest=True,
            is_active=True
        )
        
        for user in users:
            # Get unread notifications from the last 24 hours
            twenty_four_hours_ago = timezone.now() - timezone.timedelta(hours=24)
            recent_notifications = Notification.objects.filter(
                user=user,
                is_read=False,
                created_at__gte=twenty_four_hours_ago
            ).count()
            
            if recent_notifications > 0:
                # Create a digest notification
                Notification.objects.create(
                    user=user,
                    title="Daily Digest",
                    message=f"You have {recent_notifications} unread notifications from the last 24 hours.",
                    notification_type='SYSTEM',
                    priority='LOW'
                )
        
        logger.info(f"Sent daily digest to {users.count()} users")
        return {
            'status': 'success',
            'message': f'Sent daily digest to {users.count()} users'
        }
        
    except Exception as e:
        logger.error(f"Failed to send daily digest: {str(e)}")
        return {
            'status': 'error',
            'message': str(e)
        }


@shared_task
def send_weekly_digest():
    """
    Send weekly digest notifications to users who have opted in.
    Runs weekly (can be scheduled via Celery beat).
    """
    try:
        users = User.objects.filter(
            notification_preferences__weekly_digest=True,
            is_active=True
        )
        
        for user in users:
            # Get unread notifications from the last 7 days
            seven_days_ago = timezone.now() - timezone.timedelta(days=7)
            recent_notifications = Notification.objects.filter(
                user=user,
                is_read=False,
                created_at__gte=seven_days_ago
            ).count()
            
            if recent_notifications > 0:
                # Create a digest notification
                Notification.objects.create(
                    user=user,
                    title="Weekly Digest",
                    message=f"You have {recent_notifications} unread notifications from the last week.",
                    notification_type='SYSTEM',
                    priority='LOW'
                )
        
        logger.info(f"Sent weekly digest to {users.count()} users")
        return {
            'status': 'success',
            'message': f'Sent weekly digest to {users.count()} users'
        }
        
    except Exception as e:
        logger.error(f"Failed to send weekly digest: {str(e)}")
        return {
            'status': 'error',
            'message': str(e)
        }


@shared_task
def cleanup_old_notifications(days_old=90):
    """
    Clean up old notifications to prevent database bloat.
    
    Args:
        days_old: Number of days after which notifications should be cleaned up
    """
    try:
        cutoff_date = timezone.now() - timezone.timedelta(days=days_old)
        
        # Archive old notifications (soft delete by marking as archived)
        old_notifications = Notification.objects.filter(
            created_at__lt=cutoff_date,
            is_archived=False
        )
        
        count = old_notifications.count()
        old_notifications.update(is_archived=True)
        
        logger.info(f"Archived {count} notifications older than {days_old} days")
        return {
            'status': 'success',
            'message': f'Archived {count} notifications',
            'count': count
        }
        
    except Exception as e:
        logger.error(f"Failed to cleanup old notifications: {str(e)}")
        return {
            'status': 'error',
            'message': str(e)
        }


@shared_task
def expire_notifications():
    """
    Mark expired notifications as read.
    Runs periodically to clean up notifications that have passed their expiry date.
    """
    try:
        now = timezone.now()
        
        # Find notifications that have expired but are not yet read
        expired_notifications = Notification.objects.filter(
            expires_at__lt=now,
            is_read=False
        )
        
        count = expired_notifications.count()
        expired_notifications.update(is_read=True, read_at=now)
        
        logger.info(f"Marked {count} expired notifications as read")
        return {
            'status': 'success',
            'message': f'Marked {count} expired notifications as read',
            'count': count
        }
        
    except Exception as e:
        logger.error(f"Failed to expire notifications: {str(e)}")
        return {
            'status': 'error',
            'message': str(e)
        }


@shared_task
def send_immediate_notification(user_id, title, message, notification_type='GENERAL', priority='MEDIUM', group_id=None):
    """
    Send an immediate notification to a specific user.
    
    Args:
        user_id: ID of the user to notify
        title: Notification title
        message: Notification message
        notification_type: Type of notification
        priority: Priority level
        group_id: Optional group ID for context
    """
    try:
        user = User.objects.get(id=user_id)
        group = None
        
        if group_id:
            from groups.models import ChamaGroup
            group = ChamaGroup.objects.get(id=group_id)
        
        Notification.objects.create(
            user=user,
            title=title,
            message=message,
            notification_type=notification_type,
            priority=priority,
            group=group
        )
        
        logger.info(f"Sent immediate notification to user {user_id}: {title}")
        return {
            'status': 'success',
            'message': f'Sent notification to user {user_id}'
        }
        
    except User.DoesNotExist:
        logger.error(f"User {user_id} not found")
        return {
            'status': 'error',
            'message': f'User {user_id} not found'
        }
    except Exception as e:
        logger.error(f"Failed to send immediate notification: {str(e)}")
        return {
            'status': 'error',
            'message': str(e)
        }
