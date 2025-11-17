from django.contrib import admin
from .models import (
    Contribution, Loan, LoanRepayment, Expense,
    DisbursementApproval, ApprovalSignature
)


@admin.register(Contribution)
class ContributionAdmin(admin.ModelAdmin):
    list_display = ['member', 'group', 'amount', 'status', 'payment_method', 'created_at']
    list_filter = ['status', 'payment_method', 'created_at']
    search_fields = ['member__email', 'group__name', 'reference_number']


@admin.register(Loan)
class LoanAdmin(admin.ModelAdmin):
    list_display = ['borrower', 'group', 'principal_amount', 'status', 'applied_at']
    list_filter = ['status', 'applied_at']
    search_fields = ['borrower__email', 'group__name']


@admin.register(LoanRepayment)
class LoanRepaymentAdmin(admin.ModelAdmin):
    list_display = ['loan', 'amount', 'status', 'paid_at']
    list_filter = ['status', 'paid_at']


@admin.register(Expense)
class ExpenseAdmin(admin.ModelAdmin):
    list_display = ['group', 'category', 'amount', 'status', 'requested_at']
    list_filter = ['category', 'status', 'requested_at']
    search_fields = ['group__name', 'description']


@admin.register(DisbursementApproval)
class DisbursementApprovalAdmin(admin.ModelAdmin):
    list_display = ['group', 'approval_type', 'amount', 'status', 'approvals_count', 'required_approvals']
    list_filter = ['approval_type', 'status']


@admin.register(ApprovalSignature)
class ApprovalSignatureAdmin(admin.ModelAdmin):
    list_display = ['approval', 'approver', 'approved', 'signed_at']
    list_filter = ['approved', 'signed_at']

