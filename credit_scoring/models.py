from django.db import models
from django.conf import settings
from django.utils.translation import gettext_lazy as _
from decimal import Decimal


class CreditScore(models.Model):
    """Credit scoring for members."""
    
    SCORE_GRADE_CHOICES = [
        ('EXCELLENT', 'Excellent (750+)'),
        ('GOOD', 'Good (650-749)'),
        ('FAIR', 'Fair (550-649)'),
        ('POOR', 'Poor (450-549)'),
        ('VERY_POOR', 'Very Poor (<450)'),
    ]
    
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='credit_scores')
    group = models.ForeignKey('groups.ChamaGroup', on_delete=models.CASCADE, related_name='member_credit_scores')
    
    score = models.PositiveIntegerField(_('credit score'), help_text=_('Score between 300-850'))
    score_grade = models.CharField(_('score grade'), max_length=20, choices=SCORE_GRADE_CHOICES)
    
    # Scoring factors
    payment_history_score = models.DecimalField(_('payment history score'), max_digits=5, decimal_places=2)
    contribution_consistency_score = models.DecimalField(_('contribution consistency score'), max_digits=5, decimal_places=2)
    debt_to_income_ratio = models.DecimalField(_('debt to income ratio'), max_digits=5, decimal_places=2)
    loan_repayment_rate = models.DecimalField(_('loan repayment rate'), max_digits=5, decimal_places=2)
    membership_duration_score = models.DecimalField(_('membership duration score'), max_digits=5, decimal_places=2)
    
    # Risk assessment
    default_probability = models.DecimalField(_('default probability'), max_digits=5, decimal_places=2, help_text=_('Probability percentage'))
    recommended_credit_limit = models.DecimalField(_('recommended credit limit'), max_digits=12, decimal_places=2)
    
    calculated_at = models.DateTimeField(_('calculated at'), auto_now_add=True)
    expires_at = models.DateTimeField(_('expires at'), help_text=_('Score validity period'))
    
    class Meta:
        verbose_name = _('credit score')
        verbose_name_plural = _('credit scores')
        ordering = ['-calculated_at']
        unique_together = ['user', 'group']
    
    def __str__(self):
        return f"{self.user.get_full_name()} - {self.score} ({self.score_grade})"


class LoanEligibility(models.Model):
    """Loan eligibility determination."""
    
    STATUS_CHOICES = [
        ('ELIGIBLE', 'Eligible'),
        ('NOT_ELIGIBLE', 'Not Eligible'),
        ('CONDITIONAL', 'Conditionally Eligible'),
    ]
    
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='loan_eligibilities')
    group = models.ForeignKey('groups.ChamaGroup', on_delete=models.CASCADE, related_name='loan_eligibilities')
    credit_score = models.ForeignKey(CreditScore, on_delete=models.CASCADE, related_name='eligibility_checks')
    
    requested_amount = models.DecimalField(_('requested amount'), max_digits=12, decimal_places=2)
    maximum_eligible_amount = models.DecimalField(_('maximum eligible amount'), max_digits=12, decimal_places=2)
    status = models.CharField(_('status'), max_length=20, choices=STATUS_CHOICES)
    
    eligibility_reasons = models.JSONField(_('eligibility reasons'), help_text=_('Detailed reasons for decision'))
    conditions = models.TextField(_('conditions'), blank=True, help_text=_('Conditions if conditionally eligible'))
    
    checked_at = models.DateTimeField(_('checked at'), auto_now_add=True)
    
    class Meta:
        verbose_name = _('loan eligibility')
        verbose_name_plural = _('loan eligibilities')
        ordering = ['-checked_at']
    
    def __str__(self):
        return f"{self.user.get_full_name()} - {self.status} - KES {self.maximum_eligible_amount}"


class PaymentHistoryAnalysis(models.Model):
    """Analysis of member payment history."""
    
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='payment_analyses')
    group = models.ForeignKey('groups.ChamaGroup', on_delete=models.CASCADE, related_name='payment_analyses')
    
    total_payments = models.PositiveIntegerField(_('total payments'))
    on_time_payments = models.PositiveIntegerField(_('on-time payments'))
    late_payments = models.PositiveIntegerField(_('late payments'))
    missed_payments = models.PositiveIntegerField(_('missed payments'))
    
    average_payment_amount = models.DecimalField(_('average payment amount'), max_digits=12, decimal_places=2)
    payment_consistency_rate = models.DecimalField(_('payment consistency rate'), max_digits=5, decimal_places=2)
    late_payment_rate = models.DecimalField(_('late payment rate'), max_digits=5, decimal_places=2)
    
    analysis_period_months = models.PositiveIntegerField(_('analysis period (months)'))
    analyzed_at = models.DateTimeField(_('analyzed at'), auto_now_add=True)
    
    class Meta:
        verbose_name = _('payment history analysis')
        verbose_name_plural = _('payment history analyses')
        ordering = ['-analyzed_at']
    
    def __str__(self):
        return f"{self.user.get_full_name()} - {self.payment_consistency_rate}% consistency"


class DefaultPrediction(models.Model):
    """Machine learning predictions for loan default risk."""
    
    RISK_LEVEL_CHOICES = [
        ('LOW', 'Low Risk'),
        ('MEDIUM', 'Medium Risk'),
        ('HIGH', 'High Risk'),
        ('VERY_HIGH', 'Very High Risk'),
    ]
    
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='default_predictions')
    loan = models.ForeignKey('finance.Loan', on_delete=models.CASCADE, related_name='default_predictions', null=True, blank=True)
    
    default_probability = models.DecimalField(_('default probability'), max_digits=5, decimal_places=2)
    risk_level = models.CharField(_('risk level'), max_length=20, choices=RISK_LEVEL_CHOICES)
    confidence_score = models.DecimalField(_('confidence score'), max_digits=5, decimal_places=2)
    
    # Contributing factors
    key_risk_factors = models.JSONField(_('key risk factors'))
    mitigation_recommendations = models.TextField(_('mitigation recommendations'))
    
    predicted_at = models.DateTimeField(_('predicted at'), auto_now_add=True)
    model_version = models.CharField(_('model version'), max_length=20, default='1.0')
    
    class Meta:
        verbose_name = _('default prediction')
        verbose_name_plural = _('default predictions')
        ordering = ['-predicted_at']
    
    def __str__(self):
        return f"{self.user.get_full_name()} - {self.default_probability}% risk - {self.risk_level}"
