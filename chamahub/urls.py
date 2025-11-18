"""
URL configuration for chamahub project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/5.2/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
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

urlpatterns = [
    path('admin/', admin.site.urls),
    
    # API Documentation
    path('api/schema/', SpectacularAPIView.as_view(), name='schema'),
    path('api/docs/', SpectacularSwaggerView.as_view(url_name='schema'), name='swagger-ui'),
    path('api/redoc/', SpectacularRedocView.as_view(url_name='schema'), name='redoc'),
    
    # JWT Authentication
    path('api/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    
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
]

# Serve media files in development
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)

