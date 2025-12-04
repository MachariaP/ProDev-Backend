from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import UserViewSet, MemberWalletViewSet

router = DefaultRouter()
router.register(r'users', UserViewSet, basename='user')
router.register(r'wallets', MemberWalletViewSet, basename='wallet')

# Custom URL patterns for easy access
urlpatterns = [
    path('', include(router.urls)),
    
    # User endpoints
    path('users/me/', UserViewSet.as_view({'get': 'me', 'patch': 'me', 'put': 'me'}), name='user-me'),
    path('users/register/', UserViewSet.as_view({'post': 'register'}), name='user-register'),
    path('users/logout/', UserViewSet.as_view({'post': 'logout'}), name='user-logout'),
    path('users/upload_kyc/', UserViewSet.as_view({'post': 'upload_kyc'}), name='upload-kyc'),
    path('users/update_email/', UserViewSet.as_view({'post': 'update_email'}), name='update-email'),
    path('users/change_password/', UserViewSet.as_view({'post': 'change_password'}), name='change-password'),
    path('users/reset_tokens/', UserViewSet.as_view({'get': 'reset_tokens'}), name='reset-tokens'),
    
    # Password reset endpoints
    path('users/request_password_reset/', UserViewSet.as_view({'post': 'request_password_reset'}), name='request-password-reset'),
    path('users/verify_reset_token/', UserViewSet.as_view({'post': 'verify_reset_token'}), name='verify-reset-token'),
    path('users/reset_password/', UserViewSet.as_view({'post': 'reset_password'}), name='reset-password'),
    
    # Wallet endpoints
    path('wallets/my_wallet/', MemberWalletViewSet.as_view({'get': 'my_wallet'}), name='my-wallet'),
]
