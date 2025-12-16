"""
Views for M-Pesa integration.

This module provides ViewSets for managing M-Pesa transactions, bulk payments,
and reconciliation with actual Safaricom Daraja API integration.
"""
import json
import logging
from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.pagination import PageNumberPagination
from django.utils import timezone
from django.http import HttpResponse, JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.db import transaction as db_transaction
from django.conf import settings

from groups.models import ChamaGroup, GroupMembership
from finance.models import Contribution
from .models import MPesaTransaction, MPesaBulkPayment, PaymentReconciliation
from .serializers import (
    MPesaTransactionSerializer, STKPushRequestSerializer,
    MPesaBulkPaymentSerializer, PaymentReconciliationSerializer,
    BulkPaymentRequestSerializer
)
from .utils import MpesaDarajaAPI, format_phone_number

logger = logging.getLogger(__name__)


class IsGroupAdminOrTreasurer(permissions.BasePermission):
    """
    Custom permission to allow access only to group administrators or treasurers.
    
    This permission checks if the user has ADMIN, CHAIRPERSON, or TREASURER role
    in the specified group.
    """
    
    def has_permission(self, request, view):
        """
        Check if user has admin/treasurer permissions.
        
        Args:
            request: HTTP request object
            view: View being accessed
        
        Returns:
            bool: True if user has permission, False otherwise
        """
        if not request.user.is_authenticated:
            return False
        
        # Get group_id from query params or request data
        group_id = request.query_params.get('group') or request.data.get('group')
        
        if group_id:
            # Check specific group
            return GroupMembership.objects.filter(
                group_id=group_id,
                user=request.user,
                role__in=['ADMIN', 'CHAIRPERSON', 'TREASURER'],
                status='ACTIVE'
            ).exists()
        
        return False


class MPesaTransactionPagination(PageNumberPagination):
    """Pagination class for M-Pesa transactions."""
    page_size = 50
    page_size_query_param = 'page_size'
    max_page_size = 200


class MPesaTransactionViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing M-Pesa transactions.
    
    Provides CRUD operations for M-Pesa transactions with integrated
    Daraja API for STK Push initiation and callback handling.
    
    Actions:
        - list: Get all M-Pesa transactions (filterable)
        - retrieve: Get specific transaction
        - create: Create transaction record (for manual entry)
        - initiate_stk_push: Initiate STK Push payment
        - check_status: Check transaction status
        - query_payment_status: Query Daraja API for payment status
    """
    
    queryset = MPesaTransaction.objects.all()
    serializer_class = MPesaTransactionSerializer
    permission_classes = [IsAuthenticated]
    pagination_class = MPesaTransactionPagination
    filterset_fields = ['status', 'transaction_type', 'group', 'user']
    search_fields = [
        'transaction_id', 'phone_number', 'mpesa_receipt_number',
        'account_reference', 'transaction_desc'
    ]
    ordering_fields = [
        'created_at', 'amount', 'transaction_date', 'updated_at'
    ]
    ordering = ['-created_at']
    
    def get_queryset(self):
        """
        Filter transactions based on user permissions.
        
        Returns:
            QuerySet: Filtered transactions queryset
        """
        user = self.request.user
        
        if user.is_staff:
            return MPesaTransaction.objects.all().select_related(
                'group', 'user', 'contribution'
            )
        
        # Regular users can see their own transactions and group transactions
        user_transactions = MPesaTransaction.objects.filter(user=user)
        
        # Get groups where user is a member
        user_groups = ChamaGroup.objects.filter(
            memberships__user=user,
            memberships__status='ACTIVE'
        )
        group_transactions = MPesaTransaction.objects.filter(
            group__in=user_groups
        )
        
        return (user_transactions | group_transactions).select_related(
            'group', 'user', 'contribution'
        ).distinct()
    
    def perform_create(self, serializer):
        """
        Set user when creating a transaction.
        
        Args:
            serializer: Transaction serializer instance
        """
        if not serializer.validated_data.get('user'):
            serializer.save(user=self.request.user)
        else:
            serializer.save()
    
    @action(detail=False, methods=['post'], permission_classes=[IsAuthenticated])
    def initiate_stk_push(self, request):
        """
        Initiate STK Push payment request.
        
        This endpoint integrates with Safaricom Daraja API to initiate
        an STK Push payment request to the user's phone.
        
        Args:
            request: HTTP request with payment details
        
        Returns:
            Response: Transaction details or error
        
        Example request:
            POST /api/v1/mpesa/transactions/initiate_stk_push/
            {
                "phone_number": "254712345678",
                "amount": "1000.00",
                "account_reference": "CONT001",
                "transaction_desc": "Monthly contribution",
                "group_id": 1
            }
        """
        serializer = STKPushRequestSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            data = serializer.validated_data
            phone_number = data['phone_number']
            amount = data['amount']
            account_reference = data['account_reference']
            transaction_desc = data['transaction_desc']
            group_id = data.get('group_id')
            
            # Format phone number for Daraja API
            formatted_phone = format_phone_number(phone_number)
            
            # Get group if specified
            group = None
            if group_id:
                try:
                    group = ChamaGroup.objects.get(id=group_id)
                    # Verify user has access to this group
                    if not GroupMembership.objects.filter(
                        group=group,
                        user=request.user,
                        status='ACTIVE'
                    ).exists():
                        return Response(
                            {'error': 'You are not a member of this group'},
                            status=status.HTTP_403_FORBIDDEN
                        )
                except ChamaGroup.DoesNotExist:
                    return Response(
                        {'error': 'Group not found'},
                        status=status.HTTP_404_NOT_FOUND
                    )
            
            # Create transaction record
            transaction = MPesaTransaction.objects.create(
                transaction_type='STK_PUSH',
                amount=amount,
                phone_number=formatted_phone,
                account_reference=account_reference,
                transaction_desc=transaction_desc,
                user=request.user,
                group=group,
                status='PENDING'
            )
            
            # Initialize Daraja API
            daraja_api = MpesaDarajaAPI()
            
            # Initiate STK Push
            response = daraja_api.stk_push_request(
                phone_number=formatted_phone,
                amount=float(amount),
                account_reference=account_reference,
                transaction_desc=transaction_desc
            )
            
            # Update transaction with Daraja response
            if response.get('ResponseCode') == '0':
                transaction.merchant_request_id = response.get('MerchantRequestID')
                transaction.checkout_request_id = response.get('CheckoutRequestID')
                transaction.transaction_id = response.get('MerchantRequestID') or f"TXN{transaction.id:08d}"
                transaction.save()
                
                logger.info(
                    f"STK Push initiated for transaction {transaction.id}. "
                    f"MerchantRequestID: {transaction.merchant_request_id}"
                )
                
                return Response({
                    'message': 'STK Push initiated successfully. Please check your phone to complete payment.',
                    'transaction_id': transaction.transaction_id,
                    'checkout_request_id': transaction.checkout_request_id,
                    'status': transaction.status,
                    'amount': str(amount),
                    'phone_number': phone_number
                }, status=status.HTTP_201_CREATED)
            else:
                # Update transaction status to failed
                transaction.status = 'FAILED'
                transaction.result_code = response.get('ResponseCode', '9999')
                transaction.result_desc = response.get('ResponseDescription', 'Unknown error')
                transaction.save()
                
                logger.error(
                    f"STK Push failed for transaction {transaction.id}. "
                    f"Response: {response}"
                )
                
                return Response({
                    'error': 'Failed to initiate STK Push',
                    'details': response
                }, status=status.HTTP_400_BAD_REQUEST)
                
        except ValueError as e:
            logger.error(f"Invalid phone number format: {str(e)}")
            return Response(
                {'error': f'Invalid phone number format: {str(e)}'},
                status=status.HTTP_400_BAD_REQUEST
            )
        except Exception as e:
            logger.error(f"STK Push initiation failed: {str(e)}")
            return Response(
                {'error': f'Failed to initiate payment: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    @action(detail=True, methods=['get'])
    def check_status(self, request, pk=None):
        """
        Check transaction status.
        
        Args:
            request: HTTP request
            pk: Transaction primary key
        
        Returns:
            Response: Transaction status details
        """
        transaction = self.get_object()
        
        # Check if user has permission to view this transaction
        if (transaction.user != request.user and 
            not (transaction.group and 
                 GroupMembership.objects.filter(
                     group=transaction.group,
                     user=request.user,
                     status='ACTIVE'
                 ).exists())):
            return Response(
                {'error': 'You do not have permission to view this transaction'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        return Response({
            'transaction_id': transaction.transaction_id,
            'status': transaction.status,
            'amount': str(transaction.amount),
            'phone_number': transaction.phone_number,
            'mpesa_receipt_number': transaction.mpesa_receipt_number,
            'transaction_date': transaction.transaction_date,
            'result_desc': transaction.result_desc
        })
    
    @action(detail=True, methods=['post'])
    def query_payment_status(self, request, pk=None):
        """
        Query Daraja API for payment status.
        
        This endpoint queries the Daraja API to get the current status
        of an STK Push transaction.
        
        Args:
            request: HTTP request
            pk: Transaction primary key
        
        Returns:
            Response: Updated transaction status
        """
        transaction = self.get_object()
        
        if transaction.transaction_type != 'STK_PUSH':
            return Response(
                {'error': 'This endpoint is only for STK Push transactions'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        if not transaction.checkout_request_id:
            return Response(
                {'error': 'No checkout request ID available for this transaction'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            daraja_api = MpesaDarajaAPI()
            response = daraja_api.query_stk_status(transaction.checkout_request_id)
            
            # Update transaction based on response
            if response.get('ResultCode') == '0':
                # Payment successful
                transaction.status = 'SUCCESS'
                transaction.result_code = '0'
                transaction.result_desc = 'The service request is processed successfully.'
                
                # Update callback timestamp if not already set
                if not transaction.callback_received_at:
                    transaction.callback_received_at = timezone.now()
                
                # Check if we need to create a contribution
                if transaction.group and not transaction.contribution:
                    try:
                        contribution = Contribution.objects.create(
                            group=transaction.group,
                            member=transaction.user,
                            amount=transaction.amount,
                            payment_method='MPESA',
                            reference_number=transaction.mpesa_receipt_number or transaction.transaction_id,
                            status='RECONCILED',
                            notes=f'M-Pesa payment: {transaction.transaction_desc}',
                            reconciled_by=request.user,
                            reconciled_at=timezone.now()
                        )
                        transaction.contribution = contribution
                    except Exception as e:
                        logger.error(f"Failed to create contribution for transaction {transaction.id}: {str(e)}")
                
                transaction.save()
                
                return Response({
                    'message': 'Payment confirmed successfully',
                    'status': 'SUCCESS',
                    'mpesa_receipt_number': transaction.mpesa_receipt_number
                })
            else:
                # Payment failed
                transaction.status = 'FAILED'
                transaction.result_code = response.get('ResultCode', '9999')
                transaction.result_desc = response.get('ResultDesc', 'Unknown error')
                transaction.save()
                
                return Response({
                    'error': 'Payment failed',
                    'result_code': transaction.result_code,
                    'result_desc': transaction.result_desc
                }, status=status.HTTP_400_BAD_REQUEST)
                
        except Exception as e:
            logger.error(f"Failed to query payment status: {str(e)}")
            return Response(
                {'error': f'Failed to query payment status: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


@api_view(['POST'])
@permission_classes([])  # No authentication required for callbacks
@csrf_exempt
def mpesa_callback(request):
    """
    Webhook endpoint for M-Pesa payment callbacks.
    
    This endpoint receives callbacks from Safaricom Daraja API when
    transactions are completed. It validates the signature and updates
    the transaction status.
    
    Args:
        request: HTTP request with callback data
    
    Returns:
        JsonResponse: Confirmation response
    
    Security:
        - Validates signature using Daraja public key
        - Verifies transaction data integrity
        - Logs all callback attempts for audit
    """
    try:
        # Get raw request body for signature validation
        raw_body = request.body.decode('utf-8')
        
        # Get signature from header
        signature = request.headers.get('Signature', '')
        
        # Log callback for debugging
        logger.info(f"M-Pesa callback received: {raw_body}")
        logger.info(f"Signature: {signature}")
        
        # Parse JSON data
        try:
            data = json.loads(raw_body)
        except json.JSONDecodeError:
            logger.error("Invalid JSON in callback")
            return JsonResponse(
                {'ResultCode': 1, 'ResultDesc': 'Invalid JSON'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Validate signature if in production mode
        if not settings.DEBUG:
            daraja_api = MpesaDarajaAPI()
            if not daraja_api.validate_callback_signature(raw_body, signature):
                logger.error("Invalid signature in callback")
                return JsonResponse(
                    {'ResultCode': 1, 'ResultDesc': 'Invalid signature'},
                    status=status.HTTP_400_BAD_REQUEST
                )
        
        # Process STK Push callback
        stk_callback = data.get('Body', {}).get('stkCallback')
        if stk_callback:
            return process_stk_callback(stk_callback, data)
        
        # Process C2B callback
        c2b_result = data.get('Result')
        if c2b_result:
            return process_c2b_callback(c2b_result, data)
        
        # Unknown callback type
        logger.warning(f"Unknown callback type: {data}")
        return JsonResponse(
            {'ResultCode': 0, 'ResultDesc': 'Success'},
            status=status.HTTP_200_OK
        )
        
    except Exception as e:
        logger.error(f"Error processing callback: {str(e)}")
        return JsonResponse(
            {'ResultCode': 1, 'ResultDesc': f'Error: {str(e)}'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


def process_stk_callback(stk_callback, full_data):
    """
    Process STK Push callback from Daraja API.
    
    Args:
        stk_callback (dict): STK callback data
        full_data (dict): Full callback data
    
    Returns:
        JsonResponse: Processing result
    """
    checkout_request_id = stk_callback.get('CheckoutRequestID')
    result_code = stk_callback.get('ResultCode')
    result_desc = stk_callback.get('ResultDesc')
    callback_items = stk_callback.get('CallbackMetadata', {}).get('Item', [])
    
    logger.info(
        f"Processing STK callback for CheckoutRequestID: {checkout_request_id}, "
        f"ResultCode: {result_code}"
    )
    
    # Find transaction by checkout request ID
    try:
        transaction = MPesaTransaction.objects.get(
            checkout_request_id=checkout_request_id
        )
    except MPesaTransaction.DoesNotExist:
        logger.error(f"Transaction not found for CheckoutRequestID: {checkout_request_id}")
        return JsonResponse(
            {'ResultCode': 1, 'ResultDesc': 'Transaction not found'},
            status=status.HTTP_404_NOT_FOUND
        )
    
    # Update transaction with callback data
    transaction.result_code = str(result_code)
    transaction.result_desc = result_desc
    transaction.callback_received_at = timezone.now()
    
    # Extract M-Pesa receipt number and transaction date
    for item in callback_items:
        if item.get('Name') == 'MpesaReceiptNumber':
            transaction.mpesa_receipt_number = item.get('Value')
        elif item.get('Name') == 'TransactionDate':
            # Convert Daraja date format (YYYYMMDDHHMMSS) to datetime
            try:
                date_str = str(item.get('Value'))
                transaction.transaction_date = datetime.datetime.strptime(
                    date_str, '%Y%m%d%H%M%S'
                )
            except (ValueError, TypeError):
                pass
    
    # Update status based on result code
    if result_code == 0:
        transaction.status = 'SUCCESS'
        
        # Create contribution if this is for a group
        if transaction.group and not transaction.contribution:
            try:
                with db_transaction.atomic():
                    contribution = Contribution.objects.create(
                        group=transaction.group,
                        member=transaction.user,
                        amount=transaction.amount,
                        payment_method='MPESA',
                        reference_number=transaction.mpesa_receipt_number or transaction.transaction_id,
                        status='RECONCILED',
                        notes=f'M-Pesa payment: {transaction.transaction_desc}',
                        reconciled_at=timezone.now()
                    )
                    transaction.contribution = contribution
                    
                    # Update group balance
                    transaction.group.total_balance += transaction.amount
                    transaction.group.save()
                    
                    logger.info(
                        f"Created contribution {contribution.id} for "
                        f"transaction {transaction.id}"
                    )
            except Exception as e:
                logger.error(f"Failed to create contribution: {str(e)}")
    else:
        transaction.status = 'FAILED'
    
    transaction.save()
    
    logger.info(
        f"Updated transaction {transaction.id} to status {transaction.status}. "
        f"M-Pesa Receipt: {transaction.mpesa_receipt_number}"
    )
    
    return JsonResponse(
        {'ResultCode': 0, 'ResultDesc': 'Success'},
        status=status.HTTP_200_OK
    )


def process_c2b_callback(result_data, full_data):
    """
    Process C2B (Customer to Business) callback.
    
    Args:
        result_data (dict): C2B result data
        full_data (dict): Full callback data
    
    Returns:
        JsonResponse: Processing result
    """
    result_code = result_data.get('ResultCode')
    result_desc = result_data.get('ResultDesc')
    transaction_id = result_data.get('TransactionID')
    
    logger.info(
        f"Processing C2B callback for TransactionID: {transaction_id}, "
        f"ResultCode: {result_code}"
    )
    
    # Find transaction by transaction ID
    try:
        transaction = MPesaTransaction.objects.get(
            transaction_id=transaction_id
        )
    except MPesaTransaction.DoesNotExist:
        # Try to find by M-Pesa receipt number
        try:
            transaction = MPesaTransaction.objects.get(
                mpesa_receipt_number=transaction_id
            )
        except MPesaTransaction.DoesNotExist:
            logger.error(f"Transaction not found for TransactionID: {transaction_id}")
            return JsonResponse(
                {'ResultCode': 1, 'ResultDesc': 'Transaction not found'},
                status=status.HTTP_404_NOT_FOUND
            )
    
    # Update transaction
    transaction.result_code = str(result_code)
    transaction.result_desc = result_desc
    transaction.callback_received_at = timezone.now()
    
    if result_code == 0:
        transaction.status = 'SUCCESS'
    else:
        transaction.status = 'FAILED'
    
    transaction.save()
    
    logger.info(
        f"Updated C2B transaction {transaction.id} to status {transaction.status}"
    )
    
    return JsonResponse(
        {'ResultCode': 0, 'ResultDesc': 'Success'},
        status=status.HTTP_200_OK
    )


class MPesaBulkPaymentViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing M-Pesa bulk payments.
    
    Provides CRUD operations for bulk payments to multiple recipients
    with integrated Daraja B2C API.
    
    Actions:
        - list: Get all bulk payments (filterable)
        - retrieve: Get specific bulk payment
        - create: Create new bulk payment batch
        - process_batch: Process batch payments
        - retry_failed: Retry failed payments in batch
    """
    
    queryset = MPesaBulkPayment.objects.all()
    serializer_class = MPesaBulkPaymentSerializer
    permission_classes = [IsAuthenticated, IsGroupAdminOrTreasurer]
    filterset_fields = ['status', 'group']
    ordering_fields = ['created_at', 'total_amount', 'completed_at']
    ordering = ['-created_at']
    
    def get_queryset(self):
        """
        Filter bulk payments based on user permissions.
        
        Returns:
            QuerySet: Filtered bulk payments queryset
        """
        user = self.request.user
        
        if user.is_staff:
            return MPesaBulkPayment.objects.all().select_related(
                'group', 'initiated_by'
            )
        
        # Get groups where user is admin/treasurer
        admin_groups = ChamaGroup.objects.filter(
            memberships__user=user,
            memberships__role__in=['ADMIN', 'CHAIRPERSON', 'TREASURER'],
            memberships__status='ACTIVE'
        )
        
        return MPesaBulkPayment.objects.filter(
            group__in=admin_groups
        ).select_related('group', 'initiated_by')
    
    @action(detail=True, methods=['post'])
    def process_batch(self, request, pk=None):
        """
        Process bulk payment batch.
        
        This endpoint initiates the actual payment processing for a
        bulk payment batch using Daraja B2C API.
        
        Args:
            request: HTTP request
            pk: Bulk payment primary key
        
        Returns:
            Response: Processing result
        """
        bulk_payment = self.get_object()
        
        if bulk_payment.status not in ['PENDING', 'PARTIAL']:
            return Response(
                {'error': f'Batch already {bulk_payment.status.lower()}'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # TODO: Implement actual B2C API integration
        # For now, update status to processing
        bulk_payment.status = 'PROCESSING'
        bulk_payment.save()
        
        return Response({
            'message': 'Batch processing started',
            'batch_id': bulk_payment.batch_id,
            'status': bulk_payment.status
        })
    
    @action(detail=True, methods=['post'])
    def retry_failed(self, request, pk=None):
        """
        Retry failed payments in a batch.
        
        Args:
            request: HTTP request
            pk: Bulk payment primary key
        
        Returns:
            Response: Retry result
        """
        bulk_payment = self.get_object()
        
        if bulk_payment.status not in ['PARTIAL', 'FAILED']:
            return Response(
                {'error': 'No failed payments to retry'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # TODO: Implement retry logic
        return Response({
            'message': 'Retry initiated for failed payments',
            'batch_id': bulk_payment.batch_id,
            'failed_count': bulk_payment.failed_count
        })


class PaymentReconciliationViewSet(viewsets.ModelViewSet):
    """
    ViewSet for payment reconciliation.
    
    Provides CRUD operations for reconciling M-Pesa transactions
    with system contributions.
    
    Actions:
        - list: Get all reconciliations (filterable)
        - retrieve: Get specific reconciliation
        - create: Create manual reconciliation
        - mark_matched: Mark reconciliation as matched
        - mark_disputed: Mark reconciliation as disputed
        - auto_reconcile: Attempt automatic reconciliation
    """
    
    queryset = PaymentReconciliation.objects.all()
    serializer_class = PaymentReconciliationSerializer
    permission_classes = [IsAuthenticated, IsGroupAdminOrTreasurer]
    filterset_fields = ['status', 'mpesa_transaction__group']
    ordering_fields = ['created_at', 'reconciled_at', 'amount_difference']
    ordering = ['-created_at']
    
    def get_queryset(self):
        """
        Filter reconciliations based on user permissions.
        
        Returns:
            QuerySet: Filtered reconciliations queryset
        """
        user = self.request.user
        
        if user.is_staff:
            return PaymentReconciliation.objects.all().select_related(
                'mpesa_transaction', 'contribution', 'reconciled_by'
            )
        
        # Get groups where user is admin/treasurer
        admin_groups = ChamaGroup.objects.filter(
            memberships__user=user,
            memberships__role__in=['ADMIN', 'CHAIRPERSON', 'TREASURER'],
            memberships__status='ACTIVE'
        )
        
        return PaymentReconciliation.objects.filter(
            mpesa_transaction__group__in=admin_groups
        ).select_related('mpesa_transaction', 'contribution', 'reconciled_by')
    
    @action(detail=True, methods=['post'])
    def mark_matched(self, request, pk=None):
        """
        Mark reconciliation as matched.
        
        Args:
            request: HTTP request
            pk: Reconciliation primary key
        
        Returns:
            Response: Updated reconciliation
        """
        reconciliation = self.get_object()
        
        if reconciliation.status == 'MATCHED':
            return Response(
                {'error': 'Reconciliation already matched'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        reconciliation.status = 'MATCHED'
        reconciliation.reconciled_by = request.user
        reconciliation.reconciled_at = timezone.now()
        reconciliation.save()
        
        serializer = self.get_serializer(reconciliation)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def mark_disputed(self, request, pk=None):
        """
        Mark reconciliation as disputed.
        
        Args:
            request: HTTP request
            pk: Reconciliation primary key
        
        Returns:
            Response: Updated reconciliation
        """
        reconciliation = self.get_object()
        
        if reconciliation.status == 'DISPUTED':
            return Response(
                {'error': 'Reconciliation already disputed'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        reconciliation.status = 'DISPUTED'
        reconciliation.reconciled_by = request.user
        reconciliation.reconciled_at = timezone.now()
        reconciliation.save()
        
        serializer = self.get_serializer(reconciliation)
        return Response(serializer.data)
    
    @action(detail=False, methods=['post'])
    def auto_reconcile(self, request):
        """
        Attempt automatic reconciliation of unmatched transactions.
        
        This endpoint attempts to automatically match M-Pesa transactions
        with contributions based on amount, date, and reference.
        
        Args:
            request: HTTP request with optional filters
        
        Returns:
            Response: Reconciliation results
        """
        group_id = request.data.get('group_id')
        date_from = request.data.get('date_from')
        date_to = request.data.get('date_to')
        
        # TODO: Implement automatic reconciliation logic
        # This would match transactions with contributions based on:
        # 1. Same amount within tolerance
        # 2. Same date/time window
        # 3. Matching reference/description
        
        return Response({
            'message': 'Auto-reconciliation not yet implemented',
            'matched_count': 0,
            'unmatched_count': 0
        })
