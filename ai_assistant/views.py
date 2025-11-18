from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from .models import ChatConversation, ChatMessage, FinancialAdvice
from .serializers import ChatConversationSerializer, ChatMessageSerializer, FinancialAdviceSerializer


class ChatConversationViewSet(viewsets.ModelViewSet):
    queryset = ChatConversation.objects.all()
    serializer_class = ChatConversationSerializer
    permission_classes = [IsAuthenticated]


class ChatMessageViewSet(viewsets.ModelViewSet):
    queryset = ChatMessage.objects.all()
    serializer_class = ChatMessageSerializer
    permission_classes = [IsAuthenticated]


class FinancialAdviceViewSet(viewsets.ModelViewSet):
    queryset = FinancialAdvice.objects.all()
    serializer_class = FinancialAdviceSerializer
    permission_classes = [IsAuthenticated]

