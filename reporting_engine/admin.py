from django.contrib import admin
from .models import GeneratedReport, ScheduledReport


@admin.register(GeneratedReport)
class GeneratedReportAdmin(admin.ModelAdmin):
    list_display = ['id']
    search_fields = []


@admin.register(ScheduledReport)
class ScheduledReportAdmin(admin.ModelAdmin):
    list_display = ['id']
    search_fields = []

