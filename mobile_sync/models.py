from django.db import models
from django.conf import settings
from django.utils.translation import gettext_lazy as _


class OfflineTransaction(models.Model):
    """Store transactions created offline."""
    
    TRANSACTION_TYPE_CHOICES = [
        ('CONTRIBUTION', 'Contribution'),
        ('EXPENSE', 'Expense'),
        ('LOAN_PAYMENT', 'Loan Payment'),
    ]
    
    STATUS_CHOICES = [
        ('PENDING_SYNC', 'Pending Sync'),
        ('SYNCED', 'Synced'),
        ('CONFLICT', 'Conflict'),
        ('FAILED', 'Failed'),
    ]
    
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='offline_transactions')
    transaction_type = models.CharField(_('transaction type'), max_length=20, choices=TRANSACTION_TYPE_CHOICES)
    transaction_data = models.JSONField(_('transaction data'))
    
    local_id = models.CharField(_('local ID'), max_length=100, unique=True, help_text=_('Client-generated ID'))
    device_id = models.CharField(_('device ID'), max_length=100)
    
    status = models.CharField(_('status'), max_length=20, choices=STATUS_CHOICES, default='PENDING_SYNC')
    server_id = models.PositiveIntegerField(_('server ID'), null=True, blank=True, help_text=_('ID after sync'))
    
    created_at_device = models.DateTimeField(_('created at device'))
    created_at = models.DateTimeField(_('created at'), auto_now_add=True)
    synced_at = models.DateTimeField(_('synced at'), blank=True, null=True)
    
    class Meta:
        verbose_name = _('offline transaction')
        verbose_name_plural = _('offline transactions')
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.transaction_type} - {self.status} - {self.local_id}"


class SyncConflict(models.Model):
    """Track and resolve sync conflicts."""
    
    RESOLUTION_CHOICES = [
        ('SERVER_WINS', 'Server Wins'),
        ('CLIENT_WINS', 'Client Wins'),
        ('MERGE', 'Merge'),
        ('MANUAL', 'Manual Resolution'),
    ]
    
    offline_transaction = models.ForeignKey(OfflineTransaction, on_delete=models.CASCADE, related_name='conflicts')
    conflict_type = models.CharField(_('conflict type'), max_length=50)
    conflict_details = models.JSONField(_('conflict details'))
    
    server_version = models.JSONField(_('server version'))
    client_version = models.JSONField(_('client version'))
    
    resolution_strategy = models.CharField(_('resolution strategy'), max_length=20, choices=RESOLUTION_CHOICES, blank=True)
    resolved_version = models.JSONField(_('resolved version'), blank=True, null=True)
    
    detected_at = models.DateTimeField(_('detected at'), auto_now_add=True)
    resolved_at = models.DateTimeField(_('resolved at'), blank=True, null=True)
    resolved_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True)
    
    class Meta:
        verbose_name = _('sync conflict')
        verbose_name_plural = _('sync conflicts')
        ordering = ['-detected_at']
    
    def __str__(self):
        return f"{self.conflict_type} - {self.offline_transaction.local_id}"


class DeviceSync(models.Model):
    """Track device synchronization status."""
    
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='device_syncs')
    device_id = models.CharField(_('device ID'), max_length=100)
    device_name = models.CharField(_('device name'), max_length=200)
    
    last_sync_at = models.DateTimeField(_('last sync at'))
    pending_items = models.PositiveIntegerField(_('pending items'), default=0)
    
    app_version = models.CharField(_('app version'), max_length=20)
    os_version = models.CharField(_('OS version'), max_length=50)
    
    registered_at = models.DateTimeField(_('registered at'), auto_now_add=True)
    
    class Meta:
        verbose_name = _('device sync')
        verbose_name_plural = _('device syncs')
        unique_together = ['user', 'device_id']
        ordering = ['-last_sync_at']
    
    def __str__(self):
        return f"{self.user.get_full_name()} - {self.device_name}"
