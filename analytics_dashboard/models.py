from django.db import models
from django.conf import settings
from django.utils.translation import gettext_lazy as _


class AnalyticsReport(models.Model):
    """Business intelligence and analytics reports."""
    
    REPORT_TYPE_CHOICES = [
        ('FINANCIAL_HEALTH', 'Financial Health'),
        ('CONTRIBUTION_TRENDS', 'Contribution Trends'),
        ('MEMBER_ENGAGEMENT', 'Member Engagement'),
        ('CASH_FLOW', 'Cash Flow Analysis'),
    ]
    
    group = models.ForeignKey('groups.ChamaGroup', on_delete=models.CASCADE, related_name='analytics_reports')
    report_type = models.CharField(_('report type'), max_length=30, choices=REPORT_TYPE_CHOICES)
    report_data = models.JSONField(_('report data'))
    insights = models.TextField(_('insights'))
    recommendations = models.TextField(_('recommendations'), blank=True)
    
    generated_at = models.DateTimeField(_('generated at'), auto_now_add=True)
    generated_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True)
    
    class Meta:
        verbose_name = _('analytics report')
        verbose_name_plural = _('analytics reports')
        ordering = ['-generated_at']
    
    def __str__(self):
        return f"{self.report_type} - {self.group.name}"


class FinancialHealthScore(models.Model):
    """Financial health scoring for groups."""
    
    group = models.ForeignKey('groups.ChamaGroup', on_delete=models.CASCADE, related_name='health_scores')
    overall_score = models.PositiveIntegerField(_('overall score'), help_text=_('Score out of 100'))
    
    # Component scores
    liquidity_score = models.PositiveIntegerField(_('liquidity score'))
    growth_score = models.PositiveIntegerField(_('growth score'))
    stability_score = models.PositiveIntegerField(_('stability score'))
    engagement_score = models.PositiveIntegerField(_('engagement score'))
    
    trends = models.JSONField(_('trends'), help_text=_('Historical trend data'))
    calculated_at = models.DateTimeField(_('calculated at'), auto_now_add=True)
    
    class Meta:
        verbose_name = _('financial health score')
        verbose_name_plural = _('financial health scores')
        ordering = ['-calculated_at']
    
    def __str__(self):
        return f"{self.group.name} - {self.overall_score}/100"


class PredictiveCashFlow(models.Model):
    """Predictive cash flow modeling."""
    
    group = models.ForeignKey('groups.ChamaGroup', on_delete=models.CASCADE, related_name='cash_flow_predictions')
    prediction_month = models.DateField(_('prediction month'))
    
    predicted_inflow = models.DecimalField(_('predicted inflow'), max_digits=15, decimal_places=2)
    predicted_outflow = models.DecimalField(_('predicted outflow'), max_digits=15, decimal_places=2)
    predicted_balance = models.DecimalField(_('predicted balance'), max_digits=15, decimal_places=2)
    
    confidence_level = models.DecimalField(_('confidence level'), max_digits=5, decimal_places=2)
    model_accuracy = models.DecimalField(_('model accuracy'), max_digits=5, decimal_places=2)
    
    created_at = models.DateTimeField(_('created at'), auto_now_add=True)
    
    class Meta:
        verbose_name = _('predictive cash flow')
        verbose_name_plural = _('predictive cash flows')
        ordering = ['-prediction_month']
    
    def __str__(self):
        return f"{self.group.name} - {self.prediction_month.strftime('%B %Y')}"
