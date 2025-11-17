# 🌐 Guide 12: Requests Explained - Understanding API Requests

> **Duration:** 60-90 minutes  
> **Prerequisites:** Completed Guide 2 and Guide 11  
> **Outcome:** Master request handling in Django REST Framework

---

## 🎯 What You'll Learn

- What HTTP requests are (explained simply)
- DRF Request objects vs Django's HttpRequest
- Accessing request data
- Content negotiation
- Request parsers
- Working with different data formats
- File uploads
- Authentication from requests
- Best practices for request handling

---

## 📋 Table of Contents

1. [Requests Basics (ELI5)](#1-requests-basics-eli5)
2. [DRF Request vs Django HttpRequest](#2-drf-request-vs-django-httprequest)
3. [Accessing Request Data](#3-accessing-request-data)
4. [Request Methods](#4-request-methods)
5. [Content Negotiation](#5-content-negotiation)
6. [Request Parsers](#6-request-parsers)
7. [File Uploads](#7-file-uploads)
8. [Request Authentication](#8-request-authentication)
9. [Request Context](#9-request-context)
10. [Common Patterns](#10-common-patterns)

---

## 1. Requests Basics (ELI5)

### 🤔 What is a Request?

**Simple answer**: A request is a **message** sent from a client (browser, mobile app) to your server asking for something.

### 🎭 Real-World Analogy

**Analogy: Ordering at a Restaurant** 🍽️

```
You (Client): "Can I have a burger with fries?"
├── HTTP Method: GET (asking for something)
├── Path: /menu/burger
├── Headers: "I want English menu" (Accept-Language)
└── Body: "No onions please" (request data)

Waiter (Server): Processes your request
├── Checks if burger is available
├── Validates your special requests
├── Prepares your order
└── Returns response (your food!)
```

### 📨 Request Components

Every HTTP request has:

```
POST /api/users/ HTTP/1.1                    ← Request Line
Host: chamahub.co.ke                         ← Headers
Content-Type: application/json               ← Headers
Authorization: Bearer eyJhbGci...            ← Headers
                                             ← Blank line
{                                            ← Body
  "email": "john@example.com",
  "password": "SecurePass123"
}
```

---

## 2. DRF Request vs Django HttpRequest

### 🔄 Django HttpRequest (Basic)

```python
# Django view using HttpRequest
from django.http import HttpRequest, JsonResponse

def django_view(request: HttpRequest):
    # Limited functionality
    method = request.method  # GET, POST, etc.
    get_data = request.GET  # Query parameters
    post_data = request.POST  # Form data only!
    
    # No automatic JSON parsing! You need to:
    import json
    if request.content_type == 'application/json':
        body = json.loads(request.body)
    
    return JsonResponse({'message': 'Hello'})
```

### ✨ DRF Request (Enhanced)

```python
# DRF view using Request
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework.request import Request

@api_view(['POST'])
def drf_view(request: Request):
    # Enhanced functionality!
    method = request.method
    
    # Automatic parsing - works with JSON, form data, multipart, etc.
    data = request.data  # ✨ Magic! Already parsed!
    
    # Query parameters (same as Django)
    query_params = request.query_params
    
    # Authentication
    user = request.user  # Authenticated user (if any)
    auth = request.auth  # Auth credentials (token, etc.)
    
    # Negotiation
    accepted_renderer = request.accepted_renderer
    accepted_media_type = request.accepted_media_type
    
    return Response({'message': 'Hello', 'data': data})
```

### 📊 Comparison Table

| Feature | Django HttpRequest | DRF Request |
|---------|-------------------|-------------|
| **JSON parsing** | ❌ Manual | ✅ Automatic |
| **Form data** | ✅ Yes | ✅ Yes |
| **Multipart data** | ✅ Yes | ✅ Yes |
| **Content negotiation** | ❌ No | ✅ Yes |
| **Authentication** | ⚠️ Basic | ✅ Advanced |
| **Unified data access** | ❌ No | ✅ `request.data` |
| **Parser classes** | ❌ No | ✅ Yes |

---

## 3. Accessing Request Data

### 📥 request.data

The most important attribute! Works with any content type.

```python
@api_view(['POST'])
def create_user(request):
    # request.data works with JSON, form data, multipart, etc.
    email = request.data.get('email')
    password = request.data.get('password')
    first_name = request.data.get('first_name')
    
    # Or access like a dict
    data = request.data
    # data = {
    #     'email': 'john@example.com',
    #     'password': 'SecurePass123',
    #     'first_name': 'John'
    # }
    
    # Use with serializers
    serializer = UserSerializer(data=request.data)
    if serializer.is_valid():
        user = serializer.save()
        return Response({'id': user.id}, status=201)
    
    return Response(serializer.errors, status=400)
```

### 🔍 request.query_params

Access URL query parameters (the `?key=value` part):

```python
@api_view(['GET'])
def list_users(request):
    # URL: /api/users/?role=admin&active=true&page=2
    
    role = request.query_params.get('role')  # 'admin'
    active = request.query_params.get('active')  # 'true'
    page = request.query_params.get('page', 1)  # 2 (or 1 as default)
    
    # Filter based on params
    users = User.objects.all()
    
    if role:
        users = users.filter(role=role)
    
    if active == 'true':
        users = users.filter(is_active=True)
    
    # Pagination
    from django.core.paginator import Paginator
    paginator = Paginator(users, 10)
    users_page = paginator.get_page(page)
    
    serializer = UserSerializer(users_page, many=True)
    return Response(serializer.data)
```

**Note**: `request.query_params` is the same as Django's `request.GET`, but with a clearer name!

### 🎯 request.FILES

Access uploaded files:

```python
@api_view(['POST'])
def upload_avatar(request):
    # Accessing uploaded file
    avatar = request.FILES.get('avatar')
    
    if avatar:
        # File attributes
        print(f"Filename: {avatar.name}")
        print(f"Size: {avatar.size} bytes")
        print(f"Content type: {avatar.content_type}")
        
        # Save to user
        user = request.user
        user.avatar = avatar
        user.save()
        
        return Response({'message': 'Avatar uploaded successfully'})
    
    return Response({'error': 'No file provided'}, status=400)
```

### 👤 request.user

Access the authenticated user:

```python
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import permission_classes

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_profile(request):
    # request.user is the authenticated User instance
    user = request.user
    
    return Response({
        'id': user.id,
        'email': user.email,
        'first_name': user.first_name,
        'last_name': user.last_name,
        'is_staff': user.is_staff
    })

@api_view(['POST'])
def create_contribution(request):
    # For unauthenticated requests, request.user is AnonymousUser
    if request.user.is_authenticated:
        contribution = Contribution.objects.create(
            user=request.user,
            amount=request.data.get('amount')
        )
        return Response({'id': contribution.id}, status=201)
    
    return Response({'error': 'Authentication required'}, status=401)
```

### 🔑 request.auth

Access authentication credentials (token, session, etc.):

```python
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def check_auth(request):
    # For JWT authentication, this is the token
    auth_token = request.auth
    
    return Response({
        'user': request.user.email,
        'token_type': type(request.auth).__name__,
        'authenticated': True
    })
```

---

## 4. Request Methods

### 📝 Accessing HTTP Method

```python
@api_view(['GET', 'POST', 'PUT', 'DELETE'])
def flexible_view(request):
    method = request.method  # 'GET', 'POST', 'PUT', or 'DELETE'
    
    if method == 'GET':
        return Response({'message': 'This is a GET request'})
    
    elif method == 'POST':
        return Response({'message': 'This is a POST request'})
    
    elif method == 'PUT':
        return Response({'message': 'This is a PUT request'})
    
    elif method == 'DELETE':
        return Response({'message': 'This is a DELETE request'})
```

### 🎯 Common HTTP Methods

```python
# GET - Retrieve data
@api_view(['GET'])
def list_chamas(request):
    chamas = Chama.objects.all()
    serializer = ChamaSerializer(chamas, many=True)
    return Response(serializer.data)

# POST - Create new resource
@api_view(['POST'])
def create_chama(request):
    serializer = ChamaSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=201)
    return Response(serializer.errors, status=400)

# PUT - Update entire resource
@api_view(['PUT'])
def update_chama(request, pk):
    chama = Chama.objects.get(pk=pk)
    serializer = ChamaSerializer(chama, data=request.data)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data)
    return Response(serializer.errors, status=400)

# PATCH - Partial update
@api_view(['PATCH'])
def partial_update_chama(request, pk):
    chama = Chama.objects.get(pk=pk)
    serializer = ChamaSerializer(chama, data=request.data, partial=True)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data)
    return Response(serializer.errors, status=400)

# DELETE - Remove resource
@api_view(['DELETE'])
def delete_chama(request, pk):
    chama = Chama.objects.get(pk=pk)
    chama.delete()
    return Response(status=204)
```

---

## 5. Content Negotiation

### 🤝 What is Content Negotiation?

**Simple answer**: The client and server **agree** on what format to use for communication.

```python
@api_view(['GET'])
def get_user(request, pk):
    user = User.objects.get(pk=pk)
    
    # Client sends: Accept: application/json
    # Server responds with JSON
    
    # Client sends: Accept: application/xml
    # Server responds with XML
    
    # DRF handles this automatically!
    serializer = UserSerializer(user)
    return Response(serializer.data)
```

### 📋 Accepted Media Type

```python
@api_view(['GET'])
def check_accept(request):
    # What format did the client request?
    media_type = request.accepted_media_type  # 'application/json'
    renderer = request.accepted_renderer  # JSONRenderer
    
    return Response({
        'accepted_media_type': media_type,
        'renderer': renderer.__class__.__name__
    })
```

---

## 6. Request Parsers

### 🔧 What are Parsers?

**Parsers** convert incoming request data into Python data types.

### 📦 Default Parsers

```python
# settings.py

REST_FRAMEWORK = {
    'DEFAULT_PARSER_CLASSES': [
        'rest_framework.parsers.JSONParser',  # application/json
        'rest_framework.parsers.FormParser',  # application/x-www-form-urlencoded
        'rest_framework.parsers.MultiPartParser',  # multipart/form-data
    ]
}
```

### 🎯 Using Specific Parsers

```python
from rest_framework.parsers import JSONParser, MultiPartParser, FormParser
from rest_framework.decorators import api_view, parser_classes

@api_view(['POST'])
@parser_classes([JSONParser])  # Only accept JSON
def json_only_view(request):
    # This view only accepts JSON data
    data = request.data
    return Response({'received': data})

@api_view(['POST'])
@parser_classes([MultiPartParser])  # Only accept file uploads
def upload_file(request):
    file = request.FILES.get('file')
    if file:
        return Response({'filename': file.name, 'size': file.size})
    return Response({'error': 'No file provided'}, status=400)

@api_view(['POST'])
@parser_classes([JSONParser, FormParser, MultiPartParser])
def flexible_view(request):
    # Accept JSON, form data, or multipart
    data = request.data
    files = request.FILES
    
    return Response({
        'data': data,
        'files': list(files.keys())
    })
```

### 🎨 Custom Parser

```python
from rest_framework.parsers import BaseParser
import yaml

class YAMLParser(BaseParser):
    """
    Parser for YAML data.
    """
    media_type = 'application/yaml'
    
    def parse(self, stream, media_type=None, parser_context=None):
        """
        Parse YAML input.
        """
        return yaml.safe_load(stream)

# Use it
@api_view(['POST'])
@parser_classes([YAMLParser])
def yaml_view(request):
    data = request.data  # Parsed from YAML
    return Response({'received': data})
```

---

## 7. File Uploads

### 📁 Single File Upload

```python
@api_view(['POST'])
@parser_classes([MultiPartParser])
def upload_avatar(request):
    avatar = request.FILES.get('avatar')
    
    if not avatar:
        return Response({'error': 'No file provided'}, status=400)
    
    # Validate file type
    if not avatar.content_type.startswith('image/'):
        return Response({'error': 'File must be an image'}, status=400)
    
    # Validate file size (5MB max)
    if avatar.size > 5 * 1024 * 1024:
        return Response({'error': 'File too large (max 5MB)'}, status=400)
    
    # Save to user
    user = request.user
    user.avatar = avatar
    user.save()
    
    return Response({
        'message': 'Avatar uploaded successfully',
        'url': user.avatar.url
    })
```

### 📁 Multiple File Upload

```python
@api_view(['POST'])
@parser_classes([MultiPartParser])
def upload_documents(request):
    files = request.FILES.getlist('documents')  # Note: getlist()
    
    if not files:
        return Response({'error': 'No files provided'}, status=400)
    
    uploaded_files = []
    
    for file in files:
        # Validate and save each file
        if file.size > 10 * 1024 * 1024:  # 10MB max
            continue
        
        document = Document.objects.create(
            user=request.user,
            file=file,
            filename=file.name
        )
        
        uploaded_files.append({
            'id': document.id,
            'filename': document.filename,
            'url': document.file.url
        })
    
    return Response({
        'message': f'{len(uploaded_files)} files uploaded',
        'files': uploaded_files
    })
```

### 📊 File with JSON Data

```python
@api_view(['POST'])
@parser_classes([MultiPartParser, JSONParser])
def create_post_with_image(request):
    # Get JSON data
    title = request.data.get('title')
    content = request.data.get('content')
    
    # Get file
    image = request.FILES.get('image')
    
    # Create post
    post = Post.objects.create(
        title=title,
        content=content,
        image=image,
        author=request.user
    )
    
    return Response({
        'id': post.id,
        'title': post.title,
        'image_url': post.image.url if post.image else None
    }, status=201)
```

---

## 8. Request Authentication

### 🔐 Checking Authentication

```python
@api_view(['GET'])
def check_authentication(request):
    if request.user.is_authenticated:
        return Response({
            'authenticated': True,
            'user': request.user.email,
            'user_id': request.user.id
        })
    else:
        return Response({
            'authenticated': False,
            'user': 'AnonymousUser'
        })
```

### 🎯 Getting Auth Token

```python
from rest_framework.permissions import IsAuthenticated

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_token_info(request):
    # For JWT authentication
    from rest_framework_simplejwt.tokens import AccessToken
    
    token = request.auth
    
    if token:
        # Decode token to see claims
        access_token = AccessToken(str(token))
        
        return Response({
            'token_type': 'JWT',
            'user_id': access_token['user_id'],
            'exp': access_token['exp'],
            'iat': access_token['iat']
        })
    
    return Response({'message': 'No token found'})
```

---

## 9. Request Context

### 🌍 Accessing Request Context

```python
@api_view(['GET'])
def context_view(request):
    # Request contains useful context information
    
    return Response({
        'method': request.method,
        'path': request.path,  # /api/users/
        'full_path': request.get_full_path(),  # /api/users/?page=1
        'host': request.get_host(),  # chamahub.co.ke
        'scheme': request.scheme,  # http or https
        'user_agent': request.META.get('HTTP_USER_AGENT'),
        'remote_addr': request.META.get('REMOTE_ADDR'),  # Client IP
    })
```

### 🔗 Building Absolute URIs

```python
@api_view(['POST'])
def create_resource(request):
    resource = Resource.objects.create(name=request.data.get('name'))
    
    # Build absolute URL for the new resource
    resource_url = request.build_absolute_uri(f'/api/resources/{resource.id}/')
    
    return Response({
        'id': resource.id,
        'url': resource_url
    }, status=201)
```

---

## 10. Common Patterns

### ✅ Safe Request Data Access

```python
@api_view(['POST'])
def safe_create_user(request):
    # Use .get() with defaults to avoid KeyError
    email = request.data.get('email')
    first_name = request.data.get('first_name', '')
    last_name = request.data.get('last_name', '')
    age = request.data.get('age')
    
    # Validate required fields
    if not email:
        return Response({'error': 'Email is required'}, status=400)
    
    if not age:
        return Response({'error': 'Age is required'}, status=400)
    
    # Create user
    user = User.objects.create(
        email=email,
        first_name=first_name,
        last_name=last_name,
        age=age
    )
    
    return Response({'id': user.id}, status=201)
```

### 🎯 Request Data with Serializers (Recommended)

```python
@api_view(['POST'])
def create_user(request):
    # Let serializers handle validation!
    serializer = UserSerializer(data=request.data)
    
    if serializer.is_valid():
        user = serializer.save()
        return Response(serializer.data, status=201)
    
    # Serializer provides detailed error messages
    return Response(serializer.errors, status=400)
```

---

## 🎓 Learning Checkpoint

1. **What's the difference between `request.data` and `request.POST`?**
   <details>
   <summary>Answer</summary>
   `request.data` works with any content type (JSON, form data, etc.) while `request.POST` only works with form-encoded data.
   </details>

2. **How do you access query parameters in DRF?**
   <details>
   <summary>Answer</summary>
   Use `request.query_params.get('param_name')`
   </details>

3. **What does `request.user` contain for unauthenticated requests?**
   <details>
   <summary>Answer</summary>
   `AnonymousUser` instance
   </details>

4. **How do you access uploaded files?**
   <details>
   <summary>Answer</summary>
   Use `request.FILES.get('field_name')` for single file or `request.FILES.getlist('field_name')` for multiple files
   </details>

---

## 🚀 Next Steps

You now understand:
- ✅ DRF Request objects and how they differ from Django's HttpRequest
- ✅ Accessing request data, query params, and files
- ✅ HTTP methods and when to use them
- ✅ Content negotiation and parsers
- ✅ File uploads
- ✅ Request authentication and context
- ✅ Common request handling patterns

**Next**: [Responses Explained →](./13-responses-explained.md)

---

<div align="center">

[⬅️ Previous: Serializers](./11-serializers-explained.md) | [🏠 Guide Index](./README.md) | [➡️ Next: Responses](./13-responses-explained.md)

**Star this repo if you found it helpful!** ⭐

</div>
