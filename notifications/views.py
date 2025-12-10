from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.parsers import JSONParser, MultiPartParser
from django.db.models import Count, Q, F
from django.utils import timezone
from datetime import timedelta
import logging

from .models import Notification, NotificationPreference, BulkNotification
from .serializers import (
    NotificationSerializer,
    NotificationPreferenceSerializer,
    BulkNotificationSerializer,
    MarkAsReadSerializer,
    NotificationStatsSerializer
)
from .tasks import send_bulk_notification_emails

logger = logging.getLogger(__name__)


class NotificationViewSet(viewsets.ModelViewSet):
    """ViewSet for Notification model"""
    
    serializer_class = NotificationSerializer
    permission_classes = [IsAuthenticated]
    parser_classes = [JSONParser, MultiPartParser]
    
    def get_queryset(self):
        """Return notifications for current user"""
        queryset = Notification.objects.filter(
            user=self.request.user,
            is_archived=False
        ).select_related('user', 'group')
        
        # Filter by read status
        is_read = self.request.query_params.get('is_read')
        if is_read is not None:
            if is_read.lower() == 'true':
                queryset = queryset.filter(is_read=True)
            else:
                queryset = queryset.filter(is_read=False)
        
        # Filter by type
        notification_type = self.request.query_params.get('type')
        if notification_type:
            queryset = queryset.filter(notification_type=notification_type)
        
        # Filter by priority
        priority = self.request.query_params.get('priority')
        if priority:
            queryset = queryset.filter(priority=priority)
        
        # Filter by group
        group_id = self.request.query_params.get('group_id')
        if group_id:
            queryset = queryset.filter(group_id=group_id)
        
        # Filter by date range
        start_date = self.request.query_params.get('start_date')
        end_date = self.request.query_params.get('end_date')
        if start_date:
            queryset = queryset.filter(created_at__gte=start_date)
        if end_date:
            queryset = queryset.filter(created_at__lte=end_date)
        
        return queryset.order_by('-created_at')
    
    def get_serializer_context(self):
        """Add request to serializer context"""
        context = super().get_serializer_context()
        context['request'] = self.request
        return context
    
    @action(detail=False, methods=['get'])
    def stats(self, request):
        """Get notification statistics for current user"""
        total = Notification.objects.filter(
            user=request.user,
            is_archived=False
        ).count()
        
        unread = Notification.objects.filter(
            user=request.user,
            is_read=False,
            is_archived=False
        ).count()
        
        read = total - unread
        
        # Count by type
        by_type = Notification.objects.filter(
            user=request.user,
            is_archived=False
        ).values('notification_type').annotate(
            count=Count('id')
        ).order_by('-count')
        
        # Count by priority
        by_priority = Notification.objects.filter(
            user=request.user,
            is_archived=False
        ).values('priority').annotate(
            count=Count('id')
        ).order_by('-count')
        
        stats = {
            'total': total,
            'unread': unread,
            'read': read,
            'by_type': {item['notification_type']: item['count'] for item in by_type},
            'by_priority': {item['priority']: item['count'] for item in by_priority},
        }
        
        serializer = NotificationStatsSerializer(data=stats)
        serializer.is_valid(raise_exception=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['post'])
    def mark_all_as_read(self, request):
        """Mark all unread notifications as read"""
        updated = Notification.objects.filter(
            user=request.user,
            is_read=False,
            is_archived=False
        ).update(is_read=True, read_at=timezone.now())
        
        return Response({
            'status': 'success',
            'message': f'Marked {updated} notifications as read'
        })
    
    @action(detail=False, methods=['post'])
    def mark_as_read(self, request):
        """Mark specific notifications as read"""
        serializer = MarkAsReadSerializer(
            data=request.data,
            context={'request': request}
        )
        serializer.is_valid(raise_exception=True)
        
        notification_ids = serializer.validated_data['notification_ids']
        
        updated = Notification.objects.filter(
            user=request.user,
            id__in=notification_ids,
            is_read=False
        ).update(is_read=True, read_at=timezone.now())
        
        return Response({
            'status': 'success',
            'message': f'Marked {updated} notifications as read'
        })
    
    @action(detail=True, methods=['post'])
    def mark_as_read_single(self, request, pk=None):
        """Mark a single notification as read"""
        notification = self.get_object()
        notification.mark_as_read()
        
        return Response({
            'status': 'success',
            'message': 'Notification marked as read'
        })
    
    @action(detail=True, methods=['post'])
    def archive(self, request, pk=None):
        """Archive a notification"""
        notification = self.get_object()
        notification.archive()
        
        return Response({
            'status': 'success',
            'message': 'Notification archived'
        })
    
    @action(detail=False, methods=['get'])
    def unread_count(self, request):
        """Get count of unread notifications"""
        count = Notification.objects.filter(
            user=request.user,
            is_read=False,
            is_archived=False
        ).count()
        
        return Response({'count': count})


class NotificationPreferenceViewSet(viewsets.ModelViewSet):
    """ViewSet for NotificationPreference model"""
    
    serializer_class = NotificationPreferenceSerializer
    permission_classes = [IsAuthenticated]
    parser_classes = [JSONParser]
    
    def get_queryset(self):
        """Return preferences for current user"""
        return NotificationPreference.objects.filter(
            user=self.request.user
        )
    
    def get_object(self):
        """Get or create preferences for current user"""
        obj, created = NotificationPreference.objects.get_or_create(
            user=self.request.user
        )
        return obj
    
    def get_serializer_context(self):
        """Add request to serializer context"""
        context = super().get_serializer_context()
        context['request'] = self.request
        return context


class BulkNotificationViewSet(viewsets.ModelViewSet):
    """ViewSet for BulkNotification model"""
    
    serializer_class = BulkNotificationSerializer
    permission_classes = [IsAuthenticated]
    parser_classes = [JSONParser, MultiPartParser]
    
    def get_queryset(self):
        """Return bulk notifications created by current user"""
        queryset = BulkNotification.objects.filter(
            sender=self.request.user
        ).prefetch_related('groups')
        
        # Filter by sent status
        is_sent = self.request.query_params.get('is_sent')
        if is_sent is not None:
            if is_sent.lower() == 'true':
                queryset = queryset.filter(is_sent=True)
            else:
                queryset = queryset.filter(is_sent=False)
        
        return queryset.order_by('-created_at')
    
    def get_serializer_context(self):
        """Add request to serializer context"""
        context = super().get_serializer_context()
        context['request'] = self.request
        return context
    
    def perform_create(self, serializer):
        """Create bulk notification and schedule sending"""
        bulk_notification = serializer.save()
        
        # Calculate total recipients
        total_recipients = 0
        
        if bulk_notification.target_all_users:
            from django.contrib.auth import get_user_model
            User = get_user_model()
            total_recipients = User.objects.count()
        else:
            # Calculate recipients from selected groups
            for group in bulk_notification.groups.all():
                total_recipients += group.members.count()
        
        bulk_notification.total_recipients = total_recipients
        bulk_notification.save()
        
        # Schedule sending if scheduled_for is set
        if bulk_notification.scheduled_for:
            # TODO: Schedule Celery task for future sending
            pass
        else:
            # Send immediately
            self.send_bulk_notification(bulk_notification)
    
    def send_bulk_notification(self, bulk_notification):
        """Send bulk notification to all recipients"""
        try:
            # Create notifications for each recipient
            recipients = []
            
            if bulk_notification.target_all_users:
                from django.contrib.auth import get_user_model
                User = get_user_model()
                recipients = User.objects.all()
            else:
                # Get recipients from selected groups
                for group in bulk_notification.groups.all():
                    recipients.extend(group.members.all())
            
            sent_count = 0
            for user in recipients:
                if user != bulk_notification.sender:  # Don't send to self
                    Notification.objects.create(
                        user=user,
                        title=bulk_notification.title,
                        message=bulk_notification.message,
                        notification_type=bulk_notification.notification_type,
                        sender=bulk_notification.sender
                    )
                    sent_count += 1
            
            bulk_notification.sent_count = sent_count
            bulk_notification.is_sent = True
            bulk_notification.sent_at = timezone.now()
            bulk_notification.save()
            
            # Send email notifications (async)
            send_bulk_notification_emails.delay(bulk_notification.id)
            
        except Exception as e:
            logger.error(f"Failed to send bulk notification: {str(e)}")
            raise
    
    @action(detail=True, methods=['post'])
    def resend(self, request, pk=None):
        """Resend a bulk notification"""
        bulk_notification = self.get_object()
        
        if not bulk_notification.is_sent:
            return Response(
                {'error': 'This notification has not been sent yet'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Clear previous stats and resend
        bulk_notification.sent_count = 0
        bulk_notification.read_count = 0
        bulk_notification.save()
        
        self.send_bulk_notification(bulk_notification)
        
        return Response({
            'status': 'success',
            'message': 'Bulk notification resent successfully'
        })


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def recent_notifications(request):
    """Get recent notifications for current user"""
    page = int(request.query_params.get('page', 1))
    page_size = int(request.query_params.get('page_size', 10))
    
    notifications = Notification.objects.filter(
        user=request.user,
        is_archived=False
    ).select_related('user', 'group').order_by('-created_at')
    
    # Pagination
    start = (page - 1) * page_size
    end = start + page_size
    
    paginated_notifications = notifications[start:end]
    total_count = notifications.count()
    
    serializer = NotificationSerializer(
        paginated_notifications,
        many=True,
        context={'request': request}
    )
    
    return Response({
        'results': serializer.data,
        'count': total_count,
        'page': page,
        'page_size': page_size,
        'total_pages': (total_count + page_size - 1) // page_size
    })
