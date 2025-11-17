from rest_framework import viewsets, permissions
from django_filters.rest_framework import DjangoFilterBackend
from .models import (
    Contribution, Loan, LoanRepayment, Expense,
    DisbursementApproval, ApprovalSignature
)
from .serializers import (
    ContributionSerializer, LoanSerializer, LoanRepaymentSerializer,
    ExpenseSerializer, DisbursementApprovalSerializer,
    ApprovalSignatureSerializer, LoanApplicationSerializer
)


class ContributionViewSet(viewsets.ModelViewSet):
    """ViewSet for Contributions."""
    
    queryset = Contribution.objects.all()
    serializer_class = ContributionSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['group', 'member', 'status', 'payment_method']


class LoanViewSet(viewsets.ModelViewSet):
    """ViewSet for Loans."""
    
    queryset = Loan.objects.all()
    serializer_class = LoanSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['group', 'borrower', 'status']
    
    def get_serializer_class(self):
        """Return appropriate serializer."""
        if self.action == 'create':
            return LoanApplicationSerializer
        return LoanSerializer
    
    def perform_create(self, serializer):
        """Set borrower to current user."""
        serializer.save(borrower=self.request.user)


class LoanRepaymentViewSet(viewsets.ModelViewSet):
    """ViewSet for Loan Repayments."""
    
    queryset = LoanRepayment.objects.all()
    serializer_class = LoanRepaymentSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['loan', 'status']


class ExpenseViewSet(viewsets.ModelViewSet):
    """ViewSet for Expenses."""
    
    queryset = Expense.objects.all()
    serializer_class = ExpenseSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['group', 'category', 'status']
    
    def perform_create(self, serializer):
        """Set requested_by to current user."""
        serializer.save(requested_by=self.request.user)


class DisbursementApprovalViewSet(viewsets.ModelViewSet):
    """ViewSet for Disbursement Approvals."""
    
    queryset = DisbursementApproval.objects.all()
    serializer_class = DisbursementApprovalSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['group', 'approval_type', 'status']
    
    def perform_create(self, serializer):
        """Set requested_by to current user."""
        serializer.save(requested_by=self.request.user)


class ApprovalSignatureViewSet(viewsets.ModelViewSet):
    """ViewSet for Approval Signatures."""
    
    queryset = ApprovalSignature.objects.all()
    serializer_class = ApprovalSignatureSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['approval', 'approver', 'approved']
    
    def perform_create(self, serializer):
        """Set approver to current user."""
        serializer.save(approver=self.request.user)

