# 🏗️ BUILD_BE.md - Backend Development Guide

## Chama Nexus - Complete Backend Development Path

This comprehensive guide will walk you through building the **Chama Nexus** backend from scratch. Follow each step sequentially to create a production-ready Django REST Framework backend.

---

## 📁 Project Structure Overview

\`\`\`
Chama_Nexus/
├── BE/                              # Backend folder
│   ├── .env                         # Environment variables
│   ├── .env.example                 # Environment template
│   ├── .gitignore                   # Git ignore rules
│   ├── requirements.txt             # Python dependencies
│   ├── manage.py                    # Django management script
│   ├── Dockerfile                   # Docker configuration
│   ├── docker-compose.yml           # Docker Compose for services
│   ├── pytest.ini                   # Pytest configuration
│   │
│   ├── config/                      # Project configuration
│   │   ├── __init__.py
│   │   ├── settings/
│   │   │   ├── __init__.py
│   │   │   ├── base.py              # Base settings
│   │   │   ├── development.py       # Dev settings
│   │   │   └── production.py        # Production settings
│   │   ├── urls.py                  # Main URL configuration
│   │   ├── wsgi.py                  # WSGI entry point
│   │   └── asgi.py                  # ASGI entry point
│   │
│   ├── apps/                        # Django applications
│   │   ├── accounts/                # User authentication & profiles
│   │   │   ├── __init__.py
│   │   │   ├── admin.py
│   │   │   ├── apps.py
│   │   │   ├── models.py
│   │   │   ├── serializers.py
│   │   │   ├── views.py
│   │   │   ├── urls.py
│   │   │   ├── permissions.py
│   │   │   ├── managers.py
│   │   │   └── tests/
│   │   │       ├── __init__.py
│   │   │       ├── test_models.py
│   │   │       ├── test_views.py
│   │   │       └── test_serializers.py
│   │   │
│   │   ├── groups/                  # Chama groups management
│   │   │   ├── __init__.py
│   │   │   ├── admin.py
│   │   │   ├── apps.py
│   │   │   ├── models.py
│   │   │   ├── serializers.py
│   │   │   ├── views.py
│   │   │   ├── urls.py
│   │   │   ├── permissions.py
│   │   │   └── tests/
│   │   │
│   │   ├── finance/                 # Financial transactions
│   │   │   ├── __init__.py
│   │   │   ├── admin.py
│   │   │   ├── apps.py
│   │   │   ├── models.py
│   │   │   ├── serializers.py
│   │   │   ├── views.py
│   │   │   ├── urls.py
│   │   │   └── tests/
│   │   │
│   │   ├── governance/              # Group governance & voting
│   │   │   └── ...
│   │   │
│   │   └── investments/             # Investment management
│   │       └── ...
│   │
│   ├── core/                        # Shared utilities
│   │   ├── __init__.py
│   │   ├── exceptions.py            # Custom exceptions
│   │   ├── permissions.py           # Shared permissions
│   │   ├── pagination.py            # Custom pagination
│   │   ├── utils.py                 # Utility functions
│   │   └── validators.py            # Shared validators
│   │
│   ├── staticfiles/                 # Collected static files
│   ├── media/                       # User uploads
│   └── logs/                        # Application logs
│
└── FE/                              # Frontend folder (see BUILD_FE.md)
\`\`\`

---

## 🚀 Phase 1: Foundation & Authentication

### Step 1.1: Initialize Django Project

\`\`\`bash
# Create the project directory
mkdir Chama_Nexus && cd Chama_Nexus
mkdir BE FE
cd BE

# Create and activate virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install initial dependencies
pip install django djangorestframework djangorestframework-simplejwt
pip install psycopg2-binary python-decouple django-cors-headers
pip install django-filter drf-spectacular

# Create Django project
django-admin startproject config .

# Create your first app
python manage.py startapp accounts
mkdir -p apps
mv accounts apps/
\`\`\`

### Step 1.2: Configure Settings Structure

Create a settings package for different environments:

\`\`\`bash
mkdir config/settings
touch config/settings/__init__.py
touch config/settings/base.py
touch config/settings/development.py
touch config/settings/production.py
\`\`\`

**config/settings/base.py:**
\`\`\`python
"""
Base settings for Chama Nexus project.
"""
import os
from pathlib import Path
from datetime import timedelta
from decouple import config

# Build paths
BASE_DIR = Path(__file__).resolve().parent.parent.parent

# Security
SECRET_KEY = config('SECRET_KEY', default='your-secret-key-change-in-production')
DEBUG = config('DEBUG', default=False, cast=bool)
ALLOWED_HOSTS = config('ALLOWED_HOSTS', default='localhost,127.0.0.1').split(',')

# Application definition
DJANGO_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
]

THIRD_PARTY_APPS = [
    'rest_framework',
    'rest_framework_simplejwt',
    'rest_framework_simplejwt.token_blacklist',
    'corsheaders',
    'django_filters',
    'drf_spectacular',
]

LOCAL_APPS = [
    'apps.accounts',
    # Add more apps as you create them:
    # 'apps.groups',
    # 'apps.finance',
    # 'apps.governance',
    # 'apps.investments',
]

INSTALLED_APPS = DJANGO_APPS + THIRD_PARTY_APPS + LOCAL_APPS

MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',  # Must be first
    'django.middleware.security.SecurityMiddleware',
    'whitenoise.middleware.WhiteNoiseMiddleware',
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
        'DIRS': [],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'config.wsgi.application'

# Password validation
AUTH_PASSWORD_VALIDATORS = [
    {'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator'},
    {'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator', 'OPTIONS': {'min_length': 8}},
    {'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator'},
    {'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator'},
]

# Internationalization
LANGUAGE_CODE = 'en-us'
TIME_ZONE = 'Africa/Nairobi'
USE_I18N = True
USE_TZ = True

# Static files
STATIC_URL = 'static/'
STATIC_ROOT = BASE_DIR / 'staticfiles'
STATICFILES_STORAGE = 'whitenoise.storage.CompressedManifestStaticFilesStorage'

# Media files
MEDIA_URL = 'media/'
MEDIA_ROOT = BASE_DIR / 'media'

# Default primary key
DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

# Custom User Model
AUTH_USER_MODEL = 'accounts.User'

# REST Framework Configuration
REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': [
        'rest_framework_simplejwt.authentication.JWTAuthentication',
    ],
    'DEFAULT_PERMISSION_CLASSES': [
        'rest_framework.permissions.IsAuthenticated',
    ],
    'DEFAULT_PAGINATION_CLASS': 'rest_framework.pagination.PageNumberPagination',
    'PAGE_SIZE': 20,
    'DEFAULT_FILTER_BACKENDS': [
        'django_filters.rest_framework.DjangoFilterBackend',
        'rest_framework.filters.SearchFilter',
        'rest_framework.filters.OrderingFilter',
    ],
    'DEFAULT_SCHEMA_CLASS': 'drf_spectacular.openapi.AutoSchema',
    'EXCEPTION_HANDLER': 'core.exceptions.custom_exception_handler',
}

# JWT Configuration
SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(minutes=60),
    'REFRESH_TOKEN_LIFETIME': timedelta(days=7),
    'ROTATE_REFRESH_TOKENS': True,
    'BLACKLIST_AFTER_ROTATION': True,
    'UPDATE_LAST_LOGIN': True,
    'ALGORITHM': 'HS256',
    'SIGNING_KEY': SECRET_KEY,
    'AUTH_HEADER_TYPES': ('Bearer',),
    'AUTH_HEADER_NAME': 'HTTP_AUTHORIZATION',
    'USER_ID_FIELD': 'id',
    'USER_ID_CLAIM': 'user_id',
}

# CORS Configuration
CORS_ALLOWED_ORIGINS = config(
    'CORS_ALLOWED_ORIGINS',
    default='http://localhost:3000,http://localhost:5173'
).split(',')
CORS_ALLOW_ALL_ORIGINS = config('CORS_ALLOW_ALL_ORIGINS', default=False, cast=bool)
CORS_ALLOW_CREDENTIALS = True

CORS_ALLOW_HEADERS = [
    'accept',
    'accept-encoding',
    'authorization',
    'content-type',
    'dnt',
    'origin',
    'user-agent',
    'x-csrftoken',
    'x-requested-with',
]

# API Documentation
SPECTACULAR_SETTINGS = {
    'TITLE': 'Chama Nexus API',
    'DESCRIPTION': 'API for managing Chama (savings groups) operations',
    'VERSION': '1.0.0',
    'SERVE_INCLUDE_SCHEMA': False,
}

# Frontend URL (for password reset links, etc.)
FRONTEND_URL = config('FRONTEND_URL', default='http://localhost:5173')
\`\`\`

**config/settings/development.py:**
\`\`\`python
"""
Development settings.
"""
from .base import *

DEBUG = True
ALLOWED_HOSTS = ['localhost', '127.0.0.1', '0.0.0.0']

# Database (SQLite for development)
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': BASE_DIR / 'db.sqlite3',
    }
}

# Email (Console backend for development)
EMAIL_BACKEND = 'django.core.mail.backends.console.EmailBackend'

# CORS - Allow all in development
CORS_ALLOW_ALL_ORIGINS = True

# Logging
LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'handlers': {
        'console': {
            'class': 'logging.StreamHandler',
        },
    },
    'root': {
        'handlers': ['console'],
        'level': 'DEBUG',
    },
}
\`\`\`

**config/settings/production.py:**
\`\`\`python
"""
Production settings.
"""
import dj_database_url
from .base import *

DEBUG = False

# Database
DATABASES = {
    'default': dj_database_url.config(
        default=config('DATABASE_URL'),
        conn_max_age=600,
        ssl_require=True,
    )
}

# Security settings
SECURE_BROWSER_XSS_FILTER = True
SECURE_CONTENT_TYPE_NOSNIFF = True
X_FRAME_OPTIONS = 'DENY'
SECURE_SSL_REDIRECT = config('SECURE_SSL_REDIRECT', default=True, cast=bool)
SESSION_COOKIE_SECURE = True
CSRF_COOKIE_SECURE = True

# Email
EMAIL_BACKEND = 'django.core.mail.backends.smtp.EmailBackend'
EMAIL_HOST = config('EMAIL_HOST', default='smtp.gmail.com')
EMAIL_PORT = config('EMAIL_PORT', default=587, cast=int)
EMAIL_USE_TLS = True
EMAIL_HOST_USER = config('EMAIL_HOST_USER')
EMAIL_HOST_PASSWORD = config('EMAIL_HOST_PASSWORD')
\`\`\`

**config/settings/__init__.py:**
\`\`\`python
"""
Settings initialization.
Import the appropriate settings based on environment.
"""
import os

environment = os.environ.get('DJANGO_ENVIRONMENT', 'development')

if environment == 'production':
    from .production import *
else:
    from .development import *
\`\`\`

### Step 1.3: Configure PostgreSQL Database

**Install PostgreSQL driver:**
\`\`\`bash
pip install psycopg2-binary dj-database-url
\`\`\`

**For production, create a PostgreSQL database:**
\`\`\`sql
-- Connect to PostgreSQL
psql -U postgres

-- Create database and user
CREATE DATABASE chama_nexus;
CREATE USER chama_user WITH PASSWORD 'secure_password';
GRANT ALL PRIVILEGES ON DATABASE chama_nexus TO chama_user;

-- For Django migrations
ALTER USER chama_user CREATEDB;
\`\`\`

**Create .env file:**
\`\`\`bash
# .env
SECRET_KEY=your-super-secret-key-change-this
DEBUG=True
DJANGO_ENVIRONMENT=development
ALLOWED_HOSTS=localhost,127.0.0.1

# Database (for production)
DATABASE_URL=postgresql://chama_user:secure_password@localhost:5432/chama_nexus

# CORS
CORS_ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3000
FRONTEND_URL=http://localhost:5173
\`\`\`

### Step 1.4: Create Custom User Model

**apps/accounts/managers.py:**
\`\`\`python
"""
Custom user manager for email-based authentication.
"""
from django.contrib.auth.models import BaseUserManager


class UserManager(BaseUserManager):
    """Custom user manager for email-based authentication."""
    
    def create_user(self, email, password=None, **extra_fields):
        """Create and return a regular user."""
        if not email:
            raise ValueError('Users must have an email address')
        
        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user
    
    def create_superuser(self, email, password=None, **extra_fields):
        """Create and return a superuser."""
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        extra_fields.setdefault('is_active', True)
        
        if extra_fields.get('is_staff') is not True:
            raise ValueError('Superuser must have is_staff=True.')
        if extra_fields.get('is_superuser') is not True:
            raise ValueError('Superuser must have is_superuser=True.')
        
        return self.create_user(email, password, **extra_fields)
\`\`\`

**apps/accounts/models.py:**
\`\`\`python
"""
Custom User model with email-based authentication.
"""
import uuid
from django.db import models
from django.contrib.auth.models import AbstractBaseUser, PermissionsMixin
from django.utils import timezone

from .managers import UserManager


class User(AbstractBaseUser, PermissionsMixin):
    """Custom User model using email as the unique identifier."""
    
    id = models.UUIDField(
        primary_key=True,
        default=uuid.uuid4,
        editable=False
    )
    email = models.EmailField(
        'email address',
        unique=True,
        error_messages={
            'unique': 'A user with this email already exists.',
        },
    )
    first_name = models.CharField('first name', max_length=150, blank=True)
    last_name = models.CharField('last name', max_length=150, blank=True)
    phone_number = models.CharField('phone number', max_length=20, blank=True)
    
    # Profile fields
    date_of_birth = models.DateField(null=True, blank=True)
    profile_picture = models.ImageField(
        upload_to='profile_pics/',
        null=True,
        blank=True
    )
    bio = models.TextField(max_length=500, blank=True)
    
    # Status fields
    is_staff = models.BooleanField(default=False)
    is_active = models.BooleanField(default=True)
    is_verified = models.BooleanField(default=False)
    
    # Timestamps
    date_joined = models.DateTimeField(default=timezone.now)
    updated_at = models.DateTimeField(auto_now=True)
    last_login = models.DateTimeField(null=True, blank=True)
    
    objects = UserManager()
    
    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['first_name', 'last_name']
    
    class Meta:
        verbose_name = 'user'
        verbose_name_plural = 'users'
        ordering = ['-date_joined']
    
    def __str__(self):
        return self.email
    
    def get_full_name(self):
        """Return the full name of the user."""
        full_name = f'{self.first_name} {self.last_name}'.strip()
        return full_name or self.email
    
    def get_short_name(self):
        """Return the short name of the user."""
        return self.first_name or self.email.split('@')[0]
\`\`\`

### Step 1.5: Create Authentication Serializers

**apps/accounts/serializers.py:**
\`\`\`python
"""
Serializers for user authentication and management.
"""
from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password
from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

User = get_user_model()


class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    """Custom JWT token serializer with user data."""
    
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        
        # Add custom claims
        token['email'] = user.email
        token['full_name'] = user.get_full_name()
        
        return token
    
    def validate(self, attrs):
        data = super().validate(attrs)
        
        # Add user data to response
        data['user'] = {
            'id': str(self.user.id),
            'email': self.user.email,
            'first_name': self.user.first_name,
            'last_name': self.user.last_name,
            'full_name': self.user.get_full_name(),
        }
        
        return data


class UserRegistrationSerializer(serializers.ModelSerializer):
    """Serializer for user registration."""
    
    password = serializers.CharField(
        write_only=True,
        required=True,
        validators=[validate_password],
        style={'input_type': 'password'}
    )
    password_confirm = serializers.CharField(
        write_only=True,
        required=True,
        style={'input_type': 'password'}
    )
    
    class Meta:
        model = User
        fields = [
            'email', 'password', 'password_confirm',
            'first_name', 'last_name', 'phone_number'
        ]
        extra_kwargs = {
            'first_name': {'required': True},
            'last_name': {'required': True},
        }
    
    def validate(self, attrs):
        if attrs['password'] != attrs['password_confirm']:
            raise serializers.ValidationError({
                'password_confirm': 'Passwords do not match.'
            })
        return attrs
    
    def create(self, validated_data):
        validated_data.pop('password_confirm')
        user = User.objects.create_user(**validated_data)
        return user


class UserSerializer(serializers.ModelSerializer):
    """Serializer for user profile."""
    
    full_name = serializers.CharField(source='get_full_name', read_only=True)
    
    class Meta:
        model = User
        fields = [
            'id', 'email', 'first_name', 'last_name', 'full_name',
            'phone_number', 'date_of_birth', 'profile_picture',
            'bio', 'is_verified', 'date_joined', 'updated_at'
        ]
        read_only_fields = ['id', 'email', 'is_verified', 'date_joined', 'updated_at']


class ChangePasswordSerializer(serializers.Serializer):
    """Serializer for password change."""
    
    old_password = serializers.CharField(required=True)
    new_password = serializers.CharField(required=True, validators=[validate_password])
    new_password_confirm = serializers.CharField(required=True)
    
    def validate(self, attrs):
        if attrs['new_password'] != attrs['new_password_confirm']:
            raise serializers.ValidationError({
                'new_password_confirm': 'New passwords do not match.'
            })
        return attrs
    
    def validate_old_password(self, value):
        user = self.context['request'].user
        if not user.check_password(value):
            raise serializers.ValidationError('Current password is incorrect.')
        return value
\`\`\`

### Step 1.6: Create Authentication Views

**apps/accounts/views.py:**
\`\`\`python
"""
Views for user authentication and management.
"""
from django.contrib.auth import get_user_model
from rest_framework import generics, status, permissions
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.tokens import RefreshToken
from drf_spectacular.utils import extend_schema, OpenApiResponse

from .serializers import (
    CustomTokenObtainPairSerializer,
    UserRegistrationSerializer,
    UserSerializer,
    ChangePasswordSerializer,
)

User = get_user_model()


class CustomTokenObtainPairView(TokenObtainPairView):
    """Custom login view with user data in response."""
    serializer_class = CustomTokenObtainPairSerializer


class UserRegistrationView(generics.CreateAPIView):
    """User registration endpoint."""
    
    queryset = User.objects.all()
    serializer_class = UserRegistrationSerializer
    permission_classes = [permissions.AllowAny]
    
    @extend_schema(
        summary="Register a new user",
        description="Create a new user account with email and password.",
        responses={
            201: OpenApiResponse(description="User created successfully"),
            400: OpenApiResponse(description="Validation error"),
        }
    )
    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        
        # Generate tokens for the new user
        refresh = RefreshToken.for_user(user)
        
        return Response({
            'message': 'User registered successfully',
            'user': UserSerializer(user).data,
            'tokens': {
                'refresh': str(refresh),
                'access': str(refresh.access_token),
            }
        }, status=status.HTTP_201_CREATED)


class UserProfileView(generics.RetrieveUpdateAPIView):
    """User profile view and update."""
    
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_object(self):
        return self.request.user


class ChangePasswordView(generics.UpdateAPIView):
    """Change user password."""
    
    serializer_class = ChangePasswordSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_object(self):
        return self.request.user
    
    def update(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        user = self.get_object()
        user.set_password(serializer.validated_data['new_password'])
        user.save()
        
        return Response({
            'message': 'Password changed successfully'
        }, status=status.HTTP_200_OK)


class LogoutView(APIView):
    """Logout by blacklisting refresh token."""
    
    permission_classes = [permissions.IsAuthenticated]
    
    def post(self, request):
        try:
            refresh_token = request.data.get('refresh')
            if refresh_token:
                token = RefreshToken(refresh_token)
                token.blacklist()
            return Response({
                'message': 'Logged out successfully'
            }, status=status.HTTP_200_OK)
        except Exception:
            return Response({
                'error': 'Invalid token'
            }, status=status.HTTP_400_BAD_REQUEST)
\`\`\`

### Step 1.7: Configure URLs

**apps/accounts/urls.py:**
\`\`\`python
"""
URL configuration for accounts app.
"""
from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView

from .views import (
    CustomTokenObtainPairView,
    UserRegistrationView,
    UserProfileView,
    ChangePasswordView,
    LogoutView,
)

app_name = 'accounts'

urlpatterns = [
    # Authentication
    path('login/', CustomTokenObtainPairView.as_view(), name='login'),
    path('register/', UserRegistrationView.as_view(), name='register'),
    path('refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('logout/', LogoutView.as_view(), name='logout'),
    
    # Profile
    path('profile/', UserProfileView.as_view(), name='profile'),
    path('change-password/', ChangePasswordView.as_view(), name='change_password'),
]
\`\`\`

**config/urls.py:**
\`\`\`python
"""
Main URL configuration.
"""
from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from drf_spectacular.views import (
    SpectacularAPIView,
    SpectacularSwaggerView,
    SpectacularRedocView,
)

urlpatterns = [
    # Admin
    path('admin/', admin.site.urls),
    
    # API Documentation
    path('api/schema/', SpectacularAPIView.as_view(), name='schema'),
    path('api/docs/', SpectacularSwaggerView.as_view(url_name='schema'), name='swagger-ui'),
    path('api/redoc/', SpectacularRedocView.as_view(url_name='schema'), name='redoc'),
    
    # API v1
    path('api/v1/auth/', include('apps.accounts.urls', namespace='accounts')),
    # Add more app URLs as you create them:
    # path('api/v1/groups/', include('apps.groups.urls', namespace='groups')),
    # path('api/v1/finance/', include('apps.finance.urls', namespace='finance')),
]

# Serve media files in development
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
\`\`\`

### Step 1.8: Run Initial Migrations

\`\`\`bash
# Create migrations
python manage.py makemigrations accounts

# Apply migrations
python manage.py migrate

# Create superuser
python manage.py createsuperuser

# Run development server
python manage.py runserver
\`\`\`

### Step 1.9: Test Authentication Endpoints

\`\`\`bash
# Register a new user
curl -X POST http://localhost:8000/api/v1/auth/register/ \\
  -H "Content-Type: application/json" \\
  -d '{
    "email": "test@example.com",
    "password": "SecurePass123!",
    "password_confirm": "SecurePass123!",
    "first_name": "Test",
    "last_name": "User"
  }'

# Login
curl -X POST http://localhost:8000/api/v1/auth/login/ \\
  -H "Content-Type: application/json" \\
  -d '{
    "email": "test@example.com",
    "password": "SecurePass123!"
  }'

# Access protected endpoint
curl -X GET http://localhost:8000/api/v1/auth/profile/ \\
  -H "Authorization: Bearer <access_token>"
\`\`\`

---

## 🚀 Phase 2: Core App Features

### Step 2.1: Create Groups App

\`\`\`bash
python manage.py startapp groups
mv groups apps/
\`\`\`

**apps/groups/models.py:**
\`\`\`python
"""
Models for Chama groups management.
"""
import uuid
from django.db import models
from django.conf import settings


class Group(models.Model):
    """Chama group model."""
    
    class GroupType(models.TextChoices):
        SAVINGS = 'SAVINGS', 'Savings Group'
        INVESTMENT = 'INVESTMENT', 'Investment Club'
        WELFARE = 'WELFARE', 'Welfare Society'
        MERRY_GO_ROUND = 'MERRY_GO_ROUND', 'Merry-Go-Round'
        MIXED = 'MIXED', 'Mixed Purpose'
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    group_type = models.CharField(
        max_length=20,
        choices=GroupType.choices,
        default=GroupType.SAVINGS
    )
    
    # Financial settings
    contribution_amount = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        default=0
    )
    contribution_frequency = models.CharField(
        max_length=20,
        choices=[
            ('WEEKLY', 'Weekly'),
            ('BIWEEKLY', 'Bi-weekly'),
            ('MONTHLY', 'Monthly'),
        ],
        default='MONTHLY'
    )
    
    # Group settings
    max_members = models.PositiveIntegerField(default=30)
    is_active = models.BooleanField(default=True)
    is_public = models.BooleanField(default=False)
    
    # Creator
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        related_name='created_groups'
    )
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-created_at']
    
    def __str__(self):
        return self.name


class Membership(models.Model):
    """Group membership model."""
    
    class Role(models.TextChoices):
        ADMIN = 'ADMIN', 'Administrator'
        TREASURER = 'TREASURER', 'Treasurer'
        SECRETARY = 'SECRETARY', 'Secretary'
        MEMBER = 'MEMBER', 'Member'
    
    class Status(models.TextChoices):
        PENDING = 'PENDING', 'Pending'
        ACTIVE = 'ACTIVE', 'Active'
        SUSPENDED = 'SUSPENDED', 'Suspended'
        LEFT = 'LEFT', 'Left'
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='memberships'
    )
    group = models.ForeignKey(
        Group,
        on_delete=models.CASCADE,
        related_name='memberships'
    )
    role = models.CharField(max_length=20, choices=Role.choices, default=Role.MEMBER)
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.PENDING)
    
    # Timestamps
    joined_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        unique_together = ['user', 'group']
        ordering = ['joined_at']
    
    def __str__(self):
        return f"{self.user.email} - {self.group.name} ({self.role})"
\`\`\`

**apps/groups/serializers.py:**
\`\`\`python
"""
Serializers for groups app.
"""
from rest_framework import serializers
from .models import Group, Membership


class MembershipSerializer(serializers.ModelSerializer):
    """Serializer for group membership."""
    
    user_email = serializers.CharField(source='user.email', read_only=True)
    user_name = serializers.CharField(source='user.get_full_name', read_only=True)
    
    class Meta:
        model = Membership
        fields = [
            'id', 'user', 'user_email', 'user_name',
            'role', 'status', 'joined_at', 'updated_at'
        ]
        read_only_fields = ['id', 'joined_at', 'updated_at']


class GroupSerializer(serializers.ModelSerializer):
    """Serializer for Chama groups."""
    
    members_count = serializers.SerializerMethodField()
    created_by_name = serializers.CharField(
        source='created_by.get_full_name',
        read_only=True
    )
    
    class Meta:
        model = Group
        fields = [
            'id', 'name', 'description', 'group_type',
            'contribution_amount', 'contribution_frequency',
            'max_members', 'members_count',
            'is_active', 'is_public',
            'created_by', 'created_by_name',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_by', 'created_at', 'updated_at']
    
    def get_members_count(self, obj):
        return obj.memberships.filter(status='ACTIVE').count()


class GroupDetailSerializer(GroupSerializer):
    """Detailed serializer including members."""
    
    members = MembershipSerializer(source='memberships', many=True, read_only=True)
    
    class Meta(GroupSerializer.Meta):
        fields = GroupSerializer.Meta.fields + ['members']
\`\`\`

**apps/groups/views.py:**
\`\`\`python
"""
Views for groups app.
"""
from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend

from .models import Group, Membership
from .serializers import (
    GroupSerializer,
    GroupDetailSerializer,
    MembershipSerializer,
)


class GroupViewSet(viewsets.ModelViewSet):
    """ViewSet for Chama groups."""
    
    queryset = Group.objects.all()
    serializer_class = GroupSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['group_type', 'is_active', 'is_public']
    search_fields = ['name', 'description']
    ordering_fields = ['name', 'created_at']
    
    def get_serializer_class(self):
        if self.action == 'retrieve':
            return GroupDetailSerializer
        return GroupSerializer
    
    def perform_create(self, serializer):
        group = serializer.save(created_by=self.request.user)
        # Auto-create admin membership for creator
        Membership.objects.create(
            user=self.request.user,
            group=group,
            role=Membership.Role.ADMIN,
            status=Membership.Status.ACTIVE
        )
    
    @action(detail=True, methods=['post'])
    def join(self, request, pk=None):
        """Request to join a group."""
        group = self.get_object()
        
        if Membership.objects.filter(user=request.user, group=group).exists():
            return Response(
                {'error': 'You are already a member or have a pending request'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        membership = Membership.objects.create(
            user=request.user,
            group=group,
            role=Membership.Role.MEMBER,
            status=Membership.Status.PENDING
        )
        
        return Response(
            MembershipSerializer(membership).data,
            status=status.HTTP_201_CREATED
        )
    
    @action(detail=True, methods=['post'])
    def leave(self, request, pk=None):
        """Leave a group."""
        group = self.get_object()
        
        try:
            membership = Membership.objects.get(user=request.user, group=group)
            membership.status = Membership.Status.LEFT
            membership.save()
            return Response({'message': 'You have left the group'})
        except Membership.DoesNotExist:
            return Response(
                {'error': 'You are not a member of this group'},
                status=status.HTTP_404_NOT_FOUND
            )


class MembershipViewSet(viewsets.ModelViewSet):
    """ViewSet for memberships."""
    
    queryset = Membership.objects.all()
    serializer_class = MembershipSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        queryset = super().get_queryset()
        group_id = self.request.query_params.get('group')
        if group_id:
            queryset = queryset.filter(group_id=group_id)
        return queryset
\`\`\`

**apps/groups/urls.py:**
\`\`\`python
"""
URL configuration for groups app.
"""
from django.urls import path, include
from rest_framework.routers import DefaultRouter

from .views import GroupViewSet, MembershipViewSet

app_name = 'groups'

router = DefaultRouter()
router.register('groups', GroupViewSet, basename='group')
router.register('memberships', MembershipViewSet, basename='membership')

urlpatterns = [
    path('', include(router.urls)),
]
\`\`\`

### Step 2.2: Create Finance App

\`\`\`bash
python manage.py startapp finance
mv finance apps/
\`\`\`

**apps/finance/models.py:**
\`\`\`python
"""
Models for financial transactions.
"""
import uuid
from django.db import models
from django.conf import settings


class Contribution(models.Model):
    """Member contribution model."""
    
    class PaymentMethod(models.TextChoices):
        MPESA = 'MPESA', 'M-Pesa'
        BANK = 'BANK', 'Bank Transfer'
        CASH = 'CASH', 'Cash'
    
    class Status(models.TextChoices):
        PENDING = 'PENDING', 'Pending'
        CONFIRMED = 'CONFIRMED', 'Confirmed'
        FAILED = 'FAILED', 'Failed'
        REFUNDED = 'REFUNDED', 'Refunded'
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    member = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='contributions'
    )
    group = models.ForeignKey(
        'groups.Group',
        on_delete=models.CASCADE,
        related_name='contributions'
    )
    
    amount = models.DecimalField(max_digits=12, decimal_places=2)
    payment_method = models.CharField(
        max_length=20,
        choices=PaymentMethod.choices,
        default=PaymentMethod.MPESA
    )
    status = models.CharField(
        max_length=20,
        choices=Status.choices,
        default=Status.PENDING
    )
    
    transaction_ref = models.CharField(max_length=100, blank=True)
    notes = models.TextField(blank=True)
    
    # Timestamps
    contributed_at = models.DateTimeField(auto_now_add=True)
    confirmed_at = models.DateTimeField(null=True, blank=True)
    
    class Meta:
        ordering = ['-contributed_at']
    
    def __str__(self):
        return f"{self.member.email} - {self.amount} ({self.status})"


class Expense(models.Model):
    """Group expense model."""
    
    class Category(models.TextChoices):
        ADMINISTRATIVE = 'ADMINISTRATIVE', 'Administrative'
        OPERATIONAL = 'OPERATIONAL', 'Operational'
        INVESTMENT = 'INVESTMENT', 'Investment'
        WELFARE = 'WELFARE', 'Welfare'
        OTHER = 'OTHER', 'Other'
    
    class Status(models.TextChoices):
        PENDING = 'PENDING', 'Pending Approval'
        APPROVED = 'APPROVED', 'Approved'
        REJECTED = 'REJECTED', 'Rejected'
        PAID = 'PAID', 'Paid'
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    group = models.ForeignKey(
        'groups.Group',
        on_delete=models.CASCADE,
        related_name='expenses'
    )
    
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    amount = models.DecimalField(max_digits=12, decimal_places=2)
    category = models.CharField(
        max_length=20,
        choices=Category.choices,
        default=Category.OTHER
    )
    status = models.CharField(
        max_length=20,
        choices=Status.choices,
        default=Status.PENDING
    )
    
    # Receipt/proof
    receipt = models.FileField(upload_to='receipts/', null=True, blank=True)
    
    # Tracking
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        related_name='created_expenses'
    )
    approved_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='approved_expenses'
    )
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    approved_at = models.DateTimeField(null=True, blank=True)
    
    class Meta:
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.title} - {self.amount}"


class Loan(models.Model):
    """Member loan model."""
    
    class Status(models.TextChoices):
        PENDING = 'PENDING', 'Pending Approval'
        APPROVED = 'APPROVED', 'Approved'
        REJECTED = 'REJECTED', 'Rejected'
        DISBURSED = 'DISBURSED', 'Disbursed'
        REPAYING = 'REPAYING', 'Being Repaid'
        COMPLETED = 'COMPLETED', 'Fully Repaid'
        DEFAULTED = 'DEFAULTED', 'Defaulted'
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    borrower = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='loans'
    )
    group = models.ForeignKey(
        'groups.Group',
        on_delete=models.CASCADE,
        related_name='loans'
    )
    
    # Loan details
    principal_amount = models.DecimalField(max_digits=12, decimal_places=2)
    interest_rate = models.DecimalField(max_digits=5, decimal_places=2, default=10.00)
    purpose = models.TextField()
    
    # Repayment
    repayment_period_months = models.PositiveIntegerField(default=12)
    monthly_repayment = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        null=True,
        blank=True
    )
    total_repaid = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        default=0
    )
    
    status = models.CharField(
        max_length=20,
        choices=Status.choices,
        default=Status.PENDING
    )
    
    # Guarantors
    guarantors = models.ManyToManyField(
        settings.AUTH_USER_MODEL,
        related_name='guaranteed_loans',
        blank=True
    )
    
    # Timestamps
    applied_at = models.DateTimeField(auto_now_add=True)
    approved_at = models.DateTimeField(null=True, blank=True)
    disbursed_at = models.DateTimeField(null=True, blank=True)
    due_date = models.DateField(null=True, blank=True)
    
    class Meta:
        ordering = ['-applied_at']
    
    def __str__(self):
        return f"Loan: {self.borrower.email} - {self.principal_amount}"
    
    @property
    def total_amount_due(self):
        """Calculate total amount due including interest."""
        interest = self.principal_amount * (self.interest_rate / 100)
        return self.principal_amount + interest
    
    @property
    def balance_remaining(self):
        """Calculate remaining balance."""
        return self.total_amount_due - self.total_repaid
\`\`\`

### Step 2.3: Pattern for Each New App

Follow this pattern for each new app:

1. **Create the app:**
\`\`\`bash
python manage.py startapp <app_name>
mv <app_name> apps/
\`\`\`

2. **Define models** in \`models.py\`
3. **Create serializers** in \`serializers.py\`
4. **Create views** in \`views.py\`
5. **Configure URLs** in \`urls.py\`
6. **Add to INSTALLED_APPS**
7. **Include URLs** in main \`urls.py\`
8. **Run migrations:**
\`\`\`bash
python manage.py makemigrations <app_name>
python manage.py migrate
\`\`\`

9. **Write tests** in \`tests/\`
10. **Test endpoints** manually or with pytest

---

## 🔐 Security Best Practices

### Input Validation
\`\`\`python
# Always use serializers for validation
class ContributionSerializer(serializers.ModelSerializer):
    amount = serializers.DecimalField(
        max_digits=12,
        decimal_places=2,
        min_value=Decimal('0.01'),
        max_value=Decimal('1000000.00')
    )
    
    def validate_amount(self, value):
        if value <= 0:
            raise serializers.ValidationError("Amount must be positive")
        return value
\`\`\`

### SQL Injection Prevention
\`\`\`python
# Always use Django ORM - NEVER raw SQL with user input
# ✅ Safe
Group.objects.filter(name__icontains=search_term)

# ❌ Dangerous - Never do this
cursor.execute(f"SELECT * FROM groups WHERE name LIKE '%{search_term}%'")
\`\`\`

### XSS Protection
\`\`\`python
# Django auto-escapes template output
# For API responses, sanitize HTML content if accepting rich text
from django.utils.html import escape

class CommentSerializer(serializers.ModelSerializer):
    def validate_content(self, value):
        return escape(value)  # Escape HTML entities
\`\`\`

### Authentication & Authorization
\`\`\`python
# Use proper permission classes
from rest_framework import permissions

class IsGroupAdmin(permissions.BasePermission):
    def has_object_permission(self, request, view, obj):
        membership = Membership.objects.filter(
            user=request.user,
            group=obj,
            role=Membership.Role.ADMIN,
            status=Membership.Status.ACTIVE
        ).exists()
        return membership
\`\`\`

---

## ⚡ Performance Optimization

### Database Indexing
\`\`\`python
class Contribution(models.Model):
    # ...
    
    class Meta:
        indexes = [
            models.Index(fields=['group', 'contributed_at']),
            models.Index(fields=['member', 'status']),
            models.Index(fields=['-contributed_at']),
        ]
\`\`\`

### Query Optimization
\`\`\`python
# Use select_related for ForeignKey
contributions = Contribution.objects.select_related(
    'member', 'group'
).filter(group=group)

# Use prefetch_related for reverse relations
groups = Group.objects.prefetch_related(
    'memberships', 'contributions'
).all()

# Only fetch needed fields
users = User.objects.only('id', 'email', 'first_name').all()
\`\`\`

### Caching
\`\`\`python
from django.core.cache import cache
from django.conf import settings

def get_group_stats(group_id):
    cache_key = f'group_stats_{group_id}'
    stats = cache.get(cache_key)
    
    if stats is None:
        stats = calculate_group_stats(group_id)
        cache.set(cache_key, stats, timeout=300)  # 5 minutes
    
    return stats
\`\`\`

---

## 🐳 Docker Configuration

**Dockerfile:**
\`\`\`dockerfile
FROM python:3.12-slim

WORKDIR /app

# Install dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy project
COPY . .

# Collect static files
RUN python manage.py collectstatic --noinput

# Run with gunicorn
CMD ["gunicorn", "--bind", "0.0.0.0:8000", "config.wsgi:application"]
\`\`\`

**docker-compose.yml:**
\`\`\`yaml
version: '3.8'

services:
  backend:
    build: .
    ports:
      - "8000:8000"
    environment:
      - DJANGO_ENVIRONMENT=production
      - DATABASE_URL=postgresql://user:password@db:5432/chama_nexus
    depends_on:
      - db
      - redis

  db:
    image: postgres:16
    volumes:
      - postgres_data:/var/lib/postgresql/data
    environment:
      - POSTGRES_DB=chama_nexus
      - POSTGRES_USER=user
      - POSTGRES_PASSWORD=password

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"

volumes:
  postgres_data:
\`\`\`

---

## 🧪 Testing

**pytest.ini:**
\`\`\`ini
[pytest]
DJANGO_SETTINGS_MODULE = config.settings.development
python_files = tests.py test_*.py *_tests.py
addopts = -v --cov=apps --cov-report=html
\`\`\`

**Example test:**
\`\`\`python
# apps/accounts/tests/test_views.py
import pytest
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APIClient

from apps.accounts.models import User


@pytest.fixture
def api_client():
    return APIClient()


@pytest.fixture
def user():
    return User.objects.create_user(
        email='test@example.com',
        password='TestPass123!',
        first_name='Test',
        last_name='User'
    )


@pytest.mark.django_db
class TestAuthentication:
    def test_user_registration(self, api_client):
        url = reverse('accounts:register')
        data = {
            'email': 'new@example.com',
            'password': 'SecurePass123!',
            'password_confirm': 'SecurePass123!',
            'first_name': 'New',
            'last_name': 'User'
        }
        response = api_client.post(url, data)
        assert response.status_code == status.HTTP_201_CREATED
        assert 'tokens' in response.data
    
    def test_user_login(self, api_client, user):
        url = reverse('accounts:login')
        data = {
            'email': 'test@example.com',
            'password': 'TestPass123!'
        }
        response = api_client.post(url, data)
        assert response.status_code == status.HTTP_200_OK
        assert 'access' in response.data
\`\`\`

---

## 📊 Monitoring & Logging

**Logging configuration:**
\`\`\`python
LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'formatters': {
        'verbose': {
            'format': '{levelname} {asctime} {module} {process:d} {thread:d} {message}',
            'style': '{',
        },
    },
    'handlers': {
        'file': {
            'level': 'INFO',
            'class': 'logging.FileHandler',
            'filename': BASE_DIR / 'logs' / 'django.log',
            'formatter': 'verbose',
        },
        'console': {
            'class': 'logging.StreamHandler',
            'formatter': 'verbose',
        },
    },
    'loggers': {
        'django': {
            'handlers': ['file', 'console'],
            'level': 'INFO',
            'propagate': True,
        },
        'apps': {
            'handlers': ['file', 'console'],
            'level': 'DEBUG',
            'propagate': False,
        },
    },
}
\`\`\`

---

## 🚢 Deployment Checklist

- [ ] Set \`DEBUG=False\`
- [ ] Configure \`ALLOWED_HOSTS\`
- [ ] Set secure \`SECRET_KEY\`
- [ ] Configure PostgreSQL database
- [ ] Set up CORS for frontend domain
- [ ] Configure email backend
- [ ] Set up static file serving (whitenoise)
- [ ] Configure SSL/HTTPS
- [ ] Set up logging and monitoring
- [ ] Run security checks: \`python manage.py check --deploy\`
- [ ] Create superuser for admin access
- [ ] Set up backup strategy

---

## 🔗 Next Steps: Frontend Development

Once you've completed the backend setup and have your API endpoints working:

**👉 [Continue to BUILD_FE.md →](./BUILD_FE.md)**

The frontend guide will show you how to:
- Set up React + TypeScript project
- Create the API service layer with Axios
- Build authentication context/store
- Create pages and components
- Integrate with your Django backend API
- Deploy the full-stack application

---

## 📚 Additional Resources

- [Django Documentation](https://docs.djangoproject.com/)
- [Django REST Framework](https://www.django-rest-framework.org/)
- [SimpleJWT Documentation](https://django-rest-framework-simplejwt.readthedocs.io/)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Docker Documentation](https://docs.docker.com/)

---

**Happy Coding! 🎉**

*Built with ❤️ for the Chama Nexus project*
