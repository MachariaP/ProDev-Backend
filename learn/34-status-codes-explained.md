# 🔢 Guide 34: Status Codes Explained - HTTP Response Codes Demystified

> **Duration:** 45-60 minutes  
> **Prerequisites:** Completed Guide 12 and Guide 13  
> **Outcome:** Master HTTP status codes and when to use each one

---

## 🎯 What You'll Learn

- What HTTP status codes are (explained simply)
- The five status code categories
- Common status codes you'll use daily
- When to use each status code
- REST API status code conventions
- Common mistakes with status codes
- DRF's status code constants
- Best practices

---

## 📋 Table of Contents

1. [Status Codes Basics (ELI5)](#1-status-codes-basics-eli5)
2. [The Five Categories](#2-the-five-categories)
3. [Success Codes (2xx)](#3-success-codes-2xx)
4. [Redirection Codes (3xx)](#4-redirection-codes-3xx)
5. [Client Error Codes (4xx)](#5-client-error-codes-4xx)
6. [Server Error Codes (5xx)](#6-server-error-codes-5xx)
7. [REST API Conventions](#7-rest-api-conventions)
8. [Common Mistakes](#8-common-mistakes)
9. [DRF Status Constants](#9-drf-status-constants)
10. [Best Practices](#10-best-practices)

---

## 1. Status Codes Basics (ELI5)

### 🤔 What is a Status Code?

**Simple answer**: A status code is a **3-digit number** that tells the client what happened with their request.

### 🎭 Real-World Analogy

**Analogy: Vending Machine** 🥤

```
You: Insert money and select Coke

Scenario 1: Success
Machine: *Dispenses Coke* "200 OK"
├── You got what you wanted!
└── Everything worked perfectly

Scenario 2: Item Out of Stock
Machine: *Shows message* "404 Not Found"
├── The item you wanted doesn't exist (or is out)
└── It's not the machine's fault

Scenario 3: Not Enough Money
Machine: *Rejects selection* "400 Bad Request"
├── You did something wrong (not enough money)
└── Try again with correct amount

Scenario 4: Machine Broken
Machine: *Error screen* "500 Internal Server Error"
├── Something inside the machine broke
└── It's the machine's fault, not yours
```

### 📊 The Pattern

Status codes follow a simple pattern:

```
1xx = Information     (Rare - "I'm thinking...")
2xx = Success         (Common - "All good!")
3xx = Redirection     (Occasional - "Look over there")
4xx = Client Error    (Common - "You did something wrong")
5xx = Server Error    (Rare - "I messed up")
```

---

## 2. The Five Categories

### 📋 Quick Reference

```
┌─────────────────────────────────────────────┐
│  1xx - Informational                        │
│  ├── 100 Continue                           │
│  ├── 101 Switching Protocols                │
│  └── 102 Processing                         │
├─────────────────────────────────────────────┤
│  2xx - Success ✅                           │
│  ├── 200 OK                                 │
│  ├── 201 Created                            │
│  ├── 202 Accepted                           │
│  ├── 204 No Content                         │
│  └── 206 Partial Content                    │
├─────────────────────────────────────────────┤
│  3xx - Redirection 🔄                       │
│  ├── 301 Moved Permanently                  │
│  ├── 302 Found (Temporary Redirect)         │
│  ├── 304 Not Modified                       │
│  └── 307 Temporary Redirect                 │
├─────────────────────────────────────────────┤
│  4xx - Client Error ❌                      │
│  ├── 400 Bad Request                        │
│  ├── 401 Unauthorized                       │
│  ├── 403 Forbidden                          │
│  ├── 404 Not Found                          │
│  ├── 405 Method Not Allowed                 │
│  ├── 409 Conflict                           │
│  ├── 422 Unprocessable Entity               │
│  └── 429 Too Many Requests                  │
├─────────────────────────────────────────────┤
│  5xx - Server Error 💥                      │
│  ├── 500 Internal Server Error              │
│  ├── 502 Bad Gateway                        │
│  ├── 503 Service Unavailable                │
│  └── 504 Gateway Timeout                    │
└─────────────────────────────────────────────┘
```

---

## 3. Success Codes (2xx)

### ✅ 200 OK - "Everything worked!"

**Use when**: Request succeeded and you're returning data

```python
from rest_framework import status
from rest_framework.response import Response

@api_view(['GET'])
def get_user(request, user_id):
    user = User.objects.get(id=user_id)
    serializer = UserSerializer(user)
    return Response(serializer.data, status=status.HTTP_200_OK)
    # Or just: return Response(serializer.data)
    # 200 is the default!
```

**Common uses**:
- ✅ GET request returning data
- ✅ PUT request updating a resource
- ✅ PATCH request partially updating a resource
- ✅ Any successful operation that returns data

---

### ✅ 201 Created - "New resource created!"

**Use when**: Successfully created a new resource

```python
@api_view(['POST'])
def create_user(request):
    serializer = UserSerializer(data=request.data)
    
    if serializer.is_valid():
        user = serializer.save()
        
        # 201 Created - resource was created
        response = Response(serializer.data, status=status.HTTP_201_CREATED)
        
        # Best practice: Include Location header
        response['Location'] = f'/api/users/{user.id}/'
        
        return response
    
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
```

**Common uses**:
- ✅ POST request creating a user
- ✅ POST request creating a blog post
- ✅ POST request creating any new resource

**Best practice**: Include a `Location` header pointing to the new resource!

---

### ✅ 202 Accepted - "I'll process this later!"

**Use when**: Request accepted but processing isn't complete

```python
@api_view(['POST'])
def generate_report(request):
    # Start background task
    task = generate_report_task.delay(
        user_id=request.user.id,
        report_type=request.data.get('type')
    )
    
    # 202 - Accepted for processing
    return Response({
        'message': 'Report generation started',
        'task_id': task.id,
        'status_url': f'/api/tasks/{task.id}/status/'
    }, status=status.HTTP_202_ACCEPTED)
```

**Common uses**:
- ✅ Background job started
- ✅ Async processing initiated
- ✅ Email queued for sending

---

### ✅ 204 No Content - "Done, but nothing to return!"

**Use when**: Request succeeded but there's no response body

```python
@api_view(['DELETE'])
def delete_user(request, user_id):
    user = User.objects.get(id=user_id)
    user.delete()
    
    # 204 - Success, no content to return
    return Response(status=status.HTTP_204_NO_CONTENT)

@api_view(['PUT'])
def mark_notification_read(request, notification_id):
    notification = Notification.objects.get(id=notification_id)
    notification.is_read = True
    notification.save()
    
    # 204 - Done, nothing to say
    return Response(status=status.HTTP_204_NO_CONTENT)
```

**Common uses**:
- ✅ DELETE request (resource deleted)
- ✅ PUT/PATCH when you don't return the updated resource
- ✅ Actions that don't need a response body

---

## 4. Redirection Codes (3xx)

### 🔄 301 Moved Permanently

**Use when**: Resource moved to new URL permanently

```python
from django.shortcuts import redirect

@api_view(['GET'])
def old_endpoint(request):
    # Old endpoint - redirect to new one
    return redirect('/api/v2/new-endpoint/', permanent=True)
    # Returns 301
```

---

### 🔄 302 Found (Temporary Redirect)

**Use when**: Resource temporarily at different URL

```python
@api_view(['GET'])
def temporary_redirect(request):
    # Temporarily redirect (might change back)
    return redirect('/api/temp-location/')
    # Returns 302
```

---

### 🔄 304 Not Modified

**Use when**: Resource hasn't changed since last request (caching)

```python
@api_view(['GET'])
def get_user(request, user_id):
    user = User.objects.get(id=user_id)
    
    # Check If-Modified-Since header
    if_modified_since = request.META.get('HTTP_IF_MODIFIED_SINCE')
    
    if if_modified_since and user.updated_at <= parse_date(if_modified_since):
        # Not modified since last request
        return Response(status=status.HTTP_304_NOT_MODIFIED)
    
    serializer = UserSerializer(user)
    response = Response(serializer.data)
    response['Last-Modified'] = user.updated_at.strftime('%a, %d %b %Y %H:%M:%S GMT')
    
    return response
```

---

## 5. Client Error Codes (4xx)

### ❌ 400 Bad Request - "You sent invalid data"

**Use when**: Client sent malformed or invalid data

```python
@api_view(['POST'])
def create_user(request):
    serializer = UserSerializer(data=request.data)
    
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    
    # 400 - Client sent invalid data
    return Response({
        'error': 'Invalid data provided',
        'details': serializer.errors
    }, status=status.HTTP_400_BAD_REQUEST)
```

**Common causes**:
- Missing required fields
- Invalid field format
- Failed validation
- Malformed JSON

---

### ❌ 401 Unauthorized - "Who are you?"

**Use when**: Authentication required but not provided or invalid

**Note**: Despite the name, 401 means "not authenticated", not "not authorized"!

```python
from rest_framework.permissions import IsAuthenticated

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def protected_view(request):
    # If user not authenticated, DRF automatically returns 401
    return Response({'message': 'You are authenticated!'})

# Manual 401
@api_view(['POST'])
def login(request):
    email = request.data.get('email')
    password = request.data.get('password')
    
    user = authenticate(email=email, password=password)
    
    if not user:
        # 401 - Authentication failed
        return Response({
            'error': 'Invalid credentials'
        }, status=status.HTTP_401_UNAUTHORIZED)
    
    # Login successful...
```

**Common causes**:
- No authentication token provided
- Invalid or expired token
- Wrong credentials

**Best practice**: Include `WWW-Authenticate` header

---

### ❌ 403 Forbidden - "I know who you are, but you can't do this"

**Use when**: User authenticated but doesn't have permission

```python
from rest_framework.permissions import IsAuthenticated

@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def delete_user(request, user_id):
    user = User.objects.get(id=user_id)
    
    # Check if user can delete this account
    if request.user.id != user.id and not request.user.is_staff:
        # 403 - Authenticated but not allowed
        return Response({
            'error': 'You do not have permission to delete this user'
        }, status=status.HTTP_403_FORBIDDEN)
    
    user.delete()
    return Response(status=status.HTTP_204_NO_CONTENT)
```

**401 vs 403**:
- **401**: "I don't know who you are" (not logged in)
- **403**: "I know who you are, but you can't do this" (no permission)

---

### ❌ 404 Not Found - "That doesn't exist"

**Use when**: Requested resource doesn't exist

```python
from django.shortcuts import get_object_or_404

@api_view(['GET'])
def get_user(request, user_id):
    try:
        user = User.objects.get(id=user_id)
    except User.DoesNotExist:
        # 404 - Resource not found
        return Response({
            'error': 'User not found'
        }, status=status.HTTP_404_NOT_FOUND)
    
    serializer = UserSerializer(user)
    return Response(serializer.data)

# Or use shortcut
@api_view(['GET'])
def get_user_shortcut(request, user_id):
    user = get_object_or_404(User, id=user_id)  # Auto 404 if not found
    serializer = UserSerializer(user)
    return Response(serializer.data)
```

---

### ❌ 405 Method Not Allowed - "Wrong HTTP method"

**Use when**: HTTP method not supported for this endpoint

```python
# DRF handles this automatically!

@api_view(['GET', 'POST'])  # Only GET and POST allowed
def user_list(request):
    if request.method == 'GET':
        # List users
        pass
    elif request.method == 'POST':
        # Create user
        pass

# If client sends PUT, PATCH, or DELETE:
# DRF automatically returns 405 Method Not Allowed
```

---

### ❌ 409 Conflict - "That creates a conflict"

**Use when**: Request conflicts with current state

```python
@api_view(['POST'])
def create_user(request):
    email = request.data.get('email')
    
    # Check if email already exists
    if User.objects.filter(email=email).exists():
        # 409 - Conflict (email already taken)
        return Response({
            'error': 'User with this email already exists'
        }, status=status.HTTP_409_CONFLICT)
    
    # Create user...
```

**Common uses**:
- Duplicate entries
- Concurrent modification conflicts
- Business logic conflicts

---

### ❌ 422 Unprocessable Entity - "I understand, but can't process"

**Use when**: Request is well-formed but semantically incorrect

```python
@api_view(['POST'])
def create_contribution(request):
    amount = request.data.get('amount')
    
    # Valid JSON, correct format, but business logic error
    if amount <= 0:
        # 422 - Valid request, invalid business logic
        return Response({
            'error': 'Amount must be greater than zero'
        }, status=status.HTTP_422_UNPROCESSABLE_ENTITY)
    
    # Create contribution...
```

**400 vs 422**:
- **400**: Malformed data (invalid JSON, wrong type)
- **422**: Well-formed data, but business logic error

---

### ❌ 429 Too Many Requests - "Slow down!"

**Use when**: Client exceeded rate limit

```python
from django_ratelimit.decorators import ratelimit
from django_ratelimit.exceptions import Ratelimited

@api_view(['POST'])
@ratelimit(key='ip', rate='5/m', method='POST')
def create_post(request):
    # Automatically returns 429 if rate limit exceeded
    # ...
```

---

## 6. Server Error Codes (5xx)

### 💥 500 Internal Server Error - "I messed up"

**Use when**: Unexpected server error

```python
@api_view(['GET'])
def buggy_view(request):
    try:
        # Your code
        result = do_something()
        return Response({'result': result})
    except Exception as e:
        # Log the error
        logger.error(f"Unexpected error: {str(e)}")
        
        # 500 - Server error
        return Response({
            'error': 'An unexpected error occurred'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
```

**Note**: In production, don't expose error details!

---

### 💥 503 Service Unavailable - "I'm down for maintenance"

**Use when**: Server temporarily unavailable

```python
@api_view(['GET'])
def health_check(request):
    # Check if database is available
    from django.db import connection
    
    try:
        connection.ensure_connection()
    except Exception:
        # 503 - Service unavailable
        return Response({
            'error': 'Database unavailable',
            'status': 'unhealthy'
        }, status=status.HTTP_503_SERVICE_UNAVAILABLE)
    
    return Response({'status': 'healthy'})
```

---

## 7. REST API Conventions

### 📋 Standard REST Operations

```python
# List all resources
@api_view(['GET'])
def list_resources(request):
    # Return: 200 OK
    pass

# Get single resource
@api_view(['GET'])
def retrieve_resource(request, pk):
    # Return: 200 OK or 404 Not Found
    pass

# Create new resource
@api_view(['POST'])
def create_resource(request):
    # Return: 201 Created or 400 Bad Request
    pass

# Update entire resource
@api_view(['PUT'])
def update_resource(request, pk):
    # Return: 200 OK, 404 Not Found, or 400 Bad Request
    pass

# Partial update
@api_view(['PATCH'])
def partial_update_resource(request, pk):
    # Return: 200 OK, 404 Not Found, or 400 Bad Request
    pass

# Delete resource
@api_view(['DELETE'])
def delete_resource(request, pk):
    # Return: 204 No Content or 404 Not Found
    pass
```

---

## 8. Common Mistakes

### ❌ Mistake 1: Using 200 for Everything

```python
# Bad ❌
@api_view(['POST'])
def create_user(request):
    if error:
        return Response({'error': 'Invalid'}, status=200)  # Wrong!
    # ...

# Good ✅
@api_view(['POST'])
def create_user(request):
    if error:
        return Response({'error': 'Invalid'}, status=400)  # Correct!
    # ...
```

---

### ❌ Mistake 2: Returning 404 for Everything Not Found

```python
# Bad ❌
@api_view(['POST'])
def login(request):
    user = User.objects.filter(email=email).first()
    if not user:
        return Response({'error': 'Not found'}, status=404)  # Wrong!
    # ...

# Good ✅
@api_view(['POST'])
def login(request):
    user = authenticate(email=email, password=password)
    if not user:
        return Response({'error': 'Invalid credentials'}, status=401)  # Correct!
    # ...
```

---

### ❌ Mistake 3: Confusing 401 and 403

```python
# Bad ❌
@api_view(['GET'])
def get_admin_panel(request):
    if not request.user.is_authenticated:
        return Response({'error': 'Forbidden'}, status=403)  # Wrong!
    # ...

# Good ✅
@api_view(['GET'])
def get_admin_panel(request):
    if not request.user.is_authenticated:
        return Response({'error': 'Authentication required'}, status=401)  # Correct!
    
    if not request.user.is_staff:
        return Response({'error': 'Forbidden'}, status=403)  # Correct!
    # ...
```

---

## 9. DRF Status Constants

### 📦 Using Status Constants

```python
from rest_framework import status

# Instead of magic numbers:
return Response(data, status=201)  # ❌ What does 201 mean?

# Use named constants:
return Response(data, status=status.HTTP_201_CREATED)  # ✅ Clear!
```

### 📋 All Available Constants

```python
# Success (2xx)
status.HTTP_200_OK
status.HTTP_201_CREATED
status.HTTP_202_ACCEPTED
status.HTTP_204_NO_CONTENT

# Redirection (3xx)
status.HTTP_301_MOVED_PERMANENTLY
status.HTTP_302_FOUND
status.HTTP_304_NOT_MODIFIED

# Client Errors (4xx)
status.HTTP_400_BAD_REQUEST
status.HTTP_401_UNAUTHORIZED
status.HTTP_403_FORBIDDEN
status.HTTP_404_NOT_FOUND
status.HTTP_405_METHOD_NOT_ALLOWED
status.HTTP_409_CONFLICT
status.HTTP_422_UNPROCESSABLE_ENTITY
status.HTTP_429_TOO_MANY_REQUESTS

# Server Errors (5xx)
status.HTTP_500_INTERNAL_SERVER_ERROR
status.HTTP_503_SERVICE_UNAVAILABLE
```

---

## 10. Best Practices

### ✅ 1. Use Appropriate Status Codes

```python
# Match the status code to the situation
@api_view(['GET', 'POST', 'DELETE'])
def resource_view(request, pk=None):
    if request.method == 'GET':
        if pk:
            # Single resource
            return Response(data, status=status.HTTP_200_OK)
        else:
            # List
            return Response(data, status=status.HTTP_200_OK)
    
    elif request.method == 'POST':
        # New resource created
        return Response(data, status=status.HTTP_201_CREATED)
    
    elif request.method == 'DELETE':
        # Resource deleted, no content
        return Response(status=status.HTTP_204_NO_CONTENT)
```

### ✅ 2. Include Error Details

```python
# Good error response
return Response({
    'error': 'Validation failed',
    'details': {
        'email': ['This field is required'],
        'age': ['Must be at least 18']
    }
}, status=status.HTTP_400_BAD_REQUEST)
```

### ✅ 3. Be Consistent

```python
# Consistent error format across your API
def error_response(message, details=None, status_code=400):
    response_data = {
        'success': False,
        'error': message
    }
    if details:
        response_data['details'] = details
    return Response(response_data, status=status_code)
```

---

## 🎓 Learning Checkpoint

1. **What status code should you return when creating a new user?**
   <details>
   <summary>Answer</summary>
   201 Created (status.HTTP_201_CREATED)
   </details>

2. **What's the difference between 401 and 403?**
   <details>
   <summary>Answer</summary>
   401 = Not authenticated (who are you?). 403 = Authenticated but not authorized (you can't do this).
   </details>

3. **What status code should you return when deleting a resource?**
   <details>
   <summary>Answer</summary>
   204 No Content (status.HTTP_204_NO_CONTENT)
   </details>

4. **When should you use 422 instead of 400?**
   <details>
   <summary>Answer</summary>
   422 when the request is well-formed but violates business logic. 400 when the request itself is malformed.
   </details>

---

## 🚀 Next Steps

You now understand:
- ✅ What HTTP status codes are and why they matter
- ✅ The five status code categories
- ✅ When to use each common status code
- ✅ REST API status code conventions
- ✅ Common mistakes to avoid
- ✅ DRF's status code constants
- ✅ Best practices for status codes

**Next**: Review other API guides for comprehensive knowledge!

---

<div align="center">

[⬅️ Previous: Exceptions](./33-exceptions-explained.md) | [🏠 Guide Index](./README.md)

**Star this repo if you found it helpful!** ⭐

</div>
