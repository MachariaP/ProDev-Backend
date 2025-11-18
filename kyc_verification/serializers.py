from rest_framework import serializers
from .models import KYCDocument, BiometricData, VerificationWorkflow


class KYCDocumentSerializer(serializers.ModelSerializer):
    class Meta:
        model = KYCDocument
        fields = '__all__'
        read_only_fields = ['id']


class BiometricDataSerializer(serializers.ModelSerializer):
    class Meta:
        model = BiometricData
        fields = '__all__'
        read_only_fields = ['id']


class VerificationWorkflowSerializer(serializers.ModelSerializer):
    class Meta:
        model = VerificationWorkflow
        fields = '__all__'
        read_only_fields = ['id']

