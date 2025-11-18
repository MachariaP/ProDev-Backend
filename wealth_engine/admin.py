from django.contrib import admin
from .models import InvestmentRecommendation, PortfolioRebalance, AutoInvestmentRule, InvestmentPerformance


@admin.register(InvestmentRecommendation)
class InvestmentRecommendationAdmin(admin.ModelAdmin):
    list_display = ['id']
    search_fields = []


@admin.register(PortfolioRebalance)
class PortfolioRebalanceAdmin(admin.ModelAdmin):
    list_display = ['id']
    search_fields = []


@admin.register(AutoInvestmentRule)
class AutoInvestmentRuleAdmin(admin.ModelAdmin):
    list_display = ['id']
    search_fields = []


@admin.register(InvestmentPerformance)
class InvestmentPerformanceAdmin(admin.ModelAdmin):
    list_display = ['id']
    search_fields = []

