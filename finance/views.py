from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from django.utils import timezone
from django.http import HttpResponse
from django.db.models import Q
from decimal import Decimal
from datetime import datetime
import csv
from itertools import chain
from operator import attrgetter
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
    
    def perform_create(self, serializer):
        """Set member to current user."""
        serializer.save(member=self.request.user)
    
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
    
    @action(detail=False, methods=['get'], permission_classes=[permissions.IsAuthenticated])
    def export(self, request):
        """
        Export contributions to CSV.
        
        Note: In production, consider restricting this to admin/treasurer roles
        to prevent unauthorized data access. This can be done by creating a custom
        permission class like IsAdminOrTreasurer and adding it to permission_classes.
        """
        # Get filtered queryset
        queryset = self.filter_queryset(self.get_queryset())
        
        # Create the HttpResponse object with CSV header
        response = HttpResponse(content_type='text/csv')
        response['Content-Disposition'] = f'attachment; filename="contributions_{timezone.now().strftime("%Y%m%d_%H%M%S")}.csv"'
        
        # Create CSV writer
        writer = csv.writer(response)
        
        # Write header row
        writer.writerow([
            'ID', 'Group', 'Member', 'Amount (KES)', 'Payment Method', 
            'Reference Number', 'Status', 'Reconciled By', 'Reconciled At', 
            'Notes', 'Created At', 'Updated At'
        ])
        
        # Write data rows
        for contribution in queryset:
            writer.writerow([
                contribution.id,
                contribution.group.name,
                contribution.member.get_full_name(),
                contribution.amount,
                contribution.get_payment_method_display(),
                contribution.reference_number or '',
                contribution.get_status_display(),
                contribution.reconciled_by.get_full_name() if contribution.reconciled_by else '',
                contribution.reconciled_at.strftime('%Y-%m-%d %H:%M:%S') if contribution.reconciled_at else '',
                contribution.notes or '',
                contribution.created_at.strftime('%Y-%m-%d %H:%M:%S'),
                contribution.updated_at.strftime('%Y-%m-%d %H:%M:%S')
            ])
        
        return response


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


class TransactionViewSet(viewsets.ReadOnlyModelViewSet):
    """ViewSet for unified transaction history."""
    
    permission_classes = [permissions.IsAuthenticated]
    
    def list(self, request):
        """Return unified transaction history from all financial activities."""
        # Get filter parameters
        transaction_type = request.query_params.get('type', None)
        status_filter = request.query_params.get('status', None)
        date_from = request.query_params.get('date_from', None)
        date_to = request.query_params.get('date_to', None)
        
        transactions = []
        
        # Helper function to add transaction
        def add_transaction(id, type, category, amount, description, created_at, group_name, user_name, status, balance_after=0):
            transactions.append({
                'id': id,
                'type': type,
                'category': category,
                'amount': float(amount),
                'balance_after': balance_after,
                'description': description,
                'created_at': created_at.isoformat() if created_at else None,
                'group_name': group_name,
                'user_name': user_name,
                'status': status,
            })
        
        # Fetch contributions
        if not transaction_type or transaction_type == 'contribution':
            contributions = Contribution.objects.select_related('group', 'member').all()
            if status_filter:
                contributions = contributions.filter(status__iexact=status_filter)
            if date_from:
                contributions = contributions.filter(created_at__gte=date_from)
            if date_to:
                contributions = contributions.filter(created_at__lte=date_to)
            
            for c in contributions:
                add_transaction(
                    id=f"contribution-{c.id}",
                    type='contribution',
                    category=c.get_payment_method_display(),
                    amount=c.amount,
                    description=f"Contribution via {c.get_payment_method_display()}",
                    created_at=c.created_at,
                    group_name=c.group.name,
                    user_name=c.member.get_full_name() if c.member else 'Unknown',
                    status=c.status.lower(),
                )
        
        # Fetch loans
        if not transaction_type or transaction_type == 'loan':
            loans = Loan.objects.select_related('group', 'borrower').all()
            if status_filter:
                loans = loans.filter(status__iexact=status_filter)
            if date_from:
                loans = loans.filter(applied_at__gte=date_from)
            if date_to:
                loans = loans.filter(applied_at__lte=date_to)
            
            for l in loans:
                add_transaction(
                    id=f"loan-{l.id}",
                    type='loan',
                    category='Loan Disbursement',
                    amount=l.principal_amount,
                    description=f"Loan: {l.purpose[:50]}..." if len(l.purpose) > 50 else f"Loan: {l.purpose}",
                    created_at=l.disbursed_at or l.applied_at,
                    group_name=l.group.name,
                    user_name=l.borrower.get_full_name() if l.borrower else 'Unknown',
                    status=l.status.lower(),
                )
        
        # Fetch expenses
        if not transaction_type or transaction_type == 'expense':
            expenses = Expense.objects.select_related('group', 'requested_by').all()
            if status_filter:
                expenses = expenses.filter(status__iexact=status_filter)
            if date_from:
                expenses = expenses.filter(requested_at__gte=date_from)
            if date_to:
                expenses = expenses.filter(requested_at__lte=date_to)
            
            for e in expenses:
                add_transaction(
                    id=f"expense-{e.id}",
                    type='expense',
                    category=e.get_category_display(),
                    amount=e.amount,
                    description=e.description[:100] if len(e.description) > 100 else e.description,
                    created_at=e.requested_at,
                    group_name=e.group.name,
                    user_name=e.requested_by.get_full_name() if e.requested_by else 'Unknown',
                    status=e.status.lower(),
                )
        
        # Sort transactions by date (newest first)
        transactions.sort(key=lambda x: x['created_at'] or datetime.min.isoformat(), reverse=True)
        
        return Response({
            'count': len(transactions),
            'results': transactions
        })
    
    @action(detail=False, methods=['get'], permission_classes=[permissions.IsAuthenticated])
    def export(self, request):
        """Export transactions to CSV."""
        # Get all transactions
        transactions_response = self.list(request)
        transactions = transactions_response.data.get('results', [])
        
        # Create the HttpResponse object with CSV header
        response = HttpResponse(content_type='text/csv')
        response['Content-Disposition'] = f'attachment; filename="transactions_{timezone.now().strftime("%Y%m%d_%H%M%S")}.csv"'
        
        # Create CSV writer
        writer = csv.writer(response)
        
        # Write header row
        writer.writerow([
            'ID', 'Type', 'Category', 'Amount (KES)', 'Description',
            'Group', 'User', 'Status', 'Date'
        ])
        
        # Write data rows
        for transaction in transactions:
            writer.writerow([
                transaction['id'],
                transaction['type'],
                transaction['category'],
                transaction['amount'],
                transaction['description'],
                transaction['group_name'],
                transaction['user_name'],
                transaction['status'],
                transaction['created_at']
            ])
        
        return response

