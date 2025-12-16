"""
Serializers for M-Pesa integration models.

This module provides serializers for converting M-Pesa models to/from
JSON format for API communication.
"""
from rest_framework import serializers
from django.utils import timezone
from .models import MPesaTransaction, MPesaBulkPayment, PaymentReconciliation


class MPesaTransactionSerializer(serializers.ModelSerializer):
    """
    Serializer for M-Pesa transactions.
    
    Handles serialization/deserialization of MPesaTransaction model
    with nested relationships and computed fields.
    """
    
    group_name = serializers.CharField(source='group.name', read_only=True)
    user_name = serializers.CharField(source='user.get_full_name', read_only=True)
    contribution_id = serializers.IntegerField(source='contribution.id', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    transaction_type_display = serializers.CharField(
        source='get_transaction_type_display', read_only=True
    )
    formatted_phone = serializers.SerializerMethodField()
    formatted_amount = serializers.SerializerMethodField()
    is_expired = serializers.SerializerMethodField()
    
    class Meta:
        model = MPesaTransaction
        fields = [
            'id', 'transaction_id', 'merchant_request_id', 'checkout_request_id',
            'transaction_type', 'transaction_type_display', 'amount', 'formatted_amount',
            'phone_number', 'formatted_phone', 'account_reference', 'transaction_desc',
            'mpesa_receipt_number', 'transaction_date', 'status', 'status_display',
            'result_code', 'result_desc', 'group', 'group_name', 'user', 'user_name',
            'contribution', 'contribution_id', 'created_at', 'updated_at',
            'callback_received_at', 'is_expired'
        ]
        read_only_fields = [
            'id', 'transaction_id', 'merchant_request_id', 'checkout_request_id',
            'mpesa_receipt_number', 'transaction_date', 'result_code', 'result_desc',
            'created_at', 'updated_at', 'callback_received_at',
            'group_name', 'user_name', 'contribution_id',
            'status_display', 'transaction_type_display'
        ]
    
    def get_formatted_phone(self, obj):
        """Format phone number for display."""
        if not obj.phone_number:
            return ''
        
        phone = obj.phone_number
        if phone.startswith('254') and len(phone) == 12:
            return f"+{phone[:3]} {phone[3:6]} {phone[6:9]} {phone[9:]}"
        return phone
    
    def get_formatted_amount(self, obj):
        """Format amount with currency."""
        return f"KES {obj.amount:,.2f}"
    
    def get_is_expired(self, obj):
        """Check if STK Push transaction is expired (older than 10 minutes)."""
        if obj.transaction_type == 'STK_PUSH' and obj.status == 'PENDING':
            time_diff = timezone.now() - obj.created_at
            return time_diff.total_seconds() > 600  # 10 minutes
        return False
    
    def validate_phone_number(self, value):
        """Validate phone number format."""
        if not value:
            raise serializers.ValidationError("Phone number is required")
        
        # Remove any non-digit characters
        digits = ''.join(filter(str.isdigit, value))
        
        # Check if it's a valid Kenyan mobile number
        if len(digits) not in [9, 10, 12]:
            raise serializers.ValidationError("Invalid phone number length")
        
        if len(digits) == 9:
            if not digits.startswith('7'):
                raise serializers.ValidationError("Invalid mobile number format")
        elif len(digits) == 10:
            if not digits.startswith('07'):
                raise serializers.ValidationError("Phone number must start with 07")
        elif len(digits) == 12:
            if not digits.startswith('254'):
                raise serializers.ValidationError("Phone number must start with 254")
        
        return value
    
    def validate_amount(self, value):
        """Validate transaction amount."""
        if value <= 0:
            raise serializers.ValidationError("Amount must be greater than zero")
        
        if value > 150000:  # M-Pesa transaction limit
            raise serializers.ValidationError("Amount exceeds M-Pesa transaction limit of KES 150,000")
        
        return value


class STKPushRequestSerializer(serializers.Serializer):
    """
    Serializer for initiating STK Push payments.
    
    Validates and processes STK Push payment requests before
    sending to Daraja API.
    """
    
    phone_number = serializers.CharField(
        max_length=15,
        help_text="Phone number in format: 07XXXXXXXX or 2547XXXXXXXX"
    )
    amount = serializers.DecimalField(
        max_digits=12, decimal_places=2,
        min_value=1, max_value=150000,
        help_text="Amount between KES 1 and KES 150,000"
    )
    account_reference = serializers.CharField(
        max_length=100,
        help_text="Account reference (e.g., invoice number, member ID)"
    )
    transaction_desc = serializers.CharField(
        max_length=200,
        help_text="Transaction description"
    )
    group_id = serializers.IntegerField(
        required=False, allow_null=True,
        help_text="Optional group ID to associate with contribution"
    )
    
    def validate_phone_number(self, value):
        """Validate and format phone number."""
        if not value:
            raise serializers.ValidationError("Phone number is required")
        
        # Remove any non-digit characters
        digits = ''.join(filter(str.isdigit, value))
        
        # Check if it's a valid Kenyan mobile number
        if len(digits) == 9 and digits.startswith('7'):
            return f"254{digits}"
        elif len(digits) == 10 and digits.startswith('07'):
            return f"254{digits[1:]}"
        elif len(digits) == 12 and digits.startswith('254'):
            return digits
        elif len(digits) == 13 and digits.startswith('+254'):
            return digits[1:]
        else:
            raise serializers.ValidationError(
                "Invalid phone number format. Use: 07XXXXXXXX or 2547XXXXXXXX"
            )


class BulkPaymentRequestSerializer(serializers.Serializer):
    """
    Serializer for bulk payment requests.
    
    Validates and processes bulk payment requests with multiple recipients.
    """
    
    group_id = serializers.IntegerField(
        help_text="Group ID for the bulk payment"
    )
    payments = serializers.ListField(
        child=serializers.DictField(),
        help_text="List of payment objects with phone_number and amount"
    )
    description = serializers.CharField(
        max_length=200,
        help_text="Description for the bulk payment batch"
    )
    
    def validate_payments(self, value):
        """Validate payments list."""
        if not value or len(value) == 0:
            raise serializers.ValidationError("Payments list cannot be empty")
        
        if len(value) > 100:  # Daraja bulk payment limit
            raise serializers.ValidationError("Maximum 100 payments per batch")
        
        validated_payments = []
        for payment in value:
            if not all(k in payment for k in ['phone_number', 'amount']):
                raise serializers.ValidationError(
                    "Each payment must have phone_number and amount"
                )
            
            # Validate individual payment
            phone = payment['phone_number']
            amount = payment['amount']
            
            # Validate phone
            digits = ''.join(filter(str.isdigit, str(phone)))
            if len(digits) not in [9, 10, 12]:
                raise serializers.ValidationError(
                    f"Invalid phone number: {phone}"
                )
            
            # Validate amount
            try:
                amount_float = float(amount)
                if amount_float <= 0 or amount_float > 150000:
                    raise serializers.ValidationError(
                        f"Invalid amount: {amount}. Must be between 1 and 150,000"
                    )
            except (ValueError, TypeError):
                raise serializers.ValidationError(f"Invalid amount: {amount}")
            
            validated_payments.append(payment)
        
        return validated_payments


class MPesaBulkPaymentSerializer(serializers.ModelSerializer):
    """
    Serializer for M-Pesa bulk payments.
    
    Handles serialization/deserialization of MPesaBulkPayment model
    with computed fields and statistics.
    """
    
    group_name = serializers.CharField(source='group.name', read_only=True)
    initiated_by_name = serializers.CharField(
        source='initiated_by.get_full_name', read_only=True
    )
    status_display = serializers.CharField(
        source='get_status_display', read_only=True
    )
    formatted_total_amount = serializers.SerializerMethodField()
    success_rate = serializers.SerializerMethodField()
    processing_time = serializers.SerializerMethodField()
    
    class Meta:
        model = MPesaBulkPayment
        fields = [
            'id', 'batch_id', 'group', 'group_name', 'total_amount',
            'formatted_total_amount', 'total_recipients', 'successful_count',
            'failed_count', 'status', 'status_display', 'initiated_by',
            'initiated_by_name', 'created_at', 'completed_at', 'success_rate',
            'processing_time'
        ]
        read_only_fields = [
            'id', 'batch_id', 'successful_count', 'failed_count',
            'created_at', 'completed_at', 'group_name', 'initiated_by_name',
            'status_display', 'formatted_total_amount', 'success_rate',
            'processing_time'
        ]
    
    def get_formatted_total_amount(self, obj):
        """Format total amount with currency."""
        return f"KES {obj.total_amount:,.2f}"
    
    def get_success_rate(self, obj):
        """Calculate success rate percentage."""
        if obj.total_recipients > 0:
            rate = (obj.successful_count / obj.total_recipients) * 100
            return f"{rate:.1f}%"
        return "0%"
    
    def get_processing_time(self, obj):
        """Calculate processing time in minutes."""
        if obj.completed_at and obj.created_at:
            diff = obj.completed_at - obj.created_at
            minutes = diff.total_seconds() / 60
            return f"{minutes:.1f} minutes"
        return "-"


class PaymentReconciliationSerializer(serializers.ModelSerializer):
    """
    Serializer for payment reconciliation.
    
    Handles serialization/deserialization of PaymentReconciliation model
    with nested transaction and contribution details.
    """
    
    mpesa_transaction_details = serializers.SerializerMethodField()
    contribution_details = serializers.SerializerMethodField()
    reconciled_by_name = serializers.CharField(
        source='reconciled_by.get_full_name', read_only=True
    )
    status_display = serializers.CharField(
        source='get_status_display', read_only=True
    )
    formatted_amount_difference = serializers.SerializerMethodField()
    requires_attention = serializers.SerializerMethodField()
    
    class Meta:
        model = PaymentReconciliation
        fields = [
            'id', 'mpesa_transaction', 'mpesa_transaction_details',
            'contribution', 'contribution_details', 'status', 'status_display',
            'amount_difference', 'formatted_amount_difference',
            'reconciled_by', 'reconciled_by_name', 'reconciled_at',
            'notes', 'created_at', 'updated_at', 'requires_attention'
        ]
        read_only_fields = [
            'id', 'created_at', 'updated_at', 'mpesa_transaction_details',
            'contribution_details', 'reconciled_by_name', 'status_display',
            'formatted_amount_difference', 'requires_attention'
        ]
    
    def get_mpesa_transaction_details(self, obj):
        """Get M-Pesa transaction details."""
        if obj.mpesa_transaction:
            return {
                'id': obj.mpesa_transaction.id,
                'transaction_id': obj.mpesa_transaction.transaction_id,
                'amount': str(obj.mpesa_transaction.amount),
                'phone_number': obj.mpesa_transaction.phone_number,
                'mpesa_receipt_number': obj.mpesa_transaction.mpesa_receipt_number,
                'transaction_date': obj.mpesa_transaction.transaction_date,
                'status': obj.mpesa_transaction.status
            }
        return None
    
    def get_contribution_details(self, obj):
        """Get contribution details."""
        if obj.contribution:
            return {
                'id': obj.contribution.id,
                'amount': str(obj.contribution.amount),
                'reference_number': obj.contribution.reference_number,
                'status': obj.contribution.status,
                'created_at': obj.contribution.created_at
            }
        return None
    
    def get_formatted_amount_difference(self, obj):
        """Format amount difference with sign."""
        if obj.amount_difference > 0:
            return f"+KES {obj.amount_difference:,.2f}"
        elif obj.amount_difference < 0:
            return f"-KES {abs(obj.amount_difference):,.2f}"
        else:
            return "KES 0.00"
    
    def get_requires_attention(self, obj):
        """Check if reconciliation requires attention."""
        return obj.status in ['UNMATCHED', 'DISPUTED'] or abs(obj.amount_difference) > 0
    
    def validate(self, data):
        """Validate reconciliation data."""
        # Ensure at least one of mpesa_transaction or contribution is provided
        if not data.get('mpesa_transaction') and not data.get('contribution'):
            raise serializers.ValidationError(
                "At least one of mpesa_transaction or contribution must be provided"
            )
        
        # If both are provided, calculate amount difference
        if data.get('mpesa_transaction') and data.get('contribution'):
            mpesa_amount = data['mpesa_transaction'].amount
            contribution_amount = data['contribution'].amount
            
            if 'amount_difference' not in data or data['amount_difference'] is None:
                data['amount_difference'] = mpesa_amount - contribution_amount
        
        return data
