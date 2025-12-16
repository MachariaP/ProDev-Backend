"""
Admin configuration for M-Pesa integration app.

This module configures Django admin interface for M-Pesa transactions,
bulk payments, and reconciliation records.
"""
from django.contrib import admin
from django.utils.html import format_html
from django.utils import timezone
from django.db.models import Sum, Count, Q
from .models import MPesaTransaction, MPesaBulkPayment, PaymentReconciliation


class StatusFilter(admin.SimpleListFilter):
    """Custom filter for transaction status."""
    title = 'Status'
    parameter_name = 'status'
    
    def lookups(self, request, model_admin):
        return [
            ('pending', 'Pending'),
            ('success', 'Success'),
            ('failed', 'Failed'),
            ('cancelled', 'Cancelled'),
        ]
    
    def queryset(self, request, queryset):
        if self.value() == 'pending':
            return queryset.filter(status='PENDING')
        if self.value() == 'success':
            return queryset.filter(status='SUCCESS')
        if self.value() == 'failed':
            return queryset.filter(status='FAILED')
        if self.value() == 'cancelled':
            return queryset.filter(status='CANCELLED')


class DateRangeFilter(admin.SimpleListFilter):
    """Custom filter for date ranges."""
    title = 'Date Range'
    parameter_name = 'date_range'
    
    def lookups(self, request, model_admin):
        return [
            ('today', 'Today'),
            ('this_week', 'This Week'),
            ('this_month', 'This Month'),
            ('last_month', 'Last Month'),
        ]
    
    def queryset(self, request, queryset):
        today = timezone.now().date()
        
        if self.value() == 'today':
            return queryset.filter(created_at__date=today)
        if self.value() == 'this_week':
            start_date = today - timezone.timedelta(days=today.weekday())
            return queryset.filter(created_at__date__gte=start_date)
        if self.value() == 'this_month':
            return queryset.filter(
                created_at__year=today.year,
                created_at__month=today.month
            )
        if self.value() == 'last_month':
            last_month = today.replace(day=1) - timezone.timedelta(days=1)
            return queryset.filter(
                created_at__year=last_month.year,
                created_at__month=last_month.month
            )


@admin.register(MPesaTransaction)
class MPesaTransactionAdmin(admin.ModelAdmin):
    """
    Admin interface for M-Pesa transactions.
    
    Provides comprehensive view of all M-Pesa transactions with
    filtering, search, and action capabilities.
    """
    
    list_display = [
        'id', 'transaction_type', 'amount', 'phone_number',
        'account_reference', 'status_badge', 'mpesa_receipt_number',
        'transaction_date', 'created_at', 'group_link', 'user_link'
    ]
    
    list_filter = [
        StatusFilter, DateRangeFilter, 'transaction_type',
        'group', 'created_at'
    ]
    
    search_fields = [
        'transaction_id', 'merchant_request_id', 'checkout_request_id',
        'phone_number', 'account_reference', 'mpesa_receipt_number',
        'result_desc', 'transaction_desc',
        'group__name', 'user__email', 'user__first_name', 'user__last_name'
    ]
    
    readonly_fields = [
        'transaction_id', 'merchant_request_id', 'checkout_request_id',
        'created_at', 'updated_at', 'callback_received_at',
        'mpesa_receipt_number', 'result_code', 'result_desc',
        'transaction_date', 'status_display', 'amount_display'
    ]
    
    fieldsets = (
        ('Transaction Identifiers', {
            'fields': ('transaction_id', 'merchant_request_id', 'checkout_request_id')
        }),
        ('Transaction Details', {
            'fields': ('transaction_type', 'amount_display', 'phone_number',
                      'account_reference', 'transaction_desc')
        }),
        ('M-Pesa Response', {
            'fields': ('status_display', 'mpesa_receipt_number',
                      'transaction_date', 'result_code', 'result_desc')
        }),
        ('Related Entities', {
            'fields': ('group', 'user', 'contribution')
        }),
        ('Metadata', {
            'fields': ('created_at', 'updated_at', 'callback_received_at'),
            'classes': ('collapse',)
        }),
    )
    
    ordering = ['-created_at']
    date_hierarchy = 'created_at'
    list_per_page = 50
    
    actions = ['mark_as_success', 'mark_as_failed', 'resend_callback']
    
    def status_badge(self, obj):
        """Display status as colored badge."""
        colors = {
            'PENDING': 'orange',
            'SUCCESS': 'green',
            'FAILED': 'red',
            'CANCELLED': 'gray',
            'TIMEOUT': 'yellow',
        }
        color = colors.get(obj.status, 'blue')
        return format_html(
            '<span style="padding: 2px 6px; border-radius: 3px; '
            f'background-color: {color}; color: white;">{obj.status}</span>'
        )
    status_badge.short_description = 'Status'
    status_badge.admin_order_field = 'status'
    
    def group_link(self, obj):
        """Display group as clickable link."""
        if obj.group:
            url = f"/admin/groups/chamagroup/{obj.group.id}/change/"
            return format_html('<a href="{}">{}</a>', url, obj.group.name)
        return '-'
    group_link.short_description = 'Group'
    
    def user_link(self, obj):
        """Display user as clickable link."""
        if obj.user:
            url = f"/admin/users/user/{obj.user.id}/change/"
            name = obj.user.get_full_name() or obj.user.email
            return format_html('<a href="{}">{}</a>', url, name)
        return '-'
    user_link.short_description = 'User'
    
    def status_display(self, obj):
        """Display status in read-only field."""
        return self.status_badge(obj)
    status_display.short_description = 'Status'
    
    def amount_display(self, obj):
        """Display amount with currency."""
        return f'KES {obj.amount:,.2f}'
    amount_display.short_description = 'Amount'
    
    def mark_as_success(self, request, queryset):
        """Admin action to mark transactions as successful."""
        updated = queryset.update(status='SUCCESS')
        self.message_user(request, f'{updated} transactions marked as successful.')
    mark_as_success.short_description = 'Mark selected as successful'
    
    def mark_as_failed(self, request, queryset):
        """Admin action to mark transactions as failed."""
        updated = queryset.update(status='FAILED')
        self.message_user(request, f'{updated} transactions marked as failed.')
    mark_as_failed.short_description = 'Mark selected as failed'
    
    def resend_callback(self, request, queryset):
        """Admin action to resend callback for testing."""
        # TODO: Implement callback resend logic
        self.message_user(request, f'Callback resend not yet implemented for {queryset.count()} transactions.')
    resend_callback.short_description = 'Resend callback (test)'
    
    def get_queryset(self, request):
        """Optimize queryset with select_related."""
        qs = super().get_queryset(request)
        return qs.select_related('group', 'user', 'contribution')
    
    def changelist_view(self, request, extra_context=None):
        """Add summary stats to changelist view."""
        response = super().changelist_view(request, extra_context)
        
        if hasattr(response, 'context_data'):
            queryset = response.context_data['cl'].queryset
            
            # Calculate summary statistics
            total_amount = queryset.aggregate(
                total=Sum('amount')
            )['total'] or 0
            
            success_count = queryset.filter(status='SUCCESS').count()
            pending_count = queryset.filter(status='PENDING').count()
            failed_count = queryset.filter(status='FAILED').count()
            
            response.context_data.update({
                'total_amount': f'KES {total_amount:,.2f}',
                'success_count': success_count,
                'pending_count': pending_count,
                'failed_count': failed_count,
                'total_count': queryset.count(),
            })
        
        return response


@admin.register(MPesaBulkPayment)
class MPesaBulkPaymentAdmin(admin.ModelAdmin):
    """Admin interface for M-Pesa bulk payments."""
    
    list_display = [
        'batch_id', 'group_link', 'total_amount_display',
        'total_recipients', 'successful_count', 'failed_count',
        'status_badge', 'initiated_by_link', 'created_at', 'completed_at'
    ]
    
    list_filter = ['status', 'created_at', 'group']
    
    search_fields = [
        'batch_id', 'group__name',
        'initiated_by__email', 'initiated_by__first_name', 'initiated_by__last_name'
    ]
    
    readonly_fields = [
        'batch_id', 'created_at', 'completed_at',
        'successful_count', 'failed_count', 'status_display'
    ]
    
    fieldsets = (
        ('Batch Information', {
            'fields': ('batch_id', 'group', 'total_amount', 'total_recipients')
        }),
        ('Processing Results', {
            'fields': ('status_display', 'successful_count', 'failed_count')
        }),
        ('Metadata', {
            'fields': ('initiated_by', 'created_at', 'completed_at')
        }),
    )
    
    ordering = ['-created_at']
    date_hierarchy = 'created_at'
    
    def group_link(self, obj):
        """Display group as clickable link."""
        if obj.group:
            url = f"/admin/groups/chamagroup/{obj.group.id}/change/"
            return format_html('<a href="{}">{}</a>', url, obj.group.name)
        return '-'
    group_link.short_description = 'Group'
    
    def initiated_by_link(self, obj):
        """Display initiator as clickable link."""
        if obj.initiated_by:
            url = f"/admin/users/user/{obj.initiated_by.id}/change/"
            name = obj.initiated_by.get_full_name() or obj.initiated_by.email
            return format_html('<a href="{}">{}</a>', url, name)
        return '-'
    initiated_by_link.short_description = 'Initiated By'
    
    def total_amount_display(self, obj):
        """Display total amount with currency."""
        return f'KES {obj.total_amount:,.2f}'
    total_amount_display.short_description = 'Total Amount'
    
    def status_badge(self, obj):
        """Display status as colored badge."""
        colors = {
            'PENDING': 'orange',
            'PROCESSING': 'blue',
            'COMPLETED': 'green',
            'FAILED': 'red',
            'PARTIAL': 'yellow',
        }
        color = colors.get(obj.status, 'gray')
        return format_html(
            '<span style="padding: 2px 6px; border-radius: 3px; '
            f'background-color: {color}; color: white;">{obj.status}</span>'
        )
    status_badge.short_description = 'Status'
    
    def status_display(self, obj):
        """Display status in read-only field."""
        return self.status_badge(obj)
    status_display.short_description = 'Status'
    
    def get_queryset(self, request):
        """Optimize queryset with select_related."""
        qs = super().get_queryset(request)
        return qs.select_related('group', 'initiated_by')


@admin.register(PaymentReconciliation)
class PaymentReconciliationAdmin(admin.ModelAdmin):
    """Admin interface for payment reconciliation."""
    
    list_display = [
        'id', 'mpesa_transaction_link', 'contribution_link',
        'status_badge', 'amount_difference_display',
        'reconciled_by_link', 'reconciled_at', 'created_at'
    ]
    
    list_filter = ['status', 'created_at', 'reconciled_at']
    
    search_fields = [
        'mpesa_transaction__transaction_id',
        'mpesa_transaction__mpesa_receipt_number',
        'contribution__reference_number',
        'notes',
        'reconciled_by__email', 'reconciled_by__first_name', 'reconciled_by__last_name'
    ]
    
    readonly_fields = [
        'mpesa_transaction', 'contribution', 'created_at', 'updated_at',
        'amount_difference_display', 'status_display'
    ]
    
    fieldsets = (
        ('Reconciliation Details', {
            'fields': ('status_display', 'mpesa_transaction', 'contribution',
                      'amount_difference_display')
        }),
        ('Resolution', {
            'fields': ('reconciled_by', 'reconciled_at', 'notes')
        }),
        ('Metadata', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    ordering = ['-created_at']
    date_hierarchy = 'created_at'
    
    actions = ['mark_as_matched', 'mark_as_resolved']
    
    def mpesa_transaction_link(self, obj):
        """Display M-Pesa transaction as clickable link."""
        if obj.mpesa_transaction:
            url = f"/admin/mpesa_integration/mpesatransaction/{obj.mpesa_transaction.id}/change/"
            return format_html(
                '<a href="{}">{}</a>',
                url,
                f"{obj.mpesa_transaction.transaction_id} (KES {obj.mpesa_transaction.amount})"
            )
        return '-'
    mpesa_transaction_link.short_description = 'M-Pesa Transaction'
    
    def contribution_link(self, obj):
        """Display contribution as clickable link."""
        if obj.contribution:
            url = f"/admin/finance/contribution/{obj.contribution.id}/change/"
            return format_html(
                '<a href="{}">{}</a>',
                url,
                f"Contribution #{obj.contribution.id} (KES {obj.contribution.amount})"
            )
        return '-'
    contribution_link.short_description = 'Contribution'
    
    def reconciled_by_link(self, obj):
        """Display reconciler as clickable link."""
        if obj.reconciled_by:
            url = f"/admin/users/user/{obj.reconciled_by.id}/change/"
            name = obj.reconciled_by.get_full_name() or obj.reconciled_by.email
            return format_html('<a href="{}">{}</a>', url, name)
        return '-'
    reconciled_by_link.short_description = 'Reconciled By'
    
    def amount_difference_display(self, obj):
        """Display amount difference with color coding."""
        if obj.amount_difference > 0:
            color = 'green'
            sign = '+'
        elif obj.amount_difference < 0:
            color = 'red'
            sign = ''
        else:
            color = 'gray'
            sign = ''
        
        return format_html(
            '<span style="color: {};">{}{:,.2f}</span>',
            color, sign, obj.amount_difference
        )
    amount_difference_display.short_description = 'Amount Difference'
    
    def status_badge(self, obj):
        """Display status as colored badge."""
        colors = {
            'MATCHED': 'green',
            'UNMATCHED': 'orange',
            'DISPUTED': 'red',
            'RESOLVED': 'blue',
        }
        color = colors.get(obj.status, 'gray')
        return format_html(
            '<span style="padding: 2px 6px; border-radius: 3px; '
            f'background-color: {color}; color: white;">{obj.status}</span>'
        )
    status_badge.short_description = 'Status'
    
    def status_display(self, obj):
        """Display status in read-only field."""
        return self.status_badge(obj)
    status_display.short_description = 'Status'
    
    def mark_as_matched(self, request, queryset):
        """Admin action to mark reconciliations as matched."""
        updated = queryset.update(
            status='MATCHED',
            reconciled_by=request.user,
            reconciled_at=timezone.now()
        )
        self.message_user(request, f'{updated} reconciliations marked as matched.')
    mark_as_matched.short_description = 'Mark selected as matched'
    
    def mark_as_resolved(self, request, queryset):
        """Admin action to mark disputed reconciliations as resolved."""
        updated = queryset.filter(status='DISPUTED').update(
            status='RESOLVED',
            reconciled_by=request.user,
            reconciled_at=timezone.now()
        )
        self.message_user(request, f'{updated} disputed reconciliations marked as resolved.')
    mark_as_resolved.short_description = 'Mark disputed as resolved'
    
    def get_queryset(self, request):
        """Optimize queryset with select_related."""
        qs = super().get_queryset(request)
        return qs.select_related(
            'mpesa_transaction', 'contribution', 'reconciled_by'
        )
