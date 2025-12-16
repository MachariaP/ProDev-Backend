"""
Views for the finance app.

This module contains ViewSets for managing financial operations including
contributions, loans, expenses, disbursements, and transaction history.
"""
from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.pagination import PageNumberPagination
from django_filters.rest_framework import DjangoFilterBackend
from django.utils import timezone
from django.http import HttpResponse
from django.db.models import Q
from decimal import Decimal
from datetime import datetime
import csv

from groups.models import GroupMembership
from .models import (
    Contribution, Loan, LoanRepayment, Expense,
    DisbursementApproval, ApprovalSignature
)
from .serializers import (
    ContributionSerializer, LoanSerializer, LoanRepaymentSerializer,
    ExpenseSerializer, DisbursementApprovalSerializer,
    ApprovalSignatureSerializer, LoanApplicationSerializer
)


class IsAdminOrTreasurer(permissions.BasePermission):
    """
    Custom permission to allow access only to users with ADMIN or TREASURER role.
    
    This permission class checks if the user has ADMIN or TREASURER role
    in any group, or in a specific group if group_id is provided in query params.
    
    Usage:
        permission_classes = [permissions.IsAuthenticated, IsAdminOrTreasurer]
    """
    
    def has_permission(self, request, view):
        """
        Check if user has ADMIN or TREASURER role in relevant groups.
        
        Args:
            request: HTTP request object
            view: View being accessed
        
        Returns:
            bool: True if user has ADMIN or TREASURER role, False otherwise
        """
        # Must be authenticated
        if not request.user.is_authenticated:
            return False
        
        # Get group_id from query parameters if available
        group_id = request.query_params.get('group')
        
        # Build query for group membership with admin/treasurer roles
        if group_id:
            # Check specific group
            return GroupMembership.objects.filter(
                group_id=group_id,
                user=request.user,
                role__in=['ADMIN', 'TREASURER'],
                status='ACTIVE'
            ).exists()
        else:
            # Check if user is admin/treasurer in any group
            return GroupMembership.objects.filter(
                user=request.user,
                role__in=['ADMIN', 'TREASURER'],
                status='ACTIVE'
            ).exists()


class StandardPagination(PageNumberPagination):
    """
    Custom pagination class for consistent pagination across all endpoints.
    
    Attributes:
        page_size (int): Number of items per page
        page_size_query_param (str): Query parameter to override page size
        max_page_size (int): Maximum allowed page size
    """
    page_size = 100
    page_size_query_param = 'page_size'
    max_page_size = 1000


class TransactionPagination(PageNumberPagination):
    """
    Specialized pagination for transaction history with optimal defaults.
    
    Attributes:
        page_size (int): Number of transactions per page
        page_size_query_param (str): Query parameter to override page size
        max_page_size (int): Maximum allowed page size for transaction queries
    """
    page_size = 50
    page_size_query_param = 'limit'
    max_page_size = 500


class ContributionViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing Contributions.
    
    Provides CRUD operations for group contributions with filtering,
    reconciliation, and export capabilities.
    
    Actions:
        - list: Get all contributions (filterable)
        - retrieve: Get specific contribution
        - create: Create new contribution
        - update: Update contribution
        - destroy: Delete contribution
        - reconcile: Mark contribution as reconciled
        - export: Export contributions to CSV (admin/treasurer only)
    """
    
    queryset = Contribution.objects.all()
    serializer_class = ContributionSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['group', 'member', 'status', 'payment_method']
    
    def get_permissions(self):
        """
        Override to use different permissions for export action.
        
        Returns:
            list: List of permission classes for the current action
        """
        if self.action == 'export':
            # Only allow admin/treasurer for export
            return [permissions.IsAuthenticated(), IsAdminOrTreasurer()]
        return [permission() for permission in self.permission_classes]
    
    def perform_create(self, serializer):
        """
        Set member to current user when creating a contribution.
        
        Args:
            serializer: Contribution serializer instance
        """
        serializer.save(member=self.request.user)
    
    @action(detail=True, methods=['post'])
    def reconcile(self, request, pk=None):
        """
        Reconcile a contribution (Admin/Treasurer only).
        
        Args:
            request: HTTP request object
            pk (int): Primary key of contribution to reconcile
        
        Returns:
            Response: Updated contribution data or error
        """
        contribution = self.get_object()
        
        # Check if user has permission to reconcile
        if not IsAdminOrTreasurer().has_permission(request, self):
            return Response(
                {'error': 'Only group administrators or treasurers can reconcile contributions.'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        # Update reconciliation details
        contribution.status = 'RECONCILED'
        contribution.reconciled_by = request.user
        contribution.reconciled_at = timezone.now()
        contribution.save()
        
        serializer = self.get_serializer(contribution)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def export(self, request):
        """
        Export contributions to CSV (Admin/Treasurer only).
        
        This endpoint generates a CSV file containing all contributions
        based on current filters. Access is restricted to users with
        ADMIN or TREASURER role in the relevant group(s).
        
        Args:
            request: HTTP request object with optional query parameters
        
        Returns:
            HttpResponse: CSV file response
        
        Raises:
            PermissionDenied: If user is not admin/treasurer
        """
        # Permission is checked by IsAdminOrTreasurer class
        # Get filtered queryset
        queryset = self.filter_queryset(self.get_queryset())
        
        # Create the HttpResponse object with CSV header
        response = HttpResponse(content_type='text/csv')
        response['Content-Disposition'] = f'attachment; filename="contributions_{timezone.now().strftime("%Y%m%d_%H%M%S")}.csv"'
        
        # Create CSV writer with UTF-8 encoding for special characters
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
                contribution.member.get_full_name() if contribution.member else 'Unknown',
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
    """
    ViewSet for managing Loans.
    
    Provides CRUD operations for group loans including application,
    approval, disbursement, and calculation utilities.
    
    Actions:
        - list: Get all loans (filterable)
        - retrieve: Get specific loan
        - create: Apply for new loan
        - update: Update loan details
        - destroy: Delete loan application
        - calculate: Calculate loan repayment details
    """
    
    queryset = Loan.objects.all()
    serializer_class = LoanSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['group', 'borrower', 'status']
    pagination_class = StandardPagination
    
    def get_serializer_class(self):
        """
        Return appropriate serializer based on action.
        
        Returns:
            Serializer: Serializer class for current action
        """
        if self.action == 'create':
            return LoanApplicationSerializer
        return LoanSerializer
    
    def perform_create(self, serializer):
        """
        Set borrower to current user when creating a loan application.
        
        Args:
            serializer: Loan serializer instance
        """
        serializer.save(borrower=self.request.user)
    
    @action(detail=False, methods=['post'])
    def calculate(self, request):
        """
        Calculate loan repayment details without creating a loan.
        
        Args:
            request: HTTP request object with loan parameters
        
        Returns:
            Response: Calculated repayment details or error
        
        Example request:
            POST /loans/calculate/
            {
                "amount": 10000,
                "duration_months": 12,
                "interest_rate": 10.0  # optional, defaults to 10%
            }
        """
        try:
            amount = Decimal(str(request.data.get('amount', 0)))
            duration_months = int(request.data.get('duration_months', 12))
            interest_rate = Decimal(str(request.data.get('interest_rate', '10.0')))
            
            # Validate inputs
            if amount <= Decimal('0'):
                return Response(
                    {'error': 'Loan amount must be positive'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            if duration_months <= 0:
                return Response(
                    {'error': 'Loan duration must be positive'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            if interest_rate < Decimal('0'):
                return Response(
                    {'error': 'Interest rate cannot be negative'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Calculate interest using simple interest formula
            interest = (amount * interest_rate * duration_months) / (Decimal('100') * Decimal('12'))
            total_repayment = amount + interest
            monthly_payment = total_repayment / duration_months if duration_months > 0 else Decimal('0')
            
            return Response({
                'monthly_payment': round(monthly_payment, 2),
                'total_interest': round(interest, 2),
                'total_repayment': round(total_repayment, 2),
                'interest_rate': float(interest_rate)
            })
        except (ValueError, TypeError, KeyError) as e:
            return Response(
                {'error': f'Invalid input: {str(e)}'},
                status=status.HTTP_400_BAD_REQUEST
            )


class LoanRepaymentViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing Loan Repayments.
    
    Provides CRUD operations for loan repayment tracking including
    payment recording, status updates, and filtering.
    """
    
    queryset = LoanRepayment.objects.all()
    serializer_class = LoanRepaymentSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['loan', 'status']
    pagination_class = StandardPagination


class ExpenseViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing Expenses.
    
    Provides CRUD operations for group expenses including request,
    approval, payment, and tracking of financial expenditures.
    """
    
    queryset = Expense.objects.all()
    serializer_class = ExpenseSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['group', 'category', 'status']
    pagination_class = StandardPagination
    
    def perform_create(self, serializer):
        """
        Set requested_by to current user when creating an expense request.
        
        Args:
            serializer: Expense serializer instance
        """
        serializer.save(requested_by=self.request.user)


class DisbursementApprovalViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing Disbursement Approvals.
    
    Provides CRUD operations for approval workflows of financial
    disbursements including multi-signature requirements.
    """
    
    queryset = DisbursementApproval.objects.all()
    serializer_class = DisbursementApprovalSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['group', 'approval_type', 'status']
    pagination_class = StandardPagination
    
    def perform_create(self, serializer):
        """
        Set requested_by to current user when creating a disbursement approval.
        
        Args:
            serializer: DisbursementApproval serializer instance
        """
        serializer.save(requested_by=self.request.user)


class ApprovalSignatureViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing Approval Signatures.
    
    Provides CRUD operations for tracking individual signatures
    on multi-signature approval workflows.
    """
    
    queryset = ApprovalSignature.objects.all()
    serializer_class = ApprovalSignatureSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['approval', 'approver', 'approved']
    pagination_class = StandardPagination
    
    def perform_create(self, serializer):
        """
        Set approver to current user when creating an approval signature.
        
        Args:
            serializer: ApprovalSignature serializer instance
        """
        serializer.save(approver=self.request.user)


class TransactionViewSet(viewsets.ReadOnlyModelViewSet):
    """
    ViewSet for unified transaction history.
    
    Provides read-only access to consolidated transaction history
    from all financial activities (contributions, loans, expenses).
    Includes filtering, pagination, and export capabilities.
    
    Note: This endpoint aggregates data from multiple models and
    should be used with pagination for performance.
    """
    
    permission_classes = [permissions.IsAuthenticated]
    pagination_class = TransactionPagination
    
    def get_permissions(self):
        """
        Override to use different permissions for export action.
        
        Returns:
            list: List of permission classes for the current action
        """
        if self.action == 'export':
            # Only allow admin/treasurer for export
            return [permissions.IsAuthenticated(), IsAdminOrTreasurer()]
        return [permission() for permission in self.permission_classes]
    
    def list(self, request):
        """
        Return paginated unified transaction history from all financial activities.
        
        Args:
            request: HTTP request object with optional query parameters
        
        Returns:
            Response: Paginated transaction data
        
        Query Parameters:
            type: Filter by transaction type (contribution, loan, expense)
            status: Filter by status
            date_from: Filter by start date (YYYY-MM-DD)
            date_to: Filter by end date (YYYY-MM-DD)
            page: Page number for pagination
            limit: Number of transactions per page (default: 50, max: 500)
        """
        # Get filter parameters
        transaction_type = request.query_params.get('type', None)
        status_filter = request.query_params.get('status', None)
        date_from = request.query_params.get('date_from', None)
        date_to = request.query_params.get('date_to', None)
        
        transactions = []
        
        # Helper function to add transaction
        def add_transaction(id, type, category, amount, description, created_at, group_name, user_name, status, balance_after=0):
            """Helper to add transaction to list with consistent structure."""
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
        
        # Fetch contributions with pagination considerations
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
        
        # Fetch loans with pagination considerations
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
        
        # Fetch expenses with pagination considerations
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
        
        # Paginate the results
        page = self.paginate_queryset(transactions)
        if page is not None:
            return self.get_paginated_response(page)
        
        # Return unpaginated response (should not happen with pagination_class set)
        return Response({
            'count': len(transactions),
            'results': transactions
        })
    
    @action(detail=False, methods=['get'])
    def export(self, request):
        """
        Export transactions to CSV (Admin/Treasurer only).
        
        This endpoint generates a CSV file containing all transactions
        based on current filters. Access is restricted to users with
        ADMIN or TREASURER role in the relevant group(s).
        
        Args:
            request: HTTP request object with optional query parameters
        
        Returns:
            HttpResponse: CSV file response
        
        Raises:
            PermissionDenied: If user is not admin/treasurer
        """
        # Permission is checked by IsAdminOrTreasurer class
        # Get all transactions (no pagination for export)
        transactions_response = self.list(request)
        
        # Handle paginated response
        if hasattr(transactions_response, 'data'):
            data = transactions_response.data
            if 'results' in data:
                transactions = data['results']
            else:
                transactions = data
        else:
            transactions = []
        
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
                transaction.get('id', ''),
                transaction.get('type', ''),
                transaction.get('category', ''),
                transaction.get('amount', ''),
                transaction.get('description', ''),
                transaction.get('group_name', ''),
                transaction.get('user_name', ''),
                transaction.get('status', ''),
                transaction.get('created_at', '')
            ])
        
        return response
