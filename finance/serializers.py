from rest_framework import serializers
from django.db.models import Sum
from decimal import Decimal
from .models import (
    Contribution, Loan, LoanRepayment, Expense,
    DisbursementApproval, ApprovalSignature
)


class ContributionSerializer(serializers.ModelSerializer):
    """Serializer for Contributions."""
    
    member_name = serializers.CharField(source='member.get_full_name', read_only=True)
    group_name = serializers.CharField(source='group.name', read_only=True)
    reconciled_by_name = serializers.CharField(source='reconciled_by.get_full_name', read_only=True)
    
    class Meta:
        model = Contribution
        fields = [
            'id', 'group', 'group_name', 'member', 'member_name',
            'amount', 'payment_method', 'reference_number',
            'status', 'reconciled_by', 'reconciled_by_name',
            'reconciled_at', 'notes', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'member', 'reconciled_by', 'reconciled_at', 'created_at', 'updated_at']


class LoanSerializer(serializers.ModelSerializer):
    """Serializer for Loans."""
    
    borrower_name = serializers.CharField(source='borrower.get_full_name', read_only=True)
    group_name = serializers.CharField(source='group.name', read_only=True)
    approved_by_name = serializers.CharField(source='approved_by.get_full_name', read_only=True)
    total_paid = serializers.SerializerMethodField()
    
    class Meta:
        model = Loan
        fields = [
            'id', 'group', 'group_name', 'borrower', 'borrower_name',
            'principal_amount', 'interest_rate', 'duration_months',
            'total_amount', 'monthly_payment', 'outstanding_balance',
            'status', 'purpose', 'applied_at', 'approved_by',
            'approved_by_name', 'approved_at', 'disbursed_at',
            'due_date', 'completed_at', 'notes', 'total_paid'
        ]
        read_only_fields = [
            'id', 'total_amount', 'monthly_payment',
            'outstanding_balance', 'applied_at', 'approved_by',
            'approved_at', 'disbursed_at', 'completed_at'
        ]
    
    def get_total_paid(self, obj):
        """Get total amount paid so far."""
        total = obj.repayments.filter(status='COMPLETED').aggregate(total=Sum('amount'))
        return total['total'] or 0


class LoanApplicationSerializer(serializers.ModelSerializer):
    """Serializer for loan application."""
    
    interest_rate = serializers.DecimalField(
        max_digits=5, 
        decimal_places=2, 
        required=False, 
        default=Decimal('10.0'),
        help_text='Annual interest rate in percentage (defaults to 10% if not provided)'
    )
    
    class Meta:
        model = Loan
        fields = [
            'group', 'principal_amount', 'interest_rate',
            'duration_months', 'purpose'
        ]


class LoanRepaymentSerializer(serializers.ModelSerializer):
    """Serializer for Loan Repayments."""
    
    loan_details = serializers.SerializerMethodField()
    
    class Meta:
        model = LoanRepayment
        fields = [
            'id', 'loan', 'loan_details', 'amount',
            'payment_method', 'reference_number',
            'status', 'paid_at', 'notes'
        ]
        read_only_fields = ['id', 'paid_at']
    
    def get_loan_details(self, obj):
        """Get basic loan information."""
        return {
            'borrower': obj.loan.borrower.get_full_name(),
            'principal': str(obj.loan.principal_amount),
            'outstanding': str(obj.loan.outstanding_balance)
        }


class ExpenseSerializer(serializers.ModelSerializer):
    """Serializer for Expenses."""
    
    group_name = serializers.CharField(source='group.name', read_only=True)
    requested_by_name = serializers.CharField(source='requested_by.get_full_name', read_only=True)
    approved_by_name = serializers.CharField(source='approved_by.get_full_name', read_only=True)
    
    class Meta:
        model = Expense
        fields = [
            'id', 'group', 'group_name', 'category', 'description',
            'amount', 'status', 'receipt', 'requested_by',
            'requested_by_name', 'approved_by', 'approved_by_name',
            'requested_at', 'approved_at', 'disbursed_at', 'notes'
        ]
        read_only_fields = [
            'id', 'requested_by', 'requested_at',
            'approved_by', 'approved_at', 'disbursed_at'
        ]


class ApprovalSignatureSerializer(serializers.ModelSerializer):
    """Serializer for Approval Signatures."""
    
    approver_name = serializers.CharField(source='approver.get_full_name', read_only=True)
    
    class Meta:
        model = ApprovalSignature
        fields = ['id', 'approver', 'approver_name', 'approved', 'comments', 'signed_at']
        read_only_fields = ['id', 'signed_at']


class DisbursementApprovalSerializer(serializers.ModelSerializer):
    """Serializer for Disbursement Approvals."""
    
    group_name = serializers.CharField(source='group.name', read_only=True)
    requested_by_name = serializers.CharField(source='requested_by.get_full_name', read_only=True)
    signatures = ApprovalSignatureSerializer(many=True, read_only=True)
    is_approved = serializers.SerializerMethodField()
    
    class Meta:
        model = DisbursementApproval
        fields = [
            'id', 'group', 'group_name', 'approval_type',
            'amount', 'description', 'loan', 'expense',
            'required_approvals', 'approvals_count', 'status',
            'requested_by', 'requested_by_name', 'signatures',
            'is_approved', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'approvals_count', 'status', 'requested_by', 'created_at', 'updated_at']
    
    def get_is_approved(self, obj):
        """Check if approval has enough signatures."""
        return obj.approvals_count >= obj.required_approvals


class TransactionFeedSerializer(serializers.Serializer):
    """Serializer for unified transaction feed."""
    
    id = serializers.IntegerField()
    type = serializers.CharField()
    amount = serializers.DecimalField(max_digits=12, decimal_places=2)
    description = serializers.CharField()
    member = serializers.CharField()
    date = serializers.DateTimeField()
    status = serializers.CharField()
