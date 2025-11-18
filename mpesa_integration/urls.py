from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import MPesaTransactionViewSet, MPesaBulkPaymentViewSet, PaymentReconciliationViewSet

router = DefaultRouter()
router.register(r'transactions', MPesaTransactionViewSet, basename='mpesa-transaction')
router.register(r'bulk-payments', MPesaBulkPaymentViewSet, basename='bulk-payment')
router.register(r'reconciliations', PaymentReconciliationViewSet, basename='reconciliation')

urlpatterns = [
    path('', include(router.urls)),
]