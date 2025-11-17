# 🔑 Guide 10: Authentication Explained - Security Made Simple

> **Duration:** 90-120 minutes  
> **Prerequisites:** Completed Guide 2 and Guide 5  
> **Outcome:** Deep understanding of authentication, JWT tokens, and security best practices

---

## 🎯 What You'll Learn

- What authentication actually means (explained like you're 5)
- How the internet remembers who you are
- Sessions vs Tokens (and why tokens won)
- JWT explained without jargon
- Implementing secure authentication in Django
- Refresh tokens and why they matter
- Security best practices that actually make sense
- Common authentication vulnerabilities and how to prevent them

---

## 📋 Table of Contents

1. [Authentication Basics (ELI5)](#1-authentication-basics-eli5)
2. [Sessions vs Tokens](#2-sessions-vs-tokens)
3. [What is JWT?](#3-what-is-jwt)
4. [Implementing JWT in Django](#4-implementing-jwt-in-django)
5. [Refresh Tokens Explained](#5-refresh-tokens-explained)
6. [Token Security Best Practices](#6-token-security-best-practices)
7. [OAuth and Social Login](#7-oauth-and-social-login)
8. [Common Security Mistakes](#8-common-security-mistakes)
9. [Password Security](#9-password-security)
10. [Testing Authentication](#10-testing-authentication)

---

## 1. Authentication Basics (ELI5)

### 🤔 What is Authentication?

**Simple answer**: Authentication is **proving you are who you say you are**.

### 🎭 Real-World Analogies

**Analogy 1: The Nightclub Bouncer** 🎪

```
You: "I'm on the VIP list!"
Bouncer: "Show me your ID"
You: *Shows ID*
Bouncer: *Checks list* "Yep, you're John Doe. Welcome in!"
```

- **Authentication** = Bouncer checking your ID
- **Authorization** = Bouncer checking if you're on the VIP list

**Analogy 2: Hotel Check-In** 🏨

```
Day 1:
You: "I have a reservation"
Receptionist: "Can I see your ID and credit card?"
You: *Shows documents*
Receptionist: "Great! Here's your room key card"

Days 2-5:
You: *Swipes room key*
Door: *Opens* (No need to show ID again!)
```

- **Login** = Hotel check-in (prove identity once)
- **Room key** = Auth token (use it repeatedly)
- **Checkout** = Logout (key stops working)

### 🔐 Authentication vs Authorization

| Authentication | Authorization |
|---------------|--------------|
| **Who are you?** | **What can you do?** |
| Proving identity | Checking permissions |
| Login with password | Accessing admin panel |
| "I'm John Doe" | "John is an admin" |

**Example**:
```python
# Authentication: User logs in
user = User.objects.get(email='john@example.com')
if user.check_password(password):
    # User authenticated ✅
    
    # Authorization: Check permissions
    if user.is_staff:
        # User authorized to access admin ✅
    else:
        # User NOT authorized ❌
```

### 🌐 How Websites Remember You

**Problem**: HTTP is **stateless** (each request is independent)

```
Request 1: "Show me my profile"
Server: "Who are you?"
You: "I'm John"
Server: "Ok, here's John's profile"

Request 2: "Show me my orders"
Server: "Who are you?" 🤔 (Forgot you're John!)
You: "I'm John... again?"
```

**Solution**: Include proof of identity with every request!

---

## 2. Sessions vs Tokens

Two main ways to remember users across requests.

### 🍪 Session-Based Authentication (Old Way)

**How it works**:

```
┌─────────────────────────────────────────┐
│  1. User logs in with password          │
└────────────┬────────────────────────────┘
             ↓
┌─────────────────────────────────────────┐
│  2. Server creates session               │
│     Session ID: "abc123"                 │
│     Stored in database/Redis             │
│     Session data: {user_id: 42}          │
└────────────┬────────────────────────────┘
             ↓
┌─────────────────────────────────────────┐
│  3. Server sends session ID in cookie    │
│     Set-Cookie: sessionid=abc123         │
└────────────┬────────────────────────────┘
             ↓
┌─────────────────────────────────────────┐
│  4. Browser stores cookie                │
│     Sends it with every request          │
└────────────┬────────────────────────────┘
             ↓
┌─────────────────────────────────────────┐
│  5. Server checks session ID             │
│     Looks up in database                 │
│     Finds user_id: 42                    │
│     "Ah, this is John!"                  │
└─────────────────────────────────────────┘
```

**Pros** ✅:
- Simple to implement
- Server controls everything
- Easy to revoke (just delete session)

**Cons** ❌:
- Server must store all sessions (memory/database)
- Doesn't scale well (millions of users = millions of sessions)
- Difficult for mobile apps
- Doesn't work well with microservices

### 🎫 Token-Based Authentication (Modern Way)

**How it works**:

```
┌─────────────────────────────────────────┐
│  1. User logs in with password          │
└────────────┬────────────────────────────┘
             ↓
┌─────────────────────────────────────────┐
│  2. Server creates JWT token             │
│     Token contains: {user_id: 42}        │
│     Signed with secret key               │
│     Token: "eyJhbGci..."                 │
└────────────┬────────────────────────────┘
             ↓
┌─────────────────────────────────────────┐
│  3. Server sends token to client         │
│     Response: {token: "eyJhbGci..."}     │
└────────────┬────────────────────────────┘
             ↓
┌─────────────────────────────────────────┐
│  4. Client stores token                  │
│     (localStorage, memory, etc.)         │
│     Sends with every request:            │
│     Authorization: Bearer eyJhbGci...    │
└────────────┬────────────────────────────┘
             ↓
┌─────────────────────────────────────────┐
│  5. Server verifies token signature      │
│     Decodes token                        │
│     "This token says user_id: 42"        │
│     "Signature is valid ✅"              │
│     "Token not expired ✅"               │
└─────────────────────────────────────────┘
```

**Pros** ✅:
- Server doesn't store anything (stateless)
- Scales infinitely
- Works great for mobile apps
- Works across multiple services
- Industry standard

**Cons** ❌:
- Harder to revoke immediately
- Token theft is more dangerous
- Slightly larger (sent with every request)

### 📊 Comparison Table

| Feature | Sessions | Tokens (JWT) |
|---------|----------|-------------|
| **Storage** | Server stores sessions | No server storage |
| **Scalability** | ❌ Limited | ✅ Infinite |
| **Mobile apps** | ⚠️ Difficult | ✅ Easy |
| **Microservices** | ❌ Hard | ✅ Perfect |
| **Revocation** | ✅ Instant | ⚠️ Delayed |
| **Size** | Small cookie | Larger token |
| **Industry trend** | 📉 Declining | 📈 Growing |

**Verdict**: Use **tokens (JWT)** for modern APIs! 🏆

---

## 3. What is JWT?

**JWT** = **J**SON **W**eb **T**oken

### 🎁 JWT Structure

A JWT looks like this:
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjo0MiwiZXhwIjoxNzAwMDAwMDAwfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c
```

**Looks scary?** It's actually 3 parts separated by dots (`.`):

```
HEADER.PAYLOAD.SIGNATURE
```

Let's decode each part!

#### Part 1: Header

```json
{
  "alg": "HS256",  // Algorithm used for signing
  "typ": "JWT"     // Type: JWT
}
```

**What it means**: "This is a JWT, signed with HS256 algorithm"

#### Part 2: Payload (The Important Bit!)

```json
{
  "user_id": 42,           // Who you are
  "email": "john@example.com",
  "exp": 1700000000,       // Expiration time (Unix timestamp)
  "iat": 1699990000        // Issued at time
}
```

**What it means**: This token belongs to user 42, expires at timestamp X

⚠️ **Important**: Anyone can decode this! Don't put passwords here!

#### Part 3: Signature (The Security!)

```
HMACSHA256(
  base64UrlEncode(header) + "." + base64UrlEncode(payload),
  your-secret-key
)
```

**What it means**: Proof this token wasn't tampered with

**How it protects you**:
1. Hacker steals token
2. Hacker changes `user_id: 42` to `user_id: 1` (admin!)
3. Hacker tries to use modified token
4. Server recalculates signature
5. Signatures don't match! ❌
6. Server rejects token

### 🔍 Decoding a JWT (Try It!)

Visit [jwt.io](https://jwt.io) and paste a JWT:

```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjo0MiwiZW1haWwiOiJqb2huQGV4YW1wbGUuY29tIn0.FW8Vw5LmVjR3XJQzDy9F7J0qY5H7LkP8n4xZJmT7Vso
```

You'll see:
```json
{
  "user_id": 42,
  "email": "john@example.com"
}
```

**See?** Not encrypted, just **encoded**! Anyone can read it.

**The signature prevents tampering**, not reading.

### 🎯 JWT Best Practices

✅ **Do**:
- Keep tokens short-lived (15 minutes)
- Store sensitive data on server, not in token
- Use HTTPS always
- Validate expiration times

❌ **Don't**:
- Put passwords in tokens
- Make tokens live forever
- Store tokens in localStorage (vulnerable to XSS)
- Share your secret key

---

## 4. Implementing JWT in Django

We'll use **Simple JWT** (industry standard for Django).

### 📦 Installation

```bash
pip install djangorestframework-simplejwt
```

### ⚙️ Configuration

```python
# config/settings/base.py

from datetime import timedelta

INSTALLED_APPS = [
    # ...
    'rest_framework',
    'rest_framework_simplejwt',
    'rest_framework_simplejwt.token_blacklist',  # For logout
]

REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': (
        'rest_framework_simplejwt.authentication.JWTAuthentication',
    ),
}

SIMPLE_JWT = {
    # Access token expires in 15 minutes
    'ACCESS_TOKEN_LIFETIME': timedelta(minutes=15),
    
    # Refresh token expires in 7 days
    'REFRESH_TOKEN_LIFETIME': timedelta(days=7),
    
    # Generate new refresh token when used
    'ROTATE_REFRESH_TOKENS': True,
    
    # Blacklist old tokens
    'BLACKLIST_AFTER_ROTATION': True,
    
    # Update user's last_login
    'UPDATE_LAST_LOGIN': True,
    
    # Algorithm for signing
    'ALGORITHM': 'HS256',
    
    # Secret key (from settings)
    'SIGNING_KEY': SECRET_KEY,
    
    # Header type
    'AUTH_HEADER_TYPES': ('Bearer',),
}
```

### 🔌 URL Configuration

```python
# config/urls.py

from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
    TokenVerifyView,
)

urlpatterns = [
    # Get access and refresh tokens
    path('api/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    
    # Refresh access token
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    
    # Verify token is valid
    path('api/token/verify/', TokenVerifyView.as_view(), name='token_verify'),
]
```

### 🎯 Usage Examples

#### 1. Login (Get Tokens)

```bash
curl -X POST http://localhost:8000/api/token/ \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "securepass123"
  }'
```

**Response**:
```json
{
  "access": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refresh": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

#### 2. Use Access Token

```bash
curl http://localhost:8000/api/users/me/ \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

#### 3. Refresh When Access Token Expires

```bash
curl -X POST http://localhost:8000/api/token/refresh/ \
  -H "Content-Type: application/json" \
  -d '{
    "refresh": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }'
```

**Response**:
```json
{
  "access": "eyJhbGciOiJIUzI1NiIsInR5cCI... (NEW TOKEN)"
}
```

### 🛡️ Protecting Views

```python
# views.py

from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response

@api_view(['GET'])
@permission_classes([IsAuthenticated])  # Requires JWT token
def protected_view(request):
    """Only authenticated users can access this."""
    user = request.user
    return Response({
        'message': f'Hello, {user.email}!',
        'user_id': user.id,
    })
```

**Try without token**:
```bash
curl http://localhost:8000/api/protected/

# Response:
{
  "detail": "Authentication credentials were not provided."
}
```

**Try with valid token**:
```bash
curl http://localhost:8000/api/protected/ \
  -H "Authorization: Bearer eyJhbGci..."

# Response:
{
  "message": "Hello, john@example.com!",
  "user_id": 42
}
```

---

## 5. Refresh Tokens Explained

### 🤔 Why Two Tokens?

**Problem**: If access tokens live forever → Big security risk if stolen!

**Solution**: Two-token system!

```
Access Token (Short-lived: 15 min)
├── Used for API requests
├── Sent with every request
├── If stolen, only valid for 15 min
└── Low risk if compromised

Refresh Token (Long-lived: 7 days)
├── Used ONLY to get new access tokens
├── Sent rarely (only when access expires)
├── Stored more securely
└── Can be blacklisted if compromised
```

### 🔄 Token Refresh Flow

```
Day 1, 10:00 AM
User logs in
Server gives:
  - Access token (expires 10:15 AM)
  - Refresh token (expires in 7 days)

10:00-10:15 AM
User makes API requests with access token ✅

10:15 AM
Access token expires! ❌

User sends refresh token
Server validates refresh token ✅
Server gives NEW access token (expires 10:30 AM)

10:15-10:30 AM
User makes API requests with NEW access token ✅

Repeat...
```

### 🔐 Token Rotation

**Problem**: What if refresh token is stolen?

**Solution**: Rotate refresh tokens!

```python
SIMPLE_JWT = {
    'ROTATE_REFRESH_TOKENS': True,  # Generate new refresh token each time
    'BLACKLIST_AFTER_ROTATION': True,  # Invalidate old refresh token
}
```

**How it works**:

```
Request: Refresh my access token
Server:
  1. Validates old refresh token ✅
  2. Generates NEW access token
  3. Generates NEW refresh token
  4. Blacklists old refresh token ❌
  5. Returns new access + new refresh

Old refresh token is now useless!
If attacker tries to use it → Rejected! ❌
```

### 🗑️ Logout Implementation

```python
# views.py

from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def logout_view(request):
    """Logout by blacklisting refresh token."""
    try:
        refresh_token = request.data["refresh"]
        token = RefreshToken(refresh_token)
        token.blacklist()  # Add to blacklist
        
        return Response({"detail": "Successfully logged out."}, status=200)
    except Exception as e:
        return Response({"detail": "Invalid token."}, status=400)
```

**Usage**:
```bash
curl -X POST http://localhost:8000/api/logout/ \
  -H "Authorization: Bearer {access_token}" \
  -H "Content-Type: application/json" \
  -d '{"refresh": "{refresh_token}"}'
```

---

## 6. Token Security Best Practices

### 🔒 Where to Store Tokens?

| Storage Location | Security | Pros | Cons |
|------------------|----------|------|------|
| **HTTP-only Cookie** | ✅✅✅ Best | Immune to XSS | Complex setup |
| **Memory (React state)** | ✅✅ Good | Immune to XSS | Lost on refresh |
| **localStorage** | ❌ Vulnerable | Persists | Vulnerable to XSS |
| **sessionStorage** | ⚠️ Medium | Auto-clears | Still vulnerable to XSS |

**Recommended**: HTTP-only cookies (most secure)

```python
# views.py - Return token in HTTP-only cookie

from rest_framework_simplejwt.tokens import RefreshToken

def login_view(request):
    # ... authenticate user ...
    
    refresh = RefreshToken.for_user(user)
    access = str(refresh.access_token)
    
    response = Response({'detail': 'Login successful'})
    
    # Set access token in HTTP-only cookie
    response.set_cookie(
        key='access_token',
        value=access,
        httponly=True,  # JavaScript can't access it
        secure=True,    # Only sent over HTTPS
        samesite='Strict',  # CSRF protection
        max_age=15 * 60,  # 15 minutes
    )
    
    # Set refresh token
    response.set_cookie(
        key='refresh_token',
        value=str(refresh),
        httponly=True,
        secure=True,
        samesite='Strict',
        max_age=7 * 24 * 60 * 60,  # 7 days
    )
    
    return response
```

### 🛡️ HTTPS is Mandatory

**Never send tokens over HTTP!**

```python
# Production settings
SECURE_SSL_REDIRECT = True  # Redirect HTTP to HTTPS
SESSION_COOKIE_SECURE = True  # Cookies only via HTTPS
CSRF_COOKIE_SECURE = True
```

### ⏰ Token Expiration Times

**Recommended**:

```python
SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(minutes=15),  # Short!
    'REFRESH_TOKEN_LIFETIME': timedelta(days=7),     # Longer
}
```

**Why short access tokens?**
- If stolen, expires quickly
- Reduces attack window
- Refresh token handles long-term authentication

### 🚫 Token Blacklisting

Run migrations for blacklist:

```bash
python manage.py migrate token_blacklist
```

When user logs out or security issue detected:

```python
from rest_framework_simplejwt.tokens import RefreshToken

# Blacklist specific token
token = RefreshToken(token_string)
token.blacklist()

# Blacklist all user's tokens (force re-login)
from rest_framework_simplejwt.token_blacklist.models import OutstandingToken

OutstandingToken.objects.filter(user=user).delete()
```

---

## 7. OAuth and Social Login

### 🤔 What is OAuth?

**OAuth** = Let users login with Google, Facebook, etc.

**Analogy**: Valet parking 🚗

```
You (User): "Here are my car keys"
Valet (OAuth Provider - Google): "I'll park it"
You get a ticket (Access Token)
You use ticket to get car back (Access protected resources)

You didn't give your house keys!
Google didn't get your password!
```

### 🔄 OAuth Flow (Simplified)

```
1. User clicks "Login with Google"
   ↓
2. Redirect to Google login page
   ↓
3. User logs into Google
   ↓
4. Google asks: "Allow ChamaHub to access your profile?"
   User: "Yes"
   ↓
5. Google redirects back to your app with CODE
   ↓
6. Your server exchanges CODE for ACCESS TOKEN
   ↓
7. Use access token to get user's Google profile
   ↓
8. Create/login user in your database
```

### 📦 Implementation with django-allauth

```bash
pip install django-allauth
```

```python
# settings.py

INSTALLED_APPS = [
    # ...
    'django.contrib.sites',
    'allauth',
    'allauth.account',
    'allauth.socialaccount',
    'allauth.socialaccount.providers.google',
]

SITE_ID = 1

SOCIALACCOUNT_PROVIDERS = {
    'google': {
        'SCOPE': [
            'profile',
            'email',
        ],
        'AUTH_PARAMS': {
            'access_type': 'online',
        }
    }
}
```

**Add social login buttons**:

```html
{% load socialaccount %}

<a href="{% provider_login_url 'google' %}">
    Login with Google
</a>
```

---

## 8. Common Security Mistakes

### ❌ Mistake 1: Storing Passwords in Plain Text

**Bad**:
```python
user.password = request.data['password']  # DON'T!
```

**Good**:
```python
user.set_password(request.data['password'])  # Hashed!
```

### ❌ Mistake 2: Tokens in localStorage (XSS Risk)

**Bad**:
```javascript
localStorage.setItem('token', token);  // Vulnerable!
```

**Good**:
```javascript
// Store in memory or HTTP-only cookies
```

### ❌ Mistake 3: No Token Expiration

**Bad**:
```python
'ACCESS_TOKEN_LIFETIME': timedelta(days=365),  # One year!?
```

**Good**:
```python
'ACCESS_TOKEN_LIFETIME': timedelta(minutes=15),
```

### ❌ Mistake 4: Using HTTP (Not HTTPS)

**Bad**:
```
http://chamahub.co.ke  # Tokens visible to attackers!
```

**Good**:
```
https://chamahub.co.ke  # Encrypted!
```

### ❌ Mistake 5: Weak Secret Keys

**Bad**:
```python
SECRET_KEY = 'django-insecure-123'
```

**Good**:
```bash
# Generate strong secret
python -c 'from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())'
```

---

## 9. Password Security

### 🔐 Password Hashing

Django uses **PBKDF2** (good), but **Argon2** is better:

```bash
pip install django[argon2]
```

```python
# settings.py

PASSWORD_HASHERS = [
    'django.contrib.auth.hashers.Argon2PasswordHasher',  # Best!
    'django.contrib.auth.hashers.PBKDF2PasswordHasher',  # Fallback
    'django.contrib.auth.hashers.PBKDF2SHA1PasswordHasher',
]
```

### ✅ Password Validation

```python
# settings.py

AUTH_PASSWORD_VALIDATORS = [
    {
        'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator',
        # Prevents: password = "john123" when username = "john"
    },
    {
        'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator',
        'OPTIONS': {'min_length': 12},  # Minimum 12 characters
    },
    {
        'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator',
        # Prevents: "password", "123456", etc.
    },
    {
        'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator',
        # Prevents: "123456789"
    },
]
```

### 🛡️ Rate Limiting Login Attempts

Prevent brute force attacks:

```python
# Install django-ratelimit
pip install django-ratelimit
```

```python
from django_ratelimit.decorators import ratelimit

@ratelimit(key='ip', rate='5/m', method='POST')  # 5 attempts per minute
@api_view(['POST'])
def login_view(request):
    # ...
    pass
```

---

## 10. Testing Authentication

### 🧪 Test User Registration

```python
# tests/test_auth.py

from django.test import TestCase
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient

User = get_user_model()

class AuthenticationTest(TestCase):
    def setUp(self):
        self.client = APIClient()
    
    def test_user_registration(self):
        """Test user can register."""
        response = self.client.post('/api/register/', {
            'email': 'john@example.com',
            'password': 'SecurePass123!',
            'password_confirm': 'SecurePass123!',
            'first_name': 'John',
            'last_name': 'Doe',
        })
        
        self.assertEqual(response.status_code, 201)
        self.assertTrue(User.objects.filter(email='john@example.com').exists())
    
    def test_user_login(self):
        """Test user can login and receive tokens."""
        # Create user
        user = User.objects.create_user(
            email='john@example.com',
            password='SecurePass123!'
        )
        
        # Login
        response = self.client.post('/api/token/', {
            'email': 'john@example.com',
            'password': 'SecurePass123!',
        })
        
        self.assertEqual(response.status_code, 200)
        self.assertIn('access', response.data)
        self.assertIn('refresh', response.data)
    
    def test_access_protected_endpoint(self):
        """Test accessing protected endpoint with valid token."""
        # Create user and get token
        user = User.objects.create_user(
            email='john@example.com',
            password='SecurePass123!'
        )
        
        response = self.client.post('/api/token/', {
            'email': 'john@example.com',
            'password': 'SecurePass123!',
        })
        
        token = response.data['access']
        
        # Access protected endpoint
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {token}')
        response = self.client.get('/api/protected/')
        
        self.assertEqual(response.status_code, 200)
    
    def test_token_refresh(self):
        """Test refreshing access token."""
        user = User.objects.create_user(
            email='john@example.com',
            password='SecurePass123!'
        )
        
        # Get tokens
        response = self.client.post('/api/token/', {
            'email': 'john@example.com',
            'password': 'SecurePass123!',
        })
        
        refresh_token = response.data['refresh']
        
        # Refresh
        response = self.client.post('/api/token/refresh/', {
            'refresh': refresh_token,
        })
        
        self.assertEqual(response.status_code, 200)
        self.assertIn('access', response.data)
```

---

## 🎓 Learning Checkpoint

1. **What's the difference between authentication and authorization?**
   <details>
   <summary>Answer</summary>
   Authentication = Proving who you are (login). Authorization = What you're allowed to do (permissions).
   </details>

2. **Why use tokens instead of sessions?**
   <details>
   <summary>Answer</summary>
   Tokens are stateless (server doesn't store anything), scale better, work great for mobile/APIs, and are industry standard.
   </details>

3. **What are the 3 parts of a JWT?**
   <details>
   <summary>Answer</summary>
   Header (algorithm info), Payload (user data), Signature (prevents tampering).
   </details>

4. **Why have both access and refresh tokens?**
   <details>
   <summary>Answer</summary>
   Access tokens are short-lived (less risky if stolen). Refresh tokens get new access tokens without re-entering password.
   </details>

---

## 🚀 Next Steps

You now understand:
- ✅ How authentication works
- ✅ Sessions vs Tokens
- ✅ JWT structure and security
- ✅ Implementing JWT in Django
- ✅ Refresh tokens and rotation
- ✅ Security best practices
- ✅ Common vulnerabilities

**Next**: [Serializers & Validation →](./11-serializers-explained.md)

---

<div align="center">

[⬅️ Previous: PostgreSQL](./09-postgresql-deep-dive.md) | [🏠 Guide Index](./README.md) | [➡️ Next: Serializers](./11-serializers-explained.md)

**Star this repo if you found it helpful!** ⭐

</div>
