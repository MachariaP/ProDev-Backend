from django.contrib import admin
from .models import ChamaGroup, GroupMembership, GroupOfficial, GroupGoal, GroupMessage


@admin.register(ChamaGroup)
class ChamaGroupAdmin(admin.ModelAdmin):
    """Admin for Chama Groups."""
    
    list_display = ['name', 'group_type', 'total_balance', 'kyb_verified', 'is_active', 'created_at']
    list_filter = ['group_type', 'kyb_verified', 'is_active', 'contribution_frequency']
    search_fields = ['name', 'description', 'kra_pin']
    readonly_fields = ['created_at', 'updated_at', 'kyb_verified_at']
    
    fieldsets = (
        ('Basic Information', {'fields': ('name', 'description', 'group_type', 'objectives')}),
        ('KYB Documents', {'fields': ('registration_certificate', 'kra_pin', 'kra_document', 'articles_of_association', 'kyb_verified', 'kyb_verified_at')}),
        ('Financial Settings', {'fields': ('contribution_frequency', 'minimum_contribution', 'total_balance')}),
        ('Status', {'fields': ('is_active',)}),
        ('Metadata', {'fields': ('created_by', 'created_at', 'updated_at')}),
    )


@admin.register(GroupMembership)
class GroupMembershipAdmin(admin.ModelAdmin):
    """Admin for Group Memberships."""
    
    list_display = ['user', 'group', 'role', 'status', 'total_contributions', 'joined_at']
    list_filter = ['role', 'status', 'joined_at']
    search_fields = ['user__email', 'group__name']
    readonly_fields = ['joined_at', 'approved_at', 'exited_at']


@admin.register(GroupOfficial)
class GroupOfficialAdmin(admin.ModelAdmin):
    """Admin for Group Officials."""
    
    list_display = ['group', 'position', 'get_official_name', 'term_start', 'term_end', 'is_current']
    list_filter = ['position', 'is_current']
    search_fields = ['group__name', 'membership__user__email']
    
    def get_official_name(self, obj):
        return obj.membership.user.get_full_name()
    get_official_name.short_description = 'Official Name'


@admin.register(GroupGoal)
class GroupGoalAdmin(admin.ModelAdmin):
    """Admin for Group Goals."""
    
    list_display = ['title', 'group', 'target_amount', 'current_amount', 'status', 'target_date']
    list_filter = ['status', 'created_at']
    search_fields = ['title', 'group__name']
    readonly_fields = ['created_at', 'updated_at', 'achieved_at']


@admin.register(GroupMessage)
class GroupMessageAdmin(admin.ModelAdmin):
    """Admin for Group Messages."""
    
    list_display = ['get_message_preview', 'user', 'group', 'created_at', 'is_edited']
    list_filter = ['group', 'created_at', 'is_edited']
    search_fields = ['content', 'user__email', 'group__name']
    readonly_fields = ['created_at', 'edited_at']
    
    def get_message_preview(self, obj):
        return obj.content[:50]
    get_message_preview.short_description = 'Message'

