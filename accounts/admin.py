from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import User, MemberWallet


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    """Admin for custom User model."""
    
    list_display = ['email', 'first_name', 'last_name', 'kyc_verified', 'credit_score', 'is_active', 'created_at']
    list_filter = ['kyc_verified', 'is_active', 'is_staff', 'created_at']
    search_fields = ['email', 'first_name', 'last_name', 'phone_number', 'id_number']
    ordering = ['-created_at']
    
    fieldsets = (
        (None, {'fields': ('email', 'password')}),
        ('Personal Info', {'fields': ('first_name', 'last_name', 'phone_number', 'date_of_birth', 'address', 'profile_picture')}),
        ('KYC Information', {'fields': ('id_number', 'kra_pin', 'id_document', 'kra_document', 'kyc_verified', 'kyc_verified_at')}),
        ('Financial', {'fields': ('credit_score',)}),
        ('Permissions', {'fields': ('is_active', 'is_staff', 'is_superuser', 'groups', 'user_permissions')}),
        ('Important dates', {'fields': ('last_login', 'created_at', 'updated_at')}),
    )
    
    readonly_fields = ['created_at', 'updated_at', 'kyc_verified_at', 'last_login']
    
    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('email', 'password1', 'password2'),
        }),
    )


@admin.register(MemberWallet)
class MemberWalletAdmin(admin.ModelAdmin):
    """Admin for Member Wallet."""
    
    list_display = ['user', 'balance', 'created_at', 'updated_at']
    search_fields = ['user__email', 'user__first_name', 'user__last_name']
    readonly_fields = ['created_at', 'updated_at']
    list_filter = ['created_at']

