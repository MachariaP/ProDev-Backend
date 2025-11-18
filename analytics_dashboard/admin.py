from django.contrib import admin
from .models import AnalyticsReport, FinancialHealthScore, PredictiveCashFlow


@admin.register(AnalyticsReport)
class AnalyticsReportAdmin(admin.ModelAdmin):
    list_display = ['id']
    search_fields = []


@admin.register(FinancialHealthScore)
class FinancialHealthScoreAdmin(admin.ModelAdmin):
    list_display = ['id']
    search_fields = []


@admin.register(PredictiveCashFlow)
class PredictiveCashFlowAdmin(admin.ModelAdmin):
    list_display = ['id']
    search_fields = []

