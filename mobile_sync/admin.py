from django.contrib import admin
from .models import OfflineTransaction, SyncConflict, DeviceSync


@admin.register(OfflineTransaction)
class OfflineTransactionAdmin(admin.ModelAdmin):
    list_display = ['id']
    search_fields = []


@admin.register(SyncConflict)
class SyncConflictAdmin(admin.ModelAdmin):
    list_display = ['id']
    search_fields = []


@admin.register(DeviceSync)
class DeviceSyncAdmin(admin.ModelAdmin):
    list_display = ['id']
    search_fields = []

