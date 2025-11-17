# 🔐 Guide 23: Permissions Explained - Access Control Made Simple

> **Duration:** 75-90 minutes  
> **Prerequisites:** Completed Guide 10 (Authentication) and Guide 12 (Requests)  
> **Outcome:** Master permission classes and access control in Django REST Framework

---

## 🎯 What You'll Learn

- What permissions are (explained simply)
- Authentication vs Authorization
- Built-in permission classes
- Custom permission classes
- Object-level permissions
- Combining permissions
- Permission best practices
- Common permission patterns
- Security considerations

---

## 📋 Table of Contents

1. [Permissions Basics (ELI5)](#1-permissions-basics-eli5)
2. [Authentication vs Permissions](#2-authentication-vs-permissions)
3. [Built-in Permission Classes](#3-built-in-permission-classes)
4. [Using Permissions](#4-using-permissions)
5. [Custom Permissions](#5-custom-permissions)
6. [Object-Level Permissions](#6-object-level-permissions)
7. [Combining Permissions](#7-combining-permissions)
8. [Permission Methods](#8-permission-methods)
9. [Common Patterns](#9-common-patterns)
10. [Best Practices](#10-best-practices)

---

## 1. Permissions Basics (ELI5)

### 🤔 What are Permissions?

**Simple answer**: Permissions determine **what authenticated users can do**.

### 🎭 Real-World Analogies

**Analogy 1: The Office Building** 🏢

```
Everyone (AllowAny):
├── Can enter lobby
└── Can use reception

Employees (IsAuthenticated):
├── Can enter office floors
├── Can use meeting rooms
└── Can access employee cafeteria

Managers (IsAdminUser):
├── Everything employees can do
├── Can access financial reports
└── Can approve expenses

Specific Departments (Custom Permission):
├── HR can access employee records
├── Finance can access budgets
└── IT can access servers
```

**Analogy 2: Library Access** 📚

```
Anonymous (AllowAny):
├── Can browse catalog
└── Can read public information

Registered Members (IsAuthenticated):
├── Can borrow books
├── Can reserve books
└── Can access e-books

Premium Members (Custom Permission):
├── Everything regular members can
├── Can borrow more books
├── Can keep books longer
└── Can access special collections

Librarians (IsAdminUser):
├── Can add/remove books
├── Can manage members
└── Can access all areas
```

---

## 2. Authentication vs Permissions

### 🔑 The Difference

| **Authentication** | **Permissions** |
|-------------------|----------------|
| **Who are you?** | **What can you do?** |
| Proving identity | Checking access rights |
| Login with password | Check if admin |
| "I'm John Doe" | "John can edit this post" |

### 🔄 The Flow

```
1. Request arrives
   ↓
2. Authentication (Who are you?)
   ├── No auth provided → Anonymous User
   └── Token provided → Verify and identify user
   ↓
3. Permissions (What can you do?)
   ├── Check user permissions
   ├── Check object permissions
   └── Allow or deny access
   ↓
4. Execute view (if allowed)
```

### 💡 Example

```python
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import api_view, permission_classes

@api_view(['GET'])
@permission_classes([IsAuthenticated])  # ← Permission
def get_profile(request):
    # Authentication: Request contains valid JWT token
    # Permission: User must be authenticated
    
    user = request.user  # ← Authenticated user
    return Response({
        'id': user.id,
        'email': user.email
    })
```

---

## 3. Built-in Permission Classes

### 🌍 AllowAny - "Everyone Welcome"

**Use when**: Endpoint should be public

```python
from rest_framework.permissions import AllowAny

@api_view(['GET'])
@permission_classes([AllowAny])  # Everyone can access
def public_info(request):
    return Response({
        'message': 'This is public information',
        'status': 'open'
    })

# Note: AllowAny is the default if no permission_classes specified
```

**Common uses**:
- ✅ Public API endpoints
- ✅ Health checks
- ✅ Documentation
- ✅ Login/register endpoints

---

### 🔐 IsAuthenticated - "Must Be Logged In"

**Use when**: Only authenticated users should access

```python
from rest_framework.permissions import IsAuthenticated

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def protected_view(request):
    # Only authenticated users can access
    return Response({
        'message': f'Hello, {request.user.email}!'
    })
```

**Common uses**:
- ✅ User profile
- ✅ Creating resources
- ✅ Any authenticated-only feature

---

### 👑 IsAdminUser - "Staff Only"

**Use when**: Only admin/staff users should access

```python
from rest_framework.permissions import IsAdminUser

@api_view(['GET'])
@permission_classes([IsAdminUser])
def admin_dashboard(request):
    # Only admin users (is_staff=True) can access
    return Response({
        'message': 'Welcome, admin!',
        'total_users': User.objects.count()
    })
```

**Common uses**:
- ✅ Admin dashboard
- ✅ User management
- ✅ System settings
- ✅ Analytics

---

### 📖 IsAuthenticatedOrReadOnly - "Read Public, Write Authenticated"

**Use when**: Anyone can read, only authenticated can modify

```python
from rest_framework.permissions import IsAuthenticatedOrReadOnly

@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticatedOrReadOnly])
def blog_posts(request):
    if request.method == 'GET':
        # Anyone can read
        posts = BlogPost.objects.all()
        serializer = BlogPostSerializer(posts, many=True)
        return Response(serializer.data)
    
    elif request.method == 'POST':
        # Must be authenticated to create
        serializer = BlogPostSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(author=request.user)
            return Response(serializer.data, status=201)
        return Response(serializer.errors, status=400)
```

**Common uses**:
- ✅ Blog posts (read public, write authenticated)
- ✅ Comments
- ✅ Reviews
- ✅ Public APIs with modification restrictions

---

## 4. Using Permissions

### 🎯 Function-Based Views

```python
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def my_view(request):
    return Response({'message': 'Hello!'})
```

### 🎨 Class-Based Views

```python
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

class MyView(APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        return Response({'message': 'Hello!'})
```

### 🌍 Global Settings

```python
# settings.py

REST_FRAMEWORK = {
    'DEFAULT_PERMISSION_CLASSES': [
        'rest_framework.permissions.IsAuthenticated',
    ]
}

# Now all views require authentication by default
# Override for specific views using @permission_classes
```

---

## 5. Custom Permissions

### 🔧 Creating Custom Permissions

```python
from rest_framework.permissions import BasePermission

class IsOwner(BasePermission):
    """
    Permission: Only owner can access the object.
    """
    
    def has_object_permission(self, request, view, obj):
        # obj is the model instance
        return obj.owner == request.user

# Usage
@api_view(['GET', 'PUT', 'DELETE'])
@permission_classes([IsAuthenticated, IsOwner])
def user_post(request, pk):
    post = get_object_or_404(BlogPost, pk=pk)
    
    # Permission check happens automatically
    # Only owner can access
    
    if request.method == 'GET':
        serializer = BlogPostSerializer(post)
        return Response(serializer.data)
    # ...
```

### 🎯 Read/Write Permissions

```python
class IsOwnerOrReadOnly(BasePermission):
    """
    Permission: Anyone can read, only owner can modify.
    """
    
    def has_object_permission(self, request, view, obj):
        # Read permissions (GET, HEAD, OPTIONS)
        if request.method in ['GET', 'HEAD', 'OPTIONS']:
            return True
        
        # Write permissions (POST, PUT, PATCH, DELETE)
        return obj.owner == request.user

# Usage
@api_view(['GET', 'PUT', 'DELETE'])
@permission_classes([IsAuthenticatedOrReadOnly, IsOwnerOrReadOnly])
def blog_post_detail(request, pk):
    post = get_object_or_404(BlogPost, pk=pk)
    
    # Anyone can read
    # Only owner can modify
    
    if request.method == 'GET':
        serializer = BlogPostSerializer(post)
        return Response(serializer.data)
    elif request.method == 'PUT':
        # Only owner can update
        serializer = BlogPostSerializer(post, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=400)
    elif request.method == 'DELETE':
        # Only owner can delete
        post.delete()
        return Response(status=204)
```

### 🎨 Advanced Custom Permissions

```python
class IsChamaAdmin(BasePermission):
    """
    Permission: Only chama admins can modify the chama.
    """
    
    def has_object_permission(self, request, view, obj):
        # obj is a Chama instance
        
        # Check if user is a member
        member = obj.members.filter(user=request.user).first()
        
        if not member:
            return False  # Not a member
        
        # Read permissions for all members
        if request.method in ['GET', 'HEAD', 'OPTIONS']:
            return True
        
        # Write permissions only for admins
        return member.role == 'admin'

class IsChamaMember(BasePermission):
    """
    Permission: Only chama members can access.
    """
    
    def has_object_permission(self, request, view, obj):
        # Check if user is a member of this chama
        return obj.members.filter(user=request.user).exists()
```

---

## 6. Object-Level Permissions

### 🎯 has_permission vs has_object_permission

```python
class MyPermission(BasePermission):
    
    def has_permission(self, request, view):
        """
        Called BEFORE view executes.
        Check general access rights.
        """
        # Check if user can access this view at all
        return request.user.is_authenticated
    
    def has_object_permission(self, request, view, obj):
        """
        Called AFTER object is retrieved.
        Check access to specific object.
        """
        # Check if user can access THIS specific object
        return obj.owner == request.user
```

### 💡 Example: Blog Post Permissions

```python
class IsAuthorOrReadOnly(BasePermission):
    """
    - List view: Everyone can see list
    - Detail view (read): Everyone can read
    - Detail view (write): Only author can modify
    """
    
    def has_permission(self, request, view):
        # Allow list view for everyone
        if view.action == 'list':
            return True
        
        # Allow detail view for authenticated users
        if view.action in ['retrieve', 'update', 'partial_update', 'destroy']:
            return request.user.is_authenticated
        
        # Allow create for authenticated users
        if view.action == 'create':
            return request.user.is_authenticated
        
        return False
    
    def has_object_permission(self, request, view, obj):
        # Read permissions for everyone
        if request.method in ['GET', 'HEAD', 'OPTIONS']:
            return True
        
        # Write permissions only for author
        return obj.author == request.user

# Usage with ViewSet
class BlogPostViewSet(viewsets.ModelViewSet):
    queryset = BlogPost.objects.all()
    serializer_class = BlogPostSerializer
    permission_classes = [IsAuthorOrReadOnly]
    
    def perform_create(self, serializer):
        serializer.save(author=self.request.user)
```

---

## 7. Combining Permissions

### 🔗 AND Logic (All Must Pass)

```python
@api_view(['DELETE'])
@permission_classes([IsAuthenticated, IsAdminUser, IsOwner])
def delete_important_resource(request, pk):
    # User must be:
    # 1. Authenticated AND
    # 2. Admin AND
    # 3. Owner
    # All three must be True
    pass
```

### 🔀 OR Logic (Any Can Pass)

```python
from rest_framework.permissions import BasePermission

class IsAdminOrOwner(BasePermission):
    """
    Permission: Admin OR Owner can access.
    """
    
    def has_object_permission(self, request, view, obj):
        # User is admin OR user is owner
        return request.user.is_staff or obj.owner == request.user

@api_view(['DELETE'])
@permission_classes([IsAuthenticated, IsAdminOrOwner])
def delete_post(request, pk):
    post = get_object_or_404(BlogPost, pk=pk)
    # User must be authenticated AND (admin OR owner)
    post.delete()
    return Response(status=204)
```

### 🎨 Complex Logic

```python
class IsManagerOrOwnerReadOnly(BasePermission):
    """
    - Managers: Full access
    - Owner: Read-only access
    - Others: No access
    """
    
    def has_object_permission(self, request, view, obj):
        # Managers have full access
        if request.user.role == 'manager':
            return True
        
        # Owner has read-only access
        if obj.owner == request.user:
            return request.method in ['GET', 'HEAD', 'OPTIONS']
        
        # Others have no access
        return False
```

---

## 8. Permission Methods

### 🎯 Available Methods

```python
class MyPermission(BasePermission):
    
    def has_permission(self, request, view):
        """
        Return True if permission granted for view.
        
        Args:
            request: The request object
            view: The view being accessed
        
        Returns:
            bool: True if allowed, False otherwise
        """
        pass
    
    def has_object_permission(self, request, view, obj):
        """
        Return True if permission granted for specific object.
        
        Args:
            request: The request object
            view: The view being accessed
            obj: The object being accessed
        
        Returns:
            bool: True if allowed, False otherwise
        """
        pass
```

### 💡 Accessing Request Data

```python
class MyPermission(BasePermission):
    
    def has_permission(self, request, view):
        # Access user
        user = request.user
        
        # Check authentication
        if not user.is_authenticated:
            return False
        
        # Access request method
        if request.method == 'DELETE':
            return user.is_staff
        
        # Access request data
        if request.data.get('important') == True:
            return user.is_superuser
        
        # Access query params
        if request.query_params.get('admin_mode'):
            return user.is_staff
        
        return True
```

---

## 9. Common Patterns

### ✅ Pattern 1: Public Read, Authenticated Write

```python
from rest_framework.permissions import IsAuthenticatedOrReadOnly

@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticatedOrReadOnly])
def articles(request):
    if request.method == 'GET':
        # Anyone can read
        articles = Article.objects.all()
        serializer = ArticleSerializer(articles, many=True)
        return Response(serializer.data)
    
    elif request.method == 'POST':
        # Must be authenticated to write
        serializer = ArticleSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(author=request.user)
            return Response(serializer.data, status=201)
        return Response(serializer.errors, status=400)
```

### ✅ Pattern 2: Owner Can Modify

```python
class IsOwner(BasePermission):
    def has_object_permission(self, request, view, obj):
        return obj.owner == request.user

@api_view(['GET', 'PUT', 'DELETE'])
@permission_classes([IsAuthenticated, IsOwner])
def my_resource(request, pk):
    resource = get_object_or_404(Resource, pk=pk)
    # Only owner can access
    # ...
```

### ✅ Pattern 3: Admin Or Owner

```python
class IsAdminOrOwner(BasePermission):
    def has_object_permission(self, request, view, obj):
        return request.user.is_staff or obj.owner == request.user

@api_view(['DELETE'])
@permission_classes([IsAuthenticated, IsAdminOrOwner])
def delete_resource(request, pk):
    resource = get_object_or_404(Resource, pk=pk)
    resource.delete()
    return Response(status=204)
```

### ✅ Pattern 4: Role-Based Access

```python
class IsManager(BasePermission):
    def has_permission(self, request, view):
        return (
            request.user.is_authenticated and
            request.user.role == 'manager'
        )

@api_view(['GET'])
@permission_classes([IsManager])
def manager_dashboard(request):
    # Only managers can access
    return Response({'dashboard': 'data'})
```

---

## 10. Best Practices

### ✅ 1. Use Descriptive Permission Names

```python
# Bad ❌
class Perm1(BasePermission):
    pass

# Good ✅
class IsOwnerOrReadOnly(BasePermission):
    """
    Permission: Owner can edit, everyone can read.
    """
    pass
```

### ✅ 2. Add Docstrings

```python
class IsChamaMember(BasePermission):
    """
    Permission check: User must be a member of the chama.
    
    Checks if the authenticated user is a member of the chama
    being accessed. Returns True if user is a member, False otherwise.
    """
    
    def has_object_permission(self, request, view, obj):
        return obj.members.filter(user=request.user).exists()
```

### ✅ 3. Return Clear Error Messages

```python
class MyPermission(BasePermission):
    message = 'You must be the owner to perform this action.'
    
    def has_object_permission(self, request, view, obj):
        if obj.owner != request.user:
            # Custom error message will be returned
            return False
        return True
```

### ✅ 4. Check Authentication First

```python
class MyPermission(BasePermission):
    
    def has_permission(self, request, view):
        # Always check authentication first
        if not request.user.is_authenticated:
            return False
        
        # Then check other conditions
        return request.user.is_verified
```

### ✅ 5. Use Global Defaults Wisely

```python
# settings.py

# Good: Secure by default
REST_FRAMEWORK = {
    'DEFAULT_PERMISSION_CLASSES': [
        'rest_framework.permissions.IsAuthenticated',
    ]
}

# Then override for public endpoints
@api_view(['GET'])
@permission_classes([AllowAny])
def public_endpoint(request):
    pass
```

---

## 🎓 Learning Checkpoint

1. **What's the difference between authentication and permissions?**
   <details>
   <summary>Answer</summary>
   Authentication determines WHO you are (identity). Permissions determine WHAT you can do (access rights).
   </details>

2. **Which permission class allows anyone to read but only authenticated users to write?**
   <details>
   <summary>Answer</summary>
   IsAuthenticatedOrReadOnly
   </details>

3. **What's the difference between has_permission and has_object_permission?**
   <details>
   <summary>Answer</summary>
   has_permission checks general access to the view. has_object_permission checks access to a specific object instance.
   </details>

4. **How do you combine multiple permissions with AND logic?**
   <details>
   <summary>Answer</summary>
   List them in permission_classes: @permission_classes([Permission1, Permission2, Permission3])
   </details>

---

## 🚀 Next Steps

You now understand:
- ✅ What permissions are and how they differ from authentication
- ✅ Built-in permission classes (AllowAny, IsAuthenticated, etc.)
- ✅ Creating custom permissions
- ✅ Object-level permissions
- ✅ Combining permissions
- ✅ Common permission patterns
- ✅ Best practices for access control

**Next**: [Throttling Explained →](./24-throttling-explained.md)

---

<div align="center">

[⬅️ Previous: Authentication Classes](./22-authentication-classes-explained.md) | [🏠 Guide Index](./README.md) | [➡️ Next: Throttling](./24-throttling-explained.md)

**Star this repo if you found it helpful!** ⭐

</div>
