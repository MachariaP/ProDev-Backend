from rest_framework import serializers
from .models import AnalyticsReport, FinancialHealthScore, PredictiveCashFlow


class AnalyticsReportSerializer(serializers.ModelSerializer):
    class Meta:
        model = AnalyticsReport
        fields = '__all__'
        read_only_fields = ['id']


class FinancialHealthScoreSerializer(serializers.ModelSerializer):
    class Meta:
        model = FinancialHealthScore
        fields = '__all__'
        read_only_fields = ['id']


class PredictiveCashFlowSerializer(serializers.ModelSerializer):
    class Meta:
        model = PredictiveCashFlow
        fields = '__all__'
        read_only_fields = ['id']

