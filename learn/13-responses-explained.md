# 📤 Guide 13: Responses Explained - Sending Data Back to Clients

> **Duration:** 60-90 minutes  
> **Prerequisites:** Completed Guide 11 and Guide 12  
> **Outcome:** Master response creation and formatting in Django REST Framework

---

## 🎯 What You'll Learn

- What HTTP responses are (explained simply)
- DRF Response vs Django's HttpResponse
- Response formats (JSON, XML, etc.)
- HTTP status codes
- Response headers
- Error responses
- File responses
- Response renderers
- Best practices

---

## 📋 Table of Contents

1. [Responses Basics (ELI5)](#1-responses-basics-eli5)
2. [DRF Response vs Django HttpResponse](#2-drf-response-vs-django-httpresponse)
3. [Creating Responses](#3-creating-responses)
4. [Status Codes](#4-status-codes)
5. [Response Headers](#5-response-headers)
6. [Error Responses](#6-error-responses)
7. [Response Renderers](#7-response-renderers)
8. [File and Stream Responses](#8-file-and-stream-responses)
9. [Content Negotiation](#9-content-negotiation)
10. [Common Response Patterns](#10-common-response-patterns)

---

## 1. Responses Basics (ELI5)

### 🤔 What is a Response?

**Simple answer**: A response is the **answer** your server sends back to the client after processing a request.

### 🎭 Real-World Analogy

**Analogy: Restaurant Order** 🍔

```
Customer (Client): "I'd like a burger, please!" (Request)
                   ↓
Kitchen (Server): *Processes order*
                   ↓
Waiter (Response): "Here's your burger!" (Response)
├── Status: 200 OK (Order successful)
├── Headers: "Served hot, contains nuts"
└── Body: 🍔 (The actual burger)

OR

Waiter (Error Response): "Sorry, we're out of burgers" (Response)
├── Status: 404 Not Found
├── Headers: "Alternatives available"
└── Body: {"error": "Item not available", "suggestions": ["chicken", "fish"]}
```

### 📦 Response Components

Every HTTP response has:

```
HTTP/1.1 200 OK                              ← Status Line
Content-Type: application/json               ← Headers
Content-Length: 87                           ← Headers
Cache-Control: no-cache                      ← Headers
                                             ← Blank line
{                                            ← Body
  "id": 1,
  "name": "John Doe",
  "email": "john@example.com"
}
```

---

## 2. DRF Response vs Django HttpResponse

### 🔄 Django HttpResponse (Basic)

```python
from django.http import HttpResponse, JsonResponse
import json

def django_view(request):
    # Option 1: Manual JSON response
    data = {'message': 'Hello World'}
    json_data = json.dumps(data)
    response = HttpResponse(json_data, content_type='application/json')
    
    # Option 2: JsonResponse (easier)
    return JsonResponse(data)
    
    # But... only supports JSON! What about XML, YAML, etc.?
```

### ✨ DRF Response (Enhanced)

```python
from rest_framework.response import Response
from rest_framework.decorators import api_view

@api_view(['GET'])
def drf_view(request):
    data = {'message': 'Hello World'}
    
    # DRF Response handles everything!
    return Response(data)
    
    # Automatically:
    # ✅ Serializes data to JSON (or XML, or whatever client wants)
    # ✅ Sets correct Content-Type header
    # ✅ Handles content negotiation
    # ✅ Pretty-prints in browser
```

### 📊 Comparison Table

| Feature | Django HttpResponse | DRF Response |
|---------|---------------------|--------------|
| **JSON support** | ✅ Manual | ✅ Automatic |
| **XML support** | ❌ Manual | ✅ Automatic |
| **Content negotiation** | ❌ No | ✅ Yes |
| **Browsable API** | ❌ No | ✅ Yes |
| **Serialization** | ❌ Manual | ✅ Automatic |
| **Status codes** | ⚠️ Numbers | ✅ Named constants |

---

## 3. Creating Responses

### 📝 Basic Response

```python
from rest_framework.response import Response
from rest_framework.decorators import api_view

@api_view(['GET'])
def simple_response(request):
    # Simple data response
    return Response({'message': 'Hello World'})
```

### 📊 Response with Data

```python
@api_view(['GET'])
def get_user(request, user_id):
    user = User.objects.get(id=user_id)
    serializer = UserSerializer(user)
    
    # Response with serialized data
    return Response(serializer.data)
```

### 🎯 Response with Status Code

```python
from rest_framework import status

@api_view(['POST'])
def create_user(request):
    serializer = UserSerializer(data=request.data)
    
    if serializer.is_valid():
        serializer.save()
        # Created successfully - return 201
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    
    # Validation failed - return 400
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
```

### 🎨 Response with Headers

```python
@api_view(['POST'])
def create_resource(request):
    resource = Resource.objects.create(name=request.data.get('name'))
    serializer = ResourceSerializer(resource)
    
    # Create response with custom headers
    response = Response(serializer.data, status=status.HTTP_201_CREATED)
    
    # Add Location header (common for POST requests)
    response['Location'] = f'/api/resources/{resource.id}/'
    
    # Add custom header
    response['X-Resource-ID'] = str(resource.id)
    
    return response
```

---

## 4. Status Codes

### 📋 Common Status Codes

```python
from rest_framework import status

# Success Codes (2xx)
status.HTTP_200_OK                  # 200 - Success
status.HTTP_201_CREATED             # 201 - Resource created
status.HTTP_202_ACCEPTED            # 202 - Accepted for processing
status.HTTP_204_NO_CONTENT          # 204 - Success, no response body

# Client Error Codes (4xx)
status.HTTP_400_BAD_REQUEST         # 400 - Invalid request
status.HTTP_401_UNAUTHORIZED        # 401 - Not authenticated
status.HTTP_403_FORBIDDEN           # 403 - Not authorized
status.HTTP_404_NOT_FOUND           # 404 - Resource not found
status.HTTP_405_METHOD_NOT_ALLOWED  # 405 - Method not allowed
status.HTTP_409_CONFLICT            # 409 - Resource conflict
status.HTTP_429_TOO_MANY_REQUESTS   # 429 - Rate limit exceeded

# Server Error Codes (5xx)
status.HTTP_500_INTERNAL_SERVER_ERROR  # 500 - Server error
status.HTTP_503_SERVICE_UNAVAILABLE    # 503 - Service unavailable
```

### 🎯 When to Use Each Status Code

```python
@api_view(['GET', 'POST', 'PUT', 'DELETE'])
def resource_view(request, resource_id=None):
    
    if request.method == 'GET':
        if resource_id:
            # Get single resource
            try:
                resource = Resource.objects.get(id=resource_id)
                serializer = ResourceSerializer(resource)
                return Response(serializer.data, status=status.HTTP_200_OK)
            except Resource.DoesNotExist:
                return Response(
                    {'error': 'Resource not found'},
                    status=status.HTTP_404_NOT_FOUND
                )
        else:
            # List resources
            resources = Resource.objects.all()
            serializer = ResourceSerializer(resources, many=True)
            return Response(serializer.data, status=status.HTTP_200_OK)
    
    elif request.method == 'POST':
        # Create new resource
        serializer = ResourceSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    elif request.method == 'PUT':
        # Update resource
        try:
            resource = Resource.objects.get(id=resource_id)
        except Resource.DoesNotExist:
            return Response(
                {'error': 'Resource not found'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        serializer = ResourceSerializer(resource, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    elif request.method == 'DELETE':
        # Delete resource
        try:
            resource = Resource.objects.get(id=resource_id)
            resource.delete()
            return Response(status=status.HTTP_204_NO_CONTENT)
        except Resource.DoesNotExist:
            return Response(
                {'error': 'Resource not found'},
                status=status.HTTP_404_NOT_FOUND
            )
```

---

## 5. Response Headers

### 🎨 Setting Custom Headers

```python
@api_view(['GET'])
def custom_headers(request):
    response = Response({'message': 'Hello'})
    
    # Add headers
    response['X-Custom-Header'] = 'CustomValue'
    response['X-Request-ID'] = '12345'
    response['Cache-Control'] = 'max-age=3600'
    
    return response
```

### 🍪 Setting Cookies

```python
@api_view(['POST'])
def login_view(request):
    # Authenticate user...
    user = authenticate(email=request.data.get('email'), password=request.data.get('password'))
    
    if user:
        response = Response({'message': 'Login successful'})
        
        # Set cookie
        response.set_cookie(
            key='session_id',
            value='abc123',
            max_age=3600,  # 1 hour
            httponly=True,  # Not accessible via JavaScript
            secure=True,    # Only sent over HTTPS
            samesite='Strict'  # CSRF protection
        )
        
        return response
    
    return Response({'error': 'Invalid credentials'}, status=status.HTTP_401_UNAUTHORIZED)
```

### 🔒 CORS Headers

```python
@api_view(['GET'])
def cors_response(request):
    response = Response({'message': 'CORS enabled'})
    
    # Allow specific origin
    response['Access-Control-Allow-Origin'] = 'https://example.com'
    
    # Allow credentials
    response['Access-Control-Allow-Credentials'] = 'true'
    
    # Allow specific methods
    response['Access-Control-Allow-Methods'] = 'GET, POST, PUT, DELETE'
    
    # Allow specific headers
    response['Access-Control-Allow-Headers'] = 'Content-Type, Authorization'
    
    return response

# Better: Use django-cors-headers package!
# pip install django-cors-headers
```

---

## 6. Error Responses

### ❌ Simple Error Response

```python
@api_view(['GET'])
def get_user(request, user_id):
    try:
        user = User.objects.get(id=user_id)
        serializer = UserSerializer(user)
        return Response(serializer.data)
    except User.DoesNotExist:
        return Response(
            {'error': 'User not found'},
            status=status.HTTP_404_NOT_FOUND
        )
```

### 📋 Detailed Error Response

```python
@api_view(['POST'])
def create_user(request):
    serializer = UserSerializer(data=request.data)
    
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    
    # Return detailed validation errors
    return Response({
        'error': 'Validation failed',
        'details': serializer.errors
    }, status=status.HTTP_400_BAD_REQUEST)
```

**Error response example**:
```json
{
  "error": "Validation failed",
  "details": {
    "email": ["This field is required."],
    "age": ["Ensure this value is greater than or equal to 18."]
  }
}
```

### 🎯 Structured Error Responses

```python
def error_response(message, errors=None, status_code=status.HTTP_400_BAD_REQUEST):
    """Create a structured error response."""
    response_data = {
        'success': False,
        'message': message,
    }
    
    if errors:
        response_data['errors'] = errors
    
    return Response(response_data, status=status_code)

@api_view(['POST'])
def create_contribution(request):
    amount = request.data.get('amount')
    
    if not amount:
        return error_response(
            message='Validation error',
            errors={'amount': 'This field is required'}
        )
    
    if amount <= 0:
        return error_response(
            message='Invalid amount',
            errors={'amount': 'Amount must be greater than zero'}
        )
    
    # Create contribution...
    return Response({
        'success': True,
        'message': 'Contribution created',
        'data': {'id': 1, 'amount': amount}
    }, status=status.HTTP_201_CREATED)
```

---

## 7. Response Renderers

### 🎨 What are Renderers?

**Renderers** convert data into different formats (JSON, XML, HTML, etc.).

### 📋 Default Renderers

```python
# settings.py

REST_FRAMEWORK = {
    'DEFAULT_RENDERER_CLASSES': [
        'rest_framework.renderers.JSONRenderer',  # JSON responses
        'rest_framework.renderers.BrowsableAPIRenderer',  # HTML browser view
    ]
}
```

### 🎯 Available Renderers

```python
from rest_framework.renderers import (
    JSONRenderer,
    BrowsableAPIRenderer,
    XMLRenderer,
    HTMLFormRenderer,
    TemplateHTMLRenderer,
    StaticHTMLRenderer
)

@api_view(['GET'])
@renderer_classes([JSONRenderer, XMLRenderer])  # Support JSON and XML
def multi_format_view(request):
    data = {'message': 'Hello World'}
    return Response(data)

# Request with: Accept: application/json
# Response: {"message": "Hello World"}

# Request with: Accept: application/xml
# Response: <?xml version="1.0"?><root><message>Hello World</message></root>
```

### 🎨 Custom Renderer

```python
from rest_framework.renderers import BaseRenderer
import csv
from io import StringIO

class CSVRenderer(BaseRenderer):
    """Render data as CSV."""
    media_type = 'text/csv'
    format = 'csv'
    
    def render(self, data, accepted_media_type=None, renderer_context=None):
        """Render data to CSV."""
        if not data:
            return ''
        
        # Handle list of items
        if isinstance(data, list):
            if not data:
                return ''
            
            output = StringIO()
            writer = csv.DictWriter(output, fieldnames=data[0].keys())
            writer.writeheader()
            writer.writerows(data)
            return output.getvalue()
        
        return str(data)

@api_view(['GET'])
@renderer_classes([JSONRenderer, CSVRenderer])
def export_users(request):
    users = User.objects.all()
    serializer = UserSerializer(users, many=True)
    return Response(serializer.data)

# Request with: Accept: application/json
# Response: [{"id": 1, "name": "John"}, ...]

# Request with: Accept: text/csv
# Response: id,name
#          1,John
#          2,Jane
```

---

## 8. File and Stream Responses

### 📁 File Download Response

```python
from django.http import FileResponse

@api_view(['GET'])
def download_report(request, report_id):
    report = Report.objects.get(id=report_id)
    
    # Return file for download
    response = FileResponse(
        report.file.open('rb'),
        as_attachment=True,
        filename=f'report_{report_id}.pdf'
    )
    
    return response
```

### 📊 Generate and Download File

```python
from io import BytesIO
from django.http import HttpResponse
import csv

@api_view(['GET'])
def export_contributions(request):
    # Get data
    contributions = Contribution.objects.all()
    
    # Create CSV
    output = BytesIO()
    writer = csv.writer(output)
    
    # Write header
    writer.writerow(['ID', 'User', 'Amount', 'Date'])
    
    # Write data
    for contrib in contributions:
        writer.writerow([
            contrib.id,
            contrib.user.email,
            contrib.amount,
            contrib.created_at.strftime('%Y-%m-%d')
        ])
    
    # Create response
    response = HttpResponse(
        output.getvalue(),
        content_type='text/csv'
    )
    response['Content-Disposition'] = 'attachment; filename="contributions.csv"'
    
    return response
```

### 🎯 PDF Response

```python
from reportlab.pdfgen import canvas
from io import BytesIO
from django.http import HttpResponse

@api_view(['GET'])
def generate_pdf_report(request, user_id):
    user = User.objects.get(id=user_id)
    
    # Create PDF
    buffer = BytesIO()
    p = canvas.Canvas(buffer)
    
    # Add content
    p.drawString(100, 800, f"Report for {user.email}")
    p.drawString(100, 780, f"Total Contributions: ${user.total_contributions}")
    
    p.showPage()
    p.save()
    
    # Create response
    buffer.seek(0)
    response = HttpResponse(buffer, content_type='application/pdf')
    response['Content-Disposition'] = f'attachment; filename="report_{user.id}.pdf"'
    
    return response
```

---

## 9. Content Negotiation

### 🤝 Format Suffix

```python
# urls.py
from rest_framework.urlpatterns import format_suffix_patterns

urlpatterns = [
    path('api/users/', UserListView.as_view(), name='user-list'),
]

# Add format suffix support
urlpatterns = format_suffix_patterns(urlpatterns)

# Now you can access:
# /api/users/ - Default format
# /api/users.json - Force JSON
# /api/users.xml - Force XML
# /api/users.csv - Force CSV
```

### 🎯 View with Format

```python
@api_view(['GET'])
@renderer_classes([JSONRenderer, XMLRenderer])
def user_list(request, format=None):
    users = User.objects.all()
    serializer = UserSerializer(users, many=True)
    
    # Format is automatically determined by:
    # 1. URL suffix (.json, .xml)
    # 2. Accept header
    # 3. Default format
    
    return Response(serializer.data)
```

---

## 10. Common Response Patterns

### ✅ Success Response Pattern

```python
def success_response(data, message='Success', status_code=status.HTTP_200_OK):
    """Create a structured success response."""
    return Response({
        'success': True,
        'message': message,
        'data': data
    }, status=status_code)

@api_view(['POST'])
def create_chama(request):
    serializer = ChamaSerializer(data=request.data)
    
    if serializer.is_valid():
        chama = serializer.save()
        return success_response(
            data=serializer.data,
            message='Chama created successfully',
            status_code=status.HTTP_201_CREATED
        )
    
    return error_response('Validation failed', serializer.errors)
```

### 📋 Pagination Response

```python
@api_view(['GET'])
def list_users(request):
    users = User.objects.all()
    
    # Paginate
    from django.core.paginator import Paginator
    paginator = Paginator(users, 10)
    page_number = request.query_params.get('page', 1)
    page = paginator.get_page(page_number)
    
    serializer = UserSerializer(page, many=True)
    
    return Response({
        'count': paginator.count,
        'total_pages': paginator.num_pages,
        'current_page': page.number,
        'results': serializer.data
    })
```

---

## 🎓 Learning Checkpoint

1. **What's the main advantage of DRF Response over Django's HttpResponse?**
   <details>
   <summary>Answer</summary>
   Automatic content negotiation and serialization - it can render data in multiple formats (JSON, XML, etc.) based on client request.
   </details>

2. **What status code should you return when creating a new resource?**
   <details>
   <summary>Answer</summary>
   `201 Created` (status.HTTP_201_CREATED)
   </details>

3. **What status code should you return when deleting a resource successfully?**
   <details>
   <summary>Answer</summary>
   `204 No Content` (status.HTTP_204_NO_CONTENT)
   </details>

4. **How do you add custom headers to a Response?**
   <details>
   <summary>Answer</summary>
   Use dictionary-style access: `response['Header-Name'] = 'value'`
   </details>

---

## 🚀 Next Steps

You now understand:
- ✅ DRF Response objects and their advantages
- ✅ Creating responses with data and status codes
- ✅ HTTP status codes and when to use them
- ✅ Response headers and cookies
- ✅ Error responses
- ✅ Response renderers and content negotiation
- ✅ File responses
- ✅ Common response patterns

**Next**: [Views Explained →](./14-views-explained.md)

---

<div align="center">

[⬅️ Previous: Requests](./12-requests-explained.md) | [🏠 Guide Index](./README.md) | [➡️ Next: Views](./14-views-explained.md)

**Star this repo if you found it helpful!** ⭐

</div>
