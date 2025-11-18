from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from .models import KYCDocument, BiometricData, VerificationWorkflow
from .serializers import KYCDocumentSerializer, BiometricDataSerializer, VerificationWorkflowSerializer


class KYCDocumentViewSet(viewsets.ModelViewSet):
    queryset = KYCDocument.objects.all()
    serializer_class = KYCDocumentSerializer
    permission_classes = [IsAuthenticated]


class BiometricDataViewSet(viewsets.ModelViewSet):
    queryset = BiometricData.objects.all()
    serializer_class = BiometricDataSerializer
    permission_classes = [IsAuthenticated]


class VerificationWorkflowViewSet(viewsets.ModelViewSet):
    queryset = VerificationWorkflow.objects.all()
    serializer_class = VerificationWorkflowSerializer
    permission_classes = [IsAuthenticated]

