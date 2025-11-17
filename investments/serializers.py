from rest_framework import serializers
from .models import Investment, StockHolding, Portfolio, InvestmentTransaction


class InvestmentSerializer(serializers.ModelSerializer):
    """Serializer for Investments."""
    
    group_name = serializers.CharField(source='group.name', read_only=True)
    created_by_name = serializers.CharField(source='created_by.get_full_name', read_only=True)
    roi = serializers.DecimalField(max_digits=10, decimal_places=2, read_only=True)
    profit_loss = serializers.DecimalField(max_digits=15, decimal_places=2, read_only=True)
    
    class Meta:
        model = Investment
        fields = [
            'id', 'group', 'group_name', 'investment_type',
            'name', 'description', 'principal_amount',
            'current_value', 'expected_return_rate',
            'purchase_date', 'maturity_date', 'status',
            'certificate', 'roi', 'profit_loss',
            'created_by', 'created_by_name', 'created_at',
            'updated_at', 'notes'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class StockHoldingSerializer(serializers.ModelSerializer):
    """Serializer for Stock Holdings."""
    
    group_name = serializers.CharField(source='group.name', read_only=True)
    profit_loss = serializers.DecimalField(max_digits=15, decimal_places=2, read_only=True)
    profit_loss_percentage = serializers.DecimalField(max_digits=10, decimal_places=2, read_only=True)
    
    class Meta:
        model = StockHolding
        fields = [
            'id', 'group', 'group_name', 'stock_symbol',
            'stock_name', 'exchange', 'shares_quantity',
            'purchase_price_per_share', 'current_price_per_share',
            'cdsc_account_number', 'total_purchase_value',
            'current_total_value', 'purchase_date',
            'last_price_update', 'profit_loss',
            'profit_loss_percentage', 'notes',
            'created_at', 'updated_at'
        ]
        read_only_fields = [
            'id', 'total_purchase_value', 'current_total_value',
            'last_price_update', 'created_at', 'updated_at'
        ]


class PortfolioSerializer(serializers.ModelSerializer):
    """Serializer for Portfolio."""
    
    group_name = serializers.CharField(source='group.name', read_only=True)
    total_return = serializers.DecimalField(max_digits=15, decimal_places=2, read_only=True)
    total_return_percentage = serializers.DecimalField(max_digits=10, decimal_places=2, read_only=True)
    is_diversified = serializers.BooleanField(read_only=True)
    
    class Meta:
        model = Portfolio
        fields = [
            'id', 'group', 'group_name', 'total_invested',
            'current_value', 'stocks_percentage', 'bonds_percentage',
            'real_estate_percentage', 'cash_percentage',
            'other_percentage', 'ytd_return', 'total_return',
            'total_return_percentage', 'is_diversified',
            'last_rebalance_date', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class InvestmentTransactionSerializer(serializers.ModelSerializer):
    """Serializer for Investment Transactions."""
    
    investment_name = serializers.CharField(source='investment.name', read_only=True)
    created_by_name = serializers.CharField(source='created_by.get_full_name', read_only=True)
    
    class Meta:
        model = InvestmentTransaction
        fields = [
            'id', 'investment', 'investment_name',
            'transaction_type', 'amount', 'quantity',
            'price_per_unit', 'transaction_date',
            'reference_number', 'notes', 'created_by',
            'created_by_name', 'created_at'
        ]
        read_only_fields = ['id', 'created_at']


class PortfolioPerformanceSerializer(serializers.Serializer):
    """Serializer for portfolio performance summary."""
    
    total_invested = serializers.DecimalField(max_digits=15, decimal_places=2)
    current_value = serializers.DecimalField(max_digits=15, decimal_places=2)
    total_return = serializers.DecimalField(max_digits=15, decimal_places=2)
    total_return_percentage = serializers.DecimalField(max_digits=10, decimal_places=2)
    ytd_return = serializers.DecimalField(max_digits=8, decimal_places=2)
    best_performing_investment = serializers.DictField()
    worst_performing_investment = serializers.DictField()
    asset_allocation = serializers.DictField()
