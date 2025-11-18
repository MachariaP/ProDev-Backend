from rest_framework import serializers
from .models import OfflineTransaction, SyncConflict, DeviceSync


class OfflineTransactionSerializer(serializers.ModelSerializer):
    class Meta:
        model = OfflineTransaction
        fields = '__all__'
        read_only_fields = ['id']


class SyncConflictSerializer(serializers.ModelSerializer):
    class Meta:
        model = SyncConflict
        fields = '__all__'
        read_only_fields = ['id']


class DeviceSyncSerializer(serializers.ModelSerializer):
    class Meta:
        model = DeviceSync
        fields = '__all__'
        read_only_fields = ['id']

