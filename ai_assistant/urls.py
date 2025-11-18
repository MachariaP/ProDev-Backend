from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ChatConversationViewSet, ChatMessageViewSet, FinancialAdviceViewSet

router = DefaultRouter()
router.register(r'chat-conversations', ChatConversationViewSet, basename='chat-conversation')
router.register(r'chat-messages', ChatMessageViewSet, basename='chat-message')
router.register(r'financial-advices', FinancialAdviceViewSet, basename='financial-advice')

urlpatterns = [
    path('', include(router.urls)),
]
