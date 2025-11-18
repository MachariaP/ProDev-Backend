from django.contrib import admin
from .models import AutomationRule, ExecutionLog, NotificationTemplate


@admin.register(AutomationRule)
class AutomationRuleAdmin(admin.ModelAdmin):
    list_display = ['id']
    search_fields = []


@admin.register(ExecutionLog)
class ExecutionLogAdmin(admin.ModelAdmin):
    list_display = ['id']
    search_fields = []


@admin.register(NotificationTemplate)
class NotificationTemplateAdmin(admin.ModelAdmin):
    list_display = ['id']
    search_fields = []

