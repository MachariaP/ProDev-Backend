from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.exceptions import TokenError
from django.contrib.auth import get_user_model
from django.contrib.auth.tokens import default_token_generator
from django.contrib.auth.password_validation import validate_password
from django.utils.http import urlsafe_base64_encode, urlsafe_base64_decode
from django.utils.encoding import force_bytes, force_str
from django.core.mail import send_mail
from django.conf import settings
from django.utils import timezone
from datetime import timedelta
import logging

from .models import MemberWallet, PasswordResetToken
from .serializers import (
    UserSerializer, UserRegistrationSerializer,
    KYCDocumentUploadSerializer, MemberWalletSerializer,
    UserProfileUpdateSerializer, PasswordResetRequestSerializer,
    PasswordResetConfirmSerializer, LogoutSerializer,
    EmailUpdateSerializer, PasswordChangeSerializer
)

User = get_user_model()
logger = logging.getLogger(__name__)


class UserViewSet(viewsets.ModelViewSet):
    """ViewSet for User operations."""
    
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser, JSONParser]
    
    def get_serializer_class(self):
        """Return appropriate serializer class."""
        if self.action == 'create':
            return UserRegistrationSerializer
        elif self.action == 'upload_kyc':
            return KYCDocumentUploadSerializer
        elif self.action in ['update', 'partial_update']:
            return UserProfileUpdateSerializer
        elif self.action == 'update_email':
            return EmailUpdateSerializer
        elif self.action == 'change_password':
            return PasswordChangeSerializer
        return UserSerializer
    
    def get_permissions(self):
        """Allow unauthenticated access for registration and password reset."""
        if self.action in ['create', 'request_password_reset', 'reset_password', 'verify_reset_token']:
            return [permissions.AllowAny()]
        return super().get_permissions()
    
    @action(detail=False, methods=['post'], permission_classes=[permissions.AllowAny])
    def register(self, request):
        """Register a new user."""
        serializer = UserRegistrationSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        
        # Create wallet for the user
        MemberWallet.objects.create(user=user)
        
        # Generate tokens
        refresh = RefreshToken.for_user(user)
        
        # Send welcome email
        try:
            send_mail(
                subject='Welcome to ChamaHub!',
                message=f'Hi {user.get_full_name()},\n\n'
                       f'Welcome to ChamaHub! Your account has been successfully created.\n'
                       f'You can now log in and start managing your chamas.\n\n'
                       f'Best regards,\nThe ChamaHub Team',
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=[user.email],
                fail_silently=True,
            )
        except Exception as e:
            logger.warning(f"Failed to send welcome email: {e}")
        
        return Response({
            'user': UserSerializer(user).data,
            'tokens': {
                'refresh': str(refresh),
                'access': str(refresh.access_token),
            }
        }, status=status.HTTP_201_CREATED)
    
    @action(detail=False, methods=['get', 'patch', 'put'])
    def me(self, request):
        """Get or update current user profile."""
        if request.method == 'GET':
            serializer = self.get_serializer(request.user)
            return Response(serializer.data)
        
        # Handle PATCH/PUT requests
        serializer = self.get_serializer(
            request.user,
            data=request.data,
            partial=request.method == 'PATCH'
        )
        serializer.is_valid(raise_exception=True)
        serializer.save()
        
        return Response(serializer.data)
    
    @action(detail=False, methods=['post'])
    def logout(self, request):
        """Logout user by blacklisting their refresh token."""
        serializer = LogoutSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        try:
            refresh_token = serializer.validated_data['refresh']
            token = RefreshToken(refresh_token)
            token.blacklist()
            return Response(
                {'message': 'Successfully logged out.'},
                status=status.HTTP_200_OK
            )
        except TokenError:
            return Response(
                {'error': 'Invalid or expired token.'},
                status=status.HTTP_400_BAD_REQUEST
            )
    
    @action(detail=False, methods=['post'])
    def upload_kyc(self, request):
        """Upload KYC documents."""
        serializer = KYCDocumentUploadSerializer(
            request.user,
            data=request.data,
            partial=True
        )
        serializer.is_valid(raise_exception=True)
        serializer.save()
        
        return Response({
            'message': 'KYC documents uploaded successfully. Pending verification.',
            'user': UserSerializer(request.user).data
        })
    
    @action(detail=False, methods=['post'], permission_classes=[permissions.AllowAny])
    def request_password_reset(self, request):
        """Request password reset email with enhanced tracking."""
        serializer = PasswordResetRequestSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        email = serializer.validated_data['email']
        
        try:
            user = User.objects.get(email=email)
            
            # Check if there's a recent reset request (prevent spam)
            recent_reset = PasswordResetToken.objects.filter(
                user=user,
                created_at__gte=timezone.now() - timedelta(minutes=5)
            ).first()
            
            if recent_reset:
                return Response({
                    'message': 'A password reset email was recently sent. Please check your email or wait 5 minutes before requesting another.',
                    'wait_time_minutes': 5
                }, status=status.HTTP_429_TOO_MANY_REQUESTS)
            
            # Generate reset token
            token = default_token_generator.make_token(user)
            uid = urlsafe_base64_encode(force_bytes(user.pk))
            
            # Store token in database for tracking
            PasswordResetToken.objects.create(
                user=user,
                token=token,
                uid=uid
            )
            
            # Create reset URL
            reset_url = f"{settings.FRONTEND_URL}/reset-password/{uid}/{token}/"
            
            # Create email message
            email_subject = 'Reset Your ChamaHub Password'
            email_body = f"""
Hello {user.get_full_name()},

You requested to reset your password for your ChamaHub account.

Click the link below to reset your password:
{reset_url}

This link will expire in 24 hours.

If you didn't request this password reset, please ignore this email.

For security reasons, do not share this link with anyone.

Best regards,
The ChamaHub Team
            """.strip()
            
            # Send email
            try:
                send_mail(
                    subject=email_subject,
                    message=email_body,
                    from_email=settings.DEFAULT_FROM_EMAIL,
                    recipient_list=[email],
                    fail_silently=False,
                )
                email_sent = True
            except Exception as e:
                logger.error(f"Failed to send password reset email: {e}")
                email_sent = False
            
            logger.info(f"Password reset requested for user: {user.id}, email: {email}, email_sent: {email_sent}")
            
            response_data = {
                'message': 'Password reset email sent successfully.',
                'email_sent_to': email,
                'expires_in_hours': 24,
            }
            
            # In development/debug mode, include the reset URL
            if settings.DEBUG:
                response_data['reset_url'] = reset_url
                response_data['uid'] = uid
                response_data['token'] = token
            
            return Response(response_data)
            
        except User.DoesNotExist:
            # For security, don't reveal if user exists
            logger.info(f"Password reset requested for non-existent email: {email}")
            return Response({
                'message': 'If an account exists with this email, a password reset link has been sent.',
                'email_sent_to': email
            })
    
    @action(detail=False, methods=['post'], permission_classes=[permissions.AllowAny])
    def verify_reset_token(self, request):
        """Verify if a password reset token is valid."""
        serializer = PasswordResetConfirmSerializer(data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        
        uid = serializer.validated_data['uid']
        token = serializer.validated_data['token']
        
        try:
            # Decode user ID
            user_id = force_str(urlsafe_base64_decode(uid))
            user = User.objects.get(pk=user_id)
            
            # Check if token exists in database and is valid
            reset_token = PasswordResetToken.objects.filter(
                user=user,
                token=token,
                uid=uid,
                is_used=False,
                created_at__gte=timezone.now() - timedelta(hours=24)
            ).first()
            
            if not reset_token:
                return Response(
                    {'valid': False, 'error': 'Invalid, expired, or already used reset link.'},
                    status=status.HTTP_200_OK
                )
            
            # Verify Django's token
            if not default_token_generator.check_token(user, token):
                return Response(
                    {'valid': False, 'error': 'Invalid or expired reset token.'},
                    status=status.HTTP_200_OK
                )
            
            return Response({
                'valid': True,
                'user': {
                    'id': user.id,
                    'email': user.email,
                    'name': user.get_full_name()
                },
                'expires_at': reset_token.expires_at.isoformat()
            })
            
        except (TypeError, ValueError, OverflowError, User.DoesNotExist):
            return Response(
                {'valid': False, 'error': 'Invalid reset link.'},
                status=status.HTTP_200_OK
            )
    
    @action(detail=False, methods=['post'], permission_classes=[permissions.AllowAny])
    def reset_password(self, request):
        """Reset password using token with validation."""
        serializer = PasswordResetConfirmSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        uid = serializer.validated_data['uid']
        token = serializer.validated_data['token']
        new_password = serializer.validated_data['new_password']
        
        try:
            # Decode user ID
            user_id = force_str(urlsafe_base64_decode(uid))
            user = User.objects.get(pk=user_id)
            
            # Check if token exists in database and is valid
            reset_token = PasswordResetToken.objects.filter(
                user=user,
                token=token,
                uid=uid,
                is_used=False,
                created_at__gte=timezone.now() - timedelta(hours=24)
            ).first()
            
            if not reset_token:
                return Response(
                    {'error': 'Invalid, expired, or already used reset link.'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Verify Django's token
            if not default_token_generator.check_token(user, token):
                return Response(
                    {'error': 'Invalid or expired reset token.'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Validate password strength
            try:
                validate_password(new_password, user)
            except Exception as e:
                return Response(
                    {'error': ' '.join(e.messages)},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Set new password
            user.set_password(new_password)
            user.save()
            
            # Mark token as used
            reset_token.mark_as_used()
            
            # Send confirmation email
            try:
                send_mail(
                    subject='Password Successfully Reset - ChamaHub',
                    message=f'Hi {user.get_full_name()},\n\n'
                           f'Your ChamaHub password has been successfully reset.\n'
                           f'If you did not perform this action, please contact support immediately.\n\n'
                           f'Best regards,\nThe ChamaHub Team',
                    from_email=settings.DEFAULT_FROM_EMAIL,
                    recipient_list=[user.email],
                    fail_silently=True,
                )
            except Exception as e:
                logger.warning(f"Failed to send password reset confirmation email: {e}")
            
            logger.info(f"Password reset successful for user: {user.id}")
            
            # Invalidate all active sessions for security
            from rest_framework_simplejwt.tokens import OutstandingToken
            OutstandingToken.objects.filter(user=user).delete()
            
            return Response({
                'message': 'Password has been reset successfully. You can now log in with your new password.',
                'user_id': user.id,
                'email': user.email,
                'timestamp': timezone.now().isoformat()
            })
            
        except (TypeError, ValueError, OverflowError, User.DoesNotExist):
            return Response(
                {'error': 'Invalid reset link.'},
                status=status.HTTP_400_BAD_REQUEST
            )
    
    @action(detail=False, methods=['post'])
    def update_email(self, request):
        """Update user email address."""
        serializer = EmailUpdateSerializer(
            request.user,
            data=request.data,
            context={'request': request}
        )
        serializer.is_valid(raise_exception=True)
        updated_user = serializer.save()
        
        # Send confirmation email
        try:
            send_mail(
                subject='Email Address Updated - ChamaHub',
                message=f'Hi {updated_user.get_full_name()},\n\n'
                       f'Your ChamaHub email address has been successfully updated to {updated_user.email}.\n'
                       f'Please use this email for future logins.\n\n'
                       f'Best regards,\nThe ChamaHub Team',
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=[updated_user.email],
                fail_silently=True,
            )
        except Exception as e:
            logger.warning(f"Failed to send email update confirmation: {e}")
        
        return Response({
            'message': 'Email updated successfully.',
            'user': UserSerializer(updated_user).data
        })
    
    @action(detail=False, methods=['post'])
    def change_password(self, request):
        """Change password while authenticated."""
        serializer = PasswordChangeSerializer(
            request.user,
            data=request.data,
            context={'request': request}
        )
        serializer.is_valid(raise_exception=True)
        
        # Update password
        request.user.set_password(serializer.validated_data['new_password'])
        request.user.save()
        
        # Send confirmation email
        try:
            send_mail(
                subject='Password Changed - ChamaHub',
                message=f'Hi {request.user.get_full_name()},\n\n'
                       f'Your ChamaHub password has been successfully changed.\n'
                       f'If you did not perform this action, please contact support immediately.\n\n'
                       f'Best regards,\nThe ChamaHub Team',
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=[request.user.email],
                fail_silently=True,
            )
        except Exception as e:
            logger.warning(f"Failed to send password change confirmation: {e}")
        
        logger.info(f"Password changed for user: {request.user.id}")
        
        return Response({
            'message': 'Password changed successfully.',
            'timestamp': timezone.now().isoformat()
        })
    
    @action(detail=False, methods=['get'], permission_classes=[permissions.IsAuthenticated])
    def reset_tokens(self, request):
        """Get active password reset tokens for the user (admin/user view)."""
        tokens = PasswordResetToken.objects.filter(
            user=request.user,
            created_at__gte=timezone.now() - timedelta(hours=24)
        ).order_by('-created_at')
        
        token_data = []
        for token in tokens:
            token_data.append({
                'id': token.id,
                'created_at': token.created_at,
                'is_used': token.is_used,
                'used_at': token.used_at,
                'expires_at': token.expires_at,
                'is_expired': token.is_expired,
                'time_remaining': str(token.expires_at - timezone.now()) if not token.is_expired else 'Expired'
            })
        
        return Response({
            'active_tokens': token_data,
            'count': len(token_data),
            'max_age_hours': 24
        })


class MemberWalletViewSet(viewsets.ReadOnlyModelViewSet):
    """ViewSet for Member Wallet (read-only)."""
    
    queryset = MemberWallet.objects.all()
    serializer_class = MemberWalletSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        """Filter to current user's wallet or admin can see all."""
        if self.request.user.is_staff:
            return self.queryset
        return self.queryset.filter(user=self.request.user)
    
    @action(detail=False, methods=['get'])
    def my_wallet(self, request):
        """Get current user's wallet."""
        wallet, created = MemberWallet.objects.get_or_create(user=request.user)
        serializer = self.get_serializer(wallet)
        return Response(serializer.data)
