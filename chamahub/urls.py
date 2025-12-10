from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)
from drf_spectacular.views import (
    SpectacularAPIView,
    SpectacularSwaggerView,
    SpectacularRedocView,
)
from .views import api_root, health_check, actions_list

urlpatterns = [
    # Root URL - Welcome endpoint
    path('', api_root, name='api-root'),
    
    # Health check endpoint
    path('health/', health_check, name='health-check'),
    
    # Admin panel
    path('admin/', admin.site.urls),
    
    # Actions endpoint
    path('actions', actions_list, name='actions-list'),
    
    # API Documentation
    path('api/schema/', SpectacularAPIView.as_view(), name='schema'),
    path('api/docs/', SpectacularSwaggerView.as_view(url_name='schema'), name='swagger-ui'),
    path('api/redoc/', SpectacularRedocView.as_view(url_name='schema'), name='redoc'),
    
    # JWT Authentication - v1 endpoints (primary)
    path('api/v1/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/v1/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    
    # JWT Authentication - legacy endpoints (backwards compatibility)
    path('api/token/', TokenObtainPairView.as_view(), name='token_obtain_pair_legacy'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh_legacy'),
    
    # JWT Authentication - root level endpoints (backwards compatibility for frontend configurations)
    path('token/', TokenObtainPairView.as_view(), name='token_obtain_pair_root'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh_root'),
    
    # API v1 endpoints - Core apps
    path('api/v1/accounts/', include('accounts.urls')),
    path('api/v1/groups/', include('groups.urls')),
    path('api/v1/finance/', include('finance.urls')),
    path('api/v1/governance/', include('governance.urls')),
    path('api/v1/investments/', include('investments.urls')),
    
    # API v1 endpoints - Fintech apps
    path('api/v1/mpesa/', include('mpesa_integration.urls')),
    path('api/v1/wealth-engine/', include('wealth_engine.urls')),
    path('api/v1/credit-scoring/', include('credit_scoring.urls')),
    path('api/v1/analytics/', include('analytics_dashboard.urls')),
    path('api/v1/reports/', include('reporting_engine.urls')),
    path('api/v1/audit/', include('audit_trail.urls')),
    path('api/v1/kyc/', include('kyc_verification.urls')),
    path('api/v1/ai-assistant/', include('ai_assistant.urls')),
    path('api/v1/automation/', include('automation_engine.urls')),
    path('api/v1/mobile-sync/', include('mobile_sync.urls')),
    path('api/v1/api-gateway/', include('api_gateway.urls')),
    path('api/v1/gamification/', include('gamification.urls')),
    path('api/v1/education/', include('education_hub.urls')),
    
    # NEW: Notifications app
    path('api/v1/', include('notifications.urls')),
    
    # Backwards-compatible URL patterns (without /api/v1/ prefix)
    # These support legacy frontend configurations
    path('accounts/', include('accounts.urls')),
    path('groups/', include('groups.urls')),
    path('finance/', include('finance.urls')),
    path('governance/', include('governance.urls')),
    path('investments/', include('investments.urls')),
    path('mpesa/', include('mpesa_integration.urls')),
    path('wealth-engine/', include('wealth_engine.urls')),
    path('credit-scoring/', include('credit_scoring.urls')),
    path('analytics/', include('analytics_dashboard.urls')),
    path('reports/', include('reporting_engine.urls')),
    path('audit/', include('audit_trail.urls')),
    path('kyc/', include('kyc_verification.urls')),
    path('ai-assistant/', include('ai_assistant.urls')),
    path('automation/', include('automation_engine.urls')),
    path('mobile-sync/', include('mobile_sync.urls')),
    path('api-gateway/', include('api_gateway.urls')),
    path('gamification/', include('gamification.urls')),
    path('education/', include('education_hub.urls')),
    
    # NEW: Notifications app (backwards compatible)
    path('notifications/', include('notifications.urls')),
]

# Serve media files in development
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
