from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    NotificationViewSet,
    NotificationPreferenceViewSet,
    BulkNotificationViewSet,
    recent_notifications
)

router = DefaultRouter()
router.register(r'notifications', NotificationViewSet, basename='notification')
router.register(r'notification-preferences', NotificationPreferenceViewSet, basename='notification-preference')
router.register(r'bulk-notifications', BulkNotificationViewSet, basename='bulk-notification')

urlpatterns = [
    path('', include(router.urls)),
    path('notifications/recent/', recent_notifications, name='recent-notifications'),
]
