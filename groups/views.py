from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from .models import ChamaGroup, GroupMembership, GroupOfficial, GroupGoal
from .serializers import (
    ChamaGroupSerializer, GroupMembershipSerializer,
    GroupOfficialSerializer, GroupGoalSerializer,
    GroupDashboardSerializer
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

