from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import MemberWallet

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
            'created_at', 'updated_at', 'is_active'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at', 'kyc_verified', 'kyc_verified_at', 'credit_score']
        extra_kwargs = {
            'password': {'write_only': True}
        }


class UserRegistrationSerializer(serializers.ModelSerializer):
    """Serializer for user registration."""
    
    password = serializers.CharField(write_only=True, min_length=8, style={'input_type': 'password'})
    password_confirm = serializers.CharField(write_only=True, min_length=8, style={'input_type': 'password'})
    
    class Meta:
        model = User
        fields = ['email', 'password', 'password_confirm', 'first_name', 'last_name', 'phone_number']
    
    def validate(self, attrs):
        """Validate that passwords match."""
        if attrs['password'] != attrs['password_confirm']:
            raise serializers.ValidationError({"password": "Passwords do not match."})
        return attrs
    
    def create(self, validated_data):
        """Create user with hashed password."""
        validated_data.pop('password_confirm')
        user = User.objects.create_user(**validated_data)
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


class PasswordResetRequestSerializer(serializers.Serializer):
    """Serializer for requesting password reset."""
    
    email = serializers.EmailField()


class PasswordResetConfirmSerializer(serializers.Serializer):
    """Serializer for confirming password reset."""
    
    uid = serializers.CharField()
    token = serializers.CharField()
    new_password = serializers.CharField(min_length=8, write_only=True)
    new_password_confirm = serializers.CharField(min_length=8, write_only=True)
    
    def validate(self, attrs):
        """Validate that passwords match."""
        if attrs['new_password'] != attrs['new_password_confirm']:
            raise serializers.ValidationError({"new_password": "Passwords do not match."})
        return attrs

