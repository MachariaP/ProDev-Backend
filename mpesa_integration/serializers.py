from rest_framework import serializers
from .models import MPesaTransaction, MPesaBulkPayment, PaymentReconciliation


class MPesaTransactionSerializer(serializers.ModelSerializer):
    """Serializer for M-Pesa transactions."""
    
    class Meta:
        model = MPesaTransaction
        fields = [
            'id', 'transaction_id', 'merchant_request_id', 'checkout_request_id',
            'transaction_type', 'amount', 'phone_number', 'account_reference',
            'transaction_desc', 'mpesa_receipt_number', 'transaction_date',
            'status', 'result_code', 'result_desc', 'group', 'user', 'contribution',
            'created_at', 'updated_at', 'callback_received_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at', 'callback_received_at']


class STKPushRequestSerializer(serializers.Serializer):
    """Serializer for initiating STK Push."""
    
    phone_number = serializers.CharField(max_length=15)
    amount = serializers.DecimalField(max_digits=12, decimal_places=2)
    account_reference = serializers.CharField(max_length=100)
    transaction_desc = serializers.CharField(max_length=200)
    group_id = serializers.IntegerField(required=False)


class MPesaBulkPaymentSerializer(serializers.ModelSerializer):
    """Serializer for bulk payments."""
    
    class Meta:
        model = MPesaBulkPayment
        fields = [
            'id', 'batch_id', 'group', 'total_amount', 'total_recipients',
            'successful_count', 'failed_count', 'status', 'initiated_by',
            'created_at', 'completed_at'
        ]
        read_only_fields = ['id', 'batch_id', 'successful_count', 'failed_count', 'created_at', 'completed_at']


class PaymentReconciliationSerializer(serializers.ModelSerializer):
    """Serializer for payment reconciliation."""
    
    class Meta:
        model = PaymentReconciliation
        fields = [
            'id', 'mpesa_transaction', 'contribution', 'status',
            'amount_difference', 'reconciled_by', 'reconciled_at',
            'notes', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']