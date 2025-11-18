from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import OfflineTransactionViewSet, SyncConflictViewSet, DeviceSyncViewSet

router = DefaultRouter()
router.register(r'offline-transactions', OfflineTransactionViewSet, basename='offline-transaction')
router.register(r'sync-conflicts', SyncConflictViewSet, basename='sync-conflict')
router.register(r'device-syncs', DeviceSyncViewSet, basename='device-sync')

urlpatterns = [
    path('', include(router.urls)),
]
