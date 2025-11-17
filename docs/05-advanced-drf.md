# 🔐 Guide 5: Advanced DRF Features (Authentication, Permissions, Throttling)

> **Duration:** 120-150 minutes  
> **Prerequisites:** Completed Guide 1-4  
> **Outcome:** Secure, production-ready REST API with JWT authentication

---

## 🎯 What You'll Learn

- Implement JWT authentication with token refresh
- Create DRF serializers following best practices
- Build viewsets with pagination and filtering
- Add custom permissions (object-level)
- Implement rate limiting (throttling)
- Create API endpoints for CRUD operations
- Handle nested relationships in serializers

---

## 📋 Table of Contents

1. [JWT Authentication Setup](#1-jwt-authentication-setup)
2. [User Registration and Login](#2-user-registration-and-login)
3. [Creating Serializers](#3-creating-serializers)
4. [Building ViewSets](#4-building-viewsets)
5. [Custom Permissions](#5-custom-permissions)
6. [Throttling and Rate Limiting](#6-throttling-and-rate-limiting)
7. [Filtering and Pagination](#7-filtering-and-pagination)
8. [Testing APIs](#8-testing-apis)

---

## 1. JWT Authentication Setup

### 1.1 Configure JWT Settings

```python
# config/settings/base.py

from datetime import timedelta
from decouple import config

# SimpleJWT Configuration
SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(minutes=config('JWT_ACCESS_TOKEN_LIFETIME', default=15, cast=int)),
    'REFRESH_TOKEN_LIFETIME': timedelta(minutes=config('JWT_REFRESH_TOKEN_LIFETIME', default=10080, cast=int)),  # 7 days
    'ROTATE_REFRESH_TOKENS': True,
    'BLACKLIST_AFTER_ROTATION': True,
    'UPDATE_LAST_LOGIN': True,
    
    'ALGORITHM': 'HS256',
    'SIGNING_KEY': SECRET_KEY,
    'VERIFYING_KEY': None,
    
    'AUTH_HEADER_TYPES': ('Bearer',),
    'AUTH_HEADER_NAME': 'HTTP_AUTHORIZATION',
    'USER_ID_FIELD': 'id',
    'USER_ID_CLAIM': 'user_id',
    
    'AUTH_TOKEN_CLASSES': ('rest_framework_simplejwt.tokens.AccessToken',),
    'TOKEN_TYPE_CLAIM': 'token_type',
}

# Add token blacklist app
INSTALLED_APPS = [
    # ... existing apps ...
    'rest_framework_simplejwt.token_blacklist',
]
```

### 1.2 Run Migrations for Token Blacklist

```bash
python manage.py migrate token_blacklist
```

---

## 2. User Registration and Login

### 2.1 Create User Serializers

```python
# apps/users/serializers.py
from rest_framework import serializers
from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

User = get_user_model()


class UserRegistrationSerializer(serializers.ModelSerializer):
    """
    Serializer for user registration.
    Includes password confirmation and validation.
    """
    password = serializers.CharField(
        write_only=True,
        required=True,
        validators=[validate_password]
    )
    password_confirm = serializers.CharField(write_only=True, required=True)
    
    class Meta:
        model = User
        fields = [
            'email', 'password', 'password_confirm',
            'first_name', 'last_name', 'phone_number'
        ]
    
    def validate(self, attrs):
        """Validate password confirmation."""
        if attrs['password'] != attrs['password_confirm']:
            raise serializers.ValidationError({
                "password": "Password fields didn't match."
            })
        return attrs
    
    def create(self, validated_data):
        """Create user with validated data."""
        validated_data.pop('password_confirm')
        user = User.objects.create_user(**validated_data)
        return user


class UserSerializer(serializers.ModelSerializer):
    """
    Serializer for user details.
    Used for GET requests and user profiles.
    """
    full_name = serializers.CharField(source='get_full_name', read_only=True)
    
    class Meta:
        model = User
        fields = [
            'id', 'email', 'first_name', 'last_name', 'full_name',
            'phone_number', 'profile_photo', 'date_of_birth',
            'email_verified', 'phone_verified', 'date_joined'
        ]
        read_only_fields = ['id', 'email_verified', 'phone_verified', 'date_joined']


class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    """
    Custom JWT token serializer.
    Includes additional user data in the token response.
    """
    
    def validate(self, attrs):
        data = super().validate(attrs)
        
        # Add user data to response
        data['user'] = {
            'id': str(self.user.id),
            'email': self.user.email,
            'full_name': self.user.get_full_name(),
        }
        
        return data
```

### 2.2 Create Authentication Views

```python
# apps/users/views.py
from rest_framework import generics, status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.tokens import RefreshToken
from drf_spectacular.utils import extend_schema, OpenApiResponse

from .serializers import (
    UserRegistrationSerializer,
    UserSerializer,
    CustomTokenObtainPairSerializer
)


class UserRegistrationView(generics.CreateAPIView):
    """
    User registration endpoint.
    POST /api/v1/auth/register/
    """
    serializer_class = UserRegistrationSerializer
    permission_classes = [AllowAny]
    
    @extend_schema(
        request=UserRegistrationSerializer,
        responses={
            201: UserSerializer,
            400: OpenApiResponse(description="Validation error")
        },
        description="Register a new user account"
    )
    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        
        # Return user data without password
        return Response(
            UserSerializer(user).data,
            status=status.HTTP_201_CREATED
        )


class CustomTokenObtainPairView(TokenObtainPairView):
    """
    Custom JWT token obtain view.
    POST /api/v1/auth/login/
    """
    serializer_class = CustomTokenObtainPairSerializer


class LogoutView(APIView):
    """
    Logout endpoint.
    POST /api/v1/auth/logout/
    Blacklists the refresh token.
    """
    permission_classes = [IsAuthenticated]
    
    @extend_schema(
        request={"refresh": "string"},
        responses={205: {"message": "string"}},
        description="Logout and blacklist refresh token"
    )
    def post(self, request):
        try:
            refresh_token = request.data.get("refresh")
            token = RefreshToken(refresh_token)
            token.blacklist()
            return Response(
                {"message": "Logged out successfully"},
                status=status.HTTP_205_RESET_CONTENT
            )
        except Exception:
            return Response(
                {"error": "Invalid token"},
                status=status.HTTP_400_BAD_REQUEST
            )


class UserProfileView(generics.RetrieveUpdateAPIView):
    """
    Get and update user profile.
    GET/PUT/PATCH /api/v1/auth/profile/
    """
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated]
    
    def get_object(self):
        """Return the current authenticated user."""
        return self.request.user


# apps/users/urls.py
from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from .views import (
    UserRegistrationView,
    CustomTokenObtainPairView,
    LogoutView,
    UserProfileView
)

app_name = 'users'

urlpatterns = [
    path('register/', UserRegistrationView.as_view(), name='register'),
    path('login/', CustomTokenObtainPairView.as_view(), name='login'),
    path('logout/', LogoutView.as_view(), name='logout'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token-refresh'),
    path('profile/', UserProfileView.as_view(), name='profile'),
]
```

### 2.3 Update Main URLs

```python
# config/urls.py

urlpatterns = [
    # ... existing patterns ...
    
    # API v1
    path('api/v1/', include([
        path('', include('apps.core.urls')),
        path('auth/', include('apps.users.urls')),
    ])),
]
```

---

## 3. Creating Serializers

### 3.1 Chama Serializers

```python
# apps/chamas/serializers.py
from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import Chama, Member, Contribution

User = get_user_model()


class ChamaSerializer(serializers.ModelSerializer):
    """
    Serializer for Chama model.
    Includes computed fields and nested relationships.
    """
    chair_name = serializers.CharField(source='chair.get_full_name', read_only=True)
    treasurer_name = serializers.CharField(source='treasurer.get_full_name', read_only=True)
    member_count = serializers.IntegerField(read_only=True)
    is_premium = serializers.BooleanField(read_only=True)
    
    class Meta:
        model = Chama
        fields = [
            'id', 'name', 'description',
            'contribution_amount', 'contribution_frequency',
            'balance', 'idle_cash', 'max_members',
            'chair', 'chair_name', 'treasurer', 'treasurer_name',
            'subscription_tier', 'subscription_expires_at',
            'is_active', 'member_count', 'is_premium',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'balance', 'idle_cash', 'created_at', 'updated_at']
    
    def validate_contribution_amount(self, value):
        """Validate contribution amount is positive."""
        if value <= 0:
            raise serializers.ValidationError("Contribution amount must be positive")
        return value


class ChamaCreateSerializer(serializers.ModelSerializer):
    """
    Serializer for creating a chama.
    Automatically sets the creator as chair.
    """
    class Meta:
        model = Chama
        fields = [
            'name', 'description',
            'contribution_amount', 'contribution_frequency',
            'max_members'
        ]
    
    def create(self, validated_data):
        """Set the current user as chair."""
        validated_data['chair'] = self.context['request'].user
        chama = Chama.objects.create(**validated_data)
        
        # Automatically create a Member entry for the chair
        Member.objects.create(
            user=chama.chair,
            chama=chama,
            role='CHAIR'
        )
        
        return chama


class MemberSerializer(serializers.ModelSerializer):
    """Serializer for Member model."""
    user_name = serializers.CharField(source='user.get_full_name', read_only=True)
    user_email = serializers.EmailField(source='user.email', read_only=True)
    chama_name = serializers.CharField(source='chama.name', read_only=True)
    
    class Meta:
        model = Member
        fields = [
            'id', 'user', 'user_name', 'user_email',
            'chama', 'chama_name', 'role', 'is_active',
            'contribution_share', 'total_contributed', 'credit_score',
            'joined_date', 'left_date'
        ]
        read_only_fields = [
            'id', 'contribution_share', 'total_contributed',
            'credit_score', 'joined_date'
        ]


class ContributionSerializer(serializers.ModelSerializer):
    """Serializer for Contribution model."""
    member_name = serializers.CharField(source='member.user.get_full_name', read_only=True)
    chama_name = serializers.CharField(source='member.chama.name', read_only=True)
    
    class Meta:
        model = Contribution
        fields = [
            'id', 'member', 'member_name', 'chama_name',
            'amount', 'mpesa_transaction_id', 'mpesa_phone_number',
            'status', 'contribution_date', 'confirmed_at',
            'notes', 'created_at', 'updated_at'
        ]
        read_only_fields = [
            'id', 'status', 'contribution_date',
            'confirmed_at', 'created_at', 'updated_at'
        ]
    
    def validate_amount(self, value):
        """Validate contribution amount."""
        if value <= 0:
            raise serializers.ValidationError("Amount must be positive")
        if value > 1000000:  # 1M KES max
            raise serializers.ValidationError("Amount exceeds maximum limit")
        return value
```

---

## 4. Building ViewSets

### 4.1 Create ViewSets

```python
# apps/chamas/views.py
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import filters
from drf_spectacular.utils import extend_schema

from .models import Chama, Member, Contribution
from .serializers import (
    ChamaSerializer,
    ChamaCreateSerializer,
    MemberSerializer,
    ContributionSerializer
)
from .permissions import IsChamaChair, IsChamaMember


class ChamaViewSet(viewsets.ModelViewSet):
    """
    ViewSet for Chama CRUD operations.
    
    list: Get all chamas (only where user is a member)
    create: Create a new chama
    retrieve: Get chama details
    update: Update chama (chair only)
    destroy: Soft delete chama (chair only)
    """
    queryset = Chama.objects.all()
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['subscription_tier', 'is_active']
    search_fields = ['name', 'description']
    ordering_fields = ['created_at', 'name', 'balance']
    ordering = ['-created_at']
    
    def get_serializer_class(self):
        """Use different serializers for different actions."""
        if self.action == 'create':
            return ChamaCreateSerializer
        return ChamaSerializer
    
    def get_queryset(self):
        """
        Return only chamas where the user is a member.
        """
        user = self.request.user
        return Chama.objects.filter(
            members__user=user,
            members__is_active=True
        ).distinct()
    
    def get_permissions(self):
        """
        Set permissions based on action.
        """
        if self.action in ['update', 'partial_update', 'destroy']:
            permission_classes = [IsAuthenticated, IsChamaChair]
        else:
            permission_classes = [IsAuthenticated]
        return [permission() for permission in permission_classes]
    
    @extend_schema(
        description="Get members of this chama"
    )
    @action(detail=True, methods=['get'])
    def members(self, request, pk=None):
        """
        GET /api/v1/chamas/{id}/members/
        Get all members of a chama.
        """
        chama = self.get_object()
        members = chama.members.filter(is_active=True)
        serializer = MemberSerializer(members, many=True)
        return Response(serializer.data)
    
    @extend_schema(
        description="Get contributions for this chama"
    )
    @action(detail=True, methods=['get'])
    def contributions(self, request, pk=None):
        """
        GET /api/v1/chamas/{id}/contributions/
        Get all contributions for a chama.
        """
        chama = self.get_object()
        contributions = Contribution.objects.filter(
            member__chama=chama,
            status='CONFIRMED'
        )
        serializer = ContributionSerializer(contributions, many=True)
        return Response(serializer.data)


class MemberViewSet(viewsets.ModelViewSet):
    """
    ViewSet for Member CRUD operations.
    """
    queryset = Member.objects.all()
    serializer_class = MemberSerializer
    permission_classes = [IsAuthenticated, IsChamaMember]
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ['chama', 'role', 'is_active']
    ordering_fields = ['joined_date', 'credit_score', 'total_contributed']
    ordering = ['-joined_date']
    
    def get_queryset(self):
        """Filter members based on user's chamas."""
        user = self.request.user
        return Member.objects.filter(
            chama__members__user=user,
            chama__members__is_active=True
        ).distinct()


class ContributionViewSet(viewsets.ModelViewSet):
    """
    ViewSet for Contribution CRUD operations.
    """
    queryset = Contribution.objects.all()
    serializer_class = ContributionSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ['member', 'status']
    ordering_fields = ['contribution_date', 'amount']
    ordering = ['-contribution_date']
    
    def get_queryset(self):
        """Filter contributions based on user's memberships."""
        user = self.request.user
        return Contribution.objects.filter(
            member__chama__members__user=user,
            member__chama__members__is_active=True
        ).distinct()


# apps/chamas/urls.py
from rest_framework.routers import DefaultRouter
from .views import ChamaViewSet, MemberViewSet, ContributionViewSet

router = DefaultRouter()
router.register(r'chamas', ChamaViewSet, basename='chama')
router.register(r'members', MemberViewSet, basename='member')
router.register(r'contributions', ContributionViewSet, basename='contribution')

urlpatterns = router.urls
```

### 4.2 Update Main URLs

```python
# config/urls.py

urlpatterns = [
    # ... existing patterns ...
    
    # API v1
    path('api/v1/', include([
        path('', include('apps.core.urls')),
        path('auth/', include('apps.users.urls')),
        path('', include('apps.chamas.urls')),
    ])),
]
```

---

## 5. Custom Permissions

### 5.1 Create Permission Classes

```python
# apps/chamas/permissions.py
from rest_framework import permissions


class IsChamaChair(permissions.BasePermission):
    """
    Permission to only allow chama chairs to edit chama details.
    """
    message = "Only the chama chairperson can perform this action."
    
    def has_object_permission(self, request, view, obj):
        """Check if user is the chair of the chama."""
        # Read permissions are allowed for any member
        if request.method in permissions.SAFE_METHODS:
            return True
        
        # Write permissions only for chair
        return obj.chair == request.user


class IsChamaMember(permissions.BasePermission):
    """
    Permission to only allow chama members to view member details.
    """
    message = "You must be a member of this chama to perform this action."
    
    def has_object_permission(self, request, view, obj):
        """Check if user is a member of the chama."""
        return obj.chama.members.filter(
            user=request.user,
            is_active=True
        ).exists()


class IsChamaTreasurer(permissions.BasePermission):
    """
    Permission for treasurer-only actions.
    """
    message = "Only the chama treasurer can perform this action."
    
    def has_object_permission(self, request, view, obj):
        """Check if user is the treasurer."""
        return obj.treasurer == request.user
```

---

## 6. Throttling and Rate Limiting

### 6.1 Configure Throttling

```python
# config/settings/base.py

REST_FRAMEWORK = {
    # ... existing settings ...
    
    'DEFAULT_THROTTLE_CLASSES': [
        'rest_framework.throttling.AnonRateThrottle',
        'rest_framework.throttling.UserRateThrottle'
    ],
    'DEFAULT_THROTTLE_RATES': {
        'anon': '100/hour',  # Anonymous users
        'user': '1000/hour',  # Authenticated users
        'contribution': '10/minute',  # Contributions
    }
}
```

### 6.2 Custom Throttle Classes

```python
# apps/chamas/throttles.py
from rest_framework.throttling import UserRateThrottle


class ContributionThrottle(UserRateThrottle):
    """
    Throttle for contribution endpoints.
    Prevents spam contributions.
    """
    scope = 'contribution'
    rate = '10/minute'


# Use in views
class ContributionViewSet(viewsets.ModelViewSet):
    # ... existing code ...
    throttle_classes = [ContributionThrottle]
```

---

## 7. Filtering and Pagination

### 7.1 Install django-filter

```bash
pip install django-filter
echo "django-filter==23.5" >> requirements.txt
```

### 7.2 Configure Filtering

```python
# config/settings/base.py

INSTALLED_APPS = [
    # ... existing apps ...
    'django_filters',
]

REST_FRAMEWORK = {
    # ... existing settings ...
    'DEFAULT_FILTER_BACKENDS': [
        'django_filters.rest_framework.DjangoFilterBackend',
        'rest_framework.filters.SearchFilter',
        'rest_framework.filters.OrderingFilter',
    ],
}
```

---

## 8. Testing APIs

### 8.1 Test with cURL

```bash
# Register a new user
curl -X POST http://localhost:8000/api/v1/auth/register/ \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "SecurePass123!",
    "password_confirm": "SecurePass123!",
    "first_name": "John",
    "last_name": "Doe",
    "phone_number": "+254712345678"
  }'

# Login
curl -X POST http://localhost:8000/api/v1/auth/login/ \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "SecurePass123!"
  }'

# Use access token for authenticated requests
curl -X GET http://localhost:8000/api/v1/chamas/ \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

---

## 🎯 Next Steps

**Proceed to Guide 6:** [Production Features (Celery, Redis, Testing, CI/CD)](./06-production-features.md)

---

<div align="center">

**Built with ❤️ by [Phinehas Macharia](https://github.com/MachariaP)**

[⬅️ Previous: Models & Database](./04-models-database.md) | [Next: Production Features ➡️](./06-production-features.md)

</div>
