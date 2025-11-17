from django.contrib import admin
from .models import Investment, StockHolding, Portfolio, InvestmentTransaction


@admin.register(Investment)
class InvestmentAdmin(admin.ModelAdmin):
    list_display = ['name', 'group', 'investment_type', 'principal_amount', 'current_value', 'status']
    list_filter = ['investment_type', 'status', 'purchase_date']
    search_fields = ['name', 'group__name']


@admin.register(StockHolding)
class StockHoldingAdmin(admin.ModelAdmin):
    list_display = ['stock_symbol', 'group', 'shares_quantity', 'current_total_value', 'purchase_date']
    list_filter = ['exchange', 'purchase_date']
    search_fields = ['stock_symbol', 'stock_name', 'group__name']


@admin.register(Portfolio)
class PortfolioAdmin(admin.ModelAdmin):
    list_display = ['group', 'total_invested', 'current_value', 'ytd_return']
    search_fields = ['group__name']


@admin.register(InvestmentTransaction)
class InvestmentTransactionAdmin(admin.ModelAdmin):
    list_display = ['investment', 'transaction_type', 'amount', 'transaction_date']
    list_filter = ['transaction_type', 'transaction_date']
    search_fields = ['investment__name', 'reference_number']

