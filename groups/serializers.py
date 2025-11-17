from rest_framework import serializers
from .models import ChamaGroup, GroupMembership, GroupOfficial, GroupGoal
from accounts.serializers import UserSerializer


class ChamaGroupSerializer(serializers.ModelSerializer):
    """Serializer for Chama Group."""
    
    created_by_name = serializers.CharField(source='created_by.get_full_name', read_only=True)
    is_kyb_complete = serializers.BooleanField(read_only=True)
    member_count = serializers.SerializerMethodField()
    
    class Meta:
        model = ChamaGroup
        fields = [
            'id', 'name', 'description', 'group_type', 'objectives',
            'registration_certificate', 'kra_pin', 'kra_document',
            'articles_of_association', 'contribution_frequency',
            'minimum_contribution', 'total_balance', 'is_active',
            'kyb_verified', 'kyb_verified_at', 'created_by',
            'created_by_name', 'is_kyb_complete', 'member_count',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'total_balance', 'kyb_verified', 'kyb_verified_at', 'created_at', 'updated_at']
    
    def get_member_count(self, obj):
        """Get the number of active members."""
        return obj.memberships.filter(status='ACTIVE').count()


class GroupMembershipSerializer(serializers.ModelSerializer):
    """Serializer for Group Membership."""
    
    user_details = UserSerializer(source='user', read_only=True)
    group_name = serializers.CharField(source='group.name', read_only=True)
    
    class Meta:
        model = GroupMembership
        fields = [
            'id', 'group', 'group_name', 'user', 'user_details',
            'role', 'status', 'joined_at', 'approved_at',
            'exited_at', 'total_contributions'
        ]
        read_only_fields = ['id', 'joined_at', 'approved_at', 'exited_at', 'total_contributions']


class GroupOfficialSerializer(serializers.ModelSerializer):
    """Serializer for Group Officials."""
    
    official_name = serializers.CharField(source='membership.user.get_full_name', read_only=True)
    group_name = serializers.CharField(source='group.name', read_only=True)
    
    class Meta:
        model = GroupOfficial
        fields = [
            'id', 'group', 'group_name', 'membership',
            'official_name', 'position', 'elected_at',
            'term_start', 'term_end', 'is_current'
        ]
        read_only_fields = ['id', 'elected_at']


class GroupGoalSerializer(serializers.ModelSerializer):
    """Serializer for Group Goals."""
    
    created_by_name = serializers.CharField(source='created_by.get_full_name', read_only=True)
    group_name = serializers.CharField(source='group.name', read_only=True)
    progress_percentage = serializers.DecimalField(max_digits=5, decimal_places=2, read_only=True)
    
    class Meta:
        model = GroupGoal
        fields = [
            'id', 'group', 'group_name', 'title', 'description',
            'target_amount', 'current_amount', 'target_date',
            'status', 'progress_percentage', 'created_by',
            'created_by_name', 'created_at', 'updated_at',
            'achieved_at'
        ]
        read_only_fields = ['id', 'current_amount', 'created_at', 'updated_at', 'achieved_at']


class GroupDashboardSerializer(serializers.ModelSerializer):
    """Serializer for Group Dashboard with aggregated data."""
    
    member_count = serializers.SerializerMethodField()
    total_contributions = serializers.SerializerMethodField()
    total_loans_outstanding = serializers.SerializerMethodField()
    total_investments = serializers.SerializerMethodField()
    active_goals = GroupGoalSerializer(many=True, read_only=True, source='goals')
    
    class Meta:
        model = ChamaGroup
        fields = [
            'id', 'name', 'group_type', 'total_balance',
            'member_count', 'total_contributions',
            'total_loans_outstanding', 'total_investments',
            'active_goals'
        ]
    
    def get_member_count(self, obj):
        """Get active member count."""
        return obj.memberships.filter(status='ACTIVE').count()
    
    def get_total_contributions(self, obj):
        """Get total contributions."""
        from finance.models import Contribution
        total = Contribution.objects.filter(
            group=obj,
            status='COMPLETED'
        ).aggregate(total=serializers.Sum('amount'))
        return total['total'] or 0
    
    def get_total_loans_outstanding(self, obj):
        """Get total outstanding loans."""
        from finance.models import Loan
        total = Loan.objects.filter(
            group=obj,
            status__in=['ACTIVE', 'DISBURSED']
        ).aggregate(total=serializers.Sum('outstanding_balance'))
        return total['total'] or 0
    
    def get_total_investments(self, obj):
        """Get total investment value."""
        if hasattr(obj, 'portfolio'):
            return obj.portfolio.current_value
        return 0
