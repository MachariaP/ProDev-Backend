from django.contrib import admin
from .models import KYCDocument, BiometricData, VerificationWorkflow


@admin.register(KYCDocument)
class KYCDocumentAdmin(admin.ModelAdmin):
    list_display = ['id']
    search_fields = []


@admin.register(BiometricData)
class BiometricDataAdmin(admin.ModelAdmin):
    list_display = ['id']
    search_fields = []


@admin.register(VerificationWorkflow)
class VerificationWorkflowAdmin(admin.ModelAdmin):
    list_display = ['id']
    search_fields = []

