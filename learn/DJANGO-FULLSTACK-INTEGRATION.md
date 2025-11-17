# 🌐 Django + Frontend Integration Guide

<div align="center">

**Complete Guide to Connecting Django Backend with Any Frontend Framework**

*Avoid common errors when joining backend and frontend*

[![TypeScript](https://img.shields.io/badge/TypeScript-Ready-blue?style=for-the-badge)](./)
[![React](https://img.shields.io/badge/React-Compatible-61DAFB?style=for-the-badge)](./)
[![Vue](https://img.shields.io/badge/Vue-Compatible-4FC08D?style=for-the-badge)](./)
[![Angular](https://img.shields.io/badge/Angular-Compatible-DD0031?style=for-the-badge)](./)

</div>

---

## 🎯 Purpose

This guide explains **how to properly connect a Django REST Framework backend with any frontend** (React, Vue, Angular, etc.). It covers the essential concepts, configurations, and patterns to avoid common integration errors.

---

## 📚 Table of Contents

1. [Understanding the Architecture](#1-understanding-the-architecture)
2. [Django API Setup for Frontend Consumption](#2-django-api-setup-for-frontend-consumption)
3. [CORS Configuration (Critical!)](#3-cors-configuration-critical)
4. [API Versioning Strategy](#4-api-versioning-strategy)
5. [Authentication Flow (Frontend ↔ Backend)](#5-authentication-flow-frontend--backend)
6. [Type Safety with TypeScript](#6-type-safety-with-typescript)
7. [Common Integration Errors & Solutions](#7-common-integration-errors--solutions)
8. [Best Practices for API Design](#8-best-practices-for-api-design)
9. [Deployment Considerations](#9-deployment-considerations)

---

## 1. Understanding the Architecture

### The Big Picture

```
┌─────────────────────────────────────────────────────────┐
│                      Users/Clients                       │
└─────────────────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────┐
│              Frontend Application (SPA)                  │
│  ┌──────────────────────────────────────────────────┐  │
│  │  React/Vue/Angular + TypeScript                  │  │
│  │  - Components                                     │  │
│  │  - State Management (Redux/Zustand/Pinia)       │  │
│  │  - API Client (Axios/Fetch)                      │  │
│  │  - Routing (React Router/Vue Router)            │  │
│  └──────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
                           │
                           │ HTTP/HTTPS
                           │ JSON Requests
                           ▼
┌─────────────────────────────────────────────────────────┐
│              Django Backend (API Server)                 │
│  ┌──────────────────────────────────────────────────┐  │
│  │  Django REST Framework                           │  │
│  │  - URLs/Routing                                  │  │
│  │  - Views/ViewSets                                │  │
│  │  - Serializers (Data Validation)                 │  │
│  │  - Authentication (JWT)                          │  │
│  │  - Permissions                                   │  │
│  └──────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────┐
│                    Database (PostgreSQL)                 │
└─────────────────────────────────────────────────────────┘
```

### Key Concepts

**Single Page Application (SPA)**
> Frontend runs entirely in the browser. When user navigates, the page doesn't reload—JavaScript just swaps out content.

**RESTful API**
> Backend exposes "endpoints" (URLs) that frontend calls to get/send data. Communication uses JSON format.

**Separation of Concerns**
> Frontend handles UI/UX. Backend handles business logic, data, and security. They communicate via HTTP.

**Why This Architecture?**
- ✅ **Flexibility**: Change frontend framework without touching backend
- ✅ **Scalability**: Deploy frontend and backend independently
- ✅ **Team Efficiency**: Frontend and backend developers work in parallel
- ✅ **Mobile Apps**: Same backend can serve web, iOS, Android apps

---

## 2. Django API Setup for Frontend Consumption

### Essential Django Settings

#### 2.1 Install Required Packages

```bash
# Core API packages
pip install djangorestframework djangorestframework-simplejwt

# CORS support (CRITICAL for frontend)
pip install django-cors-headers

# API documentation (Swagger/OpenAPI)
pip install drf-spectacular

# For filtering and pagination
pip install django-filter
```

#### 2.2 Update `settings.py`

```python
# settings.py

INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    
    # Third-party apps
    'rest_framework',
    'rest_framework_simplejwt',
    'corsheaders',  # CRITICAL for frontend communication
    'drf_spectacular',
    'django_filters',
    
    # Your apps
    'users',
    'api',
]

MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'corsheaders.middleware.CorsMiddleware',  # Must be at top!
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

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
    # Return JSON errors, not HTML
    'EXCEPTION_HANDLER': 'rest_framework.views.exception_handler',
    # Use JSON renderer by default
    'DEFAULT_RENDERER_CLASSES': [
        'rest_framework.renderers.JSONRenderer',
    ],
}

# JWT Configuration
from datetime import timedelta

SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(minutes=15),
    'REFRESH_TOKEN_LIFETIME': timedelta(days=7),
    'ROTATE_REFRESH_TOKENS': True,  # Security best practice
    'BLACKLIST_AFTER_ROTATION': True,
    'AUTH_HEADER_TYPES': ('Bearer',),
}

# API Documentation
SPECTACULAR_SETTINGS = {
    'TITLE': 'ChamaHub API',
    'DESCRIPTION': 'Django REST API for ChamaHub fintech platform',
    'VERSION': '1.0.0',
    'SERVE_INCLUDE_SCHEMA': False,
}
```

---

## 3. CORS Configuration (Critical!)

### What is CORS?

**CORS (Cross-Origin Resource Sharing)** is a browser security feature that blocks frontend apps from making requests to backends on different domains.

**Example**:
- Frontend: `http://localhost:3000` (React dev server)
- Backend: `http://localhost:8000` (Django server)
- These are **different origins** → Browser blocks requests by default!

### The Error You'll See

```
Access to XMLHttpRequest at 'http://localhost:8000/api/users/' 
from origin 'http://localhost:3000' has been blocked by CORS policy: 
No 'Access-Control-Allow-Origin' header is present on the requested resource.
```

### Solution: Configure django-cors-headers

#### Development Configuration

```python
# settings/dev.py

# Allow all origins in development (NEVER do this in production!)
CORS_ALLOW_ALL_ORIGINS = True

# Or specify exact allowed origins
CORS_ALLOWED_ORIGINS = [
    "http://localhost:3000",      # React dev server
    "http://localhost:5173",      # Vite dev server
    "http://localhost:8080",      # Vue dev server
    "http://127.0.0.1:3000",
]

# Allow credentials (cookies, auth headers)
CORS_ALLOW_CREDENTIALS = True

# Methods allowed
CORS_ALLOW_METHODS = [
    'DELETE',
    'GET',
    'OPTIONS',
    'PATCH',
    'POST',
    'PUT',
]

# Headers allowed
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
```

#### Production Configuration

```python
# settings/prod.py

# NEVER allow all origins in production!
CORS_ALLOW_ALL_ORIGINS = False

# Only allow your production frontend domains
CORS_ALLOWED_ORIGINS = [
    "https://chamahub.co.ke",
    "https://www.chamahub.co.ke",
    "https://app.chamahub.co.ke",
]

CORS_ALLOW_CREDENTIALS = True

# Same methods and headers as dev
```

---

## 4. API Versioning Strategy

### Why Version Your API?

When you change your API, you might break existing frontend apps. Versioning lets you introduce changes without breaking things.

### URL-Based Versioning (Recommended)

```python
# urls.py

from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),
    
    # API v1
    path('api/v1/', include('api.v1.urls')),
    
    # Future: API v2 (when you make breaking changes)
    # path('api/v2/', include('api.v2.urls')),
    
    # API Documentation
    path('api/schema/', SpectacularAPIView.as_view(), name='schema'),
    path('api/docs/', SpectacularSwaggerView.as_view(url_name='schema'), name='swagger-ui'),
]
```

### API Structure

```
api/
├── __init__.py
├── v1/
│   ├── __init__.py
│   ├── urls.py
│   ├── views.py
│   ├── serializers.py
│   └── permissions.py
└── v2/  (future)
    ├── __init__.py
    ├── urls.py
    └── ...
```

---

## 5. Authentication Flow (Frontend ↔ Backend)

### JWT Authentication Flow

```
┌──────────────┐                              ┌──────────────┐
│   Frontend   │                              │   Backend    │
└──────────────┘                              └──────────────┘
       │                                              │
       │  1. POST /api/v1/auth/login/                │
       │     { email, password }                     │
       │─────────────────────────────────────────────▶│
       │                                              │
       │                                              │ Validate
       │                                              │ credentials
       │                                              │
       │  2. Return tokens                            │
       │     { access, refresh }                      │
       │◀─────────────────────────────────────────────│
       │                                              │
       │  Store tokens in memory/localStorage         │
       │                                              │
       │  3. GET /api/v1/users/me/                    │
       │     Authorization: Bearer <access_token>     │
       │─────────────────────────────────────────────▶│
       │                                              │
       │                                              │ Validate
       │                                              │ token
       │                                              │
       │  4. Return user data                         │
       │     { id, email, name, ... }                 │
       │◀─────────────────────────────────────────────│
       │                                              │
       │  (15 minutes later - access token expired)   │
       │                                              │
       │  5. POST /api/v1/auth/refresh/               │
       │     { refresh }                              │
       │─────────────────────────────────────────────▶│
       │                                              │
       │                                              │ Validate
       │                                              │ refresh token
       │                                              │
       │  6. Return new tokens                        │
       │     { access, refresh }                      │
       │◀─────────────────────────────────────────────│
       │                                              │
       │  Update stored tokens                        │
       │                                              │
```

### Django Backend Setup

```python
# api/v1/urls.py

from django.urls import path
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)
from .views import RegisterView, UserDetailView

urlpatterns = [
    # Authentication endpoints
    path('auth/register/', RegisterView.as_view(), name='register'),
    path('auth/login/', TokenObtainPairView.as_view(), name='login'),
    path('auth/refresh/', TokenRefreshView.as_view(), name='refresh'),
    
    # User endpoints
    path('users/me/', UserDetailView.as_view(), name='user-detail'),
]
```

### Frontend API Client (TypeScript)

```typescript
// api/client.ts

import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const apiClient = axios.create({
  baseURL: `${API_BASE_URL}/api/v1`,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add access token to all requests
apiClient.interceptors.request.use((config) => {
  const accessToken = localStorage.getItem('access_token');
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  return config;
});

// Handle token refresh on 401 errors
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If error is 401 and we haven't retried yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refresh_token');
        const response = await axios.post(
          `${API_BASE_URL}/api/v1/auth/refresh/`,
          { refresh: refreshToken }
        );

        const { access, refresh } = response.data;
        localStorage.setItem('access_token', access);
        localStorage.setItem('refresh_token', refresh);

        // Retry original request with new token
        originalRequest.headers.Authorization = `Bearer ${access}`;
        return apiClient(originalRequest);
      } catch (refreshError) {
        // Refresh failed - redirect to login
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default apiClient;
```

### Login Function (Frontend)

```typescript
// api/auth.ts

import apiClient from './client';

interface LoginRequest {
  email: string;
  password: string;
}

interface LoginResponse {
  access: string;
  refresh: string;
}

export async function login(credentials: LoginRequest): Promise<LoginResponse> {
  const response = await apiClient.post<LoginResponse>('/auth/login/', credentials);
  
  // Store tokens
  localStorage.setItem('access_token', response.data.access);
  localStorage.setItem('refresh_token', response.data.refresh);
  
  return response.data;
}

export function logout(): void {
  localStorage.removeItem('access_token');
  localStorage.removeItem('refresh_token');
}

export function isAuthenticated(): boolean {
  return !!localStorage.getItem('access_token');
}
```

---

## 6. Type Safety with TypeScript

### Auto-Generate TypeScript Types from Django

Use **DRF Spectacular** + **Orval** to automatically generate TypeScript types from your Django API.

#### Step 1: Generate OpenAPI Schema

```python
# settings.py

INSTALLED_APPS = [
    # ...
    'drf_spectacular',
]

REST_FRAMEWORK = {
    'DEFAULT_SCHEMA_CLASS': 'drf_spectacular.openapi.AutoSchema',
}

# urls.py
from drf_spectacular.views import SpectacularAPIView, SpectacularSwaggerView

urlpatterns = [
    path('api/schema/', SpectacularAPIView.as_view(), name='schema'),
    path('api/docs/', SpectacularSwaggerView.as_view(url_name='schema'), name='swagger-ui'),
]
```

#### Step 2: Install Orval (Frontend)

```bash
npm install -D orval
```

#### Step 3: Configure Orval

```typescript
// orval.config.ts

import { defineConfig } from 'orval';

export default defineConfig({
  chamahub: {
    input: 'http://localhost:8000/api/schema/',
    output: {
      mode: 'tags-split',
      target: 'src/api/generated',
      schemas: 'src/api/models',
      client: 'axios',
      override: {
        mutator: {
          path: 'src/api/client.ts',
          name: 'apiClient',
        },
      },
    },
  },
});
```

#### Step 4: Generate Types

```bash
# Add to package.json
{
  "scripts": {
    "generate-api": "orval"
  }
}

# Run generation
npm run generate-api
```

#### Step 5: Use Generated Types

```typescript
// src/components/UserProfile.tsx

import { useQuery } from '@tanstack/react-query';
import { getUsersMe } from '../api/generated/users/users';
import type { User } from '../api/models';

export function UserProfile() {
  const { data: user, isLoading, error } = useQuery<User>({
    queryKey: ['user', 'me'],
    queryFn: getUsersMe,
  });

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div>
      <h1>{user.full_name}</h1>
      <p>{user.email}</p>
      {/* TypeScript autocomplete works perfectly! */}
    </div>
  );
}
```

---

## 7. Common Integration Errors & Solutions

### Error 1: CORS Blocking Requests

**Symptom**:
```
Access to XMLHttpRequest blocked by CORS policy
```

**Solution**:
1. Install `django-cors-headers`
2. Add `'corsheaders'` to `INSTALLED_APPS`
3. Add `'corsheaders.middleware.CorsMiddleware'` to `MIDDLEWARE` (at top!)
4. Configure `CORS_ALLOWED_ORIGINS` in settings

### Error 2: 401 Unauthorized on Every Request

**Symptom**:
```
GET /api/v1/users/ - 401 Unauthorized
```

**Cause**: Access token not being sent or invalid.

**Solution**:
```typescript
// Check if token is being sent
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  console.log('Token being sent:', token);  // Debug log
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
```

### Error 3: CSRF Verification Failed

**Symptom**:
```
403 Forbidden - CSRF verification failed
```

**Cause**: Django's CSRF protection is enabled but you're not using session authentication.

**Solution**: For JWT/token auth, disable CSRF for API endpoints:

```python
# settings.py

REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': [
        'rest_framework_simplejwt.authentication.JWTAuthentication',
        # NOT using SessionAuthentication - no CSRF needed
    ],
}
```

### Error 4: Can't Parse JSON Response

**Symptom**:
```
SyntaxError: Unexpected token < in JSON at position 0
```

**Cause**: Django is returning HTML instead of JSON (usually an error page).

**Solution**:
```python
# settings.py - Force JSON responses

REST_FRAMEWORK = {
    'DEFAULT_RENDERER_CLASSES': [
        'rest_framework.renderers.JSONRenderer',
    ],
    # Don't include BrowsableAPIRenderer in production
}
```

### Error 5: TypeScript Types Don't Match API Response

**Symptom**:
```typescript
// Expected string, got number
const userId: string = user.id;  // Error!
```

**Solution**: Regenerate types from latest API schema:
```bash
npm run generate-api
```

---

## 8. Best Practices for API Design

### 1. Use Consistent URL Patterns

```python
# Good - RESTful URLs
/api/v1/chamas/                  # List all chamas
/api/v1/chamas/{id}/             # Get specific chama
/api/v1/chamas/{id}/members/     # List chama members
/api/v1/contributions/           # List contributions

# Bad - Inconsistent URLs
/api/v1/get_chamas/
/api/v1/chama_detail/{id}/
/api/v1/list_members_for_chama/{id}/
```

### 2. Return Appropriate Status Codes

```python
# views.py

from rest_framework import status
from rest_framework.response import Response

class ChamaViewSet(viewsets.ModelViewSet):
    def create(self, request):
        serializer = ChamaSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    def destroy(self, request, pk=None):
        chama = self.get_object()
        chama.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
```

### 3. Paginate Large Lists

```python
# settings.py

REST_FRAMEWORK = {
    'DEFAULT_PAGINATION_CLASS': 'rest_framework.pagination.PageNumberPagination',
    'PAGE_SIZE': 20,
}
```

### 4. Provide Meaningful Error Messages

```python
# serializers.py

class ChamaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Chama
        fields = '__all__'
    
    def validate_name(self, value):
        if len(value) < 3:
            raise serializers.ValidationError(
                "Chama name must be at least 3 characters long."
            )
        return value
```

### 5. Document Your API

```python
# views.py

from drf_spectacular.utils import extend_schema, OpenApiParameter

class ChamaViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing Chamas (savings groups).
    
    list: Return a list of all chamas.
    retrieve: Return a specific chama by ID.
    create: Create a new chama.
    update: Update an existing chama.
    destroy: Delete a chama.
    """
    
    @extend_schema(
        description="List all chamas for the authenticated user",
        responses={200: ChamaSerializer(many=True)},
    )
    def list(self, request):
        # ...
```

---

## 9. Deployment Considerations

### Development vs Production

#### Development Setup
- Backend: `http://localhost:8000`
- Frontend: `http://localhost:3000`
- CORS: Allow localhost origins

#### Production Setup
- Backend: `https://api.chamahub.co.ke`
- Frontend: `https://chamahub.co.ke`
- CORS: Only allow production domain
- HTTPS: Required for security

### Environment Variables

#### Backend (.env)
```bash
# Django
DEBUG=False
SECRET_KEY=your-secret-key
ALLOWED_HOSTS=api.chamahub.co.ke,chamahub.co.ke

# Database
DATABASE_URL=postgresql://user:pass@host:5432/dbname

# CORS
CORS_ALLOWED_ORIGINS=https://chamahub.co.ke,https://www.chamahub.co.ke
```

#### Frontend (.env)
```bash
# API URL
VITE_API_URL=https://api.chamahub.co.ke

# Other config
VITE_APP_NAME=ChamaHub
VITE_ENABLE_ANALYTICS=true
```

### Deployment Checklist

Backend:
- [ ] Set `DEBUG=False`
- [ ] Configure `ALLOWED_HOSTS`
- [ ] Set strong `SECRET_KEY`
- [ ] Configure CORS for production domain only
- [ ] Enable HTTPS
- [ ] Set up proper database (PostgreSQL)
- [ ] Configure Redis for caching
- [ ] Set up Celery for background tasks

Frontend:
- [ ] Update API URL to production backend
- [ ] Build for production (`npm run build`)
- [ ] Deploy to CDN/static host (Vercel, Netlify)
- [ ] Configure custom domain
- [ ] Enable HTTPS
- [ ] Set up analytics

---

## 🎯 Summary

### Key Takeaways

1. **CORS is Critical**: Configure `django-cors-headers` properly or frontend can't communicate with backend
2. **JWT Authentication**: Use access + refresh tokens for secure, stateless authentication
3. **API Versioning**: Use `/api/v1/` pattern to allow future changes without breaking existing apps
4. **Type Safety**: Auto-generate TypeScript types from Django API for error-free integration
5. **Error Handling**: Return proper status codes and error messages for better frontend UX
6. **Environment Config**: Use different settings for dev vs production
7. **Documentation**: Use DRF Spectacular to auto-generate API docs

### Next Steps

- **For Backend Focus**: Follow guides in [`/docs`](../docs/) to build the Django API
- **For Full-Stack**: Start with [`/docs/07-django-typescript-fullstack-mastery.md`](../docs/07-django-typescript-fullstack-mastery.md)
- **For Concepts**: Explore other guides in this [`/learn`](../learn/) folder

---

<div align="center">

## 🚀 Ready to Build?

[📚 Back to Learning Center](./README.md) | [🏗️ Implementation Guides](../docs/)

---

*Last Updated: November 2025 | Actively Maintained ✅*

</div>
