from django.db import models
from django.conf import settings
from django.utils.translation import gettext_lazy as _


class GeneratedReport(models.Model):
    """Generated reports for groups."""
    
    REPORT_TYPE_CHOICES = [
        ('STATEMENT', 'Financial Statement'),
        ('TAX', 'Tax Document'),
        ('AUDIT', 'Audit Trail'),
        ('COMPLIANCE', 'Compliance Report'),
        ('CUSTOM', 'Custom Report'),
    ]
    
    FORMAT_CHOICES = [
        ('PDF', 'PDF'),
        ('EXCEL', 'Excel'),
        ('CSV', 'CSV'),
    ]
    
    STATUS_CHOICES = [
        ('PENDING', 'Pending'),
        ('GENERATING', 'Generating'),
        ('COMPLETED', 'Completed'),
        ('FAILED', 'Failed'),
    ]
    
    group = models.ForeignKey('groups.ChamaGroup', on_delete=models.CASCADE, related_name='generated_reports')
    report_type = models.CharField(_('report type'), max_length=20, choices=REPORT_TYPE_CHOICES)
    report_format = models.CharField(_('report format'), max_length=10, choices=FORMAT_CHOICES)
    status = models.CharField(_('status'), max_length=20, choices=STATUS_CHOICES, default='PENDING')
    
    period_start = models.DateField(_('period start'))
    period_end = models.DateField(_('period end'))
    
    file = models.FileField(_('file'), upload_to='reports/', blank=True, null=True)
    metadata = models.JSONField(_('metadata'), default=dict)
    
    requested_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True)
    requested_at = models.DateTimeField(_('requested at'), auto_now_add=True)
    completed_at = models.DateTimeField(_('completed at'), blank=True, null=True)
    
    class Meta:
        verbose_name = _('generated report')
        verbose_name_plural = _('generated reports')
        ordering = ['-requested_at']
    
    def __str__(self):
        return f"{self.report_type} - {self.group.name} - {self.status}"


class ScheduledReport(models.Model):
    """Scheduled automated reports."""
    
    FREQUENCY_CHOICES = [
        ('DAILY', 'Daily'),
        ('WEEKLY', 'Weekly'),
        ('MONTHLY', 'Monthly'),
        ('QUARTERLY', 'Quarterly'),
        ('YEARLY', 'Yearly'),
    ]
    
    group = models.ForeignKey('groups.ChamaGroup', on_delete=models.CASCADE, related_name='scheduled_reports')
    report_type = models.CharField(_('report type'), max_length=20)
    report_format = models.CharField(_('report format'), max_length=10)
    frequency = models.CharField(_('frequency'), max_length=20, choices=FREQUENCY_CHOICES)
    
    recipients = models.JSONField(_('recipients'), help_text=_('Email addresses'))
    is_active = models.BooleanField(_('is active'), default=True)
    
    last_generated_at = models.DateTimeField(_('last generated at'), blank=True, null=True)
    next_generation_at = models.DateTimeField(_('next generation at'))
    
    created_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    created_at = models.DateTimeField(_('created at'), auto_now_add=True)
    
    class Meta:
        verbose_name = _('scheduled report')
        verbose_name_plural = _('scheduled reports')
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.report_type} - {self.frequency} - {self.group.name}"
