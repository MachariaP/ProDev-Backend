# notifications/signals.py
"""
Signal handlers for notifications app.

This module contains signal handlers that automatically create notifications
for various events in the system (user registration, contributions, loans, etc.)
"""

from django.db.models.signals import post_save, post_delete
from django.dispatch import receiver
from django.contrib.auth import get_user_model
from django.utils import timezone
from django.core.exceptions import ObjectDoesNotExist
import logging

from .models import Notification, NotificationPreference
from groups.models import GroupMembership, ChamaGroup
from finance.models import Contribution, Loan, Expense
from investments.models import Investment

logger = logging.getLogger(__name__)
User = get_user_model()


@receiver(post_save, sender=User)
def create_welcome_notification(sender, instance, created, **kwargs):
    """
    Create a welcome notification when a new user is created.
    """
    if created:
        try:
            Notification.objects.create(
                user=instance,
                title="Welcome to ChamaHub!",
                message="Welcome to ChamaHub! Get started by joining or creating a Chama group.",
                notification_type='SYSTEM',
                priority='MEDIUM'
            )
            logger.info(f"Created welcome notification for user {instance.email}")
        except Exception as e:
            logger.error(f"Failed to create welcome notification: {str(e)}")


@receiver(post_save, sender=NotificationPreference)
def create_default_preferences(sender, instance, created, **kwargs):
    """
    Ensure notification preferences are properly set when user is created.
    This is handled by the get_or_create pattern in views, but kept for safety.
    """
    pass


@receiver(post_save, sender=GroupMembership)
def create_group_join_notification(sender, instance, created, **kwargs):
    """
    Create notification when a user joins or leaves a group.
    """
    if created:
        try:
            Notification.objects.create(
                user=instance.user,
                title=f"Welcome to {instance.group.name}!",
                message=f"You have successfully joined {instance.group.name}. Start contributing and engaging with your group members.",
                notification_type='GENERAL',
                priority='MEDIUM',
                group=instance.group
            )
            logger.info(f"Created group join notification for user {instance.user.email}")
        except Exception as e:
            logger.error(f"Failed to create group join notification: {str(e)}")


@receiver(post_save, sender=Contribution)
def create_contribution_notification(sender, instance, created, **kwargs):
    """
    Create notification when a contribution is made or updated.
    """
    try:
        if created:
            # Notify the member who made the contribution
            Notification.objects.create(
                user=instance.member,
                title=f"Contribution Submitted",
                message=f"Your contribution of KES {instance.amount:,.2f} to {instance.group.name} has been submitted and is pending reconciliation.",
                notification_type='CONTRIBUTION',
                priority='MEDIUM',
                group=instance.group
            )
        elif instance.status == 'COMPLETED':
            # Notify the member when contribution is reconciled
            Notification.objects.create(
                user=instance.member,
                title=f"Contribution Reconciled",
                message=f"Your contribution of KES {instance.amount:,.2f} to {instance.group.name} has been reconciled successfully.",
                notification_type='CONTRIBUTION',
                priority='MEDIUM',
                group=instance.group
            )
    except Exception as e:
        logger.error(f"Failed to create contribution notification: {str(e)}")


@receiver(post_save, sender=Loan)
def create_loan_notification(sender, instance, created, **kwargs):
    """
    Create notification for loan applications and status changes.
    """
    try:
        if created:
            # Notify the borrower
            Notification.objects.create(
                user=instance.borrower,
                title=f"Loan Application Submitted",
                message=f"Your loan application of KES {instance.principal_amount:,.2f} has been submitted for approval.",
                notification_type='LOAN',
                priority='HIGH',
                group=instance.group
            )
        
        # Check if status has changed (we'll compare with database)
        try:
            old_instance = Loan.objects.get(pk=instance.pk)
            if old_instance.status != instance.status:
                if instance.status == 'APPROVED':
                    Notification.objects.create(
                        user=instance.borrower,
                        title=f"Loan Approved!",
                        message=f"Your loan of KES {instance.principal_amount:,.2f} has been approved. It will be disbursed shortly.",
                        notification_type='LOAN',
                        priority='HIGH',
                        group=instance.group
                    )
                elif instance.status == 'REJECTED':
                    Notification.objects.create(
                        user=instance.borrower,
                        title=f"Loan Application Rejected",
                        message=f"Your loan application of KES {instance.principal_amount:,.2f} has been rejected.",
                        notification_type='LOAN',
                        priority='HIGH',
                        group=instance.group
                    )
        except Loan.DoesNotExist:
            pass
            
    except Exception as e:
        logger.error(f"Failed to create loan notification: {str(e)}")


@receiver(post_save, sender=Investment)
def create_investment_notification(sender, instance, created, **kwargs):
    """
    Create notification for investment activities.
    """
    try:
        if created:
            Notification.objects.create(
                user=instance.created_by,
                title=f"Investment Created",
                message=f"Your investment of KES {instance.principal_amount:,.2f} in {instance.investment_type} has been created.",
                notification_type='INVESTMENT',
                priority='MEDIUM',
                group=instance.group
            )
    except Exception as e:
        logger.error(f"Failed to create investment notification: {str(e)}")


@receiver(post_save, sender=ChamaGroup)
def create_group_update_notification(sender, instance, created, **kwargs):
    """
    Create notifications for group updates (for group officials and members).
    """
    if created:
        return  # Handled by group membership signal
    
    # Check for specific field changes by comparing with database
    try:
        old_instance = ChamaGroup.objects.get(pk=instance.pk)
        
        # Check if name has changed
        if old_instance.name != instance.name:
            # Notify all members about name change
            try:
                for membership in instance.memberships.filter(status='ACTIVE'):
                    Notification.objects.create(
                        user=membership.user,
                        title=f"Group Name Updated",
                        message=f"The group '{old_instance.name}' has been renamed to '{instance.name}'.",
                        notification_type='GENERAL',
                        priority='MEDIUM',
                        group=instance
                    )
            except Exception as e:
                logger.error(f"Failed to create group name change notifications: {str(e)}")
                
    except ChamaGroup.DoesNotExist:
        pass
    except Exception as e:
        logger.error(f"Failed to check group updates: {str(e)}")


@receiver(post_save)
def create_general_notification(sender, instance, created, **kwargs):
    """
    Generic signal handler for any model changes.
    This can be extended for other models as needed.
    """
    # Avoid infinite recursion and only handle specific models
    if sender.__name__ in ['Notification', 'NotificationPreference', 'BulkNotification']:
        return


def connect_signals():
    """
    Connect all signal handlers.
    This function is called from apps.py ready() method.
    """
    # Signals are connected via @receiver decorators
    pass
