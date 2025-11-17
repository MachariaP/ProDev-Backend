# 🎬 Guide 33: Exceptions Explained - Error Handling Made Simple

> **Duration:** 60-75 minutes  
> **Prerequisites:** Completed Guide 13 (Responses) and Guide 34 (Status Codes)  
> **Outcome:** Master exception handling and error responses in Django REST Framework

---

## 🎯 What You'll Learn

- What exceptions are in DRF
- Built-in exception classes
- Custom exceptions
- Exception handlers
- Error response formatting
- Common error patterns
- Best practices

---

## 📋 Table of Contents

1. [Exceptions Basics](#1-exceptions-basics)
2. [Built-in Exceptions](#2-built-in-exceptions)
3. [Raising Exceptions](#3-raising-exceptions)
4. [Custom Exceptions](#4-custom-exceptions)
5. [Exception Handlers](#5-exception-handlers)
6. [Error Response Format](#6-error-response-format)
7. [Common Patterns](#7-common-patterns)
8. [Best Practices](#8-best-practices)

---

## 1. Exceptions Basics

### 🤔 What are Exceptions?

**Simple answer**: Exceptions are **errors** that occur during request processing, which DRF automatically converts to appropriate HTTP responses.

### 🎭 Real-World Analogy

**Restaurant Order Processing** 🍽️

```
Customer orders burger
   ↓
Kitchen checks:
├── Out of burgers? → Raise NotFound (404)
├── Customer not paid? → Raise PermissionDenied (403)
├── Invalid order format? → Raise ValidationError (400)
└── Kitchen on fire? → Raise APIException (500)
```

---

## 2. Built-in Exceptions

### 📋 Common DRF Exceptions

```python
from rest_framework.exceptions import (
    APIException,           # Base exception (500)
    ParseError,            # Malformed request (400)
    AuthenticationFailed,  # Auth failed (401)
    NotAuthenticated,      # Not authenticated (401)
    PermissionDenied,      # No permission (403)
    NotFound,              # Resource not found (404)
    MethodNotAllowed,      # Wrong HTTP method (405)
    NotAcceptable,         # Can't satisfy Accept header (406)
    ValidationError,       # Validation failed (400)
    Throttled,             # Rate limit exceeded (429)
)
```

### 💡 Exception Usage

```python
from rest_framework.exceptions import NotFound, PermissionDenied, ValidationError

@api_view(['GET'])
def get_user(request, user_id):
    try:
        user = User.objects.get(id=user_id)
    except User.DoesNotExist:
        # Raise NotFound - becomes 404 response
        raise NotFound(detail='User not found')
    
    serializer = UserSerializer(user)
    return Response(serializer.data)

@api_view(['DELETE'])
def delete_user(request, user_id):
    user = get_object_or_404(User, id=user_id)
    
    if user.id != request.user.id and not request.user.is_staff:
        # Raise PermissionDenied - becomes 403 response
        raise PermissionDenied(detail='You cannot delete this user')
    
    user.delete()
    return Response(status=204)

@api_view(['POST'])
def create_contribution(request):
    amount = request.data.get('amount')
    
    if not amount or amount <= 0:
        # Raise ValidationError - becomes 400 response
        raise ValidationError({
            'amount': 'Amount must be greater than zero'
        })
    
    # Create contribution...
```

---

## 3. Raising Exceptions

### ✅ Simple Exception

```python
from rest_framework.exceptions import NotFound

@api_view(['GET'])
def get_resource(request, pk):
    try:
        resource = Resource.objects.get(pk=pk)
    except Resource.DoesNotExist:
        raise NotFound()  # Default message
    
    serializer = ResourceSerializer(resource)
    return Response(serializer.data)
```

### ✅ Exception with Custom Message

```python
from rest_framework.exceptions import PermissionDenied

@api_view(['DELETE'])
def delete_chama(request, chama_id):
    chama = get_object_or_404(Chama, id=chama_id)
    
    if not chama.members.filter(user=request.user, role='admin').exists():
        raise PermissionDenied(
            detail='Only chama admins can delete the chama'
        )
    
    chama.delete()
    return Response(status=204)
```

### ✅ Validation Exception with Details

```python
from rest_framework.exceptions import ValidationError

@api_view(['POST'])
def register_user(request):
    email = request.data.get('email')
    password = request.data.get('password')
    
    errors = {}
    
    if not email:
        errors['email'] = ['This field is required']
    elif User.objects.filter(email=email).exists():
        errors['email'] = ['Email already registered']
    
    if not password:
        errors['password'] = ['This field is required']
    elif len(password) < 8:
        errors['password'] = ['Password must be at least 8 characters']
    
    if errors:
        raise ValidationError(errors)
    
    # Create user...
```

---

## 4. Custom Exceptions

### 🔧 Creating Custom Exceptions

```python
from rest_framework.exceptions import APIException
from rest_framework import status

class ServiceUnavailable(APIException):
    status_code = status.HTTP_503_SERVICE_UNAVAILABLE
    default_detail = 'Service temporarily unavailable, try again later.'
    default_code = 'service_unavailable'

class InsufficientBalance(APIException):
    status_code = status.HTTP_400_BAD_REQUEST
    default_detail = 'Insufficient balance for this transaction.'
    default_code = 'insufficient_balance'

class ChamaFullException(APIException):
    status_code = status.HTTP_400_BAD_REQUEST
    default_detail = 'This chama has reached maximum membership.'
    default_code = 'chama_full'

# Usage
@api_view(['POST'])
def join_chama(request, chama_id):
    chama = get_object_or_404(Chama, id=chama_id)
    
    if chama.members.count() >= chama.max_members:
        raise ChamaFullException()
    
    # Add member...
    return Response({'message': 'Successfully joined chama'}, status=201)

@api_view(['POST'])
def withdraw(request):
    amount = request.data.get('amount')
    user = request.user
    
    if user.balance < amount:
        raise InsufficientBalance(
            detail=f'Your balance is {user.balance}, cannot withdraw {amount}'
        )
    
    # Process withdrawal...
```

---

## 5. Exception Handlers

### 🎯 Custom Exception Handler

```python
# my_app/exceptions.py

from rest_framework.views import exception_handler
from rest_framework.exceptions import ValidationError, NotFound
from django.http import Http404

def custom_exception_handler(exc, context):
    # Call DRF's default exception handler first
    response = exception_handler(exc, context)
    
    if response is not None:
        # Customize error response format
        custom_response = {
            'success': False,
            'error': {
                'code': response.status_code,
                'message': str(exc),
                'details': response.data
            }
        }
        response.data = custom_response
    
    return response

# settings.py

REST_FRAMEWORK = {
    'EXCEPTION_HANDLER': 'my_app.exceptions.custom_exception_handler'
}
```

### 🎨 Advanced Exception Handler

```python
from rest_framework.views import exception_handler
from rest_framework import status
from django.core.exceptions import PermissionDenied
from django.http import Http404
import logging

logger = logging.getLogger(__name__)

def custom_exception_handler(exc, context):
    # Call DRF's default exception handler
    response = exception_handler(exc, context)
    
    if response is None:
        # Handle Django's Http404
        if isinstance(exc, Http404):
            return Response({
                'success': False,
                'error': 'Resource not found'
            }, status=status.HTTP_404_NOT_FOUND)
        
        # Handle Django's PermissionDenied
        if isinstance(exc, PermissionDenied):
            return Response({
                'success': False,
                'error': 'Permission denied'
            }, status=status.HTTP_403_FORBIDDEN)
        
        # Log unhandled exceptions
        logger.error(f'Unhandled exception: {str(exc)}', exc_info=True)
        
        # Return generic error response
        return Response({
            'success': False,
            'error': 'An unexpected error occurred'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    # Customize DRF exceptions
    custom_response = {
        'success': False,
        'error': response.data
    }
    
    # Add request ID for tracking
    request = context.get('request')
    if request:
        custom_response['request_id'] = request.META.get('HTTP_X_REQUEST_ID')
    
    response.data = custom_response
    return response
```

---

## 6. Error Response Format

### ✅ Consistent Error Format

```python
# utils/responses.py

from rest_framework.response import Response
from rest_framework import status

def error_response(message, errors=None, status_code=status.HTTP_400_BAD_REQUEST):
    """
    Create a consistent error response.
    """
    response_data = {
        'success': False,
        'message': message
    }
    
    if errors:
        response_data['errors'] = errors
    
    return Response(response_data, status=status_code)

def success_response(data, message='Success', status_code=status.HTTP_200_OK):
    """
    Create a consistent success response.
    """
    return Response({
        'success': True,
        'message': message,
        'data': data
    }, status=status_code)

# Usage
@api_view(['POST'])
def create_user(request):
    serializer = UserSerializer(data=request.data)
    
    if serializer.is_valid():
        user = serializer.save()
        return success_response(
            data=UserSerializer(user).data,
            message='User created successfully',
            status_code=status.HTTP_201_CREATED
        )
    
    return error_response(
        message='Validation failed',
        errors=serializer.errors
    )
```

---

## 7. Common Patterns

### ✅ Pattern 1: Not Found

```python
from django.shortcuts import get_object_or_404

@api_view(['GET'])
def get_chama(request, chama_id):
    # Automatically raises Http404 (converted to 404 response)
    chama = get_object_or_404(Chama, id=chama_id)
    
    serializer = ChamaSerializer(chama)
    return Response(serializer.data)

# Or manually
from rest_framework.exceptions import NotFound

@api_view(['GET'])
def get_chama_manual(request, chama_id):
    try:
        chama = Chama.objects.get(id=chama_id)
    except Chama.DoesNotExist:
        raise NotFound(detail=f'Chama with id {chama_id} not found')
    
    serializer = ChamaSerializer(chama)
    return Response(serializer.data)
```

### ✅ Pattern 2: Permission Denied

```python
from rest_framework.exceptions import PermissionDenied

@api_view(['PUT'])
def update_contribution(request, contribution_id):
    contribution = get_object_or_404(Contribution, id=contribution_id)
    
    if contribution.user != request.user:
        raise PermissionDenied(
            detail='You can only update your own contributions'
        )
    
    serializer = ContributionSerializer(contribution, data=request.data, partial=True)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data)
    return Response(serializer.errors, status=400)
```

### ✅ Pattern 3: Validation Errors

```python
from rest_framework.exceptions import ValidationError

@api_view(['POST'])
def create_loan(request):
    amount = request.data.get('amount')
    user = request.user
    
    # Business logic validation
    if amount > user.available_credit:
        raise ValidationError({
            'amount': f'Amount exceeds available credit of {user.available_credit}'
        })
    
    if user.active_loans.exists():
        raise ValidationError({
            'non_field_errors': ['You already have an active loan']
        })
    
    # Create loan...
```

---

## 8. Best Practices

### ✅ 1. Use Specific Exceptions

```python
# Bad ❌
raise Exception('User not found')

# Good ✅
from rest_framework.exceptions import NotFound
raise NotFound(detail='User not found')
```

### ✅ 2. Provide Helpful Error Messages

```python
# Bad ❌
raise ValidationError('Invalid')

# Good ✅
raise ValidationError({
    'email': ['Email address is already registered'],
    'phone': ['Phone number must be in format: +254XXXXXXXXX']
})
```

### ✅ 3. Don't Expose Sensitive Information

```python
# Bad ❌ - Exposes internal details
try:
    process_payment(user, amount)
except PaymentGatewayError as e:
    raise APIException(detail=str(e))  # Might expose API keys, etc.

# Good ✅ - Generic message, log details
try:
    process_payment(user, amount)
except PaymentGatewayError as e:
    logger.error(f'Payment failed: {str(e)}', exc_info=True)
    raise APIException(detail='Payment processing failed. Please try again.')
```

### ✅ 4. Log Errors Appropriately

```python
import logging
logger = logging.getLogger(__name__)

@api_view(['POST'])
def critical_operation(request):
    try:
        # Critical operation
        result = perform_critical_task(request.data)
        return Response({'result': result})
    except CriticalError as e:
        # Log with context
        logger.error(
            f'Critical operation failed for user {request.user.id}',
            extra={
                'user_id': request.user.id,
                'request_data': request.data,
                'error': str(e)
            },
            exc_info=True
        )
        raise APIException(detail='Operation failed')
```

---

## 🎓 Learning Checkpoint

1. **What exception should you raise when a resource is not found?**
   <details>
   <summary>Answer</summary>
   NotFound (returns 404 status code)
   </details>

2. **What's the difference between NotAuthenticated and PermissionDenied?**
   <details>
   <summary>Answer</summary>
   NotAuthenticated (401) = User not logged in. PermissionDenied (403) = User logged in but doesn't have permission.
   </details>

3. **How do you create a custom exception in DRF?**
   <details>
   <summary>Answer</summary>
   Inherit from APIException and set status_code, default_detail, and default_code.
   </details>

4. **What does the exception handler do?**
   <details>
   <summary>Answer</summary>
   Converts exceptions into HTTP Response objects with appropriate status codes and formats.
   </details>

---

## 🚀 Next Steps

You now understand:
- ✅ Built-in DRF exceptions and when to use them
- ✅ How to raise exceptions with custom messages
- ✅ Creating custom exception classes
- ✅ Custom exception handlers
- ✅ Error response formatting
- ✅ Common exception patterns
- ✅ Best practices for error handling

---

<div align="center">

[⬅️ Previous: Returning URLs](./32-returning-urls-explained.md) | [🏠 Guide Index](./README.md) | [➡️ Next: Status Codes](./34-status-codes-explained.md)

**Star this repo if you found it helpful!** ⭐

</div>
