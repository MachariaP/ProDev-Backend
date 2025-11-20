from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from django.utils import timezone
from decimal import Decimal
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
    
    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAuthenticated])
    def reconcile(self, request, pk=None):
        """Reconcile a contribution (Admin/Treasurer only)."""
        contribution = self.get_object()
        
        # Update reconciliation details
        contribution.status = 'RECONCILED'
        contribution.reconciled_by = request.user
        contribution.reconciled_at = timezone.now()
        contribution.save()
        
        serializer = self.get_serializer(contribution)
        return Response(serializer.data)


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
    
    @action(detail=False, methods=['post'], permission_classes=[permissions.IsAuthenticated])
    def calculate(self, request):
        """Calculate loan repayment details without creating a loan."""
        try:
            amount = Decimal(str(request.data.get('amount', 0)))
            duration_months = int(request.data.get('duration_months', 12))
            
            # Use a default interest rate (e.g., 10% per annum)
            # In production, this should come from group settings or policy
            interest_rate = Decimal('10.0')
            
            # Calculate interest using simple interest formula
            interest = (amount * interest_rate * duration_months) / (Decimal('100') * Decimal('12'))
            total_repayment = amount + interest
            monthly_payment = total_repayment / duration_months if duration_months > 0 else Decimal('0')
            
            return Response({
                'monthly_payment': round(monthly_payment, 2),
                'total_interest': round(interest, 2),
                'total_repayment': round(total_repayment, 2)
            })
        except (ValueError, TypeError, KeyError) as e:
            return Response(
                {'error': f'Invalid input: {str(e)}'},
                status=status.HTTP_400_BAD_REQUEST
            )


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

