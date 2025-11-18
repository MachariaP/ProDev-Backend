from django.contrib import admin
from .models import CreditScore, LoanEligibility, PaymentHistoryAnalysis, DefaultPrediction


@admin.register(CreditScore)
class CreditScoreAdmin(admin.ModelAdmin):
    list_display = ['id']
    search_fields = []


@admin.register(LoanEligibility)
class LoanEligibilityAdmin(admin.ModelAdmin):
    list_display = ['id']
    search_fields = []


@admin.register(PaymentHistoryAnalysis)
class PaymentHistoryAnalysisAdmin(admin.ModelAdmin):
    list_display = ['id']
    search_fields = []


@admin.register(DefaultPrediction)
class DefaultPredictionAdmin(admin.ModelAdmin):
    list_display = ['id']
    search_fields = []

