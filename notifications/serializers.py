from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import Notification, NotificationPreference, BulkNotification
from groups.serializers import ChamaGroupSerializer

User = get_user_model()


class NotificationSerializer(serializers.ModelSerializer):
    """Serializer for Notification model"""
    
    user = serializers.PrimaryKeyRelatedField(
        queryset=User.objects.all(),
        required=False
    )
    user_name = serializers.CharField(source='user.get_full_name', read_only=True)
    user_email = serializers.CharField(source='user.email', read_only=True)
    group_name = serializers.CharField(source='group.name', read_only=True)
    
    # Human readable timestamps
    created_at_display = serializers.SerializerMethodField()
    read_at_display = serializers.SerializerMethodField()
    
    class Meta:
        model = Notification
        fields = [
            'id', 'user', 'user_name', 'user_email',
            'title', 'message', 'notification_type', 'priority',
            'is_read', 'is_archived', 'group', 'group_name',
            'related_object_type', 'related_object_id',
            'created_at', 'created_at_display',
            'read_at', 'read_at_display', 'expires_at'
        ]
        read_only_fields = ['id', 'created_at', 'read_at']
    
    def get_created_at_display(self, obj):
        """Get human readable created at time"""
        from django.utils import timesince
        return timesince.timesince(obj.created_at) + ' ago'
    
    def get_read_at_display(self, obj):
        """Get human readable read at time"""
        if obj.read_at:
            from django.utils import timesince
            return timesince.timesince(obj.read_at) + ' ago'
        return None
    
    def create(self, validated_data):
        """Create notification with current user as default"""
        request = self.context.get('request')
        if request and hasattr(request, 'user'):
            validated_data.setdefault('user', request.user)
        return super().create(validated_data)


class NotificationPreferenceSerializer(serializers.ModelSerializer):
    """Serializer for NotificationPreference model"""
    
    user = serializers.PrimaryKeyRelatedField(
        queryset=User.objects.all(),
        required=False
    )
    user_name = serializers.CharField(source='user.get_full_name', read_only=True)
    
    class Meta:
        model = NotificationPreference
        fields = [
            'id', 'user', 'user_name',
            'email_contributions', 'email_loans', 'email_investments',
            'email_meetings', 'email_system',
            'inapp_contributions', 'inapp_loans', 'inapp_investments',
            'inapp_meetings', 'inapp_system',
            'push_contributions', 'push_loans', 'push_investments',
            'push_meetings', 'push_system',
            'daily_digest', 'weekly_digest', 'digest_time',
            'quiet_hours_start', 'quiet_hours_end',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']
    
    def create(self, validated_data):
        """Create notification preference with current user"""
        request = self.context.get('request')
        if request and hasattr(request, 'user'):
            validated_data['user'] = request.user
        return super().create(validated_data)


class BulkNotificationSerializer(serializers.ModelSerializer):
    """Serializer for BulkNotification model"""
    
    sender = serializers.PrimaryKeyRelatedField(
        queryset=User.objects.all(),
        required=False
    )
    sender_name = serializers.CharField(source='sender.get_full_name', read_only=True)
    groups_data = ChamaGroupSerializer(source='groups', many=True, read_only=True)
    
    class Meta:
        model = BulkNotification
        fields = [
            'id', 'sender', 'sender_name', 'title', 'message',
            'notification_type', 'target_all_users',
            'groups', 'groups_data',
            'total_recipients', 'sent_count', 'read_count',
            'scheduled_for', 'is_sent', 'sent_at',
            'created_at', 'updated_at'
        ]
        read_only_fields = [
            'id', 'sent_count', 'read_count', 'is_sent',
            'sent_at', 'created_at', 'updated_at'
        ]
    
    def create(self, validated_data):
        """Create bulk notification with current user as sender"""
        request = self.context.get('request')
        if request and hasattr(request, 'user'):
            validated_data['sender'] = request.user
        return super().create(validated_data)


class MarkAsReadSerializer(serializers.Serializer):
    """Serializer for marking notifications as read"""
    
    notification_ids = serializers.ListField(
        child=serializers.IntegerField(),
        required=True
    )
    
    def validate_notification_ids(self, value):
        """Validate that notification IDs exist and belong to user"""
        request = self.context.get('request')
        if request and hasattr(request, 'user'):
            user_notifications = Notification.objects.filter(
                user=request.user,
                id__in=value
            )
            valid_ids = user_notifications.values_list('id', flat=True)
            invalid_ids = set(value) - set(valid_ids)
            if invalid_ids:
                raise serializers.ValidationError(
                    f"Notifications not found or not accessible: {invalid_ids}"
                )
        return value


class NotificationStatsSerializer(serializers.Serializer):
    """Serializer for notification statistics"""
    
    total = serializers.IntegerField()
    unread = serializers.IntegerField()
    read = serializers.IntegerField()
    by_type = serializers.DictField()
    by_priority = serializers.DictField()
