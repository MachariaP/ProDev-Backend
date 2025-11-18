from django.db import models
from django.conf import settings
from django.utils.translation import gettext_lazy as _
from decimal import Decimal


class InvestmentRecommendation(models.Model):
    """AI-powered investment recommendations."""
    
    INVESTMENT_TYPE_CHOICES = [
        ('TREASURY_BILL', 'Treasury Bill'),
        ('BOND', 'Government Bond'),
        ('STOCK', 'Stock'),
        ('MUTUAL_FUND', 'Mutual Fund'),
        ('FIXED_DEPOSIT', 'Fixed Deposit'),
    ]
    
    RISK_LEVEL_CHOICES = [
        ('LOW', 'Low Risk'),
        ('MEDIUM', 'Medium Risk'),
        ('HIGH', 'High Risk'),
    ]
    
    STATUS_CHOICES = [
        ('PENDING', 'Pending Review'),
        ('ACCEPTED', 'Accepted'),
        ('REJECTED', 'Rejected'),
        ('EXECUTED', 'Executed'),
    ]
    
    group = models.ForeignKey('groups.ChamaGroup', on_delete=models.CASCADE, related_name='investment_recommendations')
    investment_type = models.CharField(_('investment type'), max_length=20, choices=INVESTMENT_TYPE_CHOICES)
    recommended_amount = models.DecimalField(_('recommended amount'), max_digits=15, decimal_places=2)
    expected_return = models.DecimalField(_('expected return'), max_digits=10, decimal_places=2)
    risk_level = models.CharField(_('risk level'), max_length=20, choices=RISK_LEVEL_CHOICES)
    duration_days = models.PositiveIntegerField(_('duration (days)'))
    
    # AI analysis
    confidence_score = models.DecimalField(_('confidence score'), max_digits=5, decimal_places=2, help_text=_('AI confidence percentage'))
    analysis_summary = models.TextField(_('analysis summary'))
    
    status = models.CharField(_('status'), max_length=20, choices=STATUS_CHOICES, default='PENDING')
    
    created_at = models.DateTimeField(_('created at'), auto_now_add=True)
    reviewed_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True, related_name='reviewed_recommendations')
    reviewed_at = models.DateTimeField(_('reviewed at'), blank=True, null=True)
    
    class Meta:
        verbose_name = _('investment recommendation')
        verbose_name_plural = _('investment recommendations')
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.investment_type} - KES {self.recommended_amount} - {self.risk_level}"


class PortfolioRebalance(models.Model):
    """Portfolio rebalancing recommendations."""
    
    STATUS_CHOICES = [
        ('PENDING', 'Pending'),
        ('IN_PROGRESS', 'In Progress'),
        ('COMPLETED', 'Completed'),
        ('CANCELLED', 'Cancelled'),
    ]
    
    group = models.ForeignKey('groups.ChamaGroup', on_delete=models.CASCADE, related_name='portfolio_rebalances')
    current_allocation = models.JSONField(_('current allocation'))
    recommended_allocation = models.JSONField(_('recommended allocation'))
    rebalance_summary = models.TextField(_('rebalance summary'))
    
    expected_improvement = models.DecimalField(_('expected improvement'), max_digits=5, decimal_places=2, help_text=_('Expected percentage improvement'))
    status = models.CharField(_('status'), max_length=20, choices=STATUS_CHOICES, default='PENDING')
    
    created_at = models.DateTimeField(_('created at'), auto_now_add=True)
    executed_at = models.DateTimeField(_('executed at'), blank=True, null=True)
    executed_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True, related_name='executed_rebalances')
    
    class Meta:
        verbose_name = _('portfolio rebalance')
        verbose_name_plural = _('portfolio rebalances')
        ordering = ['-created_at']
    
    def __str__(self):
        return f"Rebalance for {self.group.name} - {self.status}"


class AutoInvestmentRule(models.Model):
    """Automated investment rules."""
    
    FREQUENCY_CHOICES = [
        ('DAILY', 'Daily'),
        ('WEEKLY', 'Weekly'),
        ('MONTHLY', 'Monthly'),
    ]
    
    group = models.ForeignKey('groups.ChamaGroup', on_delete=models.CASCADE, related_name='auto_investment_rules')
    investment_type = models.CharField(_('investment type'), max_length=20)
    minimum_balance = models.DecimalField(_('minimum balance'), max_digits=15, decimal_places=2, help_text=_('Minimum group balance before auto-invest'))
    investment_percentage = models.DecimalField(_('investment percentage'), max_digits=5, decimal_places=2, help_text=_('Percentage of idle cash to invest'))
    frequency = models.CharField(_('frequency'), max_length=20, choices=FREQUENCY_CHOICES)
    
    is_active = models.BooleanField(_('is active'), default=True)
    last_executed_at = models.DateTimeField(_('last executed at'), blank=True, null=True)
    
    created_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='created_auto_rules')
    created_at = models.DateTimeField(_('created at'), auto_now_add=True)
    
    class Meta:
        verbose_name = _('auto investment rule')
        verbose_name_plural = _('auto investment rules')
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.group.name} - {self.investment_type} - {self.frequency}"


class InvestmentPerformance(models.Model):
    """Track investment performance metrics."""
    
    group = models.ForeignKey('groups.ChamaGroup', on_delete=models.CASCADE, related_name='investment_performance')
    investment = models.ForeignKey('investments.Investment', on_delete=models.CASCADE, related_name='performance_metrics')
    
    principal_amount = models.DecimalField(_('principal amount'), max_digits=15, decimal_places=2)
    current_value = models.DecimalField(_('current value'), max_digits=15, decimal_places=2)
    total_returns = models.DecimalField(_('total returns'), max_digits=15, decimal_places=2)
    return_percentage = models.DecimalField(_('return percentage'), max_digits=10, decimal_places=2)
    
    days_held = models.PositiveIntegerField(_('days held'))
    annualized_return = models.DecimalField(_('annualized return'), max_digits=10, decimal_places=2, blank=True, null=True)
    
    recorded_at = models.DateTimeField(_('recorded at'), auto_now_add=True)
    
    class Meta:
        verbose_name = _('investment performance')
        verbose_name_plural = _('investment performance metrics')
        ordering = ['-recorded_at']
    
    def __str__(self):
        return f"{self.investment} - {self.return_percentage}% return"
