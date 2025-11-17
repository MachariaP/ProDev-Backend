# 🚀 Guide 2: Building Your First Simple Endpoint

> **Duration:** 45-60 minutes  
> **Prerequisites:** Completed Guide 1 (Initial Setup)  
> **Outcome:** Working Django REST Framework API with your first endpoint

---

## 🎯 What You'll Learn

- Initialize a Django project from scratch
- Create a Django app following best practices
- Build your first DRF API endpoint (Health Check)
- Understand DRF serializers, views, and URLs
- Test APIs with cURL and Postman
- Follow DRF naming conventions and project structure

---

## 📋 Table of Contents

1. [Initialize Django Project](#1-initialize-django-project)
2. [Configure Django Settings](#2-configure-django-settings)
3. [Create Your First App](#3-create-your-first-app)
4. [Build a Health Check Endpoint](#4-build-a-health-check-endpoint)
5. [Add API Versioning](#5-add-api-versioning)
6. [Test Your Endpoint](#6-test-your-endpoint)
7. [Add API Documentation](#7-add-api-documentation)
8. [Best Practices Summary](#8-best-practices-summary)

---

## 1. Initialize Django Project

### 1.1 Create Django Project

```bash
# Make sure you're in the project root and venv is activated
cd /path/to/ProDev-Backend
source venv/bin/activate

# Create Django project (use '.' to create in current directory)
django-admin startproject config .

# Verify structure
ls -la
# Should see: manage.py, config/, venv/, docs/, etc.
```

**Why "config" instead of "myproject"?**  
This is a DRF best practice. The main project folder should be named `config` to indicate it contains configuration, not business logic.

### 1.2 Project Structure After Initialization

```
ProDev-Backend/
├── config/
│   ├── __init__.py
│   ├── settings.py
│   ├── urls.py
│   ├── asgi.py
│   └── wsgi.py
├── manage.py
├── venv/
├── docs/
├── requirements.txt
└── .env
```

---

## 2. Configure Django Settings

### 2.1 Split Settings into Multiple Files (Best Practice)

```bash
# Navigate to config directory
cd config

# Create settings directory
mkdir settings
touch settings/__init__.py
touch settings/base.py
touch settings/development.py
touch settings/production.py

# Move original settings to base
mv settings.py settings/base.py
```

### 2.2 Configure base.py

```bash
# Edit config/settings/base.py
nano settings/base.py
```

```python
"""
Django settings for ChamaHub project.
Base settings shared across all environments.
"""
from pathlib import Path
from decouple import config
import dj_database_url

# Build paths inside the project
BASE_DIR = Path(__file__).resolve().parent.parent.parent

# SECURITY WARNING: keep the secret key used in production secret!
SECRET_KEY = config('SECRET_KEY')

# Application definition
INSTALLED_APPS = [
    # Django apps
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    
    # Third-party apps
    'rest_framework',
    'rest_framework_simplejwt',
    'corsheaders',
    'drf_spectacular',
    
    # Local apps (will be added later)
    # 'apps.core',
    # 'apps.users',
    # 'apps.chamas',
]

MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'corsheaders.middleware.CorsMiddleware',  # Must be before CommonMiddleware
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

ROOT_URLCONF = 'config.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [BASE_DIR / 'templates'],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'config.wsgi.application'

# Database
DATABASES = {
    'default': dj_database_url.config(
        default=config('DATABASE_URL'),
        conn_max_age=600,
    )
}

# Password validation
AUTH_PASSWORD_VALIDATORS = [
    {'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator'},
    {'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator'},
    {'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator'},
    {'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator'},
]

# Internationalization
LANGUAGE_CODE = 'en-us'
TIME_ZONE = 'Africa/Nairobi'
USE_I18N = True
USE_TZ = True

# Static files (CSS, JavaScript, Images)
STATIC_URL = '/static/'
STATIC_ROOT = BASE_DIR / 'staticfiles'

MEDIA_URL = '/media/'
MEDIA_ROOT = BASE_DIR / 'media'

# Default primary key field type
DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

# Django REST Framework
REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': [
        'rest_framework_simplejwt.authentication.JWTAuthentication',
    ],
    'DEFAULT_PERMISSION_CLASSES': [
        'rest_framework.permissions.IsAuthenticated',
    ],
    'DEFAULT_RENDERER_CLASSES': [
        'rest_framework.renderers.JSONRenderer',
    ],
    'DEFAULT_PAGINATION_CLASS': 'rest_framework.pagination.PageNumberPagination',
    'PAGE_SIZE': 20,
    'DEFAULT_SCHEMA_CLASS': 'drf_spectacular.openapi.AutoSchema',
}

# API Documentation (drf-spectacular)
SPECTACULAR_SETTINGS = {
    'TITLE': 'ChamaHub API',
    'DESCRIPTION': 'Smart Chama Management & Wealth Engine API',
    'VERSION': '1.0.0',
    'SERVE_INCLUDE_SCHEMA': False,
}
```

### 2.3 Configure development.py

```python
"""Development settings"""
from .base import *

DEBUG = config('DEBUG', default=True, cast=bool)

ALLOWED_HOSTS = config('ALLOWED_HOSTS', default='localhost,127.0.0.1').split(',')

# CORS settings for development
CORS_ALLOWED_ORIGINS = config(
    'CORS_ALLOWED_ORIGINS',
    default='http://localhost:3000,http://localhost:5173'
).split(',')

CORS_ALLOW_CREDENTIALS = True

# Email backend for development (prints to console)
EMAIL_BACKEND = 'django.core.mail.backends.console.EmailBackend'

# Django Debug Toolbar (optional but recommended)
if DEBUG:
    INSTALLED_APPS += ['debug_toolbar']
    MIDDLEWARE += ['debug_toolbar.middleware.DebugToolbarMiddleware']
    INTERNAL_IPS = ['127.0.0.1']
```

### 2.4 Configure production.py

```python
"""Production settings"""
from .base import *

DEBUG = False

ALLOWED_HOSTS = config('ALLOWED_HOSTS').split(',')

# Security settings
SECURE_SSL_REDIRECT = True
SESSION_COOKIE_SECURE = True
CSRF_COOKIE_SECURE = True
SECURE_HSTS_SECONDS = 31536000
SECURE_HSTS_INCLUDE_SUBDOMAINS = True
SECURE_HSTS_PRELOAD = True

# CORS
CORS_ALLOWED_ORIGINS = config('CORS_ALLOWED_ORIGINS').split(',')
CORS_ALLOW_CREDENTIALS = True

# Email backend
EMAIL_BACKEND = 'django.core.mail.backends.smtp.EmailBackend'
EMAIL_HOST = config('EMAIL_HOST', default='smtp.gmail.com')
EMAIL_PORT = config('EMAIL_PORT', default=587, cast=int)
EMAIL_USE_TLS = True
EMAIL_HOST_USER = config('EMAIL_HOST_USER', default='')
EMAIL_HOST_PASSWORD = config('EMAIL_HOST_PASSWORD', default='')
```

### 2.5 Update __init__.py

```python
# config/settings/__init__.py
"""
Import settings based on environment.
Default to development settings.
"""
from decouple import config

environment = config('ENVIRONMENT', default='development')

if environment == 'production':
    from .production import *
elif environment == 'staging':
    from .production import *  # Can create staging.py later
else:
    from .development import *
```

---

## 3. Create Your First App

### 3.1 Create 'core' App

Following DRF best practices, create an `apps` directory:

```bash
# Navigate back to project root
cd /path/to/ProDev-Backend

# Create apps directory
mkdir apps
touch apps/__init__.py

# Create core app inside apps
python manage.py startapp core apps/core
```

### 3.2 App Structure

```
apps/
└── core/
    ├── __init__.py
    ├── admin.py
    ├── apps.py
    ├── migrations/
    ├── models.py
    ├── tests.py
    └── views.py
```

### 3.3 Update apps.py

```python
# apps/core/apps.py
from django.apps import AppConfig

class CoreConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'apps.core'
    verbose_name = 'Core'
```

### 3.4 Register App in Settings

```python
# Add to config/settings/base.py INSTALLED_APPS
INSTALLED_APPS = [
    # ... existing apps ...
    
    # Local apps
    'apps.core',
]
```

---

## 4. Build a Health Check Endpoint

### 4.1 Create Serializer

```bash
# Create serializers.py in core app
touch apps/core/serializers.py
```

```python
# apps/core/serializers.py
from rest_framework import serializers

class HealthCheckSerializer(serializers.Serializer):
    """
    Serializer for health check response.
    Shows API status, database connectivity, and cache connectivity.
    """
    status = serializers.CharField(help_text="Overall API status")
    timestamp = serializers.DateTimeField(help_text="Current server timestamp")
    database = serializers.CharField(help_text="Database connection status")
    cache = serializers.CharField(help_text="Cache connection status")
    version = serializers.CharField(help_text="API version")
```

### 4.2 Create View

```python
# apps/core/views.py
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import AllowAny
from django.utils import timezone
from django.db import connection
from django.core.cache import cache
from drf_spectacular.utils import extend_schema

from .serializers import HealthCheckSerializer


class HealthCheckView(APIView):
    """
    Health check endpoint to verify API status.
    Returns status of database and cache connections.
    """
    permission_classes = [AllowAny]  # Public endpoint

    @extend_schema(
        responses={200: HealthCheckSerializer},
        description="Check API health status including database and cache connectivity"
    )
    def get(self, request):
        """
        GET /api/v1/health/
        Returns health status of the API.
        """
        # Check database connection
        try:
            connection.ensure_connection()
            db_status = "connected"
        except Exception as e:
            db_status = f"error: {str(e)}"

        # Check cache connection
        try:
            cache.set('health_check', 'ok', 10)
            cache_status = "connected" if cache.get('health_check') == 'ok' else "error"
        except Exception as e:
            cache_status = f"error: {str(e)}"

        data = {
            'status': 'healthy',
            'timestamp': timezone.now(),
            'database': db_status,
            'cache': cache_status,
            'version': '1.0.0'
        }

        return Response(data, status=status.HTTP_200_OK)
```

### 4.3 Create URLs

```bash
# Create urls.py in core app
touch apps/core/urls.py
```

```python
# apps/core/urls.py
from django.urls import path
from .views import HealthCheckView

app_name = 'core'

urlpatterns = [
    path('health/', HealthCheckView.as_view(), name='health-check'),
]
```

---

## 5. Add API Versioning

### 5.1 Update Main URLs

```python
# config/urls.py
from django.contrib import admin
from django.urls import path, include
from drf_spectacular.views import (
    SpectacularAPIView,
    SpectacularSwaggerView,
    SpectacularRedocView,
)

urlpatterns = [
    # Admin
    path('admin/', admin.site.urls),
    
    # API v1
    path('api/v1/', include([
        path('', include('apps.core.urls')),
    ])),
    
    # API Documentation
    path('api/schema/', SpectacularAPIView.as_view(), name='schema'),
    path('api/docs/', SpectacularSwaggerView.as_view(url_name='schema'), name='swagger-ui'),
    path('api/redoc/', SpectacularRedocView.as_view(url_name='schema'), name='redoc'),
]
```

---

## 6. Test Your Endpoint

### 6.1 Run Migrations

```bash
# Create initial migrations
python manage.py makemigrations

# Apply migrations
python manage.py migrate

# Expected output:
# Operations to perform:
#   Apply all migrations: admin, auth, contenttypes, sessions
# Running migrations:
#   Applying contenttypes.0001_initial... OK
#   Applying auth.0001_initial... OK
#   ...
```

### 6.2 Create Superuser

```bash
python manage.py createsuperuser

# Follow prompts:
# Username: admin
# Email: admin@chamahub.co.ke
# Password: ******** (minimum 8 characters)
```

### 6.3 Run Development Server

```bash
python manage.py runserver

# Expected output:
# Watching for file changes with StatReloader
# Performing system checks...
# System check identified no issues (0 silenced).
# November 17, 2025 - 13:23:57
# Django version 5.1.3, using settings 'config.settings'
# Starting development server at http://127.0.0.1:8000/
# Quit the server with CONTROL-C.
```

### 6.4 Test with cURL

```bash
# Test health check endpoint
curl http://localhost:8000/api/v1/health/

# Expected response:
# {
#   "status": "healthy",
#   "timestamp": "2025-11-17T13:23:57.427000Z",
#   "database": "connected",
#   "cache": "connected",
#   "version": "1.0.0"
# }
```

### 6.5 Test with Browser

Open your browser and navigate to:
- **Health Check:** http://localhost:8000/api/v1/health/
- **API Docs:** http://localhost:8000/api/docs/
- **Admin Panel:** http://localhost:8000/admin/

---

## 7. Add API Documentation

Your API documentation is automatically available at:

- **Swagger UI:** http://localhost:8000/api/docs/
- **ReDoc:** http://localhost:8000/api/redoc/
- **OpenAPI Schema:** http://localhost:8000/api/schema/

---

## 8. Best Practices Summary

### ✅ What We Followed

1. **Project Structure:**
   - `config/` for project settings (not `myproject/`)
   - `apps/` directory for all Django apps
   - Split settings into `base.py`, `development.py`, `production.py`

2. **API Versioning:**
   - All endpoints under `/api/v1/`
   - Easy to create `/api/v2/` in the future

3. **Documentation:**
   - Used `drf-spectacular` for automatic OpenAPI schema
   - Added docstrings to all views and serializers
   - Used `@extend_schema` decorator for better docs

4. **Security:**
   - Environment variables in `.env` (never commit)
   - Different settings for dev/prod
   - AllowAny permission only for health check

5. **DRF Conventions:**
   - Serializers in `serializers.py`
   - Views in `views.py`
   - URLs in `urls.py` with `app_name`

---

## 🎯 Next Steps

**Proceed to Guide 3:** [Deployment Guide](./03-deployment.md)

In the next guide, you'll:
- Prepare the app for production
- Deploy to Railway or DigitalOcean
- Configure environment variables
- Set up CI/CD

---

<div align="center">

**Built with ❤️ by [Phinehas Macharia](https://github.com/MachariaP)**

[⬅️ Previous: Initial Setup](./01-initial-setup.md) | [Next: Deployment ➡️](./03-deployment.md)

</div>
