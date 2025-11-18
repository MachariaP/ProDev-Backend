from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    CreditScoreViewSet, LoanEligibilityViewSet,
    PaymentHistoryAnalysisViewSet, DefaultPredictionViewSet
)

router = DefaultRouter()
router.register(r'scores', CreditScoreViewSet, basename='credit-score')
router.register(r'eligibility', LoanEligibilityViewSet, basename='loan-eligibility')
router.register(r'payment-history', PaymentHistoryAnalysisViewSet, basename='payment-history')
router.register(r'default-predictions', DefaultPredictionViewSet, basename='default-prediction')

urlpatterns = [
    path('', include(router.urls)),
]