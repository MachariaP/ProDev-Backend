from django.db import models
from django.conf import settings
from django.utils.translation import gettext_lazy as _


class AuditLog(models.Model):
    """Immutable audit trail for all financial transactions."""
    
    ACTION_TYPE_CHOICES = [
        ('CREATE', 'Create'),
        ('UPDATE', 'Update'),
        ('DELETE', 'Delete'),
        ('APPROVE', 'Approve'),
        ('REJECT', 'Reject'),
        ('TRANSFER', 'Transfer'),
    ]
    
    ENTITY_TYPE_CHOICES = [
        ('CONTRIBUTION', 'Contribution'),
        ('LOAN', 'Loan'),
        ('EXPENSE', 'Expense'),
        ('INVESTMENT', 'Investment'),
        ('USER', 'User'),
        ('GROUP', 'Group'),
    ]
    
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, related_name='audit_logs')
    action_type = models.CharField(_('action type'), max_length=20, choices=ACTION_TYPE_CHOICES)
    entity_type = models.CharField(_('entity type'), max_length=20, choices=ENTITY_TYPE_CHOICES)
    entity_id = models.PositiveIntegerField(_('entity ID'))
    
    changes = models.JSONField(_('changes'), help_text=_('Old and new values'))
    ip_address = models.GenericIPAddressField(_('IP address'), blank=True, null=True)
    user_agent = models.TextField(_('user agent'), blank=True)
    
    timestamp = models.DateTimeField(_('timestamp'), auto_now_add=True, db_index=True)
    checksum = models.CharField(_('checksum'), max_length=64, help_text=_('SHA-256 hash for integrity'))
    
    class Meta:
        verbose_name = _('audit log')
        verbose_name_plural = _('audit logs')
        ordering = ['-timestamp']
        indexes = [
            models.Index(fields=['entity_type', 'entity_id']),
            models.Index(fields=['user', 'timestamp']),
        ]
    
    def __str__(self):
        return f"{self.action_type} - {self.entity_type} #{self.entity_id}"


class ComplianceReport(models.Model):
    """Regulatory compliance reports."""
    
    STATUS_CHOICES = [
        ('PENDING', 'Pending'),
        ('COMPLETED', 'Completed'),
        ('SUBMITTED', 'Submitted to Authorities'),
    ]
    
    group = models.ForeignKey('groups.ChamaGroup', on_delete=models.CASCADE, related_name='compliance_reports')
    report_type = models.CharField(_('report type'), max_length=50)
    period_start = models.DateField(_('period start'))
    period_end = models.DateField(_('period end'))
    
    findings = models.JSONField(_('findings'))
    recommendations = models.TextField(_('recommendations'), blank=True)
    status = models.CharField(_('status'), max_length=20, choices=STATUS_CHOICES, default='PENDING')
    
    file = models.FileField(_('file'), upload_to='compliance/', blank=True, null=True)
    
    generated_at = models.DateTimeField(_('generated at'), auto_now_add=True)
    submitted_at = models.DateTimeField(_('submitted at'), blank=True, null=True)
    
    class Meta:
        verbose_name = _('compliance report')
        verbose_name_plural = _('compliance reports')
        ordering = ['-generated_at']
    
    def __str__(self):
        return f"{self.report_type} - {self.group.name}"


class SuspiciousActivityAlert(models.Model):
    """Alerts for suspicious financial activities."""
    
    SEVERITY_CHOICES = [
        ('LOW', 'Low'),
        ('MEDIUM', 'Medium'),
        ('HIGH', 'High'),
        ('CRITICAL', 'Critical'),
    ]
    
    STATUS_CHOICES = [
        ('NEW', 'New'),
        ('UNDER_REVIEW', 'Under Review'),
        ('RESOLVED', 'Resolved'),
        ('FALSE_POSITIVE', 'False Positive'),
    ]
    
    group = models.ForeignKey('groups.ChamaGroup', on_delete=models.CASCADE, related_name='suspicious_alerts')
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, related_name='suspicious_alerts')
    
    alert_type = models.CharField(_('alert type'), max_length=50)
    severity = models.CharField(_('severity'), max_length=20, choices=SEVERITY_CHOICES)
    description = models.TextField(_('description'))
    detection_details = models.JSONField(_('detection details'))
    
    status = models.CharField(_('status'), max_length=20, choices=STATUS_CHOICES, default='NEW')
    reviewed_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True, related_name='reviewed_alerts')
    resolution_notes = models.TextField(_('resolution notes'), blank=True)
    
    detected_at = models.DateTimeField(_('detected at'), auto_now_add=True)
    resolved_at = models.DateTimeField(_('resolved at'), blank=True, null=True)
    
    class Meta:
        verbose_name = _('suspicious activity alert')
        verbose_name_plural = _('suspicious activity alerts')
        ordering = ['-detected_at']
    
    def __str__(self):
        return f"{self.alert_type} - {self.severity} - {self.status}"
