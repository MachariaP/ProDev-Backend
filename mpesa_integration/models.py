from django.db import models
from django.conf import settings
from django.utils.translation import gettext_lazy as _
from decimal import Decimal


class MPesaTransaction(models.Model):
    """Model for M-Pesa payment transactions."""
    
    TRANSACTION_TYPE_CHOICES = [
        ('STK_PUSH', 'STK Push'),
        ('B2C', 'Business to Customer'),
        ('B2B', 'Business to Business'),
        ('C2B', 'Customer to Business'),
    ]
    
    STATUS_CHOICES = [
        ('PENDING', 'Pending'),
        ('SUCCESS', 'Success'),
        ('FAILED', 'Failed'),
        ('CANCELLED', 'Cancelled'),
        ('TIMEOUT', 'Timeout'),
    ]
    
    # Transaction identifiers
    transaction_id = models.CharField(_('transaction ID'), max_length=100, unique=True)
    merchant_request_id = models.CharField(_('merchant request ID'), max_length=100, blank=True)
    checkout_request_id = models.CharField(_('checkout request ID'), max_length=100, blank=True)
    
    # Transaction details
    transaction_type = models.CharField(_('transaction type'), max_length=20, choices=TRANSACTION_TYPE_CHOICES)
    amount = models.DecimalField(_('amount'), max_digits=12, decimal_places=2)
    phone_number = models.CharField(_('phone number'), max_length=15)
    account_reference = models.CharField(_('account reference'), max_length=100)
    transaction_desc = models.CharField(_('transaction description'), max_length=200)
    
    # M-Pesa response
    mpesa_receipt_number = models.CharField(_('M-Pesa receipt number'), max_length=50, blank=True)
    transaction_date = models.DateTimeField(_('transaction date'), blank=True, null=True)
    status = models.CharField(_('status'), max_length=20, choices=STATUS_CHOICES, default='PENDING')
    result_code = models.CharField(_('result code'), max_length=10, blank=True)
    result_desc = models.TextField(_('result description'), blank=True)
    
    # Related entities
    group = models.ForeignKey('groups.ChamaGroup', on_delete=models.SET_NULL, null=True, blank=True, related_name='mpesa_transactions')
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True, related_name='mpesa_transactions')
    contribution = models.ForeignKey('finance.Contribution', on_delete=models.SET_NULL, null=True, blank=True, related_name='mpesa_transactions')
    
    # Metadata
    created_at = models.DateTimeField(_('created at'), auto_now_add=True)
    updated_at = models.DateTimeField(_('updated at'), auto_now=True)
    callback_received_at = models.DateTimeField(_('callback received at'), blank=True, null=True)
    
    class Meta:
        verbose_name = _('M-Pesa transaction')
        verbose_name_plural = _('M-Pesa transactions')
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['transaction_id']),
            models.Index(fields=['status']),
            models.Index(fields=['phone_number']),
            models.Index(fields=['created_at']),
        ]
    
    def __str__(self):
        return f"{self.transaction_type} - KES {self.amount} - {self.phone_number}"


class MPesaBulkPayment(models.Model):
    """Model for bulk payment processing."""
    
    STATUS_CHOICES = [
        ('PENDING', 'Pending'),
        ('PROCESSING', 'Processing'),
        ('COMPLETED', 'Completed'),
        ('FAILED', 'Failed'),
        ('PARTIAL', 'Partially Completed'),
    ]
    
    batch_id = models.CharField(_('batch ID'), max_length=100, unique=True)
    group = models.ForeignKey('groups.ChamaGroup', on_delete=models.CASCADE, related_name='bulk_payments')
    total_amount = models.DecimalField(_('total amount'), max_digits=15, decimal_places=2)
    total_recipients = models.PositiveIntegerField(_('total recipients'))
    successful_count = models.PositiveIntegerField(_('successful count'), default=0)
    failed_count = models.PositiveIntegerField(_('failed count'), default=0)
    status = models.CharField(_('status'), max_length=20, choices=STATUS_CHOICES, default='PENDING')
    
    initiated_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='initiated_bulk_payments')
    created_at = models.DateTimeField(_('created at'), auto_now_add=True)
    completed_at = models.DateTimeField(_('completed at'), blank=True, null=True)
    
    class Meta:
        verbose_name = _('M-Pesa bulk payment')
        verbose_name_plural = _('M-Pesa bulk payments')
        ordering = ['-created_at']
    
    def __str__(self):
        return f"Bulk Payment {self.batch_id} - {self.status}"


class PaymentReconciliation(models.Model):
    """Model for payment reconciliation."""
    
    STATUS_CHOICES = [
        ('MATCHED', 'Matched'),
        ('UNMATCHED', 'Unmatched'),
        ('DISPUTED', 'Disputed'),
        ('RESOLVED', 'Resolved'),
    ]
    
    mpesa_transaction = models.OneToOneField(MPesaTransaction, on_delete=models.CASCADE, related_name='reconciliation')
    contribution = models.ForeignKey('finance.Contribution', on_delete=models.CASCADE, related_name='reconciliations', null=True, blank=True)
    status = models.CharField(_('status'), max_length=20, choices=STATUS_CHOICES, default='UNMATCHED')
    amount_difference = models.DecimalField(_('amount difference'), max_digits=10, decimal_places=2, default=Decimal('0.00'))
    
    reconciled_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True, related_name='reconciliations')
    reconciled_at = models.DateTimeField(_('reconciled at'), blank=True, null=True)
    notes = models.TextField(_('notes'), blank=True)
    
    created_at = models.DateTimeField(_('created at'), auto_now_add=True)
    updated_at = models.DateTimeField(_('updated at'), auto_now=True)
    
    class Meta:
        verbose_name = _('payment reconciliation')
        verbose_name_plural = _('payment reconciliations')
        ordering = ['-created_at']
    
    def __str__(self):
        return f"Reconciliation - {self.mpesa_transaction.transaction_id} - {self.status}"
