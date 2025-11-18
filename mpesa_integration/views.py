from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.utils import timezone
import uuid
from .models import MPesaTransaction, MPesaBulkPayment, PaymentReconciliation
from .serializers import (
    MPesaTransactionSerializer, STKPushRequestSerializer,
    MPesaBulkPaymentSerializer, PaymentReconciliationSerializer
)


class MPesaTransactionViewSet(viewsets.ModelViewSet):
    """ViewSet for M-Pesa transactions."""
    
    queryset = MPesaTransaction.objects.all()
    serializer_class = MPesaTransactionSerializer
    permission_classes = [IsAuthenticated]
    filterset_fields = ['status', 'transaction_type', 'group', 'user']
    search_fields = ['transaction_id', 'phone_number', 'mpesa_receipt_number']
    ordering_fields = ['created_at', 'amount', 'transaction_date']
    
    def get_queryset(self):
        """Filter transactions by user's groups."""
        user = self.request.user
        if user.is_staff:
            return MPesaTransaction.objects.all()
        return MPesaTransaction.objects.filter(user=user) | MPesaTransaction.objects.filter(group__memberships__user=user)
    
    @action(detail=False, methods=['post'])
    def initiate_stk_push(self, request):
        """Initiate STK Push request."""
        serializer = STKPushRequestSerializer(data=request.data)
        if serializer.is_valid():
            # Create transaction record
            transaction = MPesaTransaction.objects.create(
                transaction_id=f"TXN-{uuid.uuid4().hex[:12].upper()}",
                transaction_type='STK_PUSH',
                amount=serializer.validated_data['amount'],
                phone_number=serializer.validated_data['phone_number'],
                account_reference=serializer.validated_data['account_reference'],
                transaction_desc=serializer.validated_data['transaction_desc'],
                user=request.user,
                group_id=serializer.validated_data.get('group_id'),
                status='PENDING'
            )
            
            # In production, integrate with actual M-Pesa STK Push API here
            # For now, return the transaction details
            return Response({
                'message': 'STK Push initiated successfully',
                'transaction_id': transaction.transaction_id,
                'status': transaction.status
            }, status=status.HTTP_201_CREATED)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=False, methods=['post'])
    def mpesa_callback(self, request):
        """Webhook endpoint for M-Pesa payment callbacks."""
        # In production, validate callback signature and process the payment
        data = request.data
        
        # Example callback processing
        transaction_id = data.get('transaction_id')
        if transaction_id:
            try:
                transaction = MPesaTransaction.objects.get(transaction_id=transaction_id)
                transaction.status = data.get('status', 'SUCCESS')
                transaction.mpesa_receipt_number = data.get('mpesa_receipt_number', '')
                transaction.result_code = data.get('result_code', '0')
                transaction.result_desc = data.get('result_desc', '')
                transaction.callback_received_at = timezone.now()
                transaction.save()
                
                return Response({'message': 'Callback processed'}, status=status.HTTP_200_OK)
            except MPesaTransaction.DoesNotExist:
                return Response({'error': 'Transaction not found'}, status=status.HTTP_404_NOT_FOUND)
        
        return Response({'error': 'Invalid callback data'}, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=True, methods=['get'])
    def check_status(self, request, pk=None):
        """Check transaction status."""
        transaction = self.get_object()
        return Response({
            'transaction_id': transaction.transaction_id,
            'status': transaction.status,
            'amount': transaction.amount,
            'mpesa_receipt_number': transaction.mpesa_receipt_number
        })


class MPesaBulkPaymentViewSet(viewsets.ModelViewSet):
    """ViewSet for bulk payments."""
    
    queryset = MPesaBulkPayment.objects.all()
    serializer_class = MPesaBulkPaymentSerializer
    permission_classes = [IsAuthenticated]
    filterset_fields = ['status', 'group']
    ordering_fields = ['created_at', 'total_amount']
    
    def get_queryset(self):
        """Filter by user's groups."""
        user = self.request.user
        if user.is_staff:
            return MPesaBulkPayment.objects.all()
        return MPesaBulkPayment.objects.filter(group__memberships__user=user)


class PaymentReconciliationViewSet(viewsets.ModelViewSet):
    """ViewSet for payment reconciliation."""
    
    queryset = PaymentReconciliation.objects.all()
    serializer_class = PaymentReconciliationSerializer
    permission_classes = [IsAuthenticated]
    filterset_fields = ['status', 'mpesa_transaction']
    ordering_fields = ['created_at', 'reconciled_at']
    
    @action(detail=True, methods=['post'])
    def mark_matched(self, request, pk=None):
        """Mark reconciliation as matched."""
        reconciliation = self.get_object()
        reconciliation.status = 'MATCHED'
        reconciliation.reconciled_by = request.user
        reconciliation.reconciled_at = timezone.now()
        reconciliation.save()
        
        return Response({'message': 'Reconciliation marked as matched'})
