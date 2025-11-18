from django.contrib import admin
from .models import MPesaTransaction, MPesaBulkPayment, PaymentReconciliation


@admin.register(MPesaTransaction)
class MPesaTransactionAdmin(admin.ModelAdmin):
    list_display = ['id']
    search_fields = []


@admin.register(MPesaBulkPayment)
class MPesaBulkPaymentAdmin(admin.ModelAdmin):
    list_display = ['id']
    search_fields = []


@admin.register(PaymentReconciliation)
class PaymentReconciliationAdmin(admin.ModelAdmin):
    list_display = ['id']
    search_fields = []

