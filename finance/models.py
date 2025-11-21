from django.db import models
from django.conf import settings
from django.utils.translation import gettext_lazy as _
from decimal import Decimal


class Contribution(models.Model):
    """Model for member contributions to a group."""
    
    STATUS_CHOICES = [
        ('PENDING', 'Pending'),
        ('COMPLETED', 'Completed'),
        ('FAILED', 'Failed'),
        ('RECONCILED', 'Reconciled'),
    ]
    
    PAYMENT_METHOD_CHOICES = [
        ('MPESA', 'M-Pesa'),
        ('BANK', 'Bank Transfer'),
        ('CASH', 'Cash'),
        ('OTHER', 'Other'),
    ]
    
    group = models.ForeignKey('groups.ChamaGroup', on_delete=models.CASCADE, related_name='contributions')
    member = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='contributions')
    amount = models.DecimalField(_('amount'), max_digits=10, decimal_places=2)
    payment_method = models.CharField(_('payment method'), max_length=20, choices=PAYMENT_METHOD_CHOICES)
    reference_number = models.CharField(_('reference number'), max_length=100, blank=True)
    status = models.CharField(_('status'), max_length=20, choices=STATUS_CHOICES, default='PENDING')
    
    # Reconciliation
    reconciled_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='reconciled_contributions'
    )
    reconciled_at = models.DateTimeField(_('reconciled at'), blank=True, null=True)
    
    # Metadata
    notes = models.TextField(_('notes'), blank=True)
    created_at = models.DateTimeField(_('created at'), auto_now_add=True)
    updated_at = models.DateTimeField(_('updated at'), auto_now=True)
    
    class Meta:
        verbose_name = _('contribution')
        verbose_name_plural = _('contributions')
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['group', 'member']),
            models.Index(fields=['status']),
            models.Index(fields=['created_at']),
        ]
    
    def __str__(self):
        return f"{self.member.get_full_name()} - KES {self.amount} ({self.group.name})"


class Loan(models.Model):
    """Model for loans issued to members."""
    
    STATUS_CHOICES = [
        ('PENDING', 'Pending Approval'),
        ('APPROVED', 'Approved'),
        ('DISBURSED', 'Disbursed'),
        ('ACTIVE', 'Active'),
        ('COMPLETED', 'Completed'),
        ('DEFAULTED', 'Defaulted'),
        ('REJECTED', 'Rejected'),
    ]
    
    group = models.ForeignKey('groups.ChamaGroup', on_delete=models.CASCADE, related_name='loans')
    borrower = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='loans')
    
    # Loan details
    principal_amount = models.DecimalField(_('principal amount'), max_digits=12, decimal_places=2)
    interest_rate = models.DecimalField(
        _('interest rate'),
        max_digits=5,
        decimal_places=2,
        default=Decimal('10.0'),
        help_text=_('Annual interest rate in percentage (defaults to 10%)')
    )
    duration_months = models.PositiveIntegerField(_('duration (months)'))
    
    # Calculated fields
    total_amount = models.DecimalField(
        _('total amount'),
        max_digits=12,
        decimal_places=2,
        help_text=_('Principal + Interest')
    )
    monthly_payment = models.DecimalField(_('monthly payment'), max_digits=12, decimal_places=2)
    outstanding_balance = models.DecimalField(_('outstanding balance'), max_digits=12, decimal_places=2)
    
    # Status
    status = models.CharField(_('status'), max_length=20, choices=STATUS_CHOICES, default='PENDING')
    purpose = models.TextField(_('purpose'), help_text=_('Reason for loan'))
    
    # Approval workflow
    applied_at = models.DateTimeField(_('applied at'), auto_now_add=True)
    approved_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='approved_loans'
    )
    approved_at = models.DateTimeField(_('approved at'), blank=True, null=True)
    disbursed_at = models.DateTimeField(_('disbursed at'), blank=True, null=True)
    
    # Repayment
    due_date = models.DateField(_('due date'), blank=True, null=True)
    completed_at = models.DateTimeField(_('completed at'), blank=True, null=True)
    
    # Metadata
    notes = models.TextField(_('notes'), blank=True)
    updated_at = models.DateTimeField(_('updated at'), auto_now=True)
    
    class Meta:
        verbose_name = _('loan')
        verbose_name_plural = _('loans')
        ordering = ['-applied_at']
        indexes = [
            models.Index(fields=['group', 'borrower']),
            models.Index(fields=['status']),
            models.Index(fields=['applied_at']),
        ]
    
    def __str__(self):
        return f"Loan: {self.borrower.get_full_name()} - KES {self.principal_amount}"
    
    def calculate_total_amount(self):
        """Calculate total amount including interest."""
        interest = (self.principal_amount * self.interest_rate * self.duration_months) / (Decimal('100') * Decimal('12'))
        return self.principal_amount + interest
    
    def calculate_monthly_payment(self):
        """Calculate monthly payment amount."""
        if self.duration_months > 0:
            return self.total_amount / self.duration_months
        return Decimal('0.00')
    
    def save(self, *args, **kwargs):
        """Override save to calculate fields."""
        if not self.total_amount:
            self.total_amount = self.calculate_total_amount()
        if not self.monthly_payment:
            self.monthly_payment = self.calculate_monthly_payment()
        if not self.outstanding_balance:
            self.outstanding_balance = self.total_amount
        super().save(*args, **kwargs)


class LoanRepayment(models.Model):
    """Model for tracking loan repayments."""
    
    STATUS_CHOICES = [
        ('PENDING', 'Pending'),
        ('COMPLETED', 'Completed'),
        ('FAILED', 'Failed'),
    ]
    
    loan = models.ForeignKey(Loan, on_delete=models.CASCADE, related_name='repayments')
    amount = models.DecimalField(_('amount'), max_digits=10, decimal_places=2)
    payment_method = models.CharField(_('payment method'), max_length=20)
    reference_number = models.CharField(_('reference number'), max_length=100, blank=True)
    status = models.CharField(_('status'), max_length=20, choices=STATUS_CHOICES, default='PENDING')
    
    # Metadata
    paid_at = models.DateTimeField(_('paid at'), auto_now_add=True)
    notes = models.TextField(_('notes'), blank=True)
    
    class Meta:
        verbose_name = _('loan repayment')
        verbose_name_plural = _('loan repayments')
        ordering = ['-paid_at']
    
    def __str__(self):
        return f"Repayment: {self.loan.borrower.get_full_name()} - KES {self.amount}"


class Expense(models.Model):
    """Model for group expenses."""
    
    STATUS_CHOICES = [
        ('PENDING', 'Pending Approval'),
        ('APPROVED', 'Approved'),
        ('DISBURSED', 'Disbursed'),
        ('REJECTED', 'Rejected'),
    ]
    
    CATEGORY_CHOICES = [
        ('OPERATIONAL', 'Operational'),
        ('ADMINISTRATIVE', 'Administrative'),
        ('WELFARE', 'Welfare'),
        ('INVESTMENT', 'Investment'),
        ('OTHER', 'Other'),
    ]
    
    group = models.ForeignKey('groups.ChamaGroup', on_delete=models.CASCADE, related_name='expenses')
    category = models.CharField(_('category'), max_length=20, choices=CATEGORY_CHOICES)
    description = models.TextField(_('description'))
    amount = models.DecimalField(_('amount'), max_digits=10, decimal_places=2)
    status = models.CharField(_('status'), max_length=20, choices=STATUS_CHOICES, default='PENDING')
    
    # Supporting documents
    receipt = models.FileField(_('receipt'), upload_to='expenses/receipts/', blank=True, null=True)
    
    # Approval workflow
    requested_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='requested_expenses'
    )
    approved_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='approved_expenses'
    )
    
    # Metadata
    requested_at = models.DateTimeField(_('requested at'), auto_now_add=True)
    approved_at = models.DateTimeField(_('approved at'), blank=True, null=True)
    disbursed_at = models.DateTimeField(_('disbursed at'), blank=True, null=True)
    notes = models.TextField(_('notes'), blank=True)
    
    class Meta:
        verbose_name = _('expense')
        verbose_name_plural = _('expenses')
        ordering = ['-requested_at']
    
    def __str__(self):
        return f"{self.group.name} - {self.category} - KES {self.amount}"


class DisbursementApproval(models.Model):
    """Multi-signature approval for disbursements."""
    
    APPROVAL_TYPE_CHOICES = [
        ('LOAN', 'Loan Disbursement'),
        ('EXPENSE', 'Expense'),
        ('WITHDRAWAL', 'Withdrawal'),
    ]
    
    STATUS_CHOICES = [
        ('PENDING', 'Pending'),
        ('APPROVED', 'Approved'),
        ('REJECTED', 'Rejected'),
    ]
    
    group = models.ForeignKey('groups.ChamaGroup', on_delete=models.CASCADE, related_name='approvals')
    approval_type = models.CharField(_('approval type'), max_length=20, choices=APPROVAL_TYPE_CHOICES)
    amount = models.DecimalField(_('amount'), max_digits=12, decimal_places=2)
    description = models.TextField(_('description'))
    
    # Related objects (use generic relation in production for flexibility)
    loan = models.ForeignKey(Loan, on_delete=models.CASCADE, null=True, blank=True, related_name='approvals')
    expense = models.ForeignKey(Expense, on_delete=models.CASCADE, null=True, blank=True, related_name='approvals')
    
    # Approval tracking
    required_approvals = models.PositiveIntegerField(_('required approvals'), default=2)
    approvals_count = models.PositiveIntegerField(_('approvals count'), default=0)
    status = models.CharField(_('status'), max_length=20, choices=STATUS_CHOICES, default='PENDING')
    
    # Metadata
    requested_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='requested_approvals'
    )
    created_at = models.DateTimeField(_('created at'), auto_now_add=True)
    updated_at = models.DateTimeField(_('updated at'), auto_now=True)
    
    class Meta:
        verbose_name = _('disbursement approval')
        verbose_name_plural = _('disbursement approvals')
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.approval_type} - KES {self.amount} ({self.approvals_count}/{self.required_approvals})"


class ApprovalSignature(models.Model):
    """Individual signatures for multi-signature approvals."""
    
    approval = models.ForeignKey(DisbursementApproval, on_delete=models.CASCADE, related_name='signatures')
    approver = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='approval_signatures')
    approved = models.BooleanField(_('approved'), default=False)
    comments = models.TextField(_('comments'), blank=True)
    signed_at = models.DateTimeField(_('signed at'), auto_now_add=True)
    
    class Meta:
        verbose_name = _('approval signature')
        verbose_name_plural = _('approval signatures')
        unique_together = ['approval', 'approver']
        ordering = ['-signed_at']
    
    def __str__(self):
        status = 'Approved' if self.approved else 'Rejected'
        return f"{self.approver.get_full_name()} - {status}"

