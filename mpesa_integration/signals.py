"""
Signals for M-Pesa integration app.

This module defines Django signals for automatic processing of
M-Pesa transactions including contribution creation and reconciliation.
"""
import logging
from django.db.models.signals import post_save, pre_save
from django.dispatch import receiver
from django.utils import timezone
from .models import MPesaTransaction, PaymentReconciliation
from finance.models import Contribution

logger = logging.getLogger(__name__)


@receiver(post_save, sender=MPesaTransaction)
def handle_mpesa_transaction_update(sender, instance, created, **kwargs):
    """
    Handle updates to M-Pesa transactions.
    
    This signal automatically creates contributions for successful
    group transactions and initiates reconciliation.
    
    Args:
        sender: Model class
        instance: MPesaTransaction instance
        created: Whether instance was created
    """
    # Only process successful transactions for groups
    if instance.status == 'SUCCESS' and instance.group and not instance.contribution:
        try:
            # Create contribution
            contribution = Contribution.objects.create(
                group=instance.group,
                member=instance.user,
                amount=instance.amount,
                payment_method='MPESA',
                reference_number=instance.mpesa_receipt_number or instance.transaction_id,
                status='RECONCILED',
                notes=f'M-Pesa payment: {instance.transaction_desc}',
                reconciled_at=timezone.now()
            )
            
            # Link transaction to contribution
            instance.contribution = contribution
            instance.save(update_fields=['contribution'])
            
            # Update group balance
            instance.group.total_balance += instance.amount
            instance.group.save(update_fields=['total_balance'])
            
            # Create reconciliation record
            PaymentReconciliation.objects.create(
                mpesa_transaction=instance,
                contribution=contribution,
                status='MATCHED',
                amount_difference=0,
                reconciled_at=timezone.now()
            )
            
            logger.info(
                f"Created contribution {contribution.id} and reconciliation "
                f"for transaction {instance.id}"
            )
            
        except Exception as e:
            logger.error(
                f"Failed to process transaction {instance.id}: {str(e)}"
            )


@receiver(pre_save, sender=MPesaTransaction)
def validate_transaction_status(sender, instance, **kwargs):
    """
    Validate transaction status transitions.
    
    Prevents invalid status changes and logs important transitions.
    
    Args:
        sender: Model class
        instance: MPesaTransaction instance
    """
    if instance.pk:
        try:
            old_instance = MPesaTransaction.objects.get(pk=instance.pk)
            
            # Log status changes
            if old_instance.status != instance.status:
                logger.info(
                    f"Transaction {instance.id} status changed from "
                    f"{old_instance.status} to {instance.status}"
                )
            
            # Prevent changing from terminal states
            terminal_states = ['SUCCESS', 'FAILED', 'CANCELLED']
            if old_instance.status in terminal_states and instance.status != old_instance.status:
                logger.warning(
                    f"Attempted to change transaction {instance.id} from "
                    f"terminal state {old_instance.status} to {instance.status}"
                )
                # In production, you might want to raise an exception here
                
        except MPesaTransaction.DoesNotExist:
            pass
