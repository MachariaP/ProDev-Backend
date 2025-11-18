from rest_framework import serializers
from .models import InvestmentRecommendation, PortfolioRebalance, AutoInvestmentRule, InvestmentPerformance


class InvestmentRecommendationSerializer(serializers.ModelSerializer):
    class Meta:
        model = InvestmentRecommendation
        fields = '__all__'
        read_only_fields = ['id', 'created_at', 'reviewed_at']


class PortfolioRebalanceSerializer(serializers.ModelSerializer):
    class Meta:
        model = PortfolioRebalance
        fields = '__all__'
        read_only_fields = ['id', 'created_at', 'executed_at']


class AutoInvestmentRuleSerializer(serializers.ModelSerializer):
    class Meta:
        model = AutoInvestmentRule
        fields = '__all__'
        read_only_fields = ['id', 'created_at', 'last_executed_at']


class InvestmentPerformanceSerializer(serializers.ModelSerializer):
    class Meta:
        model = InvestmentPerformance
        fields = '__all__'
        read_only_fields = ['id', 'recorded_at']