from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    ContributionViewSet, LoanViewSet, LoanRepaymentViewSet,
    ExpenseViewSet, DisbursementApprovalViewSet,
    ApprovalSignatureViewSet, TransactionViewSet
)

router = DefaultRouter()
router.register(r'contributions', ContributionViewSet, basename='contribution')
router.register(r'loans', LoanViewSet, basename='loan')
router.register(r'loan-repayments', LoanRepaymentViewSet, basename='loanrepayment')
router.register(r'expenses', ExpenseViewSet, basename='expense')
router.register(r'disbursement-approvals', DisbursementApprovalViewSet, basename='disbursementapproval')
router.register(r'approval-signatures', ApprovalSignatureViewSet, basename='approvalsignature')
router.register(r'transactions', TransactionViewSet, basename='transaction')

urlpatterns = [
    path('', include(router.urls)),
]
