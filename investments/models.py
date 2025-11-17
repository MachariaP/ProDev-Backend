from django.db import models
from django.conf import settings
from django.utils.translation import gettext_lazy as _
from decimal import Decimal


class Investment(models.Model):
    """Model for tracking group investments."""
    
    INVESTMENT_TYPE_CHOICES = [
        ('FIXED_DEPOSIT', 'Fixed Deposit'),
        ('TREASURY_BILL', 'Treasury Bill'),
        ('MONEY_MARKET', 'Money Market Fund'),
        ('STOCKS', 'Stocks/Shares'),
        ('BONDS', 'Bonds'),
        ('REAL_ESTATE', 'Real Estate'),
        ('OTHER', 'Other'),
    ]
    
    STATUS_CHOICES = [
        ('ACTIVE', 'Active'),
        ('MATURED', 'Matured'),
        ('SOLD', 'Sold'),
        ('CANCELLED', 'Cancelled'),
    ]
    
    group = models.ForeignKey('groups.ChamaGroup', on_delete=models.CASCADE, related_name='investments')
    investment_type = models.CharField(_('investment type'), max_length=30, choices=INVESTMENT_TYPE_CHOICES)
    name = models.CharField(_('investment name'), max_length=200)
    description = models.TextField(_('description'))
    
    # Investment details
    principal_amount = models.DecimalField(_('principal amount'), max_digits=15, decimal_places=2)
    current_value = models.DecimalField(_('current value'), max_digits=15, decimal_places=2)
    expected_return_rate = models.DecimalField(
        _('expected return rate'),
        max_digits=5,
        decimal_places=2,
        help_text=_('Expected annual return percentage')
    )
    
    # Timeline
    purchase_date = models.DateField(_('purchase date'))
    maturity_date = models.DateField(_('maturity date'), blank=True, null=True)
    
    # Status
    status = models.CharField(_('status'), max_length=20, choices=STATUS_CHOICES, default='ACTIVE')
    
    # Documentation
    certificate = models.FileField(
        _('investment certificate'),
        upload_to='investments/certificates/',
        blank=True,
        null=True
    )
    
    # Metadata
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        related_name='created_investments'
    )
    created_at = models.DateTimeField(_('created at'), auto_now_add=True)
    updated_at = models.DateTimeField(_('updated at'), auto_now=True)
    notes = models.TextField(_('notes'), blank=True)
    
    class Meta:
        verbose_name = _('investment')
        verbose_name_plural = _('investments')
        ordering = ['-purchase_date']
    
    def __str__(self):
        return f"{self.group.name} - {self.name}"
    
    @property
    def roi(self):
        """Calculate Return on Investment."""
        if self.principal_amount > 0:
            return ((self.current_value - self.principal_amount) / self.principal_amount) * 100
        return Decimal('0.00')
    
    @property
    def profit_loss(self):
        """Calculate profit or loss."""
        return self.current_value - self.principal_amount


class StockHolding(models.Model):
    """Model for tracking stock/share holdings."""
    
    group = models.ForeignKey('groups.ChamaGroup', on_delete=models.CASCADE, related_name='stock_holdings')
    stock_symbol = models.CharField(_('stock symbol'), max_length=10, help_text=_('e.g., SCOM for Safaricom'))
    stock_name = models.CharField(_('stock name'), max_length=200)
    exchange = models.CharField(_('exchange'), max_length=50, default='NSE', help_text=_('e.g., NSE, USE'))
    
    # Holding details
    shares_quantity = models.PositiveIntegerField(_('shares quantity'))
    purchase_price_per_share = models.DecimalField(_('purchase price per share'), max_digits=10, decimal_places=2)
    current_price_per_share = models.DecimalField(_('current price per share'), max_digits=10, decimal_places=2)
    
    # CDSC details
    cdsc_account_number = models.CharField(_('CDSC account number'), max_length=50, blank=True)
    
    # Calculated fields
    total_purchase_value = models.DecimalField(_('total purchase value'), max_digits=15, decimal_places=2)
    current_total_value = models.DecimalField(_('current total value'), max_digits=15, decimal_places=2)
    
    # Dates
    purchase_date = models.DateField(_('purchase date'))
    last_price_update = models.DateTimeField(_('last price update'), auto_now=True)
    
    # Metadata
    created_at = models.DateTimeField(_('created at'), auto_now_add=True)
    updated_at = models.DateTimeField(_('updated at'), auto_now=True)
    notes = models.TextField(_('notes'), blank=True)
    
    class Meta:
        verbose_name = _('stock holding')
        verbose_name_plural = _('stock holdings')
        ordering = ['-purchase_date']
    
    def __str__(self):
        return f"{self.group.name} - {self.stock_symbol} ({self.shares_quantity} shares)"
    
    @property
    def profit_loss(self):
        """Calculate profit or loss."""
        return self.current_total_value - self.total_purchase_value
    
    @property
    def profit_loss_percentage(self):
        """Calculate profit/loss percentage."""
        if self.total_purchase_value > 0:
            return ((self.current_total_value - self.total_purchase_value) / self.total_purchase_value) * 100
        return Decimal('0.00')
    
    def save(self, *args, **kwargs):
        """Override save to calculate totals."""
        self.total_purchase_value = self.shares_quantity * self.purchase_price_per_share
        self.current_total_value = self.shares_quantity * self.current_price_per_share
        super().save(*args, **kwargs)


class Portfolio(models.Model):
    """Model for overall investment portfolio tracking."""
    
    group = models.OneToOneField('groups.ChamaGroup', on_delete=models.CASCADE, related_name='portfolio')
    
    # Portfolio metrics
    total_invested = models.DecimalField(_('total invested'), max_digits=15, decimal_places=2, default=0.00)
    current_value = models.DecimalField(_('current value'), max_digits=15, decimal_places=2, default=0.00)
    
    # Diversification (percentages)
    stocks_percentage = models.DecimalField(_('stocks percentage'), max_digits=5, decimal_places=2, default=0.00)
    bonds_percentage = models.DecimalField(_('bonds percentage'), max_digits=5, decimal_places=2, default=0.00)
    real_estate_percentage = models.DecimalField(_('real estate percentage'), max_digits=5, decimal_places=2, default=0.00)
    cash_percentage = models.DecimalField(_('cash percentage'), max_digits=5, decimal_places=2, default=0.00)
    other_percentage = models.DecimalField(_('other percentage'), max_digits=5, decimal_places=2, default=0.00)
    
    # Performance
    ytd_return = models.DecimalField(
        _('year-to-date return'),
        max_digits=8,
        decimal_places=2,
        default=0.00,
        help_text=_('YTD return percentage')
    )
    
    # Metadata
    last_rebalance_date = models.DateField(_('last rebalance date'), blank=True, null=True)
    created_at = models.DateTimeField(_('created at'), auto_now_add=True)
    updated_at = models.DateTimeField(_('updated at'), auto_now=True)
    
    class Meta:
        verbose_name = _('portfolio')
        verbose_name_plural = _('portfolios')
    
    def __str__(self):
        return f"{self.group.name} - Portfolio"
    
    @property
    def total_return(self):
        """Calculate total return."""
        return self.current_value - self.total_invested
    
    @property
    def total_return_percentage(self):
        """Calculate total return percentage."""
        if self.total_invested > 0:
            return ((self.current_value - self.total_invested) / self.total_invested) * 100
        return Decimal('0.00')
    
    @property
    def is_diversified(self):
        """Check if portfolio is well diversified (no single asset > 60%)."""
        percentages = [
            self.stocks_percentage,
            self.bonds_percentage,
            self.real_estate_percentage,
            self.cash_percentage,
            self.other_percentage,
        ]
        return all(p <= 60 for p in percentages)


class InvestmentTransaction(models.Model):
    """Model for tracking investment transactions."""
    
    TRANSACTION_TYPE_CHOICES = [
        ('BUY', 'Buy'),
        ('SELL', 'Sell'),
        ('DIVIDEND', 'Dividend'),
        ('INTEREST', 'Interest'),
        ('MATURITY', 'Maturity'),
    ]
    
    investment = models.ForeignKey(Investment, on_delete=models.CASCADE, related_name='transactions')
    transaction_type = models.CharField(_('transaction type'), max_length=20, choices=TRANSACTION_TYPE_CHOICES)
    amount = models.DecimalField(_('amount'), max_digits=12, decimal_places=2)
    quantity = models.DecimalField(_('quantity'), max_digits=10, decimal_places=2, blank=True, null=True)
    price_per_unit = models.DecimalField(_('price per unit'), max_digits=10, decimal_places=2, blank=True, null=True)
    
    # Transaction details
    transaction_date = models.DateField(_('transaction date'))
    reference_number = models.CharField(_('reference number'), max_length=100, blank=True)
    notes = models.TextField(_('notes'), blank=True)
    
    # Metadata
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        related_name='investment_transactions'
    )
    created_at = models.DateTimeField(_('created at'), auto_now_add=True)
    
    class Meta:
        verbose_name = _('investment transaction')
        verbose_name_plural = _('investment transactions')
        ordering = ['-transaction_date']
    
    def __str__(self):
        return f"{self.transaction_type} - {self.investment.name} - KES {self.amount}"

