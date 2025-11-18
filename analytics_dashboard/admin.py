# analytics_dashboard/admin.py
from django.contrib import admin
from .models import AnalyticsReport, FinancialHealthScore


@admin.register(AnalyticsReport)
class AnalyticsReportAdmin(admin.ModelAdmin):
    list_display = ('group', 'report_type', 'generated_at', 'get_insights_preview')
    list_filter = ('report_type', 'generated_at', 'group')
    search_fields = ('group__name',)
    readonly_fields = ('generated_at', 'generated_by', 'report_data', 'insights', 'recommendations')
    
    def get_insights_preview(self, obj):
        return obj.insights[:80] + "..." if len(obj.insights) > 80 else obj.insights
    get_insights_preview.short_description = "Insights"


@admin.register(FinancialHealthScore)
class FinancialHealthScoreAdmin(admin.ModelAdmin):
    list_display = ('group', 'overall_score', 'calculated_at')
    list_filter = ('calculated_at',)
    readonly_fields = ('calculated_at',)
