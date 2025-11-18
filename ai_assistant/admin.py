from django.contrib import admin
from .models import ChatConversation, ChatMessage, FinancialAdvice


@admin.register(ChatConversation)
class ChatConversationAdmin(admin.ModelAdmin):
    list_display = ['id']
    search_fields = []


@admin.register(ChatMessage)
class ChatMessageAdmin(admin.ModelAdmin):
    list_display = ['id']
    search_fields = []


@admin.register(FinancialAdvice)
class FinancialAdviceAdmin(admin.ModelAdmin):
    list_display = ['id']
    search_fields = []

