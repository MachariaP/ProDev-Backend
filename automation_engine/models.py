from django.db import models
from django.conf import settings
from django.utils.translation import gettext_lazy as _


class AutomationRule(models.Model):
    """Smart workflow automation rules."""
    
    RULE_TYPE_CHOICES = [
        ('RECURRING_CONTRIBUTION', 'Recurring Contribution'),
        ('LATE_FEE', 'Late Fee Calculation'),
        ('DIVIDEND_DISTRIBUTION', 'Dividend Distribution'),
        ('NOTIFICATION', 'Notification'),
        ('REMINDER', 'Reminder'),
    ]
    
    FREQUENCY_CHOICES = [
        ('DAILY', 'Daily'),
        ('WEEKLY', 'Weekly'),
        ('MONTHLY', 'Monthly'),
        ('QUARTERLY', 'Quarterly'),
        ('CUSTOM', 'Custom'),
    ]
    
    group = models.ForeignKey('groups.ChamaGroup', on_delete=models.CASCADE, related_name='automation_rules')
    rule_type = models.CharField(_('rule type'), max_length=30, choices=RULE_TYPE_CHOICES)
    rule_name = models.CharField(_('rule name'), max_length=200)
    description = models.TextField(_('description'))
    
    frequency = models.CharField(_('frequency'), max_length=20, choices=FREQUENCY_CHOICES)
    conditions = models.JSONField(_('conditions'), help_text=_('Rule execution conditions'))
    actions = models.JSONField(_('actions'), help_text=_('Actions to perform'))
    
    is_active = models.BooleanField(_('is active'), default=True)
    last_executed_at = models.DateTimeField(_('last executed at'), blank=True, null=True)
    next_execution_at = models.DateTimeField(_('next execution at'))
    
    created_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    created_at = models.DateTimeField(_('created at'), auto_now_add=True)
    
    class Meta:
        verbose_name = _('automation rule')
        verbose_name_plural = _('automation rules')
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.rule_name} - {self.group.name}"


class ExecutionLog(models.Model):
    """Log of automation rule executions."""
    
    STATUS_CHOICES = [
        ('SUCCESS', 'Success'),
        ('FAILED', 'Failed'),
        ('PARTIAL', 'Partially Completed'),
    ]
    
    rule = models.ForeignKey(AutomationRule, on_delete=models.CASCADE, related_name='execution_logs')
    status = models.CharField(_('status'), max_length=20, choices=STATUS_CHOICES)
    
    executed_at = models.DateTimeField(_('executed at'), auto_now_add=True)
    duration_ms = models.PositiveIntegerField(_('duration (ms)'))
    
    result_data = models.JSONField(_('result data'), default=dict)
    error_message = models.TextField(_('error message'), blank=True)
    
    class Meta:
        verbose_name = _('execution log')
        verbose_name_plural = _('execution logs')
        ordering = ['-executed_at']
    
    def __str__(self):
        return f"{self.rule.rule_name} - {self.status} - {self.executed_at}"


class NotificationTemplate(models.Model):
    """Templates for automated notifications."""
    
    CHANNEL_CHOICES = [
        ('EMAIL', 'Email'),
        ('SMS', 'SMS'),
        ('PUSH', 'Push Notification'),
        ('IN_APP', 'In-App'),
    ]
    
    name = models.CharField(_('name'), max_length=200)
    channel = models.CharField(_('channel'), max_length=20, choices=CHANNEL_CHOICES)
    subject_template = models.CharField(_('subject template'), max_length=200, blank=True)
    body_template = models.TextField(_('body template'))
    
    variables = models.JSONField(_('variables'), help_text=_('Template variables'), default=list)
    
    is_active = models.BooleanField(_('is active'), default=True)
    created_at = models.DateTimeField(_('created at'), auto_now_add=True)
    
    class Meta:
        verbose_name = _('notification template')
        verbose_name_plural = _('notification templates')
        ordering = ['name']
    
    def __str__(self):
        return f"{self.name} ({self.channel})"
