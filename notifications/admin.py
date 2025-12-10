from django.contrib import admin
from .models import Notification, NotificationPreference, BulkNotification


@admin.register(Notification)
class NotificationAdmin(admin.ModelAdmin):
    list_display = ('title', 'user', 'notification_type', 'priority', 'is_read', 'created_at')
    list_filter = ('notification_type', 'priority', 'is_read', 'is_archived', 'created_at')
    search_fields = ('title', 'message', 'user__email', 'user__first_name', 'user__last_name')
    readonly_fields = ('created_at', 'read_at')
    fieldsets = (
        ('Notification Details', {
            'fields': ('user', 'title', 'message', 'notification_type', 'priority')
        }),
        ('Status', {
            'fields': ('is_read', 'is_archived', 'read_at', 'expires_at')
        }),
        ('Related Objects', {
            'fields': ('group', 'related_object_type', 'related_object_id'),
            'classes': ('collapse',)
        }),
        ('Timestamps', {
            'fields': ('created_at',),
            'classes': ('collapse',)
        }),
    )
    
    actions = ['mark_as_read', 'mark_as_unread', 'archive_notifications']
    
    def mark_as_read(self, request, queryset):
        updated = queryset.update(is_read=True)
        self.message_user(request, f'{updated} notifications marked as read.')
    mark_as_read.short_description = "Mark selected notifications as read"
    
    def mark_as_unread(self, request, queryset):
        updated = queryset.update(is_read=False, read_at=None)
        self.message_user(request, f'{updated} notifications marked as unread.')
    mark_as_unread.short_description = "Mark selected notifications as unread"
    
    def archive_notifications(self, request, queryset):
        updated = queryset.update(is_archived=True)
        self.message_user(request, f'{updated} notifications archived.')
    archive_notifications.short_description = "Archive selected notifications"


@admin.register(NotificationPreference)
class NotificationPreferenceAdmin(admin.ModelAdmin):
    list_display = ('user', 'daily_digest', 'weekly_digest', 'updated_at')
    list_filter = ('daily_digest', 'weekly_digest', 'updated_at')
    search_fields = ('user__email', 'user__first_name', 'user__last_name')
    readonly_fields = ('created_at', 'updated_at')
    fieldsets = (
        ('User', {
            'fields': ('user',)
        }),
        ('Email Notifications', {
            'fields': (
                'email_contributions', 'email_loans', 'email_investments',
                'email_meetings', 'email_system'
            ),
            'classes': ('collapse',)
        }),
        ('In-App Notifications', {
            'fields': (
                'inapp_contributions', 'inapp_loans', 'inapp_investments',
                'inapp_meetings', 'inapp_system'
            ),
            'classes': ('collapse',)
        }),
        ('Push Notifications', {
            'fields': (
                'push_contributions', 'push_loans', 'push_investments',
                'push_meetings', 'push_system'
            ),
            'classes': ('collapse',)
        }),
        ('Digest Settings', {
            'fields': ('daily_digest', 'weekly_digest', 'digest_time')
        }),
        ('Do Not Disturb', {
            'fields': ('quiet_hours_start', 'quiet_hours_end'),
            'classes': ('collapse',)
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )


@admin.register(BulkNotification)
class BulkNotificationAdmin(admin.ModelAdmin):
    list_display = ('title', 'sender', 'total_recipients', 'sent_count', 'is_sent', 'created_at')
    list_filter = ('notification_type', 'is_sent', 'target_all_users', 'created_at')
    search_fields = ('title', 'message', 'sender__email')
    readonly_fields = ('sent_count', 'read_count', 'is_sent', 'sent_at', 'created_at', 'updated_at')
    filter_horizontal = ('groups',)
    fieldsets = (
        ('Notification Details', {
            'fields': ('sender', 'title', 'message', 'notification_type')
        }),
        ('Target Audience', {
            'fields': ('target_all_users', 'groups')
        }),
        ('Scheduling', {
            'fields': ('scheduled_for',)
        }),
        ('Statistics', {
            'fields': ('total_recipients', 'sent_count', 'read_count'),
            'classes': ('collapse',)
        }),
        ('Status', {
            'fields': ('is_sent', 'sent_at')
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    actions = ['send_notifications', 'resend_notifications']
    
    def send_notifications(self, request, queryset):
        """Send selected bulk notifications"""
        for bulk_notification in queryset.filter(is_sent=False):
            # You would implement the actual sending logic here
            bulk_notification.is_sent = True
            bulk_notification.sent_at = timezone.now()
            bulk_notification.save()
        
        self.message_user(request, f'{queryset.count()} notifications sent.')
    send_notifications.short_description = "Send selected bulk notifications"
    
    def resend_notifications(self, request, queryset):
        """Resend selected bulk notifications"""
        for bulk_notification in queryset.filter(is_sent=True):
            bulk_notification.sent_count = 0
            bulk_notification.read_count = 0
            bulk_notification.save()
            # Resend logic would go here
        
        self.message_user(request, f'{queryset.count()} notifications reset for resending.')
    resend_notifications.short_description = "Reset and resend selected bulk notifications"
