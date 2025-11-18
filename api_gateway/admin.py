from django.contrib import admin
from .models import ExternalAPIConnection, APIRequest, WebhookEndpoint


@admin.register(ExternalAPIConnection)
class ExternalAPIConnectionAdmin(admin.ModelAdmin):
    list_display = ['id']
    search_fields = []


@admin.register(APIRequest)
class APIRequestAdmin(admin.ModelAdmin):
    list_display = ['id']
    search_fields = []


@admin.register(WebhookEndpoint)
class WebhookEndpointAdmin(admin.ModelAdmin):
    list_display = ['id']
    search_fields = []

