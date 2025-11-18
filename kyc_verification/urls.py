from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import KYCDocumentViewSet, BiometricDataViewSet, VerificationWorkflowViewSet

router = DefaultRouter()
router.register(r'kyc-documents', KYCDocumentViewSet, basename='kyc-document')
router.register(r'biometric-datas', BiometricDataViewSet, basename='biometric-data')
router.register(r'verification-workflows', VerificationWorkflowViewSet, basename='verification-workflow')

urlpatterns = [
    path('', include(router.urls)),
]
