from rest_framework import serializers
from .models import CreditScore, LoanEligibility, PaymentHistoryAnalysis, DefaultPrediction


class CreditScoreSerializer(serializers.ModelSerializer):
    class Meta:
        model = CreditScore
        fields = '__all__'
        read_only_fields = ['id', 'calculated_at']


class LoanEligibilitySerializer(serializers.ModelSerializer):
    class Meta:
        model = LoanEligibility
        fields = '__all__'
        read_only_fields = ['id', 'checked_at']


class PaymentHistoryAnalysisSerializer(serializers.ModelSerializer):
    class Meta:
        model = PaymentHistoryAnalysis
        fields = '__all__'
        read_only_fields = ['id', 'analyzed_at']


class DefaultPredictionSerializer(serializers.ModelSerializer):
    class Meta:
        model = DefaultPrediction
        fields = '__all__'
        read_only_fields = ['id', 'predicted_at']