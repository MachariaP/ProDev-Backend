from rest_framework import serializers
from .models import ChatConversation, ChatMessage, FinancialAdvice


class ChatConversationSerializer(serializers.ModelSerializer):
    class Meta:
        model = ChatConversation
        fields = '__all__'
        read_only_fields = ['id']


class ChatMessageSerializer(serializers.ModelSerializer):
    class Meta:
        model = ChatMessage
        fields = '__all__'
        read_only_fields = ['id']


class FinancialAdviceSerializer(serializers.ModelSerializer):
    class Meta:
        model = FinancialAdvice
        fields = '__all__'
        read_only_fields = ['id']

