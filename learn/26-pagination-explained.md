# 📄 Guide 26: Pagination Explained - Managing Large Data Sets

> **Duration:** 60-75 minutes  
> **Prerequisites:** Completed Guide 11 (Serializers) and Guide 13 (Responses)  
> **Outcome:** Master pagination strategies in Django REST Framework

---

## 🎯 What You'll Learn

- What pagination is and why it matters
- Built-in pagination styles
- Custom pagination classes
- Pagination with ViewSets
- Performance considerations
- Best practices

---

## 📋 Table of Contents

1. [Pagination Basics](#1-pagination-basics)
2. [PageNumberPagination](#2-pagenumberpagination)
3. [LimitOffsetPagination](#3-limitoffsetpagination)
4. [CursorPagination](#4-cursorpagination)
5. [Custom Pagination](#5-custom-pagination)
6. [Performance Tips](#6-performance-tips)
7. [Best Practices](#7-best-practices)

---

## 1. Pagination Basics

### 🤔 What is Pagination?

**Simple answer**: Pagination breaks large datasets into **smaller chunks** (pages) for better performance and usability.

### 🎭 Real-World Analogy

**Book Reading** 📚

```
Without Pagination:
├── Get entire encyclopedia at once
├── Too heavy to carry
├── Takes forever to load
└── Overwhelming!

With Pagination:
├── Get one chapter at a time
├── Easy to manage
├── Quick to load
└── Navigate as needed
```

### ❌ Without Pagination

```python
@api_view(['GET'])
def list_users(request):
    users = User.objects.all()  # Could be millions!
    serializer = UserSerializer(users, many=True)
    return Response(serializer.data)
    # ❌ Slow, uses too much memory, bad UX
```

### ✅ With Pagination

```python
from rest_framework.pagination import PageNumberPagination

@api_view(['GET'])
def list_users(request):
    paginator = PageNumberPagination()
    paginator.page_size = 10
    
    users = User.objects.all()
    paginated_users = paginator.paginate_queryset(users, request)
    serializer = UserSerializer(paginated_users, many=True)
    
    return paginator.get_paginated_response(serializer.data)
    # ✅ Fast, efficient, good UX
```

---

## 2. PageNumberPagination

### 📋 Setup

```python
# settings.py

REST_FRAMEWORK = {
    'DEFAULT_PAGINATION_CLASS': 'rest_framework.pagination.PageNumberPagination',
    'PAGE_SIZE': 10
}
```

### 🎯 Usage

```
GET /api/users/?page=1     # First page
GET /api/users/?page=2     # Second page
GET /api/users/?page=3     # Third page
```

**Response:**
```json
{
  "count": 100,
  "next": "http://api.example.com/users/?page=2",
  "previous": null,
  "results": [
    {"id": 1, "name": "John"},
    {"id": 2, "name": "Jane"},
    ...
  ]
}
```

### 🎨 Custom PageNumberPagination

```python
from rest_framework.pagination import PageNumberPagination

class CustomPageNumberPagination(PageNumberPagination):
    page_size = 20
    page_size_query_param = 'page_size'  # Allow client to set page size
    max_page_size = 100  # Maximum allowed page size
    page_query_param = 'p'  # Custom parameter name

# Usage in view
class UserListView(APIView):
    pagination_class = CustomPageNumberPagination
    
    def get(self, request):
        users = User.objects.all()
        paginator = self.pagination_class()
        paginated_users = paginator.paginate_queryset(users, request)
        serializer = UserSerializer(paginated_users, many=True)
        return paginator.get_paginated_response(serializer.data)
```

**Usage:**
```
GET /api/users/?p=1&page_size=50  # Page 1, 50 items per page
```

---

## 3. LimitOffsetPagination

### 📋 Setup

```python
# settings.py

REST_FRAMEWORK = {
    'DEFAULT_PAGINATION_CLASS': 'rest_framework.pagination.LimitOffsetPagination',
    'PAGE_SIZE': 10
}
```

### 🎯 Usage

```
GET /api/users/?limit=10&offset=0   # First 10 items
GET /api/users/?limit=10&offset=10  # Next 10 items
GET /api/users/?limit=20&offset=40  # 20 items starting from 40
```

**Response:**
```json
{
  "count": 100,
  "next": "http://api.example.com/users/?limit=10&offset=10",
  "previous": null,
  "results": [...]
}
```

### 🎨 Custom LimitOffsetPagination

```python
from rest_framework.pagination import LimitOffsetPagination

class CustomLimitOffsetPagination(LimitOffsetPagination):
    default_limit = 20
    max_limit = 100
    limit_query_param = 'limit'
    offset_query_param = 'offset'
```

---

## 4. CursorPagination

**Best for**: Large datasets, real-time data, preventing page drift

### 📋 Setup

```python
from rest_framework.pagination import CursorPagination

class TimestampCursorPagination(CursorPagination):
    page_size = 10
    ordering = '-created_at'  # Must specify ordering
    cursor_query_param = 'cursor'
```

### 🎯 Usage

```
GET /api/posts/?cursor=cD0yMDIz  # Encoded cursor
```

**Response:**
```json
{
  "next": "http://api.example.com/posts/?cursor=cj0xMjM=",
  "previous": "http://api.example.com/posts/?cursor=cj03ODk=",
  "results": [...]
}
```

### ✅ Advantages

- ✅ Better performance on large datasets
- ✅ Consistent results (no page drift)
- ✅ Works well with real-time data

### ❌ Limitations

- ❌ Can't jump to specific page
- ❌ Requires ordering field
- ❌ More complex implementation

---

## 5. Custom Pagination

### 🔧 Custom Pagination Class

```python
from rest_framework.pagination import PageNumberPagination
from rest_framework.response import Response

class CustomPagination(PageNumberPagination):
    page_size = 10
    page_size_query_param = 'page_size'
    max_page_size = 100
    
    def get_paginated_response(self, data):
        return Response({
            'success': True,
            'pagination': {
                'total': self.page.paginator.count,
                'total_pages': self.page.paginator.num_pages,
                'current_page': self.page.number,
                'per_page': self.get_page_size(self.request),
                'next': self.get_next_link(),
                'previous': self.get_previous_link()
            },
            'results': data
        })
```

**Response:**
```json
{
  "success": true,
  "pagination": {
    "total": 100,
    "total_pages": 10,
    "current_page": 1,
    "per_page": 10,
    "next": "http://api.example.com/users/?page=2",
    "previous": null
  },
  "results": [...]
}
```

---

## 6. Performance Tips

### ✅ 1. Use select_related and prefetch_related

```python
@api_view(['GET'])
def list_contributions(request):
    # Bad ❌ - N+1 queries
    contributions = Contribution.objects.all()
    
    # Good ✅ - Optimized
    contributions = Contribution.objects.select_related('user', 'chama').all()
    
    paginator = PageNumberPagination()
    paginated_contributions = paginator.paginate_queryset(contributions, request)
    serializer = ContributionSerializer(paginated_contributions, many=True)
    return paginator.get_paginated_response(serializer.data)
```

### ✅ 2. Use only() or values()

```python
# Get only needed fields
users = User.objects.only('id', 'email', 'first_name').all()
```

### ✅ 3. Add Database Indexes

```python
class User(models.Model):
    email = models.EmailField()
    created_at = models.DateTimeField(auto_now_add=True, db_index=True)
    
    class Meta:
        indexes = [
            models.Index(fields=['-created_at']),
        ]
```

---

## 7. Best Practices

### ✅ 1. Set Reasonable Defaults

```python
class StandardPagination(PageNumberPagination):
    page_size = 20  # Reasonable default
    page_size_query_param = 'page_size'
    max_page_size = 100  # Prevent abuse
```

### ✅ 2. Return Metadata

```python
# Include useful pagination metadata
{
  "count": 100,
  "total_pages": 10,
  "current_page": 1,
  "next": "...",
  "previous": null,
  "results": [...]
}
```

### ✅ 3. Use Cursor Pagination for Large Datasets

```python
# For feeds, timelines, large datasets
class FeedPagination(CursorPagination):
    page_size = 20
    ordering = '-created_at'
```

---

## 🎓 Learning Checkpoint

1. **Why is pagination important?**
   <details>
   <summary>Answer</summary>
   Improves performance, reduces memory usage, provides better user experience by breaking large datasets into manageable chunks.
   </details>

2. **What's the difference between PageNumberPagination and CursorPagination?**
   <details>
   <summary>Answer</summary>
   PageNumberPagination uses page numbers (page=1, page=2). CursorPagination uses encoded cursors, better for large datasets and real-time data.
   </details>

3. **When should you use CursorPagination?**
   <details>
   <summary>Answer</summary>
   For large datasets, real-time feeds, or when you need to prevent page drift in frequently updating data.
   </details>

---

## 🚀 Next Steps

You now understand:
- ✅ What pagination is and why it's essential
- ✅ Built-in pagination classes
- ✅ Custom pagination implementations
- ✅ Performance optimization with pagination
- ✅ Best practices

**Next**: [Versioning Explained →](./27-versioning-explained.md)

---

<div align="center">

[⬅️ Previous: Filtering](./25-filtering-explained.md) | [🏠 Guide Index](./README.md) | [➡️ Next: Versioning](./27-versioning-explained.md)

**Star this repo if you found it helpful!** ⭐

</div>
