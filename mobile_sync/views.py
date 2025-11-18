from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from .models import OfflineTransaction, SyncConflict, DeviceSync
from .serializers import OfflineTransactionSerializer, SyncConflictSerializer, DeviceSyncSerializer


class OfflineTransactionViewSet(viewsets.ModelViewSet):
    queryset = OfflineTransaction.objects.all()
    serializer_class = OfflineTransactionSerializer
    permission_classes = [IsAuthenticated]


class SyncConflictViewSet(viewsets.ModelViewSet):
    queryset = SyncConflict.objects.all()
    serializer_class = SyncConflictSerializer
    permission_classes = [IsAuthenticated]


class DeviceSyncViewSet(viewsets.ModelViewSet):
    queryset = DeviceSync.objects.all()
    serializer_class = DeviceSyncSerializer
    permission_classes = [IsAuthenticated]

