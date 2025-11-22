from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from .models import ChamaGroup, GroupMembership, GroupOfficial, GroupGoal, GroupMessage
from .serializers import (
    ChamaGroupSerializer, GroupMembershipSerializer,
    GroupOfficialSerializer, GroupGoalSerializer,
    GroupDashboardSerializer, GroupMessageSerializer
)


class ChamaGroupViewSet(viewsets.ModelViewSet):
    """ViewSet for Chama Groups."""
    
    queryset = ChamaGroup.objects.all()
    serializer_class = ChamaGroupSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['group_type', 'is_active', 'kyb_verified']
    
    def perform_create(self, serializer):
        """Set created_by to current user."""
        group = serializer.save(created_by=self.request.user)
        # Automatically add creator as admin member
        GroupMembership.objects.create(
            group=group,
            user=self.request.user,
            role='ADMIN',
            status='ACTIVE'
        )
    
    @action(detail=True, methods=['get'])
    def dashboard(self, request, pk=None):
        """Get group dashboard with aggregated data."""
        group = self.get_object()
        serializer = GroupDashboardSerializer(group)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def my_groups(self, request):
        """Get groups the current user is a member of."""
        memberships = GroupMembership.objects.filter(
            user=request.user,
            status='ACTIVE'
        )
        groups = [m.group for m in memberships]
        serializer = self.get_serializer(groups, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['get'])
    def members(self, request, pk=None):
        """Get all members of a specific group."""
        group = self.get_object()
        memberships = GroupMembership.objects.filter(group=group).select_related('user')
        serializer = GroupMembershipSerializer(memberships, many=True, context={'request': request})
        return Response(serializer.data)


class GroupMembershipViewSet(viewsets.ModelViewSet):
    """ViewSet for Group Memberships."""
    
    queryset = GroupMembership.objects.all()
    serializer_class = GroupMembershipSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['group', 'user', 'role', 'status']
    
    @action(detail=True, methods=['post'])
    def approve(self, request, pk=None):
        """Approve a pending membership."""
        membership = self.get_object()
        if membership.status != 'PENDING':
            return Response(
                {'error': 'Only pending memberships can be approved'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        from django.utils import timezone
        membership.status = 'ACTIVE'
        membership.approved_at = timezone.now()
        membership.save()
        
        serializer = self.get_serializer(membership)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def suspend(self, request, pk=None):
        """Suspend a membership."""
        membership = self.get_object()
        membership.status = 'SUSPENDED'
        membership.save()
        
        serializer = self.get_serializer(membership)
        return Response(serializer.data)


class GroupOfficialViewSet(viewsets.ModelViewSet):
    """ViewSet for Group Officials."""
    
    queryset = GroupOfficial.objects.all()
    serializer_class = GroupOfficialSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['group', 'position', 'is_current']


class GroupGoalViewSet(viewsets.ModelViewSet):
    """ViewSet for Group Goals."""
    
    queryset = GroupGoal.objects.all()
    serializer_class = GroupGoalSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['group', 'status']
    
    def perform_create(self, serializer):
        """Set created_by to current user."""
        serializer.save(created_by=self.request.user)
    
    @action(detail=True, methods=['post'])
    def mark_achieved(self, request, pk=None):
        """Mark a goal as achieved."""
        goal = self.get_object()
        from django.utils import timezone
        
        goal.status = 'ACHIEVED'
        goal.achieved_at = timezone.now()
        goal.save()
        
        serializer = self.get_serializer(goal)
        return Response(serializer.data)


class GroupMessageViewSet(viewsets.ModelViewSet):
    """ViewSet for Group Messages."""
    
    queryset = GroupMessage.objects.all()
    serializer_class = GroupMessageSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['group']
    
    def get_queryset(self):
        """Filter messages for groups the user is a member of."""
        user = self.request.user
        # Get groups where user is an active member
        user_groups = GroupMembership.objects.filter(
            user=user,
            status='ACTIVE'
        ).values_list('group_id', flat=True)
        
        return GroupMessage.objects.filter(group_id__in=user_groups).select_related('user', 'group')
    
    def perform_create(self, serializer):
        """Validate user is a member of the group before creating message."""
        group = serializer.validated_data.get('group')
        user = self.request.user
        
        # Check if user is an active member of the group
        membership = GroupMembership.objects.filter(
            group=group,
            user=user,
            status='ACTIVE'
        ).first()
        
        if not membership:
            from rest_framework.exceptions import PermissionDenied
            raise PermissionDenied("You must be an active member of this group to send messages.")
        
        serializer.save(user=user)
    
    @action(detail=True, methods=['patch'])
    def edit(self, request, pk=None):
        """Edit a message (only by the original sender)."""
        message = self.get_object()
        
        if message.user != request.user:
            return Response(
                {'error': 'You can only edit your own messages'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        content = request.data.get('content')
        if not content:
            return Response(
                {'error': 'Content is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        from django.utils import timezone
        message.content = content
        message.is_edited = True
        message.edited_at = timezone.now()
        message.save()
        
        serializer = self.get_serializer(message)
        return Response(serializer.data)

