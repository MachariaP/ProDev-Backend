from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import AutomationRuleViewSet, ExecutionLogViewSet, NotificationTemplateViewSet

router = DefaultRouter()
router.register(r'automation-rules', AutomationRuleViewSet, basename='automation-rule')
router.register(r'execution-logs', ExecutionLogViewSet, basename='execution-log')
router.register(r'notification-templates', NotificationTemplateViewSet, basename='notification-template')

urlpatterns = [
    path('', include(router.urls)),
]
