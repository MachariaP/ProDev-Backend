# 🏗️ Guide 7: The Django/TypeScript Full-Stack Mastery Guide - A Technical Blueprint

> **Duration:** 180-240 minutes  
> **Prerequisites:** Completed Guides 1-6, Basic TypeScript knowledge  
> **Outcome:** Production-grade full-stack architecture with seamless Django-TypeScript integration

---

## 🎯 What You'll Learn

- Design scalable full-stack architecture with Django and TypeScript
- Master PostgreSQL database optimization and query efficiency
- Implement type-safe API contracts between backend and frontend
- Eliminate N+1 queries and optimize database operations
- Automate TypeScript interface generation from Django serializers
- Build component-driven React architecture with strict TypeScript

---

## 📋 Table of Contents

### Part I: Architectural Foundation and Seamless Integration
1. [Project Planning and Architecture Strategy](#1-project-planning-and-architecture-strategy)
2. [Backend Project Initialization: Advanced Python/Django](#2-backend-project-initialization-advanced-pythondjango)
3. [Frontend Project Initialization: TypeScript/React](#3-frontend-project-initialization-typescriptreact)

### Part II: Backend Setup - Advanced DRF and Database Efficiency
4. [PostgreSQL Database Design and Advanced ORM Efficiency](#4-postgresql-database-design-and-advanced-orm-efficiency)
5. [Handling API Interaction and CORS](#5-handling-api-interaction-and-cors)

### Part III: Achieving Type-Safe Integration
6. [Prescribed Type Generation Workflow](#6-prescribed-type-generation-workflow)
7. [Automation via Schema Generation](#7-automation-via-schema-generation)
8. [Frontend Consumption with Typed Data](#8-frontend-consumption-with-typed-data)

### Part IV: Advanced Frontend Mastery and Mobility
9. [Advanced Routing and Route Protection](#9-advanced-routing-and-route-protection)
10. [State Management Deep Dive](#10-state-management-deep-dive)
11. [Data Fetching and Synchronization](#11-data-fetching-and-synchronization)
12. [Progressive Web App (PWA) Implementation](#12-progressive-web-app-pwa-implementation)
13. [Mobile Development with React Native](#13-mobile-development-with-react-native)

### Part V: Security, Authentication, and Threat Mitigation
14. [Secure User Authentication](#14-secure-user-authentication)
15. [Django Security Hardening Best Practices](#15-django-security-hardening-best-practices)

### Part VI: Performance, Caching, and Background Processes
16. [Database and Query Optimization](#16-database-and-query-optimization)
17. [Comprehensive Caching Strategy](#17-comprehensive-caching-strategy)
18. [Scheduled Tasks (Crons) and Asynchronous Workloads](#18-scheduled-tasks-crons-and-asynchronous-workloads)

### Part VII: Operational Maturity: DevOps, Microservices, and Observability
19. [DevOps and Containerization (Docker)](#19-devops-and-containerization-docker)
20. [Advanced Shell Commands for DevOps](#20-advanced-shell-commands-for-devops)
21. [Microservices Architecture Transition](#21-microservices-architecture-transition)
22. [Monitoring, Analysis, and Third-Party Services](#22-monitoring-analysis-and-third-party-services)
23. [Final Project: Synthesis and Comprehensive Deployment Checklist](#23-final-project-synthesis-and-comprehensive-deployment-checklist)

---

## Part I: Architectural Foundation and Seamless Integration

The construction of a scalable, full-stack application leveraging Django and TypeScript requires establishing a robust architectural foundation where the backend and frontend operate independently but communicate reliably. This decoupled architecture uses Django REST Framework (DRF) to provide a powerful API for the React/TypeScript client.

---

## 1. Project Planning and Architecture Strategy

The initial planning phase dictates long-term scalability and operational resilience. The strategy employed here centers on **high cohesion within services** and **low coupling between the client and server**.

### 1.1 Stack Selection Rationale

The choice of **Django DRF** for the backend is justified by:
- **Reliability:** Battle-tested framework with strong community support
- **Strong ORM:** Powerful database abstraction layer with query optimization
- **Comprehensive Security:** Built-in protection against common vulnerabilities (SQL injection, XSS, CSRF)
- **Rapid Development:** Simplifies common web development challenges

**React/TypeScript** is selected for the frontend due to:
- **Component-Based Architecture:** Promotes reusability and maintainability
- **Static Typing:** Enforces stability in complex user interfaces
- **Developer Experience:** Excellent tooling, debugging, and IDE support
- **Performance:** Virtual DOM and efficient rendering

**The Decoupling Principle:**
- Backend is purely a **data provider** (CRUD operations, business logic, security enforcement)
- Frontend handles **user interaction, state management, and presentation**
- Communication occurs via well-defined REST API contracts

### 1.2 Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                    CLIENT TIER (Frontend)                    │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  React + TypeScript + Vite                             │ │
│  │  - Component-based UI                                  │ │
│  │  - State management (React Query/Zustand)              │ │
│  │  - Typed API client (generated from OpenAPI schema)    │ │
│  └────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
                              │
                              │ HTTPS/REST API
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                   APPLICATION TIER (Backend)                 │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  Django REST Framework                                 │ │
│  │  - API endpoints (ViewSets/Serializers)                │ │
│  │  - JWT Authentication                                  │ │
│  │  - Business logic layer                                │ │
│  │  - OpenAPI schema generation (drf-spectacular)         │ │
│  └────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
                              │
                              │ Django ORM
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                     DATA TIER (Database)                     │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  PostgreSQL 16                                         │ │
│  │  - Relational database (3NF normalized)                │ │
│  │  - Indexes and constraints                             │ │
│  │  - Connection pooling                                  │ │
│  └────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

---

## 2. Backend Project Initialization: Advanced Python/Django

A crucial element of mature development is adhering to the principle of **"Configuration, Credentials, Code" separation**.

### 2.1 Modern Project Structure

The structure should immediately anticipate future scaling, utilizing modular Django apps within a centralized project. This modularity naturally facilitates a later transition toward a microservices architecture by defining clear domain boundaries.

```
ProDev-Backend/
├── config/                      # Project configuration
│   ├── __init__.py
│   ├── settings/
│   │   ├── __init__.py
│   │   ├── base.py             # Shared settings
│   │   ├── development.py      # Local development
│   │   ├── production.py       # Production environment
│   │   └── test.py             # Testing environment
│   ├── urls.py                 # Root URL configuration
│   ├── wsgi.py                 # WSGI entry point
│   └── asgi.py                 # ASGI entry point (for WebSockets)
│
├── apps/                       # Django applications (domain-driven)
│   ├── users/                  # User management domain
│   │   ├── models.py
│   │   ├── serializers.py
│   │   ├── views.py
│   │   ├── permissions.py
│   │   └── tests/
│   ├── chamas/                 # Chama (savings group) domain
│   ├── contributions/          # Contribution domain
│   ├── loans/                  # Loan management domain
│   └── core/                   # Shared utilities
│
├── requirements/               # Dependency management
│   ├── base.txt               # Core dependencies
│   ├── development.txt        # Dev-only dependencies
│   └── production.txt         # Production dependencies
│
├── .env.example               # Environment variable template
├── .gitignore
├── manage.py
└── README.md
```

**Key Principles:**
- **Domain-driven organization:** Each app represents a clear business domain
- **Split settings pattern:** Separate configurations for different environments
- **Clear separation:** Configuration, credentials, and code are never mixed

### 2.2 Configuration Management

All sensitive settings, including database connection strings, cloud keys, and API tokens, must be **externalized from the codebase**. Secure use of environment variables (using `django-environ` or `python-decouple`) is mandatory.

**Install python-decouple:**

```bash
pip install python-decouple
```

**Create .env file (NEVER commit this):**

```bash
# .env (add to .gitignore)
ENVIRONMENT=development
SECRET_KEY=your-secret-key-here
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1

# PostgreSQL Database
DATABASE_URL=postgresql://username:password@localhost:5432/chamahub_db

# Redis
REDIS_URL=redis://localhost:6379/0

# JWT Settings
JWT_ACCESS_TOKEN_LIFETIME=15
JWT_REFRESH_TOKEN_LIFETIME=10080
```

**Configure settings to use environment variables:**

```python
# config/settings/base.py
from pathlib import Path
from decouple import config, Csv
from datetime import timedelta
import os

BASE_DIR = Path(__file__).resolve().parent.parent.parent

# SECURITY WARNING: keep the secret key used in production secret!
SECRET_KEY = config('SECRET_KEY')

# SECURITY WARNING: don't run with debug turned on in production!
DEBUG = config('DEBUG', default=False, cast=bool)

ALLOWED_HOSTS = config('ALLOWED_HOSTS', default='localhost', cast=Csv())

# Database
# https://docs.djangoproject.com/en/5.1/ref/settings/#databases
import dj_database_url

DATABASES = {
    'default': dj_database_url.config(
        default=config('DATABASE_URL'),
        conn_max_age=600,
        conn_health_checks=True,
    )
}
```

**Security Best Practices:**
- ✅ Never commit `.env` file to version control
- ✅ Use `.env.example` to document required variables
- ✅ Rotate secrets regularly
- ✅ Use different credentials for each environment
- ✅ Store production secrets in secure vaults (Railway/Heroku Config Vars, AWS Secrets Manager, etc.)

---

## 3. Frontend Project Initialization: TypeScript/React

The frontend project must be set up with **TypeScript enabled from the start**, utilizing strict mode settings in `tsconfig.json`. This ensures maximum type enforcement throughout the development cycle.

### 3.1 Create React + TypeScript + Vite Project

```bash
# Create new React project with TypeScript template
npm create vite@latest chamahub-frontend -- --template react-ts

# Navigate to project directory
cd chamahub-frontend

# Install dependencies
npm install

# Install additional dependencies
npm install axios react-query @tanstack/react-query
npm install -D @types/node
```

### 3.2 Configure Strict TypeScript

Update `tsconfig.json` to enforce maximum type safety:

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,

    /* Bundler mode */
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",

    /* Strict Type-Checking Options */
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "noImplicitReturns": true,
    "noUncheckedIndexedAccess": true,
    "exactOptionalPropertyTypes": true,
    "noImplicitOverride": true,

    /* Path Aliases */
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"],
      "@/components/*": ["./src/components/*"],
      "@/api/*": ["./src/api/*"],
      "@/types/*": ["./src/types/*"]
    }
  },
  "include": ["src"],
  "references": [{ "path": "./tsconfig.node.json" }]
}
```

### 3.3 Project Structure - Component-Driven Architecture

```
chamahub-frontend/
├── src/
│   ├── api/                    # API client and generated types
│   │   ├── client.ts          # Axios instance configuration
│   │   ├── generated/         # Auto-generated TypeScript types
│   │   │   ├── types.ts       # API types from OpenAPI schema
│   │   │   └── endpoints.ts   # API endpoint functions
│   │   └── hooks/             # Custom API hooks
│   │       ├── useAuth.ts
│   │       ├── useChamas.ts
│   │       └── useContributions.ts
│   │
│   ├── components/            # Reusable UI components
│   │   ├── common/           # Generic components
│   │   │   ├── Button.tsx
│   │   │   ├── Input.tsx
│   │   │   └── Card.tsx
│   │   ├── layout/           # Layout components
│   │   │   ├── Header.tsx
│   │   │   ├── Sidebar.tsx
│   │   │   └── Footer.tsx
│   │   └── features/         # Feature-specific components
│   │       ├── auth/
│   │       ├── chamas/
│   │       └── contributions/
│   │
│   ├── pages/                # Page components
│   │   ├── Dashboard.tsx
│   │   ├── Login.tsx
│   │   ├── ChamaList.tsx
│   │   └── ChamaDetail.tsx
│   │
│   ├── hooks/                # Custom React hooks
│   │   ├── useAuth.ts
│   │   └── useLocalStorage.ts
│   │
│   ├── context/              # React Context providers
│   │   └── AuthContext.tsx
│   │
│   ├── types/                # TypeScript type definitions
│   │   └── index.ts
│   │
│   ├── utils/                # Utility functions
│   │   ├── formatters.ts
│   │   └── validators.ts
│   │
│   ├── App.tsx               # Root component
│   └── main.tsx              # Application entry point
│
├── public/                   # Static assets
│   ├── manifest.json        # PWA manifest
│   └── service-worker.js    # Service worker for PWA
│
├── tsconfig.json
├── vite.config.ts
└── package.json
```

### 3.4 Early PWA Configuration

Using a PWA-ready template embeds necessary configuration files early, streamlining final PWA deployment.

**Install PWA dependencies:**

```bash
npm install -D vite-plugin-pwa
```

**Configure Vite for PWA:**

```typescript
// vite.config.ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'masked-icon.svg'],
      manifest: {
        name: 'ChamaHub',
        short_name: 'ChamaHub',
        description: 'Digital platform for managing Chama savings groups',
        theme_color: '#ffffff',
        icons: [
          {
            src: 'pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      }
    })
  ]
})
```

---

## Part II: Backend Setup - Advanced DRF and Database Efficiency

The performance of a full-stack application is frequently limited by database interactions. Optimization efforts must focus on **reducing the number and complexity of database queries**.

---

## 4. PostgreSQL Database Design and Advanced ORM Efficiency

Efficiency is achieved by instructing the Django ORM precisely on what data is needed and how to fetch it.

### 4.1 N+1 Query Elimination

**The Problem:**

The N+1 query problem occurs when you fetch a list of objects (1 query) and then access related objects for each item in the list (N queries).

**Bad Example (N+1 Queries):**

```python
# This will execute 1 query to fetch chamas + N queries to fetch each chama's creator
chamas = Chama.objects.all()  # 1 query
for chama in chamas:
    print(chama.created_by.email)  # N additional queries (one per chama)
```

**Solution 1: Using select_related() for Foreign Keys**

Use `select_related()` for **one-to-one** and **foreign key** relationships. This performs a SQL JOIN and retrieves all related data in a single query.

```python
# This executes only 1 query with a JOIN
chamas = Chama.objects.select_related('created_by').all()
for chama in chamas:
    print(chama.created_by.email)  # No additional queries
```

**SQL Generated:**

```sql
SELECT chamas_chama.*, users_user.*
FROM chamas_chama
INNER JOIN users_user ON chamas_chama.created_by_id = users_user.id;
```

**Solution 2: Using prefetch_related() for Many-to-Many**

Use `prefetch_related()` for **many-to-many** or **reverse foreign key** lookups. This performs separate queries but reduces the total number.

```python
# Fetch chamas with their members (many-to-many)
chamas = Chama.objects.prefetch_related('members').all()
for chama in chamas:
    for member in chama.members.all():  # No additional queries per chama
        print(member.email)
```

**SQL Generated:**

```sql
-- Query 1: Fetch all chamas
SELECT * FROM chamas_chama;

-- Query 2: Fetch all related members
SELECT users_user.*, chamas_member.chama_id
FROM users_user
INNER JOIN chamas_member ON users_user.id = chamas_member.user_id
WHERE chamas_member.chama_id IN (1, 2, 3, ...);
```

**Complex Example: Combining Both**

```python
# ViewSet example with optimized queryset
class ChamaViewSet(viewsets.ModelViewSet):
    serializer_class = ChamaSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        """
        Optimized queryset that prevents N+1 queries.
        - select_related: created_by (foreign key)
        - prefetch_related: members, contributions (many-to-many/reverse FK)
        """
        return Chama.objects.select_related(
            'created_by'
        ).prefetch_related(
            'members',
            'members__user',  # Nested prefetch
            'contributions',
            'contributions__member'
        ).all()
```

**Testing for N+1 Queries:**

```python
# Install django-debug-toolbar to monitor queries
# settings.py
INSTALLED_APPS = [
    # ...
    'debug_toolbar',
]

MIDDLEWARE = [
    # ...
    'debug_toolbar.middleware.DebugToolbarMiddleware',
]

# Or use assertNumQueries in tests
from django.test import TestCase
from django.db import connection
from django.test.utils import override_settings

class ChamaQueryOptimizationTest(TestCase):
    def test_chama_list_query_count(self):
        """Ensure chama list doesn't trigger N+1 queries."""
        # Create test data
        user = User.objects.create_user(email='test@example.com')
        chamas = [Chama.objects.create(name=f'Chama {i}', created_by=user) 
                  for i in range(10)]
        
        # Should execute only 2 queries regardless of number of chamas
        # 1. Fetch chamas with select_related('created_by')
        # 2. Prefetch members
        with self.assertNumQueries(2):
            queryset = Chama.objects.select_related('created_by').prefetch_related('members')
            list(queryset)  # Force evaluation
```

### 4.2 Bulk Operations

Whenever modifying multiple records, use QuerySet methods instead of iterating and calling `save()` individually.

**Bad Example (Multiple Database Hits):**

```python
# DON'T DO THIS - executes N UPDATE queries
members = Member.objects.filter(chama=chama)
for member in members:
    member.is_active = False
    member.save()  # Each save() is a separate database query
```

**Good Example (Single Database Hit):**

```python
# DO THIS - executes 1 UPDATE query
Member.objects.filter(chama=chama).update(is_active=False)
```

**Bulk Create:**

```python
# Bad: Multiple INSERT queries
for i in range(100):
    Contribution.objects.create(
        member=member,
        amount=1000,
        date=datetime.now()
    )

# Good: Single INSERT query
contributions = [
    Contribution(member=member, amount=1000, date=datetime.now())
    for i in range(100)
]
Contribution.objects.bulk_create(contributions)
```

**Bulk Update with Django 4.2+:**

```python
# Update multiple objects with different values
contributions = Contribution.objects.filter(status='pending')
for contribution in contributions:
    contribution.status = 'approved'
    contribution.approved_at = datetime.now()

# Use bulk_update to save in single query
Contribution.objects.bulk_update(
    contributions,
    ['status', 'approved_at']
)
```

### 4.3 Optimized Query Execution

**Avoid Unnecessary Ordering:**

If the order of returned results doesn't matter for your use case, explicitly avoid using `.order_by()`. This prevents the database from performing potentially expensive sorting operations.

```python
# If order doesn't matter
Contribution.objects.filter(chama=chama).order_by()  # Empty order_by() removes default ordering

# Or specify in Meta
class Contribution(models.Model):
    # ...
    class Meta:
        ordering = []  # No default ordering
```

**Use only() and defer() for Large Models:**

```python
# Only fetch specific fields you need
users = User.objects.only('id', 'email', 'full_name')

# Defer loading of heavy fields (like TextField)
chamas = Chama.objects.defer('description', 'rules')
```

**Database Indexes:**

```python
# models.py
class Contribution(models.Model):
    member = models.ForeignKey(Member, on_delete=models.CASCADE)
    amount = models.DecimalField(max_digits=12, decimal_places=2)
    date = models.DateField()
    status = models.CharField(max_length=20)
    
    class Meta:
        indexes = [
            # Composite index for common query patterns
            models.Index(fields=['member', 'date']),
            models.Index(fields=['status', 'date']),
            # Partial index for specific queries
            models.Index(
                fields=['date'],
                name='pending_contributions_idx',
                condition=models.Q(status='pending')
            ),
        ]
```

### 4.4 Raw SQL Precaution

While Django's ORM provides built-in protection against SQL injection, if raw SQL is absolutely necessary, developers must use **parameterized queries** rather than string formatting.

**Dangerous (SQL Injection Vulnerability):**

```python
# NEVER DO THIS
user_input = request.GET.get('email')
User.objects.raw(f"SELECT * FROM users WHERE email = '{user_input}'")
```

**Safe (Parameterized Query):**

```python
# DO THIS
user_input = request.GET.get('email')
User.objects.raw(
    "SELECT * FROM users WHERE email = %s",
    [user_input]
)
```

### 4.5 Memory Management for Large QuerySets

For processing very large QuerySets that would otherwise consume excessive memory, use the `iterator()` method.

```python
# Bad: Loads all 1 million records into memory
all_contributions = Contribution.objects.all()
for contribution in all_contributions:
    process_contribution(contribution)

# Good: Streams records from database
all_contributions = Contribution.objects.all().iterator(chunk_size=1000)
for contribution in all_contributions:
    process_contribution(contribution)
```

### 4.6 Database Connection Pooling

Configure connection pooling to reuse database connections and reduce overhead.

```python
# settings/production.py
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': config('DB_NAME'),
        'USER': config('DB_USER'),
        'PASSWORD': config('DB_PASSWORD'),
        'HOST': config('DB_HOST'),
        'PORT': config('DB_PORT', default=5432),
        'CONN_MAX_AGE': 600,  # Connection pooling (10 minutes)
        'CONN_HEALTH_CHECKS': True,  # Check connection health
        'OPTIONS': {
            'connect_timeout': 10,
            'options': '-c statement_timeout=30000'  # 30 seconds
        }
    }
}
```

---

## 5. Handling API Interaction and CORS

A decoupled architecture necessitates careful configuration of **Cross-Origin Resource Sharing (CORS)** to allow the frontend domain to access the backend API.

### 5.1 DRF Serializers as Data Contracts

Serializers act as the **canonical data contract** between backend and frontend.

**Advanced Serializer Implementation:**

```python
# apps/chamas/serializers.py
from rest_framework import serializers
from apps.chamas.models import Chama, Member, Contribution
from apps.users.serializers import UserSerializer


class MemberSerializer(serializers.ModelSerializer):
    """Serializer for Chama members."""
    user = UserSerializer(read_only=True)
    user_id = serializers.PrimaryKeyRelatedField(
        queryset=User.objects.all(),
        source='user',
        write_only=True
    )
    
    class Meta:
        model = Member
        fields = [
            'id', 'user', 'user_id', 'chama', 'role',
            'joined_at', 'is_active'
        ]
        read_only_fields = ['id', 'joined_at']


class ContributionSerializer(serializers.ModelSerializer):
    """Serializer for contributions."""
    member_name = serializers.CharField(
        source='member.user.full_name',
        read_only=True
    )
    
    class Meta:
        model = Contribution
        fields = [
            'id', 'member', 'member_name', 'amount',
            'date', 'status', 'created_at'
        ]
        read_only_fields = ['id', 'created_at']


class ChamaSerializer(serializers.ModelSerializer):
    """
    Serializer for Chama with nested relationships.
    Includes conditional fields and complex validation.
    """
    created_by = UserSerializer(read_only=True)
    members = MemberSerializer(many=True, read_only=True)
    contributions = ContributionSerializer(many=True, read_only=True)
    
    # Computed fields
    total_contributions = serializers.SerializerMethodField()
    member_count = serializers.SerializerMethodField()
    
    class Meta:
        model = Chama
        fields = [
            'id', 'name', 'description', 'created_by',
            'created_at', 'is_active', 'members', 'contributions',
            'total_contributions', 'member_count'
        ]
        read_only_fields = ['id', 'created_at', 'created_by']
    
    def get_total_contributions(self, obj):
        """Calculate total contributions for this chama."""
        return obj.contributions.aggregate(
            total=models.Sum('amount')
        )['total'] or 0
    
    def get_member_count(self, obj):
        """Get active member count."""
        return obj.members.filter(is_active=True).count()
    
    def validate_name(self, value):
        """Custom validation for chama name."""
        if len(value) < 3:
            raise serializers.ValidationError(
                "Chama name must be at least 3 characters."
            )
        return value


class ChamaDetailSerializer(ChamaSerializer):
    """Extended serializer for detail view with additional data."""
    recent_contributions = serializers.SerializerMethodField()
    
    class Meta(ChamaSerializer.Meta):
        fields = ChamaSerializer.Meta.fields + ['recent_contributions']
    
    def get_recent_contributions(self, obj):
        """Get 10 most recent contributions."""
        recent = obj.contributions.select_related('member__user').order_by('-date')[:10]
        return ContributionSerializer(recent, many=True).data
```

### 5.2 CORS Configuration

Install and configure `django-cors-headers`:

```bash
pip install django-cors-headers
```

**Development Configuration:**

```python
# config/settings/development.py
INSTALLED_APPS = [
    # ...
    'corsheaders',
]

MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',  # Must be first
    'django.middleware.common.CommonMiddleware',
    # ... rest of middleware
]

# Allow all origins in development (for convenience)
CORS_ALLOW_ALL_ORIGINS = True
CORS_ALLOW_CREDENTIALS = True
```

**Production Configuration (CRITICAL):**

```python
# config/settings/production.py
INSTALLED_APPS = [
    # ...
    'corsheaders',
]

MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',
    'django.middleware.common.CommonMiddleware',
    # ... rest of middleware
]

# SECURITY: NEVER allow all origins in production
CORS_ALLOW_ALL_ORIGINS = False

# Whitelist only your frontend domain(s)
CORS_ALLOWED_ORIGINS = [
    'https://chamahub.com',
    'https://www.chamahub.com',
    'https://app.chamahub.com',
]

# Allow credentials (cookies, authorization headers)
CORS_ALLOW_CREDENTIALS = True

# Allowed methods
CORS_ALLOW_METHODS = [
    'DELETE',
    'GET',
    'OPTIONS',
    'PATCH',
    'POST',
    'PUT',
]

# Allowed headers
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

# Cache preflight requests for 1 hour
CORS_PREFLIGHT_MAX_AGE = 3600
```

**Testing CORS Configuration:**

```bash
# Test CORS from command line
curl -H "Origin: https://chamahub.com" \
     -H "Access-Control-Request-Method: POST" \
     -H "Access-Control-Request-Headers: Content-Type" \
     -X OPTIONS \
     https://api.chamahub.com/api/v1/chamas/ \
     --verbose
```

---

## Part III: Achieving Type-Safe Integration (The Seamless API Contract)

Bridging the Python-TypeScript gap is the cornerstone of a successful decoupled development lifecycle. If the two domains fall out of sync, the benefits of TypeScript are negated, leading to runtime data errors.

---

## 6. Prescribed Type Generation Workflow

The process of manually updating TypeScript interfaces to match Django REST Framework serializers is time-consuming and prone to human error. A robust architecture dictates that this process must be **automated**.

### 6.1 The Problem: Manual Type Definitions

**Manual approach (ERROR-PRONE):**

```typescript
// frontend/src/types/api.ts
// Manually maintained - can easily fall out of sync with backend

export interface User {
  id: number;
  email: string;
  full_name: string;
  phone_number: string;
  created_at: string;
}

export interface Chama {
  id: number;
  name: string;
  description: string;
  created_by: User;
  created_at: string;
  is_active: boolean;
  members: Member[];
  total_contributions: number;
  member_count: number;
}
```

**Problems:**
- ❌ Manual updates required when backend changes
- ❌ Easy to forget fields or use wrong types
- ❌ No compile-time safety across network boundary
- ❌ Developers must maintain two separate type definitions

### 6.2 The Solution: Automated Type Generation

**Benefits of automation:**
- ✅ Single source of truth (backend serializers)
- ✅ Automatic synchronization on build
- ✅ Compile-time type checking
- ✅ Reduced maintenance burden
- ✅ Catches API mismatches before deployment

---

## 7. Automation via Schema Generation

Two primary tools provide the necessary automation to bridge this gap:

### 7.1 Method 1: DRF Spectacular (OpenAPI Schema) - RECOMMENDED

**DRF Spectacular** generates a comprehensive OpenAPI 3.0 schema from your DRF views and serializers. Client-side code generators can then consume this schema to produce fully typed TypeScript clients.

#### Step 1: Install and Configure DRF Spectacular

```bash
# Backend
pip install drf-spectacular
```

```python
# config/settings/base.py
INSTALLED_APPS = [
    # ...
    'drf_spectacular',
]

REST_FRAMEWORK = {
    'DEFAULT_SCHEMA_CLASS': 'drf_spectacular.openapi.AutoSchema',
    'DEFAULT_AUTHENTICATION_CLASSES': [
        'rest_framework_simplejwt.authentication.JWTAuthentication',
    ],
    'DEFAULT_PERMISSION_CLASSES': [
        'rest_framework.permissions.IsAuthenticated',
    ],
    'DEFAULT_PAGINATION_CLASS': 'rest_framework.pagination.PageNumberPagination',
    'PAGE_SIZE': 20,
}

SPECTACULAR_SETTINGS = {
    'TITLE': 'ChamaHub API',
    'DESCRIPTION': 'API for managing Chama savings groups',
    'VERSION': '1.0.0',
    'SERVE_INCLUDE_SCHEMA': False,
    'COMPONENT_SPLIT_REQUEST': True,
    'SCHEMA_PATH_PREFIX': r'/api/v[0-9]',
}
```

#### Step 2: Add Schema URLs

```python
# config/urls.py
from django.urls import path, include
from drf_spectacular.views import (
    SpectacularAPIView,
    SpectacularSwaggerView,
    SpectacularRedocView,
)

urlpatterns = [
    # API documentation
    path('api/schema/', SpectacularAPIView.as_view(), name='schema'),
    path('api/docs/', SpectacularSwaggerView.as_view(url_name='schema'), name='swagger-ui'),
    path('api/redoc/', SpectacularRedocView.as_view(url_name='schema'), name='redoc'),
    
    # API endpoints
    path('api/v1/', include('apps.users.urls')),
    path('api/v1/', include('apps.chamas.urls')),
]
```

#### Step 3: Generate OpenAPI Schema

```bash
# Generate schema.yaml file
python manage.py spectacular --file schema.yaml

# Or generate schema.json
python manage.py spectacular --format openapi-json --file schema.json
```

#### Step 4: Install Frontend Code Generator (Orval)

```bash
# Frontend
npm install -D orval
```

#### Step 5: Configure Orval

Create `orval.config.ts` in your frontend project:

```typescript
// orval.config.ts
import { defineConfig } from 'orval';

export default defineConfig({
  chamahub: {
    input: {
      target: 'http://localhost:8000/api/schema/',
      // Or use local file after generating it
      // target: './schema.yaml',
    },
    output: {
      mode: 'tags-split',
      target: 'src/api/generated',
      schemas: 'src/api/generated/models',
      client: 'react-query',
      mock: true,
      clean: true,
      prettier: true,
      override: {
        mutator: {
          path: 'src/api/client.ts',
          name: 'customInstance',
        },
      },
    },
  },
});
```

#### Step 6: Create Custom Axios Instance

```typescript
// src/api/client.ts
import Axios, { AxiosRequestConfig } from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

export const axios = Axios.create({
  baseURL: API_BASE_URL,
});

// Add JWT token to requests
axios.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle token refresh on 401
axios.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        const refreshToken = localStorage.getItem('refresh_token');
        const response = await Axios.post(`${API_BASE_URL}/api/v1/auth/token/refresh/`, {
          refresh: refreshToken,
        });
        
        const { access } = response.data;
        localStorage.setItem('access_token', access);
        
        originalRequest.headers.Authorization = `Bearer ${access}`;
        return axios(originalRequest);
      } catch (refreshError) {
        // Redirect to login
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }
    
    return Promise.reject(error);
  }
);

// Custom instance for Orval
export const customInstance = <T>(config: AxiosRequestConfig): Promise<T> => {
  return axios(config).then(({ data }) => data);
};
```

#### Step 7: Generate TypeScript Client

Add script to `package.json`:

```json
{
  "scripts": {
    "generate:api": "orval --config ./orval.config.ts"
  }
}
```

Run generation:

```bash
npm run generate:api
```

**Generated files:**

```
src/api/generated/
├── models/
│   ├── user.ts           # User interface
│   ├── chama.ts          # Chama interface
│   ├── contribution.ts   # Contribution interface
│   └── index.ts
├── users/
│   └── users.ts          # User API endpoints
├── chamas/
│   └── chamas.ts         # Chama API endpoints
└── index.ts
```

**Example generated TypeScript types:**

```typescript
// src/api/generated/models/chama.ts (AUTO-GENERATED)
export interface Chama {
  id: number;
  name: string;
  description: string;
  created_by: User;
  created_at: string;
  is_active: boolean;
  members: Member[];
  contributions: Contribution[];
  total_contributions: number;
  member_count: number;
}

export interface ChamaCreate {
  name: string;
  description: string;
}
```

**Example generated React Query hooks:**

```typescript
// src/api/generated/chamas/chamas.ts (AUTO-GENERATED)
import { useQuery, useMutation, UseQueryOptions, UseMutationOptions } from '@tanstack/react-query';
import { Chama, ChamaCreate } from '../models';
import { customInstance } from '../../client';

export const getChamasList = (options?: AxiosRequestConfig) => {
  return customInstance<Chama[]>({ url: '/api/v1/chamas/', method: 'GET', ...options });
};

export const useGetChamasList = <TData = Chama[]>(
  options?: UseQueryOptions<Chama[], Error, TData>
) => {
  return useQuery<Chama[], Error, TData>(
    ['chamas'],
    () => getChamasList(),
    options
  );
};

export const createChama = (chamaCreate: ChamaCreate, options?: AxiosRequestConfig) => {
  return customInstance<Chama>({
    url: '/api/v1/chamas/',
    method: 'POST',
    data: chamaCreate,
    ...options,
  });
};

export const useCreateChama = <TError = Error, TContext = unknown>(
  options?: UseMutationOptions<Chama, TError, ChamaCreate, TContext>
) => {
  return useMutation<Chama, TError, ChamaCreate, TContext>(
    (data) => createChama(data),
    options
  );
};
```

### 7.2 Method 2: Django Typomatic (Direct Serializer to TypeScript)

**Django Typomatic** provides a direct way to generate TypeScript interfaces from decorated DRF serializers.

#### Step 1: Install Django Typomatic

```bash
pip install django-typomatic
```

#### Step 2: Decorate Serializers

```python
# apps/chamas/serializers.py
from typomatic import ts_interface
from rest_framework import serializers

@ts_interface()
class ChamaSerializer(serializers.ModelSerializer):
    total_contributions = serializers.SerializerMethodField()
    member_count = serializers.SerializerMethodField()
    
    class Meta:
        model = Chama
        fields = [
            'id', 'name', 'description', 'created_by',
            'created_at', 'is_active', 'total_contributions',
            'member_count'
        ]
```

#### Step 3: Generate TypeScript Interfaces

```bash
# Generate TypeScript interfaces
python manage.py generate_ts --output frontend/src/types/api.ts
```

**Generated TypeScript:**

```typescript
// frontend/src/types/api.ts (AUTO-GENERATED)
export interface Chama {
  id: number;
  name: string;
  description: string;
  created_by: number;
  created_at: string;
  is_active: boolean;
  total_contributions: number;
  member_count: number;
}
```

### 7.3 Comparison: DRF Spectacular vs Django Typomatic

| Feature | DRF Spectacular | Django Typomatic |
|---------|----------------|------------------|
| **Schema Type** | OpenAPI 3.0 (industry standard) | Direct Python → TypeScript |
| **API Documentation** | ✅ Swagger UI, ReDoc | ❌ No built-in docs |
| **Client Generation** | ✅ Full API client with React Query hooks | ❌ Types only |
| **Ecosystem** | ✅ Works with many code generators | ⚠️ Limited to TypeScript |
| **Maintenance** | ✅ Active, well-supported | ⚠️ Less active |
| **Best For** | Production apps, teams | Simple projects, quick prototypes |

**Recommendation:** Use **DRF Spectacular** for production applications. It provides comprehensive API documentation and generates complete, typed API clients.

---

## 8. Frontend Consumption with Typed Data

On the React/TypeScript side, the data fetching logic must utilize these generated interfaces. By fetching data and validating the response structure against generated TypeScript models, the application maintains **end-to-end type safety**.

### 8.1 Using Generated React Query Hooks

```typescript
// src/pages/ChamaList.tsx
import React from 'react';
import { useGetChamasList, useCreateChama } from '@/api/generated/chamas/chamas';
import { ChamaCreate } from '@/api/generated/models';

export const ChamaList: React.FC = () => {
  // Fetch chamas with automatic type inference
  const { data: chamas, isLoading, error } = useGetChamasList();
  
  // Create chama mutation
  const createChamaMutation = useCreateChama({
    onSuccess: () => {
      // Invalidate and refetch
      queryClient.invalidateQueries(['chamas']);
    },
  });
  
  const handleCreate = (formData: ChamaCreate) => {
    createChamaMutation.mutate(formData);
  };
  
  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;
  
  return (
    <div>
      <h1>Chamas</h1>
      {chamas?.map((chama) => (
        <div key={chama.id}>
          {/* TypeScript knows exact shape of chama */}
          <h2>{chama.name}</h2>
          <p>{chama.description}</p>
          <p>Members: {chama.member_count}</p>
          <p>Total: KSh {chama.total_contributions.toLocaleString()}</p>
        </div>
      ))}
    </div>
  );
};
```

### 8.2 Type Safety Guarantees

**Compile-time type checking:**

```typescript
// This will cause a TypeScript error if 'name' field doesn't exist
const chamaName = chama.name;  // ✅ TypeScript knows this exists

// This will cause a TypeScript error
const invalidField = chama.invalidField;  // ❌ Error: Property 'invalidField' does not exist
```

**Autocomplete and IntelliSense:**

IDEs provide autocomplete for all fields based on generated types:

```typescript
chama.  // IDE shows: id, name, description, created_by, created_at, etc.
```

### 8.3 Runtime Validation (Optional but Recommended)

For additional safety, validate API responses at runtime using Zod:

```bash
npm install zod
```

```typescript
// src/api/validation.ts
import { z } from 'zod';

export const ChamaSchema = z.object({
  id: z.number(),
  name: z.string(),
  description: z.string(),
  created_by: z.object({
    id: z.number(),
    email: z.string().email(),
    full_name: z.string(),
  }),
  created_at: z.string().datetime(),
  is_active: z.boolean(),
  member_count: z.number(),
  total_contributions: z.number(),
});

// Use in API client
export const getChamasListWithValidation = async () => {
  const response = await customInstance<unknown>({ url: '/api/v1/chamas/', method: 'GET' });
  return z.array(ChamaSchema).parse(response);
};
```

---

## Part IV: Advanced Frontend Mastery and Mobility

The frontend architecture moves beyond basic rendering to focus on complex state management, optimal data fetching, and adaptation to different platforms.

---

## 9. Advanced Routing and Route Protection

Frontend routing, typically managed by React Router, must incorporate protective measures to secure application routes and handle dynamic navigation patterns.

### 9.1 Installing React Router

```bash
npm install react-router-dom
npm install -D @types/react-router-dom
```

### 9.2 Dynamic Page Routing

Dynamic routing is necessary to handle complex URLs, such as user profiles or resource details.

```typescript
// src/App.tsx
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Dashboard } from '@/pages/Dashboard';
import { ChamaList } from '@/pages/ChamaList';
import { ChamaDetail } from '@/pages/ChamaDetail';
import { UserProfile } from '@/pages/UserProfile';
import { Login } from '@/pages/Login';
import { NotFound } from '@/pages/NotFound';

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public routes */}
        <Route path="/login" element={<Login />} />
        
        {/* Protected routes */}
        <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/chamas" element={<ProtectedRoute><ChamaList /></ProtectedRoute>} />
        <Route path="/chamas/:chamaId" element={<ProtectedRoute><ChamaDetail /></ProtectedRoute>} />
        <Route path="/profile/:userId" element={<ProtectedRoute><UserProfile /></ProtectedRoute>} />
        
        {/* 404 Not Found */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
};
```

### 9.3 Route Guards - Protected Routes

Critical routes (e.g., dashboard, settings) must be protected using "route guards." These components check the authentication state (presence and validity of the JWT) and redirect unauthorized users to the login page.

```typescript
// src/components/ProtectedRoute.tsx
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: string;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  requiredRole 
}) => {
  const { accessToken, user } = useAuthStore();
  const location = useLocation();
  
  // Check if user is authenticated
  if (!accessToken) {
    // Redirect to login page with return URL
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  
  // Check if JWT is expired (basic validation)
  const isTokenExpired = () => {
    if (!accessToken) return true;
    
    try {
      const payload = JSON.parse(atob(accessToken.split('.')[1]));
      const expirationTime = payload.exp * 1000; // Convert to milliseconds
      return Date.now() >= expirationTime;
    } catch (error) {
      return true;
    }
  };
  
  if (isTokenExpired()) {
    // Token expired, redirect to login
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  
  // Check role-based access if required
  if (requiredRole && user?.role !== requiredRole) {
    return <Navigate to="/unauthorized" replace />;
  }
  
  return <>{children}</>;
};
```

### 9.4 Advanced Route Guard with Token Refresh

For production applications, the route guard should attempt to refresh the token before redirecting:

```typescript
// src/components/AdvancedProtectedRoute.tsx
import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';
import { axios } from '@/api/client';

interface AdvancedProtectedRouteProps {
  children: React.ReactNode;
  requiredPermission?: string;
}

export const AdvancedProtectedRoute: React.FC<AdvancedProtectedRouteProps> = ({ 
  children,
  requiredPermission 
}) => {
  const { accessToken, refreshToken, setTokens, logout } = useAuthStore();
  const location = useLocation();
  const [isValidating, setIsValidating] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);
  
  useEffect(() => {
    const validateAuth = async () => {
      if (!accessToken) {
        setIsValidating(false);
        return;
      }
      
      // Check if token is expired
      const isExpired = () => {
        try {
          const payload = JSON.parse(atob(accessToken.split('.')[1]));
          return Date.now() >= payload.exp * 1000;
        } catch {
          return true;
        }
      };
      
      if (isExpired() && refreshToken) {
        try {
          // Attempt to refresh the token
          const response = await axios.post('/api/v1/auth/token/refresh/', {
            refresh: refreshToken,
          });
          setTokens(response.data.access, refreshToken);
          setIsAuthorized(true);
        } catch (error) {
          // Refresh failed, logout user
          logout();
          setIsAuthorized(false);
        }
      } else if (!isExpired()) {
        setIsAuthorized(true);
      } else {
        setIsAuthorized(false);
      }
      
      setIsValidating(false);
    };
    
    validateAuth();
  }, [accessToken, refreshToken, setTokens, logout]);
  
  if (isValidating) {
    return <div>Loading...</div>;
  }
  
  if (!isAuthorized) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  
  return <>{children}</>;
};
```

### 9.5 Programmatic Navigation

Use React Router hooks for programmatic navigation:

```typescript
// src/pages/Login.tsx
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';

export const Login: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { setTokens, setUser } = useAuthStore();
  
  const from = (location.state as any)?.from?.pathname || '/';
  
  const handleLogin = async (email: string, password: string) => {
    try {
      const response = await axios.post('/api/v1/auth/login/', {
        email,
        password,
      });
      
      setTokens(response.data.access, response.data.refresh);
      setUser(response.data.user);
      
      // Redirect to original destination or dashboard
      navigate(from, { replace: true });
    } catch (error) {
      console.error('Login failed:', error);
    }
  };
  
  // ... rest of login component
};
```

---

## 10. State Management Deep Dive

Choosing the correct state management library is vital for application performance and developer overhead. Modern React applications require a clear separation between **server state** (data from APIs) and **client state** (UI state, user preferences).

### 10.1 The Dichotomy: Server State vs Client State

**Server State:**
- Data fetched from Django backend
- Asynchronous by nature
- Potentially outdated (requires synchronization)
- Examples: user data, chamas, contributions

**Client State:**
- Local UI state
- Synchronous
- Always up-to-date
- Examples: modal open/closed, form inputs, theme preferences

### 10.2 Recommended Solution: Zustand for Client State

For most modern React applications, **Zustand** offers a superior balance of performance and minimalism for managing client-side state.

**Why Zustand?**

✅ **Simplified Flux Principles:** Operates on flux principles but without the boilerplate of Redux  
✅ **Hook-Based API:** Comfortable, modern React hooks interface  
✅ **Un-opinionated:** No strict architectural requirements  
✅ **Minimal Boilerplate:** Significantly less code than Redux  
✅ **Optimized Performance:** Engineered to avoid React pitfalls  
✅ **No Provider Wrapping:** Cleaner root component structure  
✅ **TypeScript-First:** Excellent TypeScript support out of the box

**Critical Performance Advantages:**

Zustand has been engineered to avoid common React pitfalls:
- **Zombie Child Problem:** Eliminated through proper subscription handling
- **Context Loss:** No context providers means no context loss
- **Unnecessary Re-renders:** Selective state consumption prevents wasted renders

**Installation:**

```bash
npm install zustand
```

**Basic Zustand Store:**

```typescript
// src/stores/uiStore.ts
import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

interface UIState {
  theme: 'light' | 'dark';
  sidebarOpen: boolean;
  notifications: Array<{ id: string; message: string; type: string }>;
  
  // Actions
  setTheme: (theme: 'light' | 'dark') => void;
  toggleSidebar: () => void;
  addNotification: (notification: { message: string; type: string }) => void;
  removeNotification: (id: string) => void;
}

export const useUIStore = create<UIState>()(
  devtools(
    persist(
      (set, get) => ({
        theme: 'light',
        sidebarOpen: true,
        notifications: [],
        
        setTheme: (theme) => set({ theme }),
        
        toggleSidebar: () => set((state) => ({ 
          sidebarOpen: !state.sidebarOpen 
        })),
        
        addNotification: (notification) => set((state) => ({
          notifications: [
            ...state.notifications,
            { ...notification, id: Math.random().toString(36) }
          ]
        })),
        
        removeNotification: (id) => set((state) => ({
          notifications: state.notifications.filter(n => n.id !== id)
        })),
      }),
      {
        name: 'ui-storage', // localStorage key
        partialize: (state) => ({ theme: state.theme }), // Only persist theme
      }
    )
  )
);
```

**Selective State Consumption (Performance Optimization):**

```typescript
// ❌ Bad: Component re-renders on ANY state change
const Component = () => {
  const store = useUIStore();
  return <div>{store.theme}</div>;
};

// ✅ Good: Component only re-renders when theme changes
const Component = () => {
  const theme = useUIStore((state) => state.theme);
  return <div>{theme}</div>;
};

// ✅ Even better: Multiple selective subscriptions
const Component = () => {
  const theme = useUIStore((state) => state.theme);
  const sidebarOpen = useUIStore((state) => state.sidebarOpen);
  const toggleSidebar = useUIStore((state) => state.toggleSidebar);
  
  return (
    <div className={theme}>
      <button onClick={toggleSidebar}>
        Toggle Sidebar ({sidebarOpen ? 'Open' : 'Closed'})
      </button>
    </div>
  );
};
```

**Advanced: Computed Values with Zustand:**

```typescript
// src/stores/cartStore.ts
import { create } from 'zustand';

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

interface CartState {
  items: CartItem[];
  
  // Computed values (as getters)
  totalItems: () => number;
  totalPrice: () => number;
  
  // Actions
  addItem: (item: CartItem) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
}

export const useCartStore = create<CartState>()((set, get) => ({
  items: [],
  
  // Computed values
  totalItems: () => {
    return get().items.reduce((sum, item) => sum + item.quantity, 0);
  },
  
  totalPrice: () => {
    return get().items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  },
  
  // Actions
  addItem: (item) => set((state) => {
    const existingItem = state.items.find(i => i.id === item.id);
    if (existingItem) {
      return {
        items: state.items.map(i =>
          i.id === item.id
            ? { ...i, quantity: i.quantity + 1 }
            : i
        )
      };
    }
    return { items: [...state.items, { ...item, quantity: 1 }] };
  }),
  
  removeItem: (id) => set((state) => ({
    items: state.items.filter(item => item.id !== id)
  })),
  
  updateQuantity: (id, quantity) => set((state) => ({
    items: state.items.map(item =>
      item.id === id ? { ...item, quantity } : item
    )
  })),
}));
```

### 10.3 Alternatives: When to Consider Other Solutions

**Redux Toolkit:**
- ✅ Use for: Extremely large applications with rigid architectural requirements
- ✅ Benefits: Highly predictable state flow, time-travel debugging, extensive ecosystem
- ❌ Drawbacks: Significant boilerplate, steeper learning curve, provider wrapping required

```bash
npm install @reduxjs/toolkit react-redux
```

**Recoil:**
- ✅ Use for: Applications requiring atomic state units with complex dependency graphs
- ✅ Benefits: Atom-based architecture, excellent for derived state
- ❌ Drawbacks: Facebook-backed but less community adoption, requires provider wrapping

**Jotai:**
- ✅ Use for: Similar to Recoil but more minimal
- ✅ Benefits: Atomic state, minimal API, no providers
- ❌ Drawbacks: Smaller ecosystem than Zustand or Redux

### 10.4 Best Practice: Zustand + React Query Pattern

The recommended architecture separates concerns clearly:

```typescript
// ✅ Server state: React Query
const { data: chamas } = useGetChamasList();

// ✅ Client state: Zustand
const theme = useUIStore((state) => state.theme);
const setTheme = useUIStore((state) => state.setTheme);

// ❌ Don't mix: Don't put server data in Zustand
// Bad: const chamas = useUIStore((state) => state.chamas);
```

**Complete Example:**

```typescript
// src/pages/Dashboard.tsx
import React from 'react';
import { useGetChamasList } from '@/api/generated/chamas/chamas';
import { useUIStore } from '@/stores/uiStore';
import { useAuthStore } from '@/stores/authStore';

export const Dashboard: React.FC = () => {
  // Server state (React Query)
  const { data: chamas, isLoading } = useGetChamasList();
  
  // Client state (Zustand)
  const theme = useUIStore((state) => state.theme);
  const sidebarOpen = useUIStore((state) => state.sidebarOpen);
  const user = useAuthStore((state) => state.user);
  
  return (
    <div className={`dashboard theme-${theme}`}>
      <h1>Welcome, {user?.full_name}</h1>
      {isLoading ? (
        <div>Loading chamas...</div>
      ) : (
        <div>
          <h2>Your Chamas ({chamas?.length})</h2>
          {/* ... render chamas */}
        </div>
      )}
    </div>
  );
};
```

---

## 11. Data Fetching and Synchronization

Handling asynchronous server state (data fetched from Django) is conceptually separate from handling local UI state (managed by Zustand). Specialized libraries abstract away the complexity of caching, background synchronization, retries, and error handling.

### 11.1 Server State Management with React Query

**React Query** (TanStack Query) is prescribed for managing server state. These tools significantly improve the user experience and reduce manual development effort.

**Key Benefits:**
- ✅ Automatic caching and cache invalidation
- ✅ Background refetching and synchronization
- ✅ Automatic retries on failure
- ✅ Request deduplication
- ✅ Optimistic updates
- ✅ Pagination and infinite scroll support
- ✅ Prefetching capabilities

**Installation:**

```bash
npm install @tanstack/react-query @tanstack/react-query-devtools
```

**Setup:**

```typescript
// src/main.tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import App from './App';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes - data is fresh for this duration
      cacheTime: 10 * 60 * 1000, // 10 minutes - cache persists for this duration
      refetchOnWindowFocus: false, // Don't refetch when window regains focus
      refetchOnReconnect: true, // Refetch when reconnecting to internet
      retry: 1, // Retry failed requests once
    },
  },
});

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <App />
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  </React.StrictMode>
);
```

### 11.2 Advanced Caching Strategies

**Cache Management:**

```typescript
// src/hooks/useChamaData.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getChamasList, createChama, updateChama, deleteChama } from '@/api/generated/chamas/chamas';

export const useChamasList = () => {
  return useQuery({
    queryKey: ['chamas'],
    queryFn: getChamasList,
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000, // 10 minutes
  });
};

export const useChamaDetail = (chamaId: string) => {
  return useQuery({
    queryKey: ['chamas', chamaId],
    queryFn: () => getChama(chamaId),
    enabled: !!chamaId, // Only run if chamaId exists
    staleTime: 3 * 60 * 1000, // 3 minutes
  });
};

export const useCreateChama = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: createChama,
    onSuccess: (newChama) => {
      // Invalidate chamas list to trigger refetch
      queryClient.invalidateQueries({ queryKey: ['chamas'] });
      
      // Or optimistically add to cache
      queryClient.setQueryData<Chama[]>(['chamas'], (old) => {
        return old ? [...old, newChama] : [newChama];
      });
    },
  });
};
```

**Background Synchronization:**

```typescript
// Automatic background refetching
export const useChamasList = () => {
  return useQuery({
    queryKey: ['chamas'],
    queryFn: getChamasList,
    refetchInterval: 60000, // Refetch every 60 seconds
    refetchIntervalInBackground: true, // Continue refetching even when tab is in background
  });
};
```

**Error Handling and Retries:**

```typescript
// src/hooks/useChamaData.ts
import { useQuery } from '@tanstack/react-query';
import { AxiosError } from 'axios';

export const useChamasList = () => {
  return useQuery({
    queryKey: ['chamas'],
    queryFn: getChamasList,
    retry: (failureCount, error) => {
      const axiosError = error as AxiosError;
      // Don't retry on 404 or 401
      if (axiosError.response?.status === 404 || axiosError.response?.status === 401) {
        return false;
      }
      // Retry up to 3 times for other errors
      return failureCount < 3;
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    onError: (error: AxiosError) => {
      console.error('Failed to fetch chamas:', error.message);
      // Show user-friendly error message
    },
  });
};
```

### 11.3 Pagination Implementation

When displaying large lists of data, dynamic pagination must be implemented. The frontend communicates the desired page number and results limit to the Django REST Framework backend, which handles server-side pagination efficiently.

**Backend Pagination Setup (Django):**

```python
# config/settings/base.py
REST_FRAMEWORK = {
    'DEFAULT_PAGINATION_CLASS': 'rest_framework.pagination.PageNumberPagination',
    'PAGE_SIZE': 20,
}
```

**Custom Paginator:**

```python
# apps/core/pagination.py
from rest_framework.pagination import PageNumberPagination
from rest_framework.response import Response

class StandardResultsSetPagination(PageNumberPagination):
    page_size = 20
    page_size_query_param = 'page_size'
    max_page_size = 100
    
    def get_paginated_response(self, data):
        return Response({
            'count': self.page.paginator.count,
            'next': self.get_next_link(),
            'previous': self.get_previous_link(),
            'total_pages': self.page.paginator.num_pages,
            'current_page': self.page.number,
            'results': data
        })
```

**Frontend Pagination with React Query:**

```typescript
// src/hooks/usePaginatedChamas.ts
import { useQuery } from '@tanstack/react-query';
import { axios } from '@/api/client';

interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  total_pages: number;
  current_page: number;
  results: T[];
}

export const usePaginatedChamas = (page: number, pageSize: number = 20) => {
  return useQuery({
    queryKey: ['chamas', 'paginated', page, pageSize],
    queryFn: async (): Promise<PaginatedResponse<Chama>> => {
      const response = await axios.get('/api/v1/chamas/', {
        params: { page, page_size: pageSize },
      });
      return response.data;
    },
    keepPreviousData: true, // Keep old data while fetching new page
    staleTime: 5 * 60 * 1000,
  });
};
```

**Pagination Component:**

```typescript
// src/components/PaginatedChamaList.tsx
import React, { useState } from 'react';
import { usePaginatedChamas } from '@/hooks/usePaginatedChamas';

export const PaginatedChamaList: React.FC = () => {
  const [page, setPage] = useState(1);
  const [pageSize] = useState(20);
  
  const { data, isLoading, isFetching, isPreviousData } = usePaginatedChamas(page, pageSize);
  
  return (
    <div>
      <h1>Chamas</h1>
      
      {isLoading ? (
        <div>Loading...</div>
      ) : (
        <>
          <div className="grid grid-cols-3 gap-4">
            {data?.results.map((chama) => (
              <div key={chama.id} className={isPreviousData ? 'opacity-50' : ''}>
                <h3>{chama.name}</h3>
                <p>{chama.description}</p>
              </div>
            ))}
          </div>
          
          {/* Pagination Controls */}
          <div className="flex gap-2 mt-4">
            <button
              onClick={() => setPage((old) => Math.max(old - 1, 1))}
              disabled={page === 1 || isFetching}
            >
              Previous
            </button>
            
            <span>
              Page {page} of {data?.total_pages}
            </span>
            
            <button
              onClick={() => {
                if (!isPreviousData && data?.next) {
                  setPage((old) => old + 1);
                }
              }}
              disabled={!data?.next || isFetching}
            >
              Next
            </button>
          </div>
          
          <div className="text-sm text-gray-600 mt-2">
            Showing {data?.results.length} of {data?.count} total chamas
          </div>
        </>
      )}
    </div>
  );
};
```

### 11.4 Infinite Scroll Implementation

For mobile-friendly interfaces:

```typescript
// src/hooks/useInfiniteChamas.ts
import { useInfiniteQuery } from '@tanstack/react-query';
import { axios } from '@/api/client';

export const useInfiniteChamas = (pageSize: number = 20) => {
  return useInfiniteQuery({
    queryKey: ['chamas', 'infinite'],
    queryFn: async ({ pageParam = 1 }) => {
      const response = await axios.get('/api/v1/chamas/', {
        params: { page: pageParam, page_size: pageSize },
      });
      return response.data;
    },
    getNextPageParam: (lastPage) => {
      if (lastPage.next) {
        return lastPage.current_page + 1;
      }
      return undefined;
    },
  });
};
```

```typescript
// src/components/InfiniteChamaList.tsx
import React, { useEffect } from 'react';
import { useInView } from 'react-intersection-observer';
import { useInfiniteChamas } from '@/hooks/useInfiniteChamas';

export const InfiniteChamaList: React.FC = () => {
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
  } = useInfiniteChamas();
  
  const { ref, inView } = useInView();
  
  useEffect(() => {
    if (inView && hasNextPage) {
      fetchNextPage();
    }
  }, [inView, hasNextPage, fetchNextPage]);
  
  if (isLoading) return <div>Loading...</div>;
  
  return (
    <div>
      {data?.pages.map((page, i) => (
        <React.Fragment key={i}>
          {page.results.map((chama) => (
            <div key={chama.id}>
              <h3>{chama.name}</h3>
              <p>{chama.description}</p>
            </div>
          ))}
        </React.Fragment>
      ))}
      
      {/* Load more trigger */}
      <div ref={ref}>
        {isFetchingNextPage ? 'Loading more...' : hasNextPage ? 'Load More' : 'No more chamas'}
      </div>
    </div>
  );
};
```

### 11.5 Optimistic Updates

Optimistic updates improve perceived performance by immediately updating the UI before the server confirms the change.

```typescript
// src/hooks/useOptimisticChama.ts
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updateChama } from '@/api/generated/chamas/chamas';
import { Chama } from '@/api/generated/models';

export const useOptimisticChamaUpdate = () => {
  const queryClient = useQueryClient();
  
  return useMutation(
    ({ id, data }: { id: number; data: Partial<Chama> }) =>
      updateChama(id, data),
    {
      // Optimistically update cache before request completes
      onMutate: async ({ id, data }) => {
        // Cancel outgoing refetches to avoid race conditions
        await queryClient.cancelQueries(['chamas', id]);
        
        // Snapshot previous value for rollback
        const previousChama = queryClient.getQueryData<Chama>(['chamas', id]);
        
        // Optimistically update the cache
        queryClient.setQueryData<Chama>(['chamas', id], (old) => ({
          ...old!,
          ...data,
        }));
        
        return { previousChama };
      },
      // Rollback on error
      onError: (err, variables, context) => {
        queryClient.setQueryData(['chamas', variables.id], context?.previousChama);
        // Show error notification
        console.error('Update failed, rolling back:', err);
      },
      // Refetch after success or error
      onSettled: (data, error, variables) => {
        queryClient.invalidateQueries(['chamas', variables.id]);
      },
    }
  );
};
```

---

## 12. Progressive Web App (PWA) Implementation

Turning the React application into a Progressive Web App (PWA) enhances reliability, speed, and installability. PWAs provide app-like experiences on the web with offline support, push notifications, and home screen installation.

### 12.1 PWA Setup

A new project can be initialized using the dedicated PWA template for Create React App:

```bash
# For Create React App
npx create-react-app pwa-app --template cra-template-pwa-typescript

# For Vite (recommended)
npm install -D vite-plugin-pwa
```

For existing Vite builds, manual configuration of the Web App Manifest and service worker generation plugins is required.

### 12.2 Service Worker Configuration

The service worker is the core component that enables caching and offline capabilities. The template typically includes a pre-configured service worker file, which must be correctly registered to begin intercepting network requests and serving cached content.

```typescript
// vite.config.ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'masked-icon.svg'],
      manifest: {
        name: 'ChamaHub - Digital Savings Groups',
        short_name: 'ChamaHub',
        description: 'Manage your Chama savings groups digitally',
        theme_color: '#ffffff',
        background_color: '#ffffff',
        display: 'standalone',
        start_url: '/',
        orientation: 'portrait',
        icons: [
          {
            src: 'pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable',
          },
        ],
      },
      workbox: {
        runtimeCaching: [
          {
            // API caching with NetworkFirst strategy
            urlPattern: /^https:\/\/api\.chamahub\.com\/api\/v1\/.*/i,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'api-cache',
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 5 * 60, // 5 minutes
              },
              cacheableResponse: {
                statuses: [0, 200],
              },
              networkTimeoutSeconds: 10,
            },
          },
          {
            // Image caching with CacheFirst strategy
            urlPattern: /\.(?:png|jpg|jpeg|svg|gif|webp)$/,
            handler: 'CacheFirst',
            options: {
              cacheName: 'image-cache',
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 30 * 24 * 60 * 60, // 30 days
              },
            },
          },
          {
            // Static assets with StaleWhileRevalidate
            urlPattern: /\.(?:js|css|woff2?)$/,
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'static-cache',
              expiration: {
                maxEntries: 60,
                maxAgeSeconds: 7 * 24 * 60 * 60, // 7 days
              },
            },
          },
        ],
      },
    }),
  ],
});
```

### 12.3 Manifest File

The `public/manifest.json` file contains metadata that allows the browser to install the application as a native app on desktop or mobile devices. Critical properties like `name`, `short_name`, `start_url`, and `theme_color` must be updated accurately.

```json
{
  "name": "ChamaHub - Digital Savings Groups Platform",
  "short_name": "ChamaHub",
  "description": "Manage your Chama savings groups with ease",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#ffffff",
  "theme_color": "#4F46E5",
  "orientation": "portrait-primary",
  "icons": [
    {
      "src": "/icons/icon-72x72.png",
      "sizes": "72x72",
      "type": "image/png",
      "purpose": "any"
    },
    {
      "src": "/icons/icon-96x96.png",
      "sizes": "96x96",
      "type": "image/png",
      "purpose": "any"
    },
    {
      "src": "/icons/icon-128x128.png",
      "sizes": "128x128",
      "type": "image/png",
      "purpose": "any"
    },
    {
      "src": "/icons/icon-144x144.png",
      "sizes": "144x144",
      "type": "image/png",
      "purpose": "any"
    },
    {
      "src": "/icons/icon-152x152.png",
      "sizes": "152x152",
      "type": "image/png",
      "purpose": "any"
    },
    {
      "src": "/icons/icon-192x192.png",
      "sizes": "192x192",
      "type": "image/png",
      "purpose": "any"
    },
    {
      "src": "/icons/icon-384x384.png",
      "sizes": "384x384",
      "type": "image/png",
      "purpose": "any"
    },
    {
      "src": "/icons/icon-512x512.png",
      "sizes": "512x512",
      "type": "image/png",
      "purpose": "any maskable"
    }
  ]
}
```

### 12.4 Service Worker Registration

```typescript
// src/main.tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { registerSW } from 'virtual:pwa-register';

// Register service worker
const updateSW = registerSW({
  onNeedRefresh() {
    if (confirm('New content available. Reload?')) {
      updateSW(true);
    }
  },
  onOfflineReady() {
    console.log('App ready to work offline');
  },
});

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
```

### 12.5 Offline Support

```typescript
// src/hooks/useOnlineStatus.ts
import { useState, useEffect } from 'react';

export const useOnlineStatus = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);
  
  return isOnline;
};
```

```typescript
// src/components/OfflineBanner.tsx
import React from 'react';
import { useOnlineStatus } from '@/hooks/useOnlineStatus';

export const OfflineBanner: React.FC = () => {
  const isOnline = useOnlineStatus();
  
  if (isOnline) return null;
  
  return (
    <div className="bg-yellow-500 text-white px-4 py-2 text-center">
      You are currently offline. Some features may be unavailable.
    </div>
  );
};
```

### 12.6 Validation and Auditing

After implementing the PWA essentials, the application must be tested. Running a production build allows developers to test offline behavior. The process requires mandatory validation using the Google Lighthouse Audit tool.

**Building for Production:**

```bash
# Build the production version
npm run build

# Preview the build locally
npm run preview
```

**Testing PWA Functionality:**

1. Open the preview URL in Chrome
2. Open DevTools (F12)
3. Go to Application tab
4. Check Service Workers section
5. Test offline mode using the "Offline" checkbox in the Network tab

**Running Lighthouse Audit:**

1. Open Chrome DevTools
2. Navigate to the "Lighthouse" tab
3. Select "Progressive Web App" category
4. Click "Analyze page load"

**Lighthouse Checklist:**

The audit provides a quantifiable score (0-100) and highlights specific areas:

✅ **Installability:**
- Registers a service worker
- Responds with a 200 when offline
- Has a web app manifest
- Sets viewport meta tag
- Contains icons in manifest

✅ **PWA Optimized:**
- Uses HTTPS
- Redirects HTTP to HTTPS
- Has a themed address bar
- Provides a custom splash screen
- Sets an address bar theme color

✅ **Performance:**
- First Contentful Paint < 1.8s
- Speed Index < 3.4s
- Time to Interactive < 3.9s
- First Meaningful Paint < 2.0s

**Example Lighthouse Command Line:**

```bash
# Install Lighthouse CLI
npm install -g lighthouse

# Run audit
lighthouse https://your-app.com --view

# Generate JSON report
lighthouse https://your-app.com --output json --output-path ./lighthouse-report.json
```

### 12.7 PWA Caching and Backend Coordination

**CRITICAL:** The successful implementation of PWA caching introduces a need for strict backend coordination. If the PWA service worker aggressively caches API responses, subsequent updates on the Django side may not be immediately visible to the user, leading to data staleness.

**Backend Cache Control Headers (Django):**

```python
# apps/core/middleware.py
from django.utils.cache import add_never_cache_headers, patch_vary_headers

class CacheControlMiddleware:
    """
    Add appropriate cache control headers to API responses.
    """
    def __init__(self, get_response):
        self.get_response = get_response
    
    def __call__(self, request):
        response = self.get_response(request)
        
        # For API endpoints
        if request.path.startswith('/api/'):
            if request.method in ['GET', 'HEAD']:
                # Allow caching but require revalidation
                response['Cache-Control'] = 'private, must-revalidate, max-age=300'
                
                # Add ETag for conditional requests
                if hasattr(response, 'render') and callable(response.render):
                    response.add_post_render_callback(
                        lambda r: r.setdefault('ETag', f'"{hash(r.content)}"')
                    )
            else:
                # Never cache mutations
                add_never_cache_headers(response)
        
        return response
```

**ETag Support in Views:**

```python
# apps/chamas/views.py
from django.views.decorators.http import condition
from rest_framework import viewsets
from rest_framework.decorators import action

def chama_etag(request, pk=None):
    """Generate ETag based on last modification time."""
    try:
        chama = Chama.objects.get(pk=pk)
        return f'"{chama.updated_at.timestamp()}"'
    except Chama.DoesNotExist:
        return None

def chama_last_modified(request, pk=None):
    """Return last modification time."""
    try:
        chama = Chama.objects.get(pk=pk)
        return chama.updated_at
    except Chama.DoesNotExist:
        return None

class ChamaViewSet(viewsets.ModelViewSet):
    """
    ViewSet with ETag support for efficient caching.
    """
    queryset = Chama.objects.all()
    serializer_class = ChamaSerializer
    
    @condition(etag_func=chama_etag, last_modified_func=chama_last_modified)
    def retrieve(self, request, *args, **kwargs):
        """Retrieve with ETag support."""
        return super().retrieve(request, *args, **kwargs)
```

**Frontend ETag Handling:**

```typescript
// src/api/client.ts
import Axios from 'axios';

export const axios = Axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
});

// Store ETags in memory
const etagCache = new Map<string, string>();

// Add ETag to requests
axios.interceptors.request.use((config) => {
  const etag = etagCache.get(config.url || '');
  if (etag && config.method === 'get') {
    config.headers['If-None-Match'] = etag;
  }
  return config;
});

// Store ETags from responses
axios.interceptors.response.use((response) => {
  if (response.headers['etag']) {
    etagCache.set(response.config.url || '', response.headers['etag']);
  }
  return response;
});
```

---

## 13. Mobile Development with React Native

Leveraging React Native allows the same backend API developed using DRF to power native mobile applications for iOS and Android.

### 13.1 Architectural Synergy

The pre-existing DRF API endpoints and serializers are fully reusable, requiring no significant changes to the backend structure. The core logic remains centralized in Django.

**Benefits:**
- ✅ Single backend serves web and mobile clients
- ✅ Shared authentication mechanism (JWT)
- ✅ Consistent data models and business logic
- ✅ Reduced development and maintenance overhead

**Project Setup:**

```bash
# Install React Native CLI
npm install -g react-native-cli

# Create new React Native project
npx react-native init ChamaHubMobile --template react-native-template-typescript

# Navigate to project
cd ChamaHubMobile

# Install dependencies
npm install axios @tanstack/react-query zustand
npm install @react-navigation/native @react-navigation/stack
npm install react-native-screens react-native-safe-area-context
```

### 13.2 Network Configuration and CORS

When testing React Native applications using emulators or physical devices on a local development network, special care must be taken with CORS settings and network addresses.

**Understanding Mobile Network Addresses:**

- **iOS Simulator:** Use `localhost` or `127.0.0.1`
- **Android Emulator:** Use `10.0.2.2` (maps to host machine's localhost)
- **Physical Device:** Use your computer's local IP address (e.g., `192.168.1.100`)

**Backend CORS Configuration for Mobile:**

```python
# config/settings/development.py
CORS_ALLOWED_ORIGINS = [
    'http://localhost:3000',  # React web app
    'http://127.0.0.1:3000',
    'http://localhost:8081',  # React Native Metro bundler
    'http://127.0.0.1:8081',
]

# Temporarily allow all origins during local mobile development
# WARNING: Never use in production!
CORS_ORIGIN_ALLOW_ALL = True  # Only for local development

# Allow credentials for JWT cookies
CORS_ALLOW_CREDENTIALS = True
```

**Production CORS Configuration:**

```python
# config/settings/production.py
CORS_ORIGIN_ALLOW_ALL = False

# Whitelist only production domains
CORS_ALLOWED_ORIGINS = [
    'https://chamahub.com',
    'https://www.chamahub.com',
    'https://app.chamahub.com',
]

CORS_ALLOW_CREDENTIALS = True
```

### 13.3 Data Exchange and API Integration

React Native uses standard networking libraries (like `fetch` or `Axios`) to make API calls to the Django backend. All communication must adhere to the secure token exchange mechanism and must ensure proper JSON content type headers are sent with requests.

**API Client Configuration:**

```typescript
// src/api/client.ts
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

// Determine API base URL based on platform
const getBaseURL = () => {
  if (__DEV__) {
    // Development mode
    if (Platform.OS === 'android') {
      return 'http://10.0.2.2:8000'; // Android emulator
    } else {
      return 'http://localhost:8000'; // iOS simulator
    }
  } else {
    // Production mode
    return 'https://api.chamahub.com';
  }
};

export const apiClient = axios.create({
  baseURL: getBaseURL(),
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

// Add JWT token to requests
apiClient.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Handle token refresh on 401
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        const refreshToken = await AsyncStorage.getItem('refresh_token');
        const response = await axios.post(`${getBaseURL()}/api/v1/auth/token/refresh/`, {
          refresh: refreshToken,
        });
        
        const { access } = response.data;
        await AsyncStorage.setItem('access_token', access);
        
        originalRequest.headers.Authorization = `Bearer ${access}`;
        return apiClient(originalRequest);
      } catch (refreshError) {
        // Redirect to login
        await AsyncStorage.multiRemove(['access_token', 'refresh_token']);
        // Navigate to login screen
        return Promise.reject(refreshError);
      }
    }
    
    return Promise.reject(error);
  }
);
```

**Example API Calls:**

```typescript
// src/api/chamas.ts
import { apiClient } from './client';

export interface Chama {
  id: number;
  name: string;
  description: string;
  created_at: string;
}

export const chamasAPI = {
  getAll: async (): Promise<Chama[]> => {
    const response = await apiClient.get('/api/v1/chamas/');
    return response.data;
  },
  
  getById: async (id: number): Promise<Chama> => {
    const response = await apiClient.get(`/api/v1/chamas/${id}/`);
    return response.data;
  },
  
  create: async (data: Omit<Chama, 'id' | 'created_at'>): Promise<Chama> => {
    const response = await apiClient.post('/api/v1/chamas/', data);
    return response.data;
  },
  
  update: async (id: number, data: Partial<Chama>): Promise<Chama> => {
    const response = await apiClient.patch(`/api/v1/chamas/${id}/`, data);
    return response.data;
  },
  
  delete: async (id: number): Promise<void> => {
    await apiClient.delete(`/api/v1/chamas/${id}/`);
  },
};
```

**Using React Query in React Native:**

```typescript
// src/screens/ChamaListScreen.tsx
import React from 'react';
import { View, Text, FlatList, ActivityIndicator } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { chamasAPI } from '@/api/chamas';

export const ChamaListScreen: React.FC = () => {
  const { data: chamas, isLoading, error } = useQuery({
    queryKey: ['chamas'],
    queryFn: chamasAPI.getAll,
  });
  
  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#4F46E5" />
      </View>
    );
  }
  
  if (error) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>Error loading chamas</Text>
      </View>
    );
  }
  
  return (
    <FlatList
      data={chamas}
      keyExtractor={(item) => item.id.toString()}
      renderItem={({ item }) => (
        <View style={{ padding: 16, borderBottomWidth: 1, borderColor: '#E5E7EB' }}>
          <Text style={{ fontSize: 18, fontWeight: 'bold' }}>{item.name}</Text>
          <Text style={{ color: '#6B7280' }}>{item.description}</Text>
        </View>
      )}
    />
  );
};
```

### 13.4 Physical Device Testing

**Finding Your Local IP Address:**

```bash
# macOS/Linux
ifconfig | grep "inet " | grep -v 127.0.0.1

# Windows
ipconfig | findstr IPv4
```

**Update API Client for Physical Device:**

```typescript
// src/api/client.ts
const getBaseURL = () => {
  if (__DEV__) {
    if (Platform.OS === 'android') {
      // For physical Android device, use your local IP
      return 'http://192.168.1.100:8000';
    } else {
      // For physical iOS device, use your local IP
      return 'http://192.168.1.100:8000';
    }
  }
  return 'https://api.chamahub.com';
};
```

---

## Part V: Security, Authentication, and Threat Mitigation

Security is not a feature but a layer that must be integrated into the architecture from the foundation up. For a decoupled application, managing stateless authentication is paramount.

---

## 14. Secure User Authentication

### 14.1 Implementing JSON Web Tokens (JWT)

JWT is selected for authentication due to its inherent advantages in modern decoupled architectures: it is stateless, self-contained, and scalable, making it ideal for distributed systems and potential microservices transitions.

**Installation:**

```bash
pip install djangorestframework-simplejwt
```

**Configuration:**

```python
# config/settings/base.py
from datetime import timedelta

INSTALLED_APPS = [
    # ...
    'rest_framework',
    'rest_framework_simplejwt',
]

REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': [
        'rest_framework_simplejwt.authentication.JWTAuthentication',
    ],
    'DEFAULT_PERMISSION_CLASSES': [
        'rest_framework.permissions.IsAuthenticated',
    ],
}

# JWT Settings
SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(minutes=15),
    'REFRESH_TOKEN_LIFETIME': timedelta(days=7),
    'ROTATE_REFRESH_TOKENS': True,
    'BLACKLIST_AFTER_ROTATION': True,
    'UPDATE_LAST_LOGIN': True,
    
    'ALGORITHM': 'HS256',
    'SIGNING_KEY': SECRET_KEY,
    'VERIFYING_KEY': None,
    'AUDIENCE': None,
    'ISSUER': None,
    
    'AUTH_HEADER_TYPES': ('Bearer',),
    'AUTH_HEADER_NAME': 'HTTP_AUTHORIZATION',
    'USER_ID_FIELD': 'id',
    'USER_ID_CLAIM': 'user_id',
    
    'AUTH_TOKEN_CLASSES': ('rest_framework_simplejwt.tokens.AccessToken',),
    'TOKEN_TYPE_CLAIM': 'token_type',
    
    'JTI_CLAIM': 'jti',
}
```

**URL Configuration:**

```python
# apps/users/urls.py
from django.urls import path
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
    TokenVerifyView,
)
from .views import RegisterView, LogoutView

urlpatterns = [
    path('register/', RegisterView.as_view(), name='register'),
    path('login/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('token/verify/', TokenVerifyView.as_view(), name='token_verify'),
    path('logout/', LogoutView.as_view(), name='logout'),
]
```

### 14.2 Critical: Token Storage Best Practices

A strict protocol must govern token storage to prevent client-side vulnerabilities.

**❌ Local Storage Vulnerability:**

JWTs must **NEVER** be stored in browser `localStorage` or `sessionStorage`. These storage mechanisms are inherently vulnerable to Cross-Site Scripting (XSS) attacks, where malicious client-side JavaScript can easily steal the authentication token.

```typescript
// ❌ NEVER DO THIS - Vulnerable to XSS
localStorage.setItem('access_token', token);
sessionStorage.setItem('access_token', token);
```

**✅ Prescribed Storage: HTTP-Only Cookies**

The only secure method is storing the access token and refresh token in secure, HTTP-only cookies. These cookies are flagged such that client-side JavaScript cannot access them, effectively blocking XSS token theft.

**Django Backend - Set HTTP-Only Cookies:**

```python
# apps/users/views.py
from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken
from django.conf import settings

class LoginView(APIView):
    """
    Custom login view that sets JWT in HTTP-only cookies.
    """
    permission_classes = []
    
    def post(self, request):
        from .serializers import LoginSerializer
        
        serializer = LoginSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        user = serializer.validated_data['user']
        refresh = RefreshToken.for_user(user)
        
        response = Response({
            'user': {
                'id': user.id,
                'email': user.email,
                'full_name': user.full_name,
            }
        }, status=status.HTTP_200_OK)
        
        # Set access token in HTTP-only cookie
        response.set_cookie(
            key='access_token',
            value=str(refresh.access_token),
            httponly=True,  # Prevents JavaScript access
            secure=not settings.DEBUG,  # HTTPS only in production
            samesite='Strict',  # CSRF protection
            max_age=settings.SIMPLE_JWT['ACCESS_TOKEN_LIFETIME'].total_seconds(),
        )
        
        # Set refresh token in HTTP-only cookie
        response.set_cookie(
            key='refresh_token',
            value=str(refresh),
            httponly=True,
            secure=not settings.DEBUG,
            samesite='Strict',
            max_age=settings.SIMPLE_JWT['REFRESH_TOKEN_LIFETIME'].total_seconds(),
        )
        
        return response


class LogoutView(APIView):
    """
    Logout view that clears HTTP-only cookies.
    """
    def post(self, request):
        response = Response({'message': 'Logged out successfully'})
        response.delete_cookie('access_token')
        response.delete_cookie('refresh_token')
        return response
```

**Custom Authentication Class for Cookies:**

```python
# apps/core/authentication.py
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework_simplejwt.exceptions import InvalidToken

class CookieJWTAuthentication(JWTAuthentication):
    """
    Custom JWT authentication that reads token from HTTP-only cookie.
    """
    def authenticate(self, request):
        # Try to get token from cookie
        raw_token = request.COOKIES.get('access_token')
        
        if raw_token is None:
            return None
        
        validated_token = self.get_validated_token(raw_token)
        return self.get_user(validated_token), validated_token
```

```python
# config/settings/base.py
REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': [
        'apps.core.authentication.CookieJWTAuthentication',
    ],
}
```

### 14.3 Authentication Flow Implications

This security mandate dictates the authentication flow:

**Complete Authentication Flow:**

1. **Client sends credentials** to the Django login endpoint (`/api/v1/auth/login/`)
2. **Django validates credentials** and generates the JWT tokens
3. **Django sets the tokens in secure, HTTP-only cookies** in the response headers
4. **Browser automatically attaches cookies** to all subsequent API requests
5. **If an API request returns 401 Unauthorized**, the frontend triggers a silent refresh request
6. **Browser automatically sends the HTTP-only refresh token cookie**, allowing Django to issue new tokens
7. **Session persistence maintained** without client-side token access

**Frontend Implementation:**

```typescript
// src/api/auth.ts
import { axios } from './client';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface User {
  id: number;
  email: string;
  full_name: string;
}

export const authAPI = {
  login: async (credentials: LoginCredentials): Promise<User> => {
    const response = await axios.post('/api/v1/auth/login/', credentials, {
      withCredentials: true, // Important: Include cookies in request
    });
    return response.data.user;
  },
  
  logout: async (): Promise<void> => {
    await axios.post('/api/v1/auth/logout/', {}, {
      withCredentials: true,
    });
  },
  
  refreshToken: async (): Promise<void> => {
    await axios.post('/api/v1/auth/token/refresh/', {}, {
      withCredentials: true,
    });
  },
};
```

**Axios Configuration for Cookies:**

```typescript
// src/api/client.ts
import Axios from 'axios';

export const axios = Axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  withCredentials: true, // Always include cookies
});

// Handle 401 errors with automatic token refresh
axios.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        // Attempt to refresh the token
        // Browser automatically sends refresh token cookie
        await axios.post('/api/v1/auth/token/refresh/');
        
        // Retry original request
        return axios(originalRequest);
      } catch (refreshError) {
        // Refresh failed, redirect to login
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }
    
    return Promise.reject(error);
  }
);
```

**Login Component:**

```typescript
// src/pages/Login.tsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authAPI } from '@/api/auth';
import { useAuthStore } from '@/stores/authStore';

export const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const setUser = useAuthStore((state) => state.setUser);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    try {
      const user = await authAPI.login({ email, password });
      setUser(user);
      navigate('/dashboard');
    } catch (err) {
      setError('Invalid email or password');
    }
  };
  
  return (
    <form onSubmit={handleSubmit}>
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email"
        required
      />
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Password"
        required
      />
      {error && <div className="error">{error}</div>}
      <button type="submit">Login</button>
    </form>
  );
};
```

**Security Benefits:**

✅ **XSS Protection:** JavaScript cannot access HTTP-only cookies  
✅ **CSRF Protection:** SameSite=Strict prevents cross-site request forgery  
✅ **Automatic Management:** Browser handles cookie storage and transmission  
✅ **Secure Transport:** Secure flag ensures cookies only sent over HTTPS  
✅ **Seamless Refresh:** Silent token refresh without client-side token handling

---

## 15. Django Security Hardening Best Practices

General system hardening complements authentication security and is critical for production-grade applications.

### 15.1 Version Maintenance

**Critical Requirement:** The Django framework must be regularly updated. The development team frequently releases security patches, and running outdated versions introduces known vulnerabilities.

**Best Practices:**

```bash
# Check current Django version
python -c "import django; print(django.get_version())"

# Update Django to latest stable version
pip install --upgrade django

# Check for security updates
pip list --outdated | grep -i django
```

**Automated Update Monitoring:**

```python
# config/settings/base.py
import django
import sys

# Log Django version on startup
print(f"Django version: {django.get_version()}")

# Optional: Warning for outdated versions
DJANGO_VERSION = tuple(map(int, django.get_version().split('.')[:2]))
if DJANGO_VERSION < (4, 2):  # Example: warn if below 4.2
    print("WARNING: Django version is outdated. Please upgrade!", file=sys.stderr)
```

**Dependency Management:**

```bash
# requirements/base.txt
Django>=4.2,<5.0  # Pin major version, allow minor updates
djangorestframework>=3.14,<4.0
psycopg2-binary>=2.9,<3.0

# Regularly check security advisories
pip-audit  # Install: pip install pip-audit
```

### 15.2 Secret Key Management

**CRITICAL:** The Django `SECRET_KEY` is crucial for cryptographic signing. It must be generated strongly (e.g., using `os.urandom()`) and stored exclusively in environment variables or a secrets manager, never hardcoded in the codebase.

**Generate Strong Secret Key:**

```python
# generate_secret_key.py
import secrets

def generate_secret_key():
    """Generate a cryptographically strong secret key."""
    return secrets.token_urlsafe(50)

if __name__ == '__main__':
    print(f"SECRET_KEY={generate_secret_key()}")
```

```bash
# Generate and save to .env
python generate_secret_key.py >> .env
```

**Secure Configuration:**

```python
# config/settings/base.py
from decouple import config
import os

# SECURITY WARNING: keep the secret key used in production secret!
SECRET_KEY = config('SECRET_KEY')

# Validation: Ensure SECRET_KEY is set and strong
if not SECRET_KEY:
    raise ValueError("SECRET_KEY must be set in environment variables")

if len(SECRET_KEY) < 50:
    raise ValueError("SECRET_KEY must be at least 50 characters long")

# Never log the secret key
# BAD: print(f"Secret key: {SECRET_KEY}")
```

**Production Secrets Management:**

```python
# For AWS Secrets Manager
import boto3
import json

def get_secret(secret_name):
    """Retrieve secret from AWS Secrets Manager."""
    session = boto3.session.Session()
    client = session.client(
        service_name='secretsmanager',
        region_name='us-east-1'
    )
    
    try:
        get_secret_value_response = client.get_secret_value(
            SecretId=secret_name
        )
        secret = json.loads(get_secret_value_response['SecretString'])
        return secret
    except Exception as e:
        raise e

# config/settings/production.py
if not os.getenv('DJANGO_ENV') == 'development':
    secrets = get_secret('chamahub-production-secrets')
    SECRET_KEY = secrets['SECRET_KEY']
    DATABASES['default']['PASSWORD'] = secrets['DB_PASSWORD']
```

### 15.3 Injection Prevention

**Standard Practice:** Rely on the Django ORM for query construction, which handles necessary escaping and sanitization, preventing most SQL injection attacks.

**Safe Query Patterns:**

```python
# ✅ SAFE: Using Django ORM
users = User.objects.filter(email=user_input)

# ✅ SAFE: Parameterized raw SQL
users = User.objects.raw(
    "SELECT * FROM users WHERE email = %s",
    [user_input]
)

# ❌ DANGEROUS: String formatting
# users = User.objects.raw(f"SELECT * FROM users WHERE email = '{user_input}'")

# ❌ DANGEROUS: String concatenation
# query = "SELECT * FROM users WHERE email = '" + user_input + "'"
```

**ORM Query Security:**

```python
# apps/chamas/views.py
from django.db.models import Q
from rest_framework import viewsets
from rest_framework.decorators import action

class ChamaViewSet(viewsets.ModelViewSet):
    """
    Secure ViewSet with proper input validation.
    """
    def get_queryset(self):
        queryset = Chama.objects.all()
        
        # ✅ SAFE: Using ORM filters
        search_term = self.request.query_params.get('search', '')
        if search_term:
            queryset = queryset.filter(
                Q(name__icontains=search_term) |
                Q(description__icontains=search_term)
            )
        
        return queryset
    
    @action(detail=False, methods=['get'])
    def search(self, request):
        """Search chamas with validated input."""
        query = request.query_params.get('q', '').strip()
        
        # Input validation
        if len(query) > 100:
            return Response(
                {'error': 'Search query too long'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # ✅ SAFE: ORM handles escaping
        results = Chama.objects.filter(
            Q(name__icontains=query) |
            Q(description__icontains=query)
        )
        
        serializer = self.get_serializer(results, many=True)
        return Response(serializer.data)
```

### 15.4 Cross-Site Vulnerability Mitigation

#### 15.4.1 XSS Protection

Django's template system automatically escapes output by default, which is the primary defense against XSS. For scenarios requiring raw HTML, rigorous sanitization libraries (like bleach) must be used.

**Template Auto-Escaping:**

```python
# Django templates automatically escape by default
# template.html
<div>{{ user_input }}</div>  <!-- ✅ Automatically escaped -->

# To render raw HTML (USE WITH CAUTION)
<div>{{ user_input|safe }}</div>  <!-- ⚠️ Marks as safe, no escaping -->
```

**Sanitizing User HTML Input:**

```bash
pip install bleach
```

```python
# apps/core/utils.py
import bleach

ALLOWED_TAGS = [
    'p', 'br', 'strong', 'em', 'u', 'a', 'ul', 'ol', 'li',
    'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'blockquote', 'code', 'pre'
]

ALLOWED_ATTRIBUTES = {
    'a': ['href', 'title', 'rel'],
    'img': ['src', 'alt', 'title'],
}

def sanitize_html(html_content):
    """
    Sanitize HTML content to prevent XSS attacks.
    Only allows safe HTML tags and attributes.
    """
    cleaned = bleach.clean(
        html_content,
        tags=ALLOWED_TAGS,
        attributes=ALLOWED_ATTRIBUTES,
        strip=True
    )
    return cleaned

def sanitize_url(url):
    """Sanitize URLs to prevent JavaScript injection."""
    cleaned = bleach.linkify(url, parse_email=False)
    return cleaned
```

**Using in Serializers:**

```python
# apps/chamas/serializers.py
from apps.core.utils import sanitize_html

class ChamaSerializer(serializers.ModelSerializer):
    description = serializers.CharField(max_length=5000)
    
    def validate_description(self, value):
        """Sanitize description HTML."""
        # Sanitize HTML content
        cleaned = sanitize_html(value)
        return cleaned
    
    class Meta:
        model = Chama
        fields = ['id', 'name', 'description', 'created_at']
```

**DRF Response Security:**

```python
# config/settings/base.py

# Ensure proper content-type headers
REST_FRAMEWORK = {
    # ...
    'DEFAULT_RENDERER_CLASSES': [
        'rest_framework.renderers.JSONRenderer',
    ],
}

# Security headers
SECURE_CONTENT_TYPE_NOSNIFF = True
SECURE_BROWSER_XSS_FILTER = True
X_FRAME_OPTIONS = 'DENY'
```

#### 15.4.2 CSRF Protection

Django's built-in Cross-Site Request Forgery (CSRF) middleware must be enabled. The decoupled frontend must be configured to retrieve the CSRF token (usually via a separate cookie) and include it in all unsafe requests (POST, PUT, DELETE) to protect against malicious external sites exploiting user sessions.

**Django CSRF Configuration:**

```python
# config/settings/base.py

MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'corsheaders.middleware.CorsMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',  # ✅ CSRF protection
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

# CSRF settings for API
CSRF_COOKIE_NAME = 'csrftoken'
CSRF_HEADER_NAME = 'HTTP_X_CSRFTOKEN'
CSRF_COOKIE_HTTPONLY = False  # Must be False for JavaScript to read
CSRF_COOKIE_SAMESITE = 'Strict'
CSRF_COOKIE_SECURE = not DEBUG  # HTTPS only in production
CSRF_USE_SESSIONS = False
CSRF_COOKIE_AGE = 31449600  # 1 year

# CORS settings that work with CSRF
CORS_ALLOW_CREDENTIALS = True
```

**CSRF Token Endpoint:**

```python
# apps/users/views.py
from django.middleware.csrf import get_token
from django.http import JsonResponse
from django.views.decorators.http import require_http_methods

@require_http_methods(["GET"])
def csrf_token_view(request):
    """
    Return CSRF token for frontend to use.
    """
    token = get_token(request)
    return JsonResponse({'csrfToken': token})
```

```python
# apps/users/urls.py
urlpatterns = [
    path('csrf/', csrf_token_view, name='csrf-token'),
    # ... other patterns
]
```

**Frontend CSRF Integration:**

```typescript
// src/api/client.ts
import Axios from 'axios';

export const axios = Axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  withCredentials: true, // Include cookies
});

// Fetch CSRF token on app initialization
export const initializeCSRF = async () => {
  try {
    const response = await axios.get('/api/v1/auth/csrf/');
    const csrfToken = response.data.csrfToken;
    
    // Add CSRF token to all non-GET requests
    axios.interceptors.request.use((config) => {
      if (config.method !== 'get') {
        config.headers['X-CSRFToken'] = csrfToken;
      }
      return config;
    });
  } catch (error) {
    console.error('Failed to fetch CSRF token:', error);
  }
};
```

```typescript
// src/main.tsx
import { initializeCSRF } from './api/client';

// Initialize CSRF before rendering app
initializeCSRF().then(() => {
  ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
});
```

**Alternative: CSRF Token from Cookie:**

```typescript
// src/utils/csrf.ts
export const getCSRFToken = (): string | null => {
  const name = 'csrftoken';
  let cookieValue = null;
  
  if (document.cookie && document.cookie !== '') {
    const cookies = document.cookie.split(';');
    for (let i = 0; i < cookies.length; i++) {
      const cookie = cookies[i].trim();
      if (cookie.substring(0, name.length + 1) === (name + '=')) {
        cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
        break;
      }
    }
  }
  
  return cookieValue;
};

// src/api/client.ts
import { getCSRFToken } from '@/utils/csrf';

axios.interceptors.request.use((config) => {
  if (config.method !== 'get') {
    const csrfToken = getCSRFToken();
    if (csrfToken) {
      config.headers['X-CSRFToken'] = csrfToken;
    }
  }
  return config;
});
```

#### 15.4.3 Clickjacking Prevention

To mitigate clickjacking (where a malicious site embeds the application in an iframe to trick the user), the setting `X_FRAME_OPTIONS = 'DENY'` must be enabled in settings.py.

**Django Configuration:**

```python
# config/settings/base.py

# Prevent site from being framed
X_FRAME_OPTIONS = 'DENY'

# Or allow only same origin
# X_FRAME_OPTIONS = 'SAMEORIGIN'

# For more granular control, use Content-Security-Policy
SECURE_CONTENT_SECURITY_POLICY = {
    'frame-ancestors': ["'none'"],  # Equivalent to DENY
    # Or specific domains
    # 'frame-ancestors': ["'self'", "https://trusted-domain.com"],
}
```

**Middleware Configuration:**

```python
# config/settings/base.py

MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    # ...
    'django.middleware.clickjacking.XFrameOptionsMiddleware',  # ✅ Clickjacking protection
]
```

**Testing Clickjacking Protection:**

```python
# apps/core/tests/test_security.py
from django.test import TestCase, Client

class SecurityHeadersTest(TestCase):
    def setUp(self):
        self.client = Client()
    
    def test_x_frame_options_header(self):
        """Test that X-Frame-Options header is set."""
        response = self.client.get('/api/v1/chamas/')
        self.assertEqual(response.get('X-Frame-Options'), 'DENY')
    
    def test_content_security_policy(self):
        """Test CSP headers are present."""
        response = self.client.get('/')
        self.assertIn('Content-Security-Policy', response.headers)
```

### 15.5 Additional Security Headers

**Comprehensive Security Headers:**

```python
# config/settings/production.py

# Security Headers
SECURE_SSL_REDIRECT = True  # Redirect HTTP to HTTPS
SECURE_HSTS_SECONDS = 31536000  # 1 year
SECURE_HSTS_INCLUDE_SUBDOMAINS = True
SECURE_HSTS_PRELOAD = True

SECURE_CONTENT_TYPE_NOSNIFF = True
SECURE_BROWSER_XSS_FILTER = True
SECURE_REFERRER_POLICY = 'same-origin'

# Session security
SESSION_COOKIE_SECURE = True
SESSION_COOKIE_HTTPONLY = True
SESSION_COOKIE_SAMESITE = 'Strict'
SESSION_COOKIE_AGE = 1209600  # 2 weeks

# CSRF security
CSRF_COOKIE_SECURE = True
CSRF_COOKIE_SAMESITE = 'Strict'

# Content Security Policy
CSP_DEFAULT_SRC = ("'self'",)
CSP_SCRIPT_SRC = ("'self'", "'unsafe-inline'")
CSP_STYLE_SRC = ("'self'", "'unsafe-inline'")
CSP_IMG_SRC = ("'self'", "data:", "https:")
CSP_FONT_SRC = ("'self'", "data:")
CSP_CONNECT_SRC = ("'self'", "https://api.chamahub.com")
CSP_FRAME_ANCESTORS = ("'none'",)
```

**Security Middleware:**

```python
# apps/core/middleware.py
class SecurityHeadersMiddleware:
    """Add additional security headers to all responses."""
    
    def __init__(self, get_response):
        self.get_response = get_response
    
    def __call__(self, request):
        response = self.get_response(request)
        
        # Additional security headers
        response['X-Content-Type-Options'] = 'nosniff'
        response['X-XSS-Protection'] = '1; mode=block'
        response['Referrer-Policy'] = 'same-origin'
        response['Permissions-Policy'] = 'geolocation=(), microphone=(), camera=()'
        
        return response

# config/settings/base.py
MIDDLEWARE = [
    # ...
    'apps.core.middleware.SecurityHeadersMiddleware',
]
```

---

## Part VI: Performance, Caching, and Background Processes

High performance requires optimizing the data path, from the database query execution to the network response.

## 16. Database and Query Optimization

Optimization begins by profiling the application to identify slow database queries, which are often the primary performance bottleneck.

### 16.1 QuerySet Pruning

Limit query results (`.only()`, `.values()`) to retrieve only the fields strictly necessary for the current task. Similarly, use slicing (e.g., `queryset[:10]`) to restrict the number of results fetched if the full set is not needed.

**Field Selection:**

```python
# ❌ BAD: Fetch all fields
users = User.objects.all()

# ✅ GOOD: Fetch only needed fields
users = User.objects.only('id', 'email', 'full_name')

# ✅ GOOD: Return dict instead of model instances
users = User.objects.values('id', 'email', 'full_name')

# ✅ GOOD: For serialization, values_list can be faster
user_emails = User.objects.values_list('email', flat=True)
```

**Deferring Heavy Fields:**

```python
# Defer loading of heavy text fields
chamas = Chama.objects.defer('description', 'terms_and_conditions', 'rules')

# Only load them when accessed
for chama in chamas:
    print(chama.name)  # No extra query
    print(chama.description)  # Triggers query only if accessed
```

**Result Limiting:**

```python
# ✅ Limit results at database level
recent_contributions = Contribution.objects.order_by('-created_at')[:10]

# ❌ DON'T: Fetch all then slice in Python
# all_contributions = list(Contribution.objects.all())
# recent = all_contributions[:10]  # Wasteful memory usage
```

**Conditional Field Loading:**

```python
# apps/chamas/serializers.py
class ChamaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Chama
        fields = ['id', 'name', 'created_at']
    
    def get_fields(self):
        """Dynamically include fields based on request."""
        fields = super().get_fields()
        
        # Check if detailed view
        request = self.context.get('request')
        if request and request.query_params.get('detailed'):
            # Add heavy fields only when requested
            fields['description'] = serializers.CharField()
            fields['rules'] = serializers.CharField()
        
        return fields
```

### 16.2 Bulk Transaction Efficiency

Ensure that bulk creation, updates, and deletions are wrapped within database transactions to maintain atomic operations, guaranteeing data integrity and preventing partial commits.

**Using Transactions:**

```python
from django.db import transaction

# ✅ Atomic bulk create
@transaction.atomic
def create_contributions(contribution_data):
    """Create multiple contributions atomically."""
    contributions = [
        Contribution(**data)
        for data in contribution_data
    ]
    return Contribution.objects.bulk_create(contributions)

# ✅ Atomic updates
@transaction.atomic
def approve_pending_contributions(chama):
    """Approve all pending contributions for a chama."""
    updated_count = Contribution.objects.filter(
        chama=chama,
        status='pending'
    ).update(
        status='approved',
        approved_at=timezone.now()
    )
    
    # Update chama total in same transaction
    chama.total_contributions = chama.contributions.aggregate(
        total=models.Sum('amount')
    )['total']
    chama.save()
    
    return updated_count
```

**Transaction Rollback on Error:**

```python
from django.db import transaction, IntegrityError

def process_loan_application(loan_data):
    """Process loan with automatic rollback on error."""
    try:
        with transaction.atomic():
            # Create loan
            loan = Loan.objects.create(**loan_data)
            
            # Deduct from chama balance
            chama = loan.chama
            chama.available_balance -= loan.amount
            chama.save()
            
            # Create disbursement record
            Disbursement.objects.create(
                loan=loan,
                amount=loan.amount,
                disbursed_at=timezone.now()
            )
            
            # Send notification
            send_loan_approval_notification(loan)
            
            return loan
    except IntegrityError as e:
        # Transaction automatically rolled back
        logger.error(f"Loan processing failed: {e}")
        raise ValueError("Insufficient chama balance")
```

**Nested Transactions with Savepoints:**

```python
def complex_operation():
    """Use savepoints for nested transaction control."""
    with transaction.atomic():
        # Outer transaction
        user = User.objects.create(email='test@example.com')
        
        try:
            # Inner savepoint
            with transaction.atomic():
                # This might fail
                risky_operation()
        except Exception:
            # Inner transaction rolled back, outer continues
            logger.warning("Risky operation failed, continuing")
        
        # Outer transaction continues
        user.profile.setup_complete = True
        user.profile.save()
```

### 16.3 Loop Refactoring

Any pattern where a database query is executed inside a loop (the N+1 pattern) must be identified and refactored using `select_related` or `prefetch_related`.

**Identifying N+1 Queries:**

```python
# ❌ BAD: N+1 query problem
chamas = Chama.objects.all()  # 1 query
for chama in chamas:
    creator_email = chama.created_by.email  # N queries (one per chama)
    print(f"{chama.name} created by {creator_email}")

# ✅ GOOD: Use select_related
chamas = Chama.objects.select_related('created_by').all()  # 1 query with JOIN
for chama in chamas:
    creator_email = chama.created_by.email  # No additional queries
    print(f"{chama.name} created by {creator_email}")
```

**Monitoring Query Count:**

```python
# Use Django Debug Toolbar or manual logging
from django.db import connection
from django.test.utils import override_settings

@override_settings(DEBUG=True)
def test_query_performance():
    from django.db import reset_queries
    
    reset_queries()
    
    # Your code here
    chamas = Chama.objects.select_related('created_by').all()
    list(chamas)  # Force evaluation
    
    query_count = len(connection.queries)
    print(f"Queries executed: {query_count}")
    
    # Print all queries for debugging
    for query in connection.queries:
        print(query['sql'])
```

**Complex Prefetching:**

```python
# Prefetch with custom QuerySet
from django.db.models import Prefetch

# Get chamas with only active members
chamas = Chama.objects.prefetch_related(
    Prefetch(
        'members',
        queryset=Member.objects.filter(is_active=True).select_related('user'),
        to_attr='active_members'
    )
).all()

for chama in chamas:
    # Use prefetched active members (no extra queries)
    for member in chama.active_members:
        print(f"{member.user.full_name} is an active member")
```

### 16.4 Query Performance Profiling

**Using Django Debug Toolbar:**

```bash
pip install django-debug-toolbar
```

```python
# config/settings/development.py
INSTALLED_APPS = [
    # ...
    'debug_toolbar',
]

MIDDLEWARE = [
    'debug_toolbar.middleware.DebugToolbarMiddleware',
    # ...
]

INTERNAL_IPS = [
    '127.0.0.1',
]

# config/urls.py
if settings.DEBUG:
    import debug_toolbar
    urlpatterns = [
        path('__debug__/', include(debug_toolbar.urls)),
    ] + urlpatterns
```

**Using django-silk for Production Profiling:**

```bash
pip install django-silk
```

```python
# config/settings/base.py
INSTALLED_APPS = [
    # ...
    'silk',
]

MIDDLEWARE = [
    'silk.middleware.SilkyMiddleware',
    # ...
]

# config/urls.py
urlpatterns = [
    path('silk/', include('silk.urls', namespace='silk')),
    # ...
]
```

**Custom Query Logging:**

```python
# apps/core/middleware.py
import logging
from django.db import connection

logger = logging.getLogger(__name__)

class QueryCountDebugMiddleware:
    """Log query count for each request."""
    
    def __init__(self, get_response):
        self.get_response = get_response
    
    def __call__(self, request):
        # Reset query count
        from django.db import reset_queries
        reset_queries()
        
        response = self.get_response(request)
        
        # Log query statistics
        query_count = len(connection.queries)
        if query_count > 10:
            logger.warning(
                f"High query count: {query_count} queries for {request.path}"
            )
        
        # Add header for debugging
        response['X-Query-Count'] = str(query_count)
        
        return response
```

---

## 17. Comprehensive Caching Strategy

Caching is an advanced performance accelerator, not a fix for poorly written code. It must be applied strategically after core code optimization.

### 17.1 Redis Implementation

Redis is the prescribed caching solution due to its high performance as an in-memory database. It should be configured as the cache backend using `django-redis` or the native Django Redis backend.

**Installation:**

```bash
pip install django-redis redis
```

**Settings Configuration:**

```python
# config/settings/base.py

CACHES = {
    "default": {
        "BACKEND": "django.core.cache.backends.redis.RedisCache",
        "LOCATION": "redis://127.0.0.1:6379",
        "OPTIONS": {
            "CLIENT_CLASS": "django_redis.client.DefaultClient",
        }
    }
}

# For multiple Redis servers (replication mode)
CACHES = {
    "default": {
        "BACKEND": "django_redis.cache.RedisCache",
        "LOCATION": [
            "redis://127.0.0.1:6379/1",  # Primary
            "redis://127.0.0.1:6380/1",  # Replica 1
            "redis://127.0.0.1:6381/1",  # Replica 2
        ],
        "OPTIONS": {
            "CLIENT_CLASS": "django_redis.client.DefaultClient",
            "CONNECTION_POOL_KWARGS": {
                "max_connections": 50,
                "retry_on_timeout": True,
            },
            "SOCKET_CONNECT_TIMEOUT": 5,
            "SOCKET_TIMEOUT": 5,
            "COMPRESSOR": "django_redis.compressors.zlib.ZlibCompressor",
            "IGNORE_EXCEPTIONS": True,  # Don't crash if Redis is down
        }
    }
}
```

**Docker Compose Redis Setup:**

```yaml
# docker-compose.yml
version: '3.8'

services:
  redis:
    image: redis:7-alpine
    container_name: chamahub_redis
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data
    command: redis-server --appendonly yes
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 10s
      timeout: 3s
      retries: 3
  
  django:
    build: .
    depends_on:
      - redis
      - db
    environment:
      - REDIS_URL=redis://redis:6379/0

volumes:
  redis_data:
```

### 17.2 Granular Caching Levels

Django's caching framework offers multiple levels of granularity.

#### 17.2.1 View Caching

For API endpoints that infrequently change, the entire response output can be cached using the `@cache_page` decorator.

```python
# apps/chamas/views.py
from django.views.decorators.cache import cache_page
from django.utils.decorators import method_decorator
from rest_framework import viewsets

class PublicChamaViewSet(viewsets.ReadOnlyModelViewSet):
    """Public chama data with caching."""
    
    @method_decorator(cache_page(60 * 15))  # Cache for 15 minutes
    def list(self, request, *args, **kwargs):
        return super().list(request, *args, **kwargs)
    
    @method_decorator(cache_page(60 * 30))  # Cache for 30 minutes
    def retrieve(self, request, *args, **kwargs):
        return super().retrieve(request, *args, **kwargs)
```

**Cache Key Variation:**

```python
from django.views.decorators.cache import cache_page
from django.views.decorators.vary import vary_on_headers

# Vary cache by Authorization header (different cache per user)
@method_decorator(vary_on_headers('Authorization'))
@method_decorator(cache_page(60 * 10))
def list(self, request, *args, **kwargs):
    return super().list(request, *args, **kwargs)
```

#### 17.2.2 Low-Level API Caching

Highly complex or computationally expensive internal functions should utilize `cache.set()` and `cache.get()` directly to store and retrieve specific data points.

```python
# apps/chamas/utils.py
from django.core.cache import cache
from django.db.models import Sum, Count, Avg
import hashlib

def get_chama_statistics(chama_id):
    """Get chama statistics with caching."""
    cache_key = f'chama_stats_{chama_id}'
    
    # Try to get from cache
    stats = cache.get(cache_key)
    
    if stats is None:
        # Cache miss - compute statistics
        from apps.chamas.models import Chama
        
        chama = Chama.objects.get(id=chama_id)
        stats = {
            'total_members': chama.members.filter(is_active=True).count(),
            'total_contributions': chama.contributions.aggregate(
                total=Sum('amount')
            )['total'] or 0,
            'average_contribution': chama.contributions.aggregate(
                avg=Avg('amount')
            )['avg'] or 0,
            'total_loans': chama.loans.aggregate(
                total=Sum('amount')
            )['total'] or 0,
        }
        
        # Store in cache for 10 minutes
        cache.set(cache_key, stats, timeout=60 * 10)
    
    return stats

def invalidate_chama_statistics(chama_id):
    """Invalidate cached statistics when data changes."""
    cache_key = f'chama_stats_{chama_id}'
    cache.delete(cache_key)
```

**Using in Views:**

```python
# apps/chamas/views.py
from rest_framework.decorators import action
from rest_framework.response import Response
from .utils import get_chama_statistics, invalidate_chama_statistics

class ChamaViewSet(viewsets.ModelViewSet):
    @action(detail=True, methods=['get'])
    def statistics(self, request, pk=None):
        """Get chama statistics (cached)."""
        stats = get_chama_statistics(pk)
        return Response(stats)
    
    def perform_update(self, serializer):
        """Invalidate cache on update."""
        instance = serializer.save()
        invalidate_chama_statistics(instance.id)
```

**Cache Patterns:**

```python
# apps/core/cache.py
from django.core.cache import cache
import functools
import hashlib
import json

def cache_result(timeout=300, key_prefix=''):
    """Decorator to cache function results."""
    def decorator(func):
        @functools.wraps(func)
        def wrapper(*args, **kwargs):
            # Generate cache key from function name and arguments
            key_data = {
                'func': func.__name__,
                'args': args,
                'kwargs': kwargs,
            }
            key_hash = hashlib.md5(
                json.dumps(key_data, sort_keys=True, default=str).encode()
            ).hexdigest()
            cache_key = f'{key_prefix}{func.__name__}_{key_hash}'
            
            # Try to get from cache
            result = cache.get(cache_key)
            
            if result is None:
                # Cache miss - execute function
                result = func(*args, **kwargs)
                cache.set(cache_key, result, timeout=timeout)
            
            return result
        
        return wrapper
    return decorator

# Usage
@cache_result(timeout=600, key_prefix='chama_')
def get_chama_analytics(chama_id, date_range):
    """Expensive analytics calculation."""
    # Complex calculation here
    return analytics_data
```

#### 17.2.3 Session Caching

To prevent database latency from slowing down session lookups, sessions should be configured to use Redis.

```python
# config/settings/base.py

# Use Redis for session storage
SESSION_ENGINE = 'django.contrib.sessions.backends.cache'
SESSION_CACHE_ALIAS = 'default'

# Session settings
SESSION_COOKIE_AGE = 1209600  # 2 weeks
SESSION_COOKIE_SECURE = not DEBUG
SESSION_COOKIE_HTTPONLY = True
SESSION_COOKIE_SAMESITE = 'Strict'
```

**Alternative: Cached DB Sessions:**

```python
# config/settings/base.py

# Use database with cache for sessions (best of both worlds)
SESSION_ENGINE = 'django.contrib.sessions.backends.cached_db'
```

### 17.3 Cache Invalidation Strategies

**CRITICAL:** Memory-based caching solutions, including Redis, are temporary storage solutions and should never be relied upon for permanent data persistence.

**Time-Based Invalidation:**

```python
# Set explicit timeout
cache.set('key', value, timeout=60 * 5)  # 5 minutes

# Use default timeout from settings
cache.set('key', value)  # Uses CACHES['default']['TIMEOUT']

# Cache forever (until manually deleted or Redis restart)
cache.set('key', value, timeout=None)
```

**Event-Based Invalidation:**

```python
# apps/chamas/signals.py
from django.db.models.signals import post_save, post_delete
from django.dispatch import receiver
from django.core.cache import cache
from .models import Contribution

@receiver(post_save, sender=Contribution)
def invalidate_contribution_cache(sender, instance, **kwargs):
    """Invalidate caches when contribution is saved."""
    # Invalidate chama statistics
    cache.delete(f'chama_stats_{instance.chama_id}')
    
    # Invalidate contribution list for this chama
    cache.delete(f'chama_contributions_{instance.chama_id}')

@receiver(post_delete, sender=Contribution)
def invalidate_contribution_cache_on_delete(sender, instance, **kwargs):
    """Invalidate caches when contribution is deleted."""
    cache.delete(f'chama_stats_{instance.chama_id}')
    cache.delete(f'chama_contributions_{instance.chama_id}')
```

**Pattern-Based Invalidation:**

```python
# Invalidate all keys matching a pattern
from django_redis import get_redis_connection

def invalidate_chama_caches(chama_id):
    """Invalidate all caches related to a chama."""
    redis_client = get_redis_connection("default")
    
    # Find all keys matching pattern
    pattern = f'*chama_{chama_id}*'
    keys = redis_client.keys(pattern)
    
    if keys:
        redis_client.delete(*keys)
```

### 17.4 Cache Monitoring

```python
# apps/core/management/commands/cache_stats.py
from django.core.management.base import BaseCommand
from django_redis import get_redis_connection

class Command(BaseCommand):
    help = 'Display Redis cache statistics'
    
    def handle(self, *args, **options):
        redis_client = get_redis_connection("default")
        
        # Get Redis info
        info = redis_client.info()
        
        self.stdout.write(f"Redis Version: {info['redis_version']}")
        self.stdout.write(f"Used Memory: {info['used_memory_human']}")
        self.stdout.write(f"Connected Clients: {info['connected_clients']}")
        self.stdout.write(f"Total Keys: {redis_client.dbsize()}")
        
        # Get cache hit/miss stats
        stats = cache.get_stats()
        self.stdout.write(f"Cache Stats: {stats}")
```

---

## 18. Scheduled Tasks (Crons) and Asynchronous Workloads

Handling tasks that are too long-running or should be executed outside the synchronous request-response cycle requires robust task queuing.

### 18.1 Celery vs. Management Commands/Crons

The choice between a simple system cron executing Django management commands and a full Celery setup depends on complexity and fault tolerance requirements.

#### 18.1.1 Simple Crons

Suitable for low-criticality, periodic maintenance tasks (e.g., rotating logs, simple cleanup scripts).

**Create Management Command:**

```python
# apps/core/management/commands/cleanup_old_sessions.py
from django.core.management.base import BaseCommand
from django.contrib.sessions.models import Session
from django.utils import timezone

class Command(BaseCommand):
    help = 'Clean up expired sessions'
    
    def handle(self, *args, **options):
        deleted_count, _ = Session.objects.filter(
            expire_date__lt=timezone.now()
        ).delete()
        
        self.stdout.write(
            self.style.SUCCESS(f'Deleted {deleted_count} expired sessions')
        )
```

**Crontab Setup:**

```bash
# Create shell script
# scripts/run_cleanup.sh
#!/bin/bash
cd /path/to/project
source venv/bin/activate
python manage.py cleanup_old_sessions
```

```bash
# Add to crontab (crontab -e)
# Run cleanup every day at 2 AM
0 2 * * * /path/to/project/scripts/run_cleanup.sh >> /var/log/cleanup.log 2>&1
```

#### 18.1.2 Celery (Recommended for High Traffic)

Celery is the industry standard for high-volume Django task management. It handles long-running tasks, ensures guaranteed execution with retry mechanisms, manages worker processes, and offers high infrastructure integration.

**Installation:**

```bash
pip install celery redis
```

**Celery Configuration:**

```python
# config/celery.py
import os
from celery import Celery

# Set default Django settings
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings.development')

app = Celery('chamahub')

# Load config from Django settings with CELERY_ prefix
app.config_from_object('django.conf:settings', namespace='CELERY')

# Auto-discover tasks from all installed apps
app.autodiscover_tasks()

@app.task(bind=True, ignore_result=True)
def debug_task(self):
    print(f'Request: {self.request!r}')
```

```python
# config/__init__.py
from .celery import app as celery_app

__all__ = ('celery_app',)
```

**Settings Configuration:**

```python
# config/settings/base.py

# Celery Configuration
CELERY_BROKER_URL = config('REDIS_URL', default='redis://localhost:6379/0')
CELERY_RESULT_BACKEND = config('REDIS_URL', default='redis://localhost:6379/0')

CELERY_ACCEPT_CONTENT = ['json']
CELERY_TASK_SERIALIZER = 'json'
CELERY_RESULT_SERIALIZER = 'json'
CELERY_TIMEZONE = 'Africa/Nairobi'

# Task execution settings
CELERY_TASK_TRACK_STARTED = True
CELERY_TASK_TIME_LIMIT = 30 * 60  # 30 minutes
CELERY_TASK_SOFT_TIME_LIMIT = 25 * 60  # 25 minutes

# Retry settings
CELERY_TASK_AUTORETRY_FOR = (Exception,)
CELERY_TASK_RETRY_KWARGS = {'max_retries': 3}
CELERY_TASK_RETRY_BACKOFF = True
CELERY_TASK_RETRY_BACKOFF_MAX = 600  # 10 minutes
CELERY_TASK_RETRY_JITTER = True

# Result backend settings
CELERY_RESULT_EXPIRES = 60 * 60 * 24  # 24 hours

# Worker settings
CELERY_WORKER_PREFETCH_MULTIPLIER = 4
CELERY_WORKER_MAX_TASKS_PER_CHILD = 1000  # Restart worker after 1000 tasks
```

**Create Tasks:**

```python
# apps/chamas/tasks.py
from celery import shared_task
from django.core.mail import send_mail
from django.utils import timezone
from .models import Contribution, Chama
import logging

logger = logging.getLogger(__name__)

@shared_task(bind=True, max_retries=3)
def send_contribution_reminder(self, chama_id):
    """Send contribution reminders to chama members."""
    try:
        chama = Chama.objects.get(id=chama_id)
        members = chama.members.filter(is_active=True)
        
        for member in members:
            send_mail(
                subject=f'Contribution Reminder - {chama.name}',
                message=f'Dear {member.user.full_name}, your contribution is due.',
                from_email='noreply@chamahub.com',
                recipient_list=[member.user.email],
                fail_silently=False,
            )
        
        logger.info(f'Sent reminders to {members.count()} members of {chama.name}')
        return f'Sent {members.count()} reminders'
        
    except Chama.DoesNotExist:
        logger.error(f'Chama {chama_id} not found')
        raise
    except Exception as exc:
        logger.error(f'Failed to send reminders: {exc}')
        raise self.retry(exc=exc, countdown=60)  # Retry after 1 minute

@shared_task
def calculate_monthly_interest():
    """Calculate and apply monthly interest to savings."""
    chamas = Chama.objects.filter(is_active=True)
    
    for chama in chamas:
        interest_rate = chama.interest_rate / 100 / 12  # Monthly rate
        
        contributions = chama.contributions.filter(
            status='approved',
            interest_applied_date__lt=timezone.now() - timezone.timedelta(days=30)
        )
        
        for contribution in contributions:
            interest = contribution.amount * interest_rate
            contribution.interest_earned += interest
            contribution.interest_applied_date = timezone.now()
            contribution.save()
    
    return f'Processed {chamas.count()} chamas'

@shared_task(bind=True)
def process_bulk_contributions(self, contribution_data):
    """Process bulk contribution uploads."""
    from django.db import transaction
    
    total = len(contribution_data)
    processed = 0
    
    try:
        with transaction.atomic():
            for data in contribution_data:
                Contribution.objects.create(**data)
                processed += 1
                
                # Update progress
                self.update_state(
                    state='PROGRESS',
                    meta={'processed': processed, 'total': total}
                )
        
        return {'status': 'success', 'processed': processed, 'total': total}
        
    except Exception as exc:
        return {'status': 'error', 'error': str(exc)}
```

**Using Tasks:**

```python
# apps/chamas/views.py
from .tasks import send_contribution_reminder, process_bulk_contributions

class ChamaViewSet(viewsets.ModelViewSet):
    @action(detail=True, methods=['post'])
    def send_reminders(self, request, pk=None):
        """Trigger contribution reminders asynchronously."""
        # Queue task for background processing
        task = send_contribution_reminder.delay(pk)
        
        return Response({
            'status': 'Task queued',
            'task_id': task.id
        })
    
    @action(detail=False, methods=['post'])
    def bulk_upload(self, request):
        """Handle bulk contribution upload."""
        contribution_data = request.data.get('contributions', [])
        
        # Process asynchronously
        task = process_bulk_contributions.delay(contribution_data)
        
        return Response({
            'status': 'Processing',
            'task_id': task.id
        })
```

**Running Celery Workers:**

```bash
# Start Celery worker
celery -A config worker --loglevel=info

# Start multiple workers
celery -A config worker --loglevel=info --concurrency=4

# Start worker with specific queue
celery -A config worker --loglevel=info --queue=emails,default

# Run in background (production)
celery -A config worker --loglevel=info --detach --pidfile=/var/run/celery/worker.pid
```

### 18.2 Robust Scheduling with Celery Beat

For scheduling periodic tasks, the use of `django-celery-beat` is mandatory for centralized management.

**Installation:**

```bash
pip install django-celery-beat
```

**Configuration:**

```python
# config/settings/base.py

INSTALLED_APPS = [
    # ...
    'django_celery_beat',
]

# Celery Beat settings
CELERY_BEAT_SCHEDULER = 'django_celery_beat.schedulers:DatabaseScheduler'
```

**Run Migrations:**

```bash
python manage.py migrate django_celery_beat
```

**Define Periodic Tasks in Code:**

```python
# config/celery.py
from celery.schedules import crontab

app.conf.beat_schedule = {
    'send-monthly-reports': {
        'task': 'apps.chamas.tasks.send_monthly_reports',
        'schedule': crontab(day_of_month='1', hour='9', minute='0'),  # 1st of month at 9 AM
    },
    'calculate-interest': {
        'task': 'apps.chamas.tasks.calculate_monthly_interest',
        'schedule': crontab(day_of_month='1', hour='0', minute='0'),  # 1st of month at midnight
    },
    'cleanup-old-data': {
        'task': 'apps.core.tasks.cleanup_old_data',
        'schedule': crontab(hour='2', minute='0'),  # Every day at 2 AM
    },
    'send-contribution-reminders': {
        'task': 'apps.chamas.tasks.send_all_contribution_reminders',
        'schedule': crontab(day_of_week='1', hour='8', minute='0'),  # Every Monday at 8 AM
    },
}
```

**Managing via Django Admin:**

```python
# apps/core/admin.py (django-celery-beat provides admin automatically)
# Navigate to /admin/django_celery_beat/ to manage schedules
```

**Start Celery Beat:**

```bash
# Start beat scheduler
celery -A config beat --loglevel=info

# Use database scheduler (with django-celery-beat)
celery -A config beat -l INFO --scheduler django_celery_beat.schedulers:DatabaseScheduler

# Run in background (production)
celery -A config beat --loglevel=info --detach --pidfile=/var/run/celery/beat.pid
```

**Docker Compose with Celery:**

```yaml
# docker-compose.yml
version: '3.8'

services:
  django:
    build: .
    command: gunicorn config.wsgi:application --bind 0.0.0.0:8000
    depends_on:
      - db
      - redis
  
  celery_worker:
    build: .
    command: celery -A config worker --loglevel=info
    depends_on:
      - db
      - redis
    environment:
      - CELERY_BROKER_URL=redis://redis:6379/0
  
  celery_beat:
    build: .
    command: celery -A config beat --loglevel=info --scheduler django_celery_beat.schedulers:DatabaseScheduler
    depends_on:
      - db
      - redis
    environment:
      - CELERY_BROKER_URL=redis://redis:6379/0
  
  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
  
  db:
    image: postgres:15
    environment:
      - POSTGRES_DB=chamahub
```

**Monitoring Celery:**

```bash
# Monitor tasks in real-time
celery -A config events

# Flower - Web-based monitoring
pip install flower
celery -A config flower
# Access at http://localhost:5555
```

---

## Part VII: Operational Maturity: DevOps, Microservices, and Observability

Moving to operational maturity requires standardizing environments, enabling horizontal scaling, and establishing comprehensive monitoring capabilities.

## 19. DevOps and Containerization (Docker)

Docker and Docker Compose ensure that the development, staging, and production environments are functionally identical, eliminating "works on my machine" issues.

### 19.1 Full-Stack Dockerization

#### 19.1.1 Django Backend

The backend Dockerfile uses a Python base image. It must specify dependencies (requirements.txt) and utilize Gunicorn or uWSGI as the production application server to host the Django application.

**Backend Dockerfile:**

```dockerfile
# Dockerfile
FROM python:3.11-slim

# Set environment variables
ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    PIP_NO_CACHE_DIR=1 \
    PIP_DISABLE_PIP_VERSION_CHECK=1

# Set work directory
WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    postgresql-client \
    build-essential \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

# Install Python dependencies
COPY requirements/production.txt requirements.txt
RUN pip install --upgrade pip && \
    pip install -r requirements.txt

# Copy project
COPY . .

# Collect static files
RUN python manage.py collectstatic --noinput

# Create non-root user
RUN useradd -m -u 1000 django && \
    chown -R django:django /app
USER django

# Run gunicorn
CMD ["gunicorn", "--bind", "0.0.0.0:8000", "--workers", "4", "config.wsgi:application"]
```

**Multi-Stage Build for Smaller Images:**

```dockerfile
# Dockerfile (multi-stage)
# Stage 1: Build dependencies
FROM python:3.11-slim AS builder

WORKDIR /app

RUN apt-get update && apt-get install -y \
    build-essential \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

COPY requirements/production.txt requirements.txt
RUN pip install --user --no-cache-dir -r requirements.txt

# Stage 2: Runtime
FROM python:3.11-slim

ENV PYTHONUNBUFFERED=1 \
    PATH=/root/.local/bin:$PATH

WORKDIR /app

# Install runtime dependencies only
RUN apt-get update && apt-get install -y \
    postgresql-client \
    && rm -rf /var/lib/apt/lists/*

# Copy installed packages from builder
COPY --from=builder /root/.local /root/.local

# Copy application
COPY . .

# Collect static files
RUN python manage.py collectstatic --noinput

# Create non-root user
RUN useradd -m -u 1000 django && \
    chown -R django:django /app
USER django

EXPOSE 8000

CMD ["gunicorn", "--bind", "0.0.0.0:8000", "--workers", "4", "config.wsgi:application"]
```

#### 19.1.2 React Frontend

The frontend Dockerfile should use a Node base image for building the static assets. Critically, a multi-stage build is required: the final stage uses a lightweight HTTP server (like Nginx) to serve the static bundle.

**Frontend Dockerfile:**

```dockerfile
# chamahub-frontend/Dockerfile
# Stage 1: Build React app
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy source code
COPY . .

# Build production bundle
RUN npm run build

# Stage 2: Serve with Nginx
FROM nginx:alpine

# Copy built assets from builder
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy custom nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
```

**Nginx Configuration:**

```nginx
# nginx.conf
server {
    listen 80;
    server_name localhost;
    
    root /usr/share/nginx/html;
    index index.html;
    
    # Gzip compression
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;
    
    # SPA routing - redirect all requests to index.html
    location / {
        try_files $uri $uri/ /index.html;
    }
    
    # Cache static assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
    
    # Security headers
    add_header X-Frame-Options "DENY" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
}
```

### 19.2 Local Development with Docker Compose

The docker-compose.yml file defines the entire ecosystem. It must orchestrate the deployment of all necessary services.

**Comprehensive Docker Compose:**

```yaml
# docker-compose.yml
version: '3.8'

services:
  # PostgreSQL Database
  db:
    image: postgres:15-alpine
    container_name: chamahub_db
    volumes:
      - postgres_data:/var/lib/postgresql/data
    environment:
      - POSTGRES_DB=chamahub
      - POSTGRES_USER=chamahub_user
      - POSTGRES_PASSWORD=chamahub_pass
    ports:
      - "5432:5432"
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U chamahub_user"]
      interval: 10s
      timeout: 5s
      retries: 5
  
  # Redis Cache & Message Broker
  redis:
    image: redis:7-alpine
    container_name: chamahub_redis
    volumes:
      - redis_data:/data
    ports:
      - "6379:6379"
    command: redis-server --appendonly yes
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 10s
      timeout: 3s
      retries: 3
  
  # Django Backend
  django:
    build: .
    container_name: chamahub_backend
    command: python manage.py runserver 0.0.0.0:8000
    volumes:
      - .:/app
      - static_volume:/app/staticfiles
      - media_volume:/app/media
    ports:
      - "8000:8000"
    environment:
      - DEBUG=True
      - DATABASE_URL=postgresql://chamahub_user:chamahub_pass@db:5432/chamahub
      - REDIS_URL=redis://redis:6379/0
      - CELERY_BROKER_URL=redis://redis:6379/0
    depends_on:
      db:
        condition: service_healthy
      redis:
        condition: service_healthy
  
  # Celery Worker
  celery_worker:
    build: .
    container_name: chamahub_celery_worker
    command: celery -A config worker --loglevel=info
    volumes:
      - .:/app
    environment:
      - DATABASE_URL=postgresql://chamahub_user:chamahub_pass@db:5432/chamahub
      - REDIS_URL=redis://redis:6379/0
      - CELERY_BROKER_URL=redis://redis:6379/0
    depends_on:
      - db
      - redis
  
  # Celery Beat Scheduler
  celery_beat:
    build: .
    container_name: chamahub_celery_beat
    command: celery -A config beat --loglevel=info --scheduler django_celery_beat.schedulers:DatabaseScheduler
    volumes:
      - .:/app
    environment:
      - DATABASE_URL=postgresql://chamahub_user:chamahub_pass@db:5432/chamahub
      - REDIS_URL=redis://redis:6379/0
      - CELERY_BROKER_URL=redis://redis:6379/0
    depends_on:
      - db
      - redis
  
  # React Frontend
  frontend:
    build: ./chamahub-frontend
    container_name: chamahub_frontend
    volumes:
      - ./chamahub-frontend:/app
      - /app/node_modules
    ports:
      - "3000:3000"
    environment:
      - VITE_API_BASE_URL=http://localhost:8000
    command: npm run dev -- --host
    depends_on:
      - django

volumes:
  postgres_data:
  redis_data:
  static_volume:
  media_volume:

networks:
  default:
    name: chamahub_network
```

**Running the Stack:**

```bash
# Build and start all services
docker-compose up --build

# Run in detached mode
docker-compose up -d

# View logs
docker-compose logs -f

# Stop all services
docker-compose down

# Stop and remove volumes
docker-compose down -v

# Run specific service
docker-compose up django

# Execute commands in running container
docker-compose exec django python manage.py migrate
docker-compose exec django python manage.py createsuperuser
docker-compose exec django python manage.py shell
```

**Production Docker Compose:**

```yaml
# docker-compose.prod.yml
version: '3.8'

services:
  django:
    build:
      context: .
      dockerfile: Dockerfile
    command: gunicorn config.wsgi:application --bind 0.0.0.0:8000 --workers 4
    environment:
      - DEBUG=False
      - SECRET_KEY=${SECRET_KEY}
      - DATABASE_URL=${DATABASE_URL}
      - REDIS_URL=${REDIS_URL}
      - ALLOWED_HOSTS=${ALLOWED_HOSTS}
    restart: always
  
  nginx:
    image: nginx:alpine
    volumes:
      - ./nginx/prod.conf:/etc/nginx/conf.d/default.conf
      - static_volume:/app/staticfiles
      - media_volume:/app/media
    ports:
      - "80:80"
      - "443:443"
    depends_on:
      - django
    restart: always

# ... other services
```

---

## 20. Advanced Shell Commands for DevOps

Mastery of the underlying operating system is non-negotiable for effective deployment and troubleshooting. These advanced shell commands are essential for managing processes and diagnosing issues in a live server environment.

### 20.1 Essential DevOps Commands

| Command | Purpose | Operational Necessity |
|---------|---------|----------------------|
| `top` / `htop` / `free` | Real-time memory and CPU monitoring | Identifying resource-intensive processes (e.g., misbehaving Celery workers or database queries) |
| `ps aux` / `pidof` / `kill` | Process management | Listing running processes, finding PID by name, and terminating unresponsive services (e.g., restarting Gunicorn or Celery workers) |
| `systemctl` | Service status management | Checking the status of systemd-managed services like Docker, Nginx, or the Celery worker daemon |
| `ls -ld` / `chmod` / `chown` | File permissions audit | Ensuring that sensitive configuration files and directories have appropriate permissions to prevent security exposures |
| `curl` / `wget` / `nslookup` / `dig` | Network diagnostics | Testing connectivity between services and diagnosing DNS resolution problems |

### 20.2 System Monitoring

**Memory and CPU Monitoring:**

```bash
# Real-time process monitoring
top

# Enhanced process viewer
htop

# Memory usage summary
free -h

# Detailed memory info
cat /proc/meminfo

# CPU information
lscpu

# System load average
uptime
```

**Disk Usage:**

```bash
# Disk space usage
df -h

# Directory size
du -sh /var/log/*

# Find large files
find / -type f -size +100M -exec ls -lh {} \;

# Check inode usage
df -i
```

### 20.3 Process Management

**Viewing Processes:**

```bash
# All running processes
ps aux

# Filter Django processes
ps aux | grep python

# Filter Celery workers
ps aux | grep celery

# Process tree
pstree

# Find process by name
pidof gunicorn

# Process details
ps -p <PID> -f
```

**Killing Processes:**

```bash
# Graceful termination
kill <PID>

# Force kill
kill -9 <PID>

# Kill all processes by name
pkill -f gunicorn

# Kill all Celery workers
pkill -f celery

# Kill with signal
kill -SIGHUP <PID>  # Reload configuration
```

**Managing Gunicorn:**

```bash
# Start Gunicorn
gunicorn config.wsgi:application --bind 0.0.0.0:8000 --daemon

# Reload Gunicorn gracefully (zero downtime)
kill -HUP $(cat /var/run/gunicorn.pid)

# Stop Gunicorn
kill $(cat /var/run/gunicorn.pid)

# Check if Gunicorn is running
pgrep -f gunicorn
```

### 20.4 Service Management (systemd)

**Systemd Service File:**

```ini
# /etc/systemd/system/chamahub.service
[Unit]
Description=ChamaHub Django Application
After=network.target postgresql.service redis.service

[Service]
Type=notify
User=django
Group=django
WorkingDirectory=/opt/chamahub
Environment="PATH=/opt/chamahub/venv/bin"
Environment="DJANGO_SETTINGS_MODULE=config.settings.production"
ExecStart=/opt/chamahub/venv/bin/gunicorn \
    --workers 4 \
    --bind unix:/run/chamahub/gunicorn.sock \
    --pid /run/chamahub/gunicorn.pid \
    config.wsgi:application
ExecReload=/bin/kill -s HUP $MAINPID
KillMode=mixed
TimeoutStopSec=5
PrivateTmp=true
Restart=always

[Install]
WantedBy=multi-user.target
```

**Systemd Commands:**

```bash
# Reload systemd daemon
sudo systemctl daemon-reload

# Start service
sudo systemctl start chamahub

# Stop service
sudo systemctl stop chamahub

# Restart service
sudo systemctl restart chamahub

# Reload configuration
sudo systemctl reload chamahub

# Enable service on boot
sudo systemctl enable chamahub

# Check service status
sudo systemctl status chamahub

# View service logs
sudo journalctl -u chamahub -f

# View logs since last boot
sudo journalctl -u chamahub -b
```

### 20.5 File Permissions and Security

**Permission Management:**

```bash
# Check file permissions
ls -la /etc/chamahub/

# Change permissions (numeric)
chmod 600 /etc/chamahub/.env  # Owner read/write only
chmod 644 /etc/chamahub/settings.py  # Owner rw, group/others r
chmod 755 /opt/chamahub/manage.py  # Owner rwx, group/others rx

# Change permissions (symbolic)
chmod u+x script.sh  # Add execute for owner
chmod go-w file.txt  # Remove write for group and others

# Change ownership
chown django:django /opt/chamahub/
chown -R django:django /opt/chamahub/  # Recursive

# Set default permissions for new files
umask 022
```

**Secure File Permissions:**

```bash
# Secure .env file (production)
chmod 600 /opt/chamahub/.env
chown django:django /opt/chamahub/.env

# Secure static files
chmod -R 755 /opt/chamahub/staticfiles

# Secure log files
chmod 640 /var/log/chamahub/*.log
chown django:adm /var/log/chamahub/*.log

# Find files with wrong permissions
find /opt/chamahub -type f -perm 777
```

### 20.6 Network Diagnostics

**Testing Connectivity:**

```bash
# Test HTTP endpoint
curl -I http://localhost:8000/api/v1/chamas/

# Test with headers
curl -H "Authorization: Bearer TOKEN" http://localhost:8000/api/v1/chamas/

# Test POST request
curl -X POST -H "Content-Type: application/json" \
    -d '{"email":"test@example.com"}' \
    http://localhost:8000/api/v1/auth/login/

# Follow redirects
curl -L http://chamahub.com

# Save response
curl -o response.json http://localhost:8000/api/v1/chamas/
```

**DNS and Network Tools:**

```bash
# DNS lookup
nslookup chamahub.com

# Detailed DNS info
dig chamahub.com

# Trace route
traceroute chamahub.com

# Check open ports
netstat -tulpn | grep LISTEN

# Check specific port
lsof -i :8000

# Test port connectivity
telnet localhost 5432
```

**Network Monitoring:**

```bash
# Active connections
ss -tuln

# Established connections
ss -tn state established

# Monitor network traffic
iftop

# Network statistics
netstat -s

# Bandwidth usage
vnstat
```

### 20.7 Log Management

**Viewing Logs:**

```bash
# View Django logs
tail -f /var/log/chamahub/django.log

# View last 100 lines
tail -n 100 /var/log/chamahub/django.log

# Follow multiple logs
tail -f /var/log/chamahub/*.log

# Search logs
grep "ERROR" /var/log/chamahub/django.log

# Search with context
grep -C 5 "ERROR" /var/log/chamahub/django.log

# Real-time search
tail -f /var/log/chamahub/django.log | grep "ERROR"
```

**Log Rotation:**

```bash
# /etc/logrotate.d/chamahub
/var/log/chamahub/*.log {
    daily
    rotate 14
    compress
    delaycompress
    notifempty
    create 0640 django adm
    sharedscripts
    postrotate
        systemctl reload chamahub
    endscript
}
```

### 20.8 Docker Commands

**Container Management:**

```bash
# List running containers
docker ps

# List all containers
docker ps -a

# View container logs
docker logs -f chamahub_backend

# Execute command in container
docker exec -it chamahub_backend python manage.py shell

# Enter container shell
docker exec -it chamahub_backend /bin/bash

# Copy files from container
docker cp chamahub_backend:/app/logs ./logs

# Inspect container
docker inspect chamahub_backend

# Container resource usage
docker stats
```

**Image Management:**

```bash
# List images
docker images

# Remove unused images
docker image prune

# Build image
docker build -t chamahub:latest .

# Tag image
docker tag chamahub:latest registry.example.com/chamahub:v1.0

# Push to registry
docker push registry.example.com/chamahub:v1.0
```

---

## 21. Microservices Architecture Transition

The plan anticipates a future transition to microservices, utilizing Django as a base for individual service components.

### 21.1 Strategic Blueprint for Isolation

Microservices are adopted to achieve greater horizontal scalability and allow independent deployment cycles. This decomposition requires the refactoring of a monolithic Django application into separate, independent Django projects (or services) for core functions.

**Service Decomposition Strategy:**

```
Monolithic Structure:
ProDev-Backend/
├── apps/
│   ├── users/
│   ├── chamas/
│   ├── contributions/
│   ├── loans/
│   └── notifications/

↓ REFACTOR TO ↓

Microservices Structure:
├── user-service/
│   └── Django project managing users, authentication
├── chama-service/
│   └── Django project managing chamas, members
├── contribution-service/
│   └── Django project managing contributions, payments
├── loan-service/
│   └── Django project managing loans, disbursements
└── notification-service/
    └── Django project managing emails, SMS, push notifications
```

**Service Boundaries:**

Each service should have:
- **Clear domain responsibility:** Single Responsibility Principle
- **Independent database:** Data sovereignty
- **API contracts:** Well-defined REST APIs
- **Autonomous deployment:** Can be deployed independently
- **Fault isolation:** Failure in one service doesn't crash others

### 21.2 Data Sovereignty and Service Independence

**CRITICAL PRINCIPLE:** Each service must own its own, independent database instance. Sharing a single database reintroduces tight coupling, negating the architectural benefits of decomposition.

#### 21.2.1 Separate Databases

```python
# user-service/config/settings.py
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': 'user_service_db',
        'USER': 'user_service_user',
        'PASSWORD': config('DB_PASSWORD'),
        'HOST': 'user-db.example.com',
        'PORT': '5432',
    }
}

# chama-service/config/settings.py
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': 'chama_service_db',
        'USER': 'chama_service_user',
        'PASSWORD': config('DB_PASSWORD'),
        'HOST': 'chama-db.example.com',
        'PORT': '5432',
    }
}
```

**Docker Compose for Microservices:**

```yaml
# docker-compose.microservices.yml
version: '3.8'

services:
  # User Service
  user-service:
    build: ./user-service
    environment:
      - DATABASE_URL=postgresql://user_user:pass@user-db:5432/user_db
    depends_on:
      - user-db
    ports:
      - "8001:8000"
  
  user-db:
    image: postgres:15-alpine
    environment:
      - POSTGRES_DB=user_db
      - POSTGRES_USER=user_user
      - POSTGRES_PASSWORD=pass
    volumes:
      - user_db_data:/var/lib/postgresql/data
  
  # Chama Service
  chama-service:
    build: ./chama-service
    environment:
      - DATABASE_URL=postgresql://chama_user:pass@chama-db:5432/chama_db
      - USER_SERVICE_URL=http://user-service:8000
    depends_on:
      - chama-db
    ports:
      - "8002:8000"
  
  chama-db:
    image: postgres:15-alpine
    environment:
      - POSTGRES_DB=chama_db
      - POSTGRES_USER=chama_user
      - POSTGRES_PASSWORD=pass
    volumes:
      - chama_db_data:/var/lib/postgresql/data
  
  # Contribution Service
  contribution-service:
    build: ./contribution-service
    environment:
      - DATABASE_URL=postgresql://contrib_user:pass@contribution-db:5432/contribution_db
      - USER_SERVICE_URL=http://user-service:8000
      - CHAMA_SERVICE_URL=http://chama-service:8000
    depends_on:
      - contribution-db
    ports:
      - "8003:8000"
  
  contribution-db:
    image: postgres:15-alpine
    environment:
      - POSTGRES_DB=contribution_db
      - POSTGRES_USER=contrib_user
      - POSTGRES_PASSWORD=pass
    volumes:
      - contribution_db_data:/var/lib/postgresql/data
  
  # API Gateway (Nginx)
  api-gateway:
    image: nginx:alpine
    volumes:
      - ./nginx-gateway.conf:/etc/nginx/conf.d/default.conf
    ports:
      - "80:80"
    depends_on:
      - user-service
      - chama-service
      - contribution-service

volumes:
  user_db_data:
  chama_db_data:
  contribution_db_data:
```

#### 21.2.2 Communication Protocols

Internal function calls between applications within the monolith must be replaced by network calls (e.g., HTTP requests) to other services.

**Service-to-Service Communication:**

```python
# chama-service/apps/chamas/services.py
import requests
from django.conf import settings

class UserServiceClient:
    """Client for communicating with User Service."""
    
    def __init__(self):
        self.base_url = settings.USER_SERVICE_URL
        self.timeout = 5  # seconds
    
    def get_user(self, user_id):
        """Fetch user details from User Service."""
        try:
            response = requests.get(
                f"{self.base_url}/api/v1/users/{user_id}/",
                timeout=self.timeout
            )
            response.raise_for_status()
            return response.json()
        except requests.exceptions.RequestException as e:
            # Handle service unavailability
            logger.error(f"Failed to fetch user {user_id}: {e}")
            return None
    
    def validate_user_exists(self, user_id):
        """Validate that a user exists."""
        user = self.get_user(user_id)
        return user is not None

# Usage in views
class ChamaViewSet(viewsets.ModelViewSet):
    def perform_create(self, serializer):
        user_client = UserServiceClient()
        
        # Validate user exists in User Service
        creator_id = self.request.user.id
        if not user_client.validate_user_exists(creator_id):
            raise ValidationError("User not found in User Service")
        
        serializer.save(created_by_id=creator_id)
```

**Event-Driven Communication:**

For asynchronous communication, use message queues (RabbitMQ, Kafka):

```python
# user-service/apps/users/signals.py
from django.db.models.signals import post_save
from django.dispatch import receiver
from .models import User
from .publishers import publish_user_created

@receiver(post_save, sender=User)
def user_created_handler(sender, instance, created, **kwargs):
    """Publish user created event."""
    if created:
        publish_user_created({
            'user_id': instance.id,
            'email': instance.email,
            'full_name': instance.full_name,
        })

# publishers.py
import pika
import json

def publish_user_created(user_data):
    """Publish user created event to RabbitMQ."""
    connection = pika.BlockingConnection(
        pika.ConnectionParameters('rabbitmq')
    )
    channel = connection.channel()
    
    channel.exchange_declare(
        exchange='user_events',
        exchange_type='fanout'
    )
    
    channel.basic_publish(
        exchange='user_events',
        routing_key='',
        body=json.dumps(user_data)
    )
    
    connection.close()
```

**API Gateway Pattern:**

```nginx
# nginx-gateway.conf
upstream user_service {
    server user-service:8000;
}

upstream chama_service {
    server chama-service:8000;
}

upstream contribution_service {
    server contribution-service:8000;
}

server {
    listen 80;
    
    # User Service
    location /api/v1/users/ {
        proxy_pass http://user_service;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
    
    location /api/v1/auth/ {
        proxy_pass http://user_service;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
    
    # Chama Service
    location /api/v1/chamas/ {
        proxy_pass http://chama_service;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
    
    # Contribution Service
    location /api/v1/contributions/ {
        proxy_pass http://contribution_service;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

### 21.3 Service Resilience Patterns

**Circuit Breaker:**

```python
# apps/core/circuit_breaker.py
from datetime import datetime, timedelta

class CircuitBreaker:
    """Simple circuit breaker pattern implementation."""
    
    def __init__(self, failure_threshold=5, timeout=60):
        self.failure_threshold = failure_threshold
        self.timeout = timeout
        self.failures = 0
        self.last_failure_time = None
        self.state = 'CLOSED'  # CLOSED, OPEN, HALF_OPEN
    
    def call(self, func, *args, **kwargs):
        """Execute function with circuit breaker protection."""
        if self.state == 'OPEN':
            if datetime.now() - self.last_failure_time > timedelta(seconds=self.timeout):
                self.state = 'HALF_OPEN'
            else:
                raise Exception("Circuit breaker is OPEN")
        
        try:
            result = func(*args, **kwargs)
            self.on_success()
            return result
        except Exception as e:
            self.on_failure()
            raise e
    
    def on_success(self):
        """Handle successful call."""
        self.failures = 0
        self.state = 'CLOSED'
    
    def on_failure(self):
        """Handle failed call."""
        self.failures += 1
        self.last_failure_time = datetime.now()
        
        if self.failures >= self.failure_threshold:
            self.state = 'OPEN'

# Usage
user_service_breaker = CircuitBreaker()

def get_user_with_breaker(user_id):
    """Get user with circuit breaker protection."""
    def fetch():
        return requests.get(f"{USER_SERVICE_URL}/api/v1/users/{user_id}/").json()
    
    return user_service_breaker.call(fetch)
```

---

## 22. Monitoring, Analysis, and Third-Party Services

A production-grade application must be fully observable to detect and diagnose issues rapidly across both the Python and TypeScript domains.

### 22.1 Bug Reporting and Application Performance Monitoring (APM)

#### 22.1.1 Sentry Integration

**MANDATORY:** The immediate integration of Sentry is mandatory. Sentry provides unified visibility across the full stack, aggregating errors from the Django backend (Python exceptions) and the React frontend (client-side JavaScript/TypeScript errors).

**Backend Sentry Setup:**

```bash
pip install sentry-sdk
```

```python
# config/settings/base.py
import sentry_sdk
from sentry_sdk.integrations.django import DjangoIntegration
from sentry_sdk.integrations.celery import CeleryIntegration
from sentry_sdk.integrations.redis import RedisIntegration

sentry_sdk.init(
    dsn=config('SENTRY_DSN'),
    integrations=[
        DjangoIntegration(),
        CeleryIntegration(),
        RedisIntegration(),
    ],
    # Set traces_sample_rate to 1.0 to capture 100% of transactions for performance monitoring
    traces_sample_rate=0.1,  # 10% sampling in production
    
    # Set profiles_sample_rate to capture profiles for performance insights
    profiles_sample_rate=0.1,
    
    # Send sensitive information like user IDs
    send_default_pii=True,
    
    # Environment
    environment=config('ENVIRONMENT', default='production'),
    
    # Release version
    release=config('RELEASE_VERSION', default='unknown'),
    
    # Custom tags
    before_send=lambda event, hint: event,
)
```

**Custom Error Handling:**

```python
# apps/core/exceptions.py
from sentry_sdk import capture_exception, capture_message
import logging

logger = logging.getLogger(__name__)

def handle_external_service_error(service_name, error):
    """Handle and report external service errors."""
    logger.error(f"{service_name} error: {error}")
    
    # Capture in Sentry with context
    with sentry_sdk.push_scope() as scope:
        scope.set_tag("service", service_name)
        scope.set_level("error")
        scope.set_context("service_details", {
            "service_name": service_name,
            "error_type": type(error).__name__,
        })
        capture_exception(error)
```

**Frontend Sentry Setup:**

```bash
npm install @sentry/react @sentry/tracing
```

```typescript
// src/main.tsx
import * as Sentry from "@sentry/react";
import { BrowserTracing } from "@sentry/tracing";

Sentry.init({
  dsn: import.meta.env.VITE_SENTRY_DSN,
  integrations: [
    new BrowserTracing(),
    new Sentry.Replay({
      maskAllText: false,
      blockAllMedia: false,
    }),
  ],
  
  // Performance Monitoring
  tracesSampleRate: 0.1, // 10% of transactions
  
  // Session Replay
  replaysSessionSampleRate: 0.1, // 10% of sessions
  replaysOnErrorSampleRate: 1.0, // 100% of errors
  
  environment: import.meta.env.MODE,
  release: import.meta.env.VITE_RELEASE_VERSION,
});

// Error Boundary
const App = () => (
  <Sentry.ErrorBoundary fallback={<ErrorFallback />}>
    <YourApp />
  </Sentry.ErrorBoundary>
);
```

**Custom Frontend Error Tracking:**

```typescript
// src/utils/errorTracking.ts
import * as Sentry from "@sentry/react";

export const trackError = (error: Error, context?: Record<string, any>) => {
  Sentry.captureException(error, {
    contexts: {
      custom: context,
    },
  });
};

export const trackMessage = (message: string, level: Sentry.SeverityLevel = "info") => {
  Sentry.captureMessage(message, level);
};

// Usage
try {
  await chamasAPI.create(data);
} catch (error) {
  trackError(error as Error, {
    operation: "create_chama",
    user_id: currentUser.id,
  });
}
```

#### 22.1.2 Security Logging

Implement robust security logging to monitor events such as failed login attempts, privilege escalation, and configuration changes.

```python
# apps/core/security_logging.py
import logging
from django.contrib.auth.signals import user_logged_in, user_logged_out, user_login_failed
from django.dispatch import receiver

security_logger = logging.getLogger('security')

@receiver(user_logged_in)
def log_user_login(sender, request, user, **kwargs):
    """Log successful login."""
    security_logger.info(
        f"User logged in: {user.email}",
        extra={
            'user_id': user.id,
            'ip_address': get_client_ip(request),
            'user_agent': request.META.get('HTTP_USER_AGENT', ''),
            'event': 'login_success',
        }
    )

@receiver(user_login_failed)
def log_failed_login(sender, credentials, request, **kwargs):
    """Log failed login attempts."""
    security_logger.warning(
        f"Failed login attempt for: {credentials.get('email')}",
        extra={
            'email': credentials.get('email'),
            'ip_address': get_client_ip(request),
            'user_agent': request.META.get('HTTP_USER_AGENT', ''),
            'event': 'login_failed',
        }
    )

def get_client_ip(request):
    """Extract client IP address."""
    x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
    if x_forwarded_for:
        ip = x_forwarded_for.split(',')[0]
    else:
        ip = request.META.get('REMOTE_ADDR')
    return ip
```

### 22.2 Network Traffic Analysis Tools

For deep-level debugging related to latency, dropped packets, or security protocol negotiation, advanced analysis tools are required.

**Server-Side Analysis:**

```bash
# Wireshark (GUI)
sudo apt-get install wireshark
sudo wireshark

# tcpdump (CLI)
# Capture HTTP traffic
sudo tcpdump -i any -s 0 -A 'tcp port 8000'

# Capture and save to file
sudo tcpdump -i any -w capture.pcap 'tcp port 8000'

# Read capture file
tcpdump -r capture.pcap

# Filter by IP
sudo tcpdump -i any 'host 192.168.1.100'
```

**Browser Tools:**

The browser's network tab remains critical for analyzing frontend latency, resource loading times, and verifying HTTP-only cookie transmission during the JWT flow.

### 22.3 IP Tracking Tools

Integration with third-party geolocation services is often required for fraud detection, personalized content, or regulatory compliance.

**Geolocation Service Integration:**

```python
# apps/core/geolocation.py
import requests
from django.core.cache import cache
from django.conf import settings
import logging

logger = logging.getLogger(__name__)

def get_ip_location(ip_address):
    """
    Get location data for IP address with caching.
    Uses ipapi.co service.
    """
    # Check cache first
    cache_key = f'ip_location_{ip_address}'
    cached_result = cache.get(cache_key)
    
    if cached_result:
        return cached_result
    
    try:
        # Call ipapi.co API
        response = requests.get(
            f'https://ipapi.co/{ip_address}/json/',
            timeout=5
        )
        response.raise_for_status()
        
        location_data = response.json()
        
        # Cache for 24 hours
        cache.set(cache_key, location_data, timeout=86400)
        
        return location_data
        
    except requests.exceptions.RequestException as e:
        logger.error(f"Failed to fetch IP location for {ip_address}: {e}")
        return None

# Usage in views
from apps.core.geolocation import get_ip_location
from apps.core.security_logging import get_client_ip

class LoginView(APIView):
    def post(self, request):
        # ... authentication logic ...
        
        # Track login location
        ip_address = get_client_ip(request)
        location = get_ip_location(ip_address)
        
        if location:
            logger.info(
                f"Login from {location.get('city')}, {location.get('country_name')}"
            )
        
        # ... rest of logic ...
```

**Rate Limiting to Avoid API Limits:**

```python
# config/settings/base.py

# Custom rate limiting for geolocation
GEOLOCATION_RATE_LIMIT = 1000  # requests per day
GEOLOCATION_CACHE_TIMEOUT = 86400  # 24 hours
```

---

## 23. Final Project: Synthesis and Comprehensive Deployment Checklist

The culmination of this blueprint is a system that synthesizes performance, security, and scalability. A final audit confirms readiness for deployment.

### 23.1 Pre-Deployment Security Audit

**Security Checklist:**

✅ **HTTPS Enforcement:**
```python
# config/settings/production.py
SECURE_SSL_REDIRECT = True
SECURE_PROXY_SSL_HEADER = ('HTTP_X_FORWARDED_PROTO', 'https')
```

✅ **SECRET_KEY Externalized:**
```bash
# Verify .env is not in git
git ls-files | grep .env  # Should return nothing

# Verify SECRET_KEY is strong
python -c "from decouple import config; print(len(config('SECRET_KEY')))"  # Should be >= 50
```

✅ **CSRF/XSS Mitigations Active:**
```python
# Verify in settings
assert 'django.middleware.csrf.CsrfViewMiddleware' in MIDDLEWARE
assert X_FRAME_OPTIONS == 'DENY'
assert SECURE_CONTENT_TYPE_NOSNIFF == True
```

✅ **JWT in HTTP-only Cookies:**
```python
# Verify cookie settings
assert SESSION_COOKIE_HTTPONLY == True
assert SESSION_COOKIE_SECURE == (not DEBUG)
assert CSRF_COOKIE_SECURE == (not DEBUG)
```

### 23.2 Performance Verification

**Performance Checklist:**

✅ **N+1 Queries Eliminated:**
```python
# Run django-debug-toolbar checks
# All list views should have < 5 queries

# Test with assertion
from django.test import TestCase
from django.test.utils import override_settings

@override_settings(DEBUG=True)
class PerformanceTest(TestCase):
    def test_chama_list_queries(self):
        with self.assertNumQueries(3):  # Should be minimal
            response = self.client.get('/api/v1/chamas/')
```

✅ **Redis Caching Functional:**
```python
# Test cache
from django.core.cache import cache

cache.set('test_key', 'test_value')
assert cache.get('test_key') == 'test_value'
```

✅ **Celery Workers Registered:**
```bash
# Check Celery tasks
celery -A config inspect registered

# Check Celery beat schedule
celery -A config inspect scheduled
```

### 23.3 Architectural Conformity

**Type Safety Checklist:**

✅ **TypeScript Build Passes:**
```bash
cd chamahub-frontend
npm run type-check
npm run build
```

✅ **Generated Types Up-to-Date:**
```bash
# Backend: Generate schema
python manage.py spectacular --file schema.yaml

# Frontend: Generate types
npm run generate:api

# Verify no uncommitted changes
git status | grep "generated"
```

### 23.4 Deployment Readiness

**Deployment Checklist:**

✅ **Environment Variables Configured:**
```bash
# Production .env template
cat > .env.production << EOF
ENVIRONMENT=production
DEBUG=False
SECRET_KEY=<generated-secret-key>
ALLOWED_HOSTS=chamahub.com,www.chamahub.com
DATABASE_URL=postgresql://user:pass@host:5432/db
REDIS_URL=redis://host:6379/0
SENTRY_DSN=https://...
EOF
```

✅ **Static Files Collected:**
```bash
python manage.py collectstatic --noinput
```

✅ **Migrations Applied:**
```bash
python manage.py migrate --check
python manage.py migrate
```

✅ **Docker Images Built:**
```bash
docker-compose -f docker-compose.prod.yml build
docker-compose -f docker-compose.prod.yml up -d
```

✅ **SSL Certificates Configured:**
```bash
# Let's Encrypt with Certbot
sudo certbot --nginx -d chamahub.com -d www.chamahub.com
```

✅ **Monitoring Active:**
```python
# Verify Sentry
import sentry_sdk
sentry_sdk.capture_message("Deployment test message")
```

✅ **Backups Configured:**
```bash
# Database backup script
# scripts/backup_db.sh
#!/bin/bash
BACKUP_DIR="/backups/postgres"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)

pg_dump -h $DB_HOST -U $DB_USER $DB_NAME | gzip > \
    $BACKUP_DIR/backup_$TIMESTAMP.sql.gz

# Keep only last 30 days
find $BACKUP_DIR -name "backup_*.sql.gz" -mtime +30 -delete
```

### 23.5 Post-Deployment Validation

**Validation Tests:**

```bash
# Test API endpoints
curl -I https://api.chamahub.com/api/v1/chamas/

# Test HTTPS redirect
curl -I http://chamahub.com  # Should return 301 to https

# Test static files
curl -I https://chamahub.com/static/css/main.css

# Load test (optional)
pip install locust
locust -f locustfile.py --host=https://api.chamahub.com
```

**Health Check Endpoint:**

```python
# apps/core/views.py
from django.http import JsonResponse
from django.db import connection
from django.core.cache import cache

def health_check(request):
    """Health check endpoint for monitoring."""
    status = {
        'status': 'healthy',
        'database': 'unknown',
        'cache': 'unknown',
    }
    
    # Check database
    try:
        connection.ensure_connection()
        status['database'] = 'healthy'
    except Exception:
        status['database'] = 'unhealthy'
        status['status'] = 'unhealthy'
    
    # Check cache
    try:
        cache.set('health_check', 'ok', 1)
        if cache.get('health_check') == 'ok':
            status['cache'] = 'healthy'
        else:
            status['cache'] = 'unhealthy'
    except Exception:
        status['cache'] = 'unhealthy'
    
    return JsonResponse(status)
```

### 23.6 Monitoring Dashboard

**Key Metrics to Monitor:**

- **Application Metrics:**
  - Response times (p50, p95, p99)
  - Error rates
  - Request throughput
  - Active users

- **Infrastructure Metrics:**
  - CPU usage
  - Memory usage
  - Disk I/O
  - Network I/O

- **Business Metrics:**
  - User signups
  - Chama creations
  - Contribution volumes
  - Active chamas

**Example Grafana Dashboard JSON:**
```json
{
  "dashboard": {
    "title": "ChamaHub Production Dashboard",
    "panels": [
      {
        "title": "Request Rate",
        "targets": [
          {
            "expr": "rate(django_http_requests_total[5m])"
          }
        ]
      },
      {
        "title": "Error Rate",
        "targets": [
          {
            "expr": "rate(django_http_requests_total{status=~\"5..\"}[5m])"
          }
        ]
      }
    ]
  }
}
```

---

## 📊 Summary and Best Practices

### Backend Best Practices

✅ **Database Optimization:**
- Always use `select_related()` for foreign keys
- Always use `prefetch_related()` for many-to-many relationships
- Use bulk operations (`bulk_create()`, `update()`) instead of loops
- Add database indexes on frequently queried fields
- Use `only()` and `defer()` to fetch only needed fields
- Use `iterator()` for large QuerySets

✅ **Security:**
- Externalize all secrets to environment variables
- Never use `CORS_ALLOW_ALL_ORIGINS = True` in production
- Use parameterized queries for raw SQL
- Enable HTTPS in production
- Implement rate limiting and throttling
- Use JWT with HTTP-only cookies for authentication
- Set appropriate cache-control headers
- Implement ETag support for efficient caching
- Rotate refresh tokens on use
- Blacklist tokens after rotation

✅ **API Design:**
- Use DRF Spectacular for OpenAPI schema generation
- Implement proper pagination and filtering
- Use nested serializers for related data
- Provide clear error messages
- Version your API (`/api/v1/`)

### Frontend Best Practices

✅ **Type Safety:**
- Enable strict mode in `tsconfig.json`
- Use generated TypeScript types from backend
- Automate type generation in CI/CD pipeline
- Use runtime validation with Zod for critical data

✅ **Routing and Protection:**
- Implement route guards with JWT validation
- Use React Router for dynamic routing
- Protect critical routes (dashboard, settings)
- Handle authentication redirects gracefully

✅ **State Management:**
- Use React Query for server state
- Use Zustand for client state (preferred over Redux for most cases)
- Implement optimistic updates for better UX
- Cache API responses appropriately
- Separate server and client state concerns

✅ **Data Fetching:**
- Use React Query for automatic caching and background refetching
- Implement pagination for large data sets
- Use infinite scroll for mobile-friendly interfaces
- Configure proper retry and error handling strategies

✅ **PWA Implementation:**
- Configure service workers for offline support
- Create comprehensive manifest.json
- Run Lighthouse audits for validation
- Coordinate caching with backend using ETags
- Implement network-first or cache-first strategies based on data type

✅ **Security:**
- Store JWT tokens in HTTP-only cookies (NEVER localStorage)
- Use secure, SameSite=Strict cookies
- Implement automatic token refresh
- Protect against XSS and CSRF attacks
- Always use HTTPS in production

✅ **Mobile Development:**
- Use React Native with existing Django backend
- Configure CORS for mobile emulators and devices
- Use proper base URLs for Android (10.0.2.2) and iOS
- Implement JWT authentication with AsyncStorage for React Native

✅ **Performance:**
- Implement code splitting
- Use lazy loading for routes
- Optimize bundle size
- Enable PWA for offline support
- Use CDN for static assets
- Implement selective state consumption in Zustand

---

## 🎯 Next Steps

After mastering this guide, you can:

1. **Implement Advanced Features:**
   - WebSocket real-time updates with Django Channels
   - Background task processing with Celery
   - Full-text search with PostgreSQL
   - Data analytics and reporting

2. **Scale Your Application:**
   - Horizontal scaling with load balancers
   - Database replication and sharding
   - Microservices architecture
   - Containerization with Docker/Kubernetes

3. **Enhance User Experience:**
   - Mobile app with React Native
   - Push notifications
   - Internationalization (i18n)
   - Advanced PWA features (background sync, push API)

4. **Production Hardening:**
   - Comprehensive monitoring (Sentry, DataDog)
   - Performance optimization (profiling, caching)
   - Security audits and penetration testing
   - Disaster recovery planning

---

## 📚 Additional Resources

### Django & DRF
- [Django Documentation](https://docs.djangoproject.com/)
- [DRF Documentation](https://www.django-rest-framework.org/)
- [DRF Spectacular Documentation](https://drf-spectacular.readthedocs.io/)
- [PostgreSQL Performance Tips](https://wiki.postgresql.org/wiki/Performance_Optimization)

### TypeScript & React
- [TypeScript Handbook](https://www.typescriptlang.org/docs/handbook/)
- [React TypeScript Cheatsheet](https://react-typescript-cheatsheet.netlify.app/)
- [TanStack Query Documentation](https://tanstack.com/query/latest)
- [Zustand Documentation](https://docs.pmnd.rs/zustand/)

### Code Generation
- [Orval Documentation](https://orval.dev/)
- [OpenAPI Generator](https://openapi-generator.tech/)

### Best Practices
- [Two Scoops of Django](https://www.feldroy.com/books/two-scoops-of-django-3-x)
- [Clean Code in TypeScript](https://github.com/labs42io/clean-code-typescript)

---

<div align="center">

## 🌟 Congratulations!

You've completed the Django/TypeScript Full-Stack Mastery Guide. You now have the knowledge to build production-grade, type-safe, scalable full-stack applications.

### [⬅️ Back to Guide 6](./06-production-features.md) | [📚 Back to Guide Index](./README.md)

**Built with ❤️ for the ChamaHub platform**

</div>
