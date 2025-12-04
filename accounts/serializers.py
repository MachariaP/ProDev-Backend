from rest_framework import serializers
from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password
from django.core.validators import validate_email
from django.core.exceptions import ValidationError as DjangoValidationError
from .models import MemberWallet, PasswordResetToken

User = get_user_model()


class UserSerializer(serializers.ModelSerializer):
    """Serializer for User model."""
    
    full_name = serializers.CharField(source='get_full_name', read_only=True)
    is_kyc_complete = serializers.BooleanField(read_only=True)
    
    class Meta:
        model = User
        fields = [
            'id', 'email', 'first_name', 'last_name', 'full_name',
            'phone_number', 'id_number', 'kra_pin', 'kyc_verified',
            'kyc_verified_at', 'profile_picture', 'date_of_birth',
            'address', 'credit_score', 'is_kyc_complete',
            'created_at', 'updated_at', 'is_active', 'is_staff'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at', 'kyc_verified', 'kyc_verified_at', 'credit_score', 'is_staff']
        extra_kwargs = {
            'password': {'write_only': True}
        }


class UserRegistrationSerializer(serializers.ModelSerializer):
    """Serializer for user registration."""
    
    password = serializers.CharField(
        write_only=True, 
        min_length=8, 
        style={'input_type': 'password'},
        error_messages={
            'min_length': 'Password must be at least 8 characters long.',
            'blank': 'Password cannot be blank.'
        }
    )
    password_confirm = serializers.CharField(
        write_only=True, 
        min_length=8, 
        style={'input_type': 'password'},
        error_messages={
            'min_length': 'Password confirmation must be at least 8 characters long.',
            'blank': 'Password confirmation cannot be blank.'
        }
    )
    
    class Meta:
        model = User
        fields = ['email', 'password', 'password_confirm', 'first_name', 'last_name', 'phone_number']
        extra_kwargs = {
            'email': {
                'error_messages': {
                    'required': 'Email is required.',
                    'blank': 'Email cannot be blank.',
                    'invalid': 'Enter a valid email address.'
                }
            },
            'first_name': {
                'error_messages': {
                    'required': 'First name is required.',
                    'blank': 'First name cannot be blank.'
                }
            },
            'last_name': {
                'error_messages': {
                    'required': 'Last name is required.',
                    'blank': 'Last name cannot be blank.'
                }
            },
            'phone_number': {
                'error_messages': {
                    'required': 'Phone number is required.',
                    'blank': 'Phone number cannot be blank.'
                }
            }
        }
    
    def validate_email(self, value):
        """Validate email format and uniqueness."""
        try:
            validate_email(value)
        except DjangoValidationError:
            raise serializers.ValidationError("Enter a valid email address.")
        
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError("A user with this email already exists.")
        
        return value
    
    def validate_phone_number(self, value):
        """Validate phone number format."""
        if not value:
            raise serializers.ValidationError("Phone number is required.")
        
        # Basic phone number validation
        if len(value) < 10:
            raise serializers.ValidationError("Phone number must be at least 10 digits.")
        
        if len(value) > 15:
            raise serializers.ValidationError("Phone number cannot exceed 15 digits.")
        
        return value
    
    def validate(self, attrs):
        """Validate that passwords match."""
        password = attrs.get('password')
        password_confirm = attrs.get('password_confirm')
        
        if password and password_confirm and password != password_confirm:
            raise serializers.ValidationError({"password_confirm": "Passwords do not match."})
        
        # Validate password strength
        if password:
            try:
                validate_password(password)
            except DjangoValidationError as e:
                raise serializers.ValidationError({"password": list(e.messages)})
        
        return attrs
    
    def create(self, validated_data):
        """Create user with hashed password."""
        validated_data.pop('password_confirm')
        password = validated_data.pop('password')
        user = User(**validated_data)
        user.set_password(password)
        user.save()
        return user


class KYCDocumentUploadSerializer(serializers.ModelSerializer):
    """Serializer for KYC document upload."""
    
    class Meta:
        model = User
        fields = ['id_number', 'kra_pin', 'id_document', 'kra_document']
    
    def validate(self, attrs):
        """Validate that all KYC fields are provided."""
        required_fields = ['id_number', 'kra_pin', 'id_document', 'kra_document']
        for field in required_fields:
            if not attrs.get(field):
                raise serializers.ValidationError({field: "This field is required for KYC verification."})
        return attrs


class MemberWalletSerializer(serializers.ModelSerializer):
    """Serializer for Member Wallet."""
    
    user_email = serializers.EmailField(source='user.email', read_only=True)
    user_name = serializers.CharField(source='user.get_full_name', read_only=True)
    
    class Meta:
        model = MemberWallet
        fields = ['id', 'user', 'user_email', 'user_name', 'balance', 'created_at', 'updated_at']
        read_only_fields = ['id', 'balance', 'created_at', 'updated_at']


class UserProfileUpdateSerializer(serializers.ModelSerializer):
    """Serializer for updating user profile."""
    
    class Meta:
        model = User
        fields = [
            'first_name', 'last_name', 'phone_number',
            'profile_picture', 'date_of_birth', 'address'
        ]


class EmailUpdateSerializer(serializers.Serializer):
    """Serializer for updating user email."""
    
    new_email = serializers.EmailField(
        required=True,
        validators=[validate_email]
    )
    current_password = serializers.CharField(
        write_only=True,
        required=True,
        style={'input_type': 'password'}
    )
    
    def validate_new_email(self, value):
        """Validate new email is not already in use."""
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError("This email is already in use.")
        return value
    
    def validate(self, attrs):
        """Validate current password."""
        user = self.context['request'].user
        if not user.check_password(attrs['current_password']):
            raise serializers.ValidationError(
                {"current_password": "Current password is incorrect."}
            )
        return attrs
    
    def save(self, **kwargs):
        """Update user email."""
        user = self.context['request'].user
        user.email = self.validated_data['new_email']
        user.save()
        return user


class PasswordChangeSerializer(serializers.Serializer):
    """Serializer for changing password while authenticated."""
    
    current_password = serializers.CharField(
        write_only=True,
        required=True,
        style={'input_type': 'password'}
    )
    new_password = serializers.CharField(
        write_only=True,
        required=True,
        min_length=8,
        style={'input_type': 'password'}
    )
    new_password_confirm = serializers.CharField(
        write_only=True,
        required=True,
        min_length=8,
        style={'input_type': 'password'}
    )
    
    def validate_current_password(self, value):
        """Validate current password."""
        user = self.context['request'].user
        if not user.check_password(value):
            raise serializers.ValidationError("Current password is incorrect.")
        return value
    
    def validate(self, attrs):
        """Validate new passwords."""
        new_password = attrs.get('new_password')
        new_password_confirm = attrs.get('new_password_confirm')
        
        if new_password and new_password_confirm and new_password != new_password_confirm:
            raise serializers.ValidationError({"new_password_confirm": "Passwords do not match."})
        
        # Validate password strength
        if new_password:
            try:
                validate_password(new_password)
            except DjangoValidationError as e:
                raise serializers.ValidationError({"new_password": list(e.messages)})
        
        return attrs


class PasswordResetRequestSerializer(serializers.Serializer):
    """Serializer for requesting password reset."""
    
    email = serializers.EmailField(required=True)
    
    def validate_email(self, value):
        """Validate email format."""
        try:
            validate_email(value)
        except DjangoValidationError:
            raise serializers.ValidationError("Enter a valid email address.")
        return value


class PasswordResetConfirmSerializer(serializers.Serializer):
    """Serializer for confirming password reset."""
    
    uid = serializers.CharField(required=True)
    token = serializers.CharField(required=True)
    new_password = serializers.CharField(
        min_length=8, 
        write_only=True, 
        required=True,
        style={'input_type': 'password'}
    )
    new_password_confirm = serializers.CharField(
        min_length=8, 
        write_only=True, 
        required=True,
        style={'input_type': 'password'}
    )
    
    def validate(self, attrs):
        """Validate that passwords match."""
        new_password = attrs.get('new_password')
        new_password_confirm = attrs.get('new_password_confirm')
        
        if new_password and new_password_confirm and new_password != new_password_confirm:
            raise serializers.ValidationError({"new_password_confirm": "Passwords do not match."})
        
        return attrs


class LogoutSerializer(serializers.Serializer):
    """Serializer for logout request."""
    
    refresh = serializers.CharField(help_text="The refresh token to blacklist")


class PasswordResetTokenSerializer(serializers.ModelSerializer):
    """Serializer for Password Reset Token tracking."""
    
    user_email = serializers.EmailField(source='user.email', read_only=True)
    expires_at = serializers.DateTimeField(read_only=True)
    is_expired = serializers.BooleanField(read_only=True)
    
    class Meta:
        model = PasswordResetToken
        fields = ['id', 'user', 'user_email', 'token', 'uid', 'is_used', 
                 'used_at', 'created_at', 'expires_at', 'is_expired']
        read_only_fields = fields
