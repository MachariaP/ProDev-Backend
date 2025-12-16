"""
URL configuration for M-Pesa integration app.

This module defines the URL patterns for M-Pesa integration endpoints
including transactions, bulk payments, and callbacks.
"""
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    MPesaTransactionViewSet, MPesaBulkPaymentViewSet,
    PaymentReconciliationViewSet, mpesa_callback
)

router = DefaultRouter()
router.register(r'transactions', MPesaTransactionViewSet, basename='mpesa-transaction')
router.register(r'bulk-payments', MPesaBulkPaymentViewSet, basename='bulk-payment')
router.register(r'reconciliations', PaymentReconciliationViewSet, basename='reconciliation')

urlpatterns = [
    path('', include(router.urls)),
    
    # Callback endpoints (no authentication required)
    path('callbacks/mpesa/', mpesa_callback, name='mpesa-callback'),
    path('callbacks/stk/', mpesa_callback, name='stk-callback'),
    path('callbacks/c2b/', mpesa_callback, name='c2b-callback'),
]
