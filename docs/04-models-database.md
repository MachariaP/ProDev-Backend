# 🗄️ Guide 4: Core Django Models and Database Design

> **Duration:** 90-120 minutes  
> **Prerequisites:** Completed Guide 1, 2, and 3  
> **Outcome:** Production-ready database schema with Django models

---

## 🎯 What You'll Learn

- Design a normalized database schema (3NF)
- Create Django models with best practices
- Implement model relationships (1-to-Many, Many-to-Many)
- Add database indexes and constraints
- Use Django signals for business logic
- Write model tests

---

## 📋 Table of Contents

1. [Database Design Principles](#1-database-design-principles)
2. [Create Users App](#2-create-users-app)
3. [Create Chamas App](#3-create-chamas-app)
4. [Model Relationships](#4-model-relationships)
5. [Database Indexes and Constraints](#5-database-indexes-and-constraints)
6. [Django Signals](#6-django-signals)
7. [Testing Models](#7-testing-models)

---

## 1. Database Design Principles

### 1.1 ChamaHub Database Schema

**Core Entities:**
- **User:** Custom user model (email/phone authentication)
- **Chama:** Savings group
- **Member:** Junction table (User ↔ Chama)
- **Contribution:** Member deposits
- **Expense:** Chama expenditures
- **Loan:** Member loans

**Key Design Principles:**
- ✅ Third Normal Form (3NF) compliant
- ✅ Financial-grade constraints (`CHECK`, `NOT NULL`)
- ✅ Composite indexes on high-read queries
- ✅ Soft deletes (never hard delete financial records)
- ✅ Audit trail (track all changes)

---

## 2. Create Users App

### 2.1 Create App

```bash
python manage.py startapp users apps/users
```

### 2.2 Custom User Model

```python
# apps/users/models.py
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin
from django.db import models
from django.utils import timezone
from django.core.validators import RegexValidator
import uuid


class UserManager(BaseUserManager):
    """Custom user manager for email/phone authentication."""
    
    def create_user(self, email, password=None, **extra_fields):
        """Create and return a regular user."""
        if not email:
            raise ValueError('Email address is required')
        
        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user
    
    def create_superuser(self, email, password=None, **extra_fields):
        """Create and return a superuser."""
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        extra_fields.setdefault('is_active', True)
        
        if extra_fields.get('is_staff') is not True:
            raise ValueError('Superuser must have is_staff=True')
        if extra_fields.get('is_superuser') is not True:
            raise ValueError('Superuser must have is_superuser=True')
        
        return self.create_user(email, password, **extra_fields)


class User(AbstractBaseUser, PermissionsMixin):
    """
    Custom user model using email as the unique identifier.
    Supports both email and phone authentication.
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    email = models.EmailField(
        unique=True,
        db_index=True,
        help_text="User's email address (primary authentication)"
    )
    phone_number = models.CharField(
        max_length=15,
        unique=True,
        null=True,
        blank=True,
        validators=[RegexValidator(
            regex=r'^\+?254\d{9}$',
            message='Phone must be in format: +254XXXXXXXXX'
        )],
        help_text="Kenyan phone number in format +254XXXXXXXXX"
    )
    first_name = models.CharField(max_length=150)
    last_name = models.CharField(max_length=150)
    
    # Profile fields
    profile_photo = models.ImageField(
        upload_to='profiles/',
        null=True,
        blank=True
    )
    date_of_birth = models.DateField(null=True, blank=True)
    national_id = models.CharField(
        max_length=20,
        unique=True,
        null=True,
        blank=True,
        help_text="National ID or Passport number"
    )
    
    # Account status
    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)
    email_verified = models.BooleanField(default=False)
    phone_verified = models.BooleanField(default=False)
    
    # Timestamps
    date_joined = models.DateTimeField(default=timezone.now)
    last_login = models.DateTimeField(null=True, blank=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    objects = UserManager()
    
    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['first_name', 'last_name']
    
    class Meta:
        db_table = 'users'
        verbose_name = 'User'
        verbose_name_plural = 'Users'
        ordering = ['-date_joined']
        indexes = [
            models.Index(fields=['email']),
            models.Index(fields=['phone_number']),
            models.Index(fields=['-date_joined']),
        ]
    
    def __str__(self):
        return f"{self.get_full_name()} ({self.email})"
    
    def get_full_name(self):
        """Return user's full name."""
        return f"{self.first_name} {self.last_name}".strip()
    
    def get_short_name(self):
        """Return user's first name."""
        return self.first_name


# apps/users/admin.py
from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import User


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    """Admin interface for User model."""
    
    list_display = ['email', 'get_full_name', 'phone_number', 'is_active', 'date_joined']
    list_filter = ['is_active', 'is_staff', 'email_verified', 'phone_verified']
    search_fields = ['email', 'first_name', 'last_name', 'phone_number']
    ordering = ['-date_joined']
    
    fieldsets = (
        (None, {'fields': ('email', 'password')}),
        ('Personal Info', {'fields': ('first_name', 'last_name', 'phone_number', 'date_of_birth', 'national_id', 'profile_photo')}),
        ('Permissions', {'fields': ('is_active', 'is_staff', 'is_superuser', 'groups', 'user_permissions')}),
        ('Verification', {'fields': ('email_verified', 'phone_verified')}),
        ('Important Dates', {'fields': ('last_login', 'date_joined')}),
    )
    
    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('email', 'first_name', 'last_name', 'password1', 'password2'),
        }),
    )


# apps/users/apps.py
from django.apps import AppConfig


class UsersConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'apps.users'
    verbose_name = 'Users'
```

### 2.3 Update Settings

```python
# config/settings/base.py

INSTALLED_APPS = [
    # ... existing apps ...
    'apps.users',
]

# Custom user model
AUTH_USER_MODEL = 'users.User'
```

### 2.4 Create and Run Migrations

```bash
python manage.py makemigrations users
python manage.py migrate users
```

---

## 3. Create Chamas App

### 3.1 Create App

```bash
python manage.py startapp chamas apps/chamas
```

### 3.2 Chama Model

```python
# apps/chamas/models.py
from django.db import models
from django.conf import settings
from django.core.validators import MinValueValidator
from decimal import Decimal
import uuid


class Chama(models.Model):
    """
    Savings group (Chama) model.
    Central entity for group savings and investments.
    """
    
    CONTRIBUTION_FREQUENCY_CHOICES = [
        ('WEEKLY', 'Weekly'),
        ('BIWEEKLY', 'Bi-Weekly'),
        ('MONTHLY', 'Monthly'),
    ]
    
    SUBSCRIPTION_TIER_CHOICES = [
        ('FREE', 'Free Tier'),
        ('PREMIUM', 'Premium Tier'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(
        max_length=200,
        unique=True,
        help_text="Chama name (must be unique)"
    )
    description = models.TextField(blank=True)
    
    # Chama settings
    contribution_amount = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        validators=[MinValueValidator(Decimal('0.01'))],
        help_text="Fixed contribution amount per member"
    )
    contribution_frequency = models.CharField(
        max_length=20,
        choices=CONTRIBUTION_FREQUENCY_CHOICES,
        default='MONTHLY'
    )
    
    # Financial tracking
    balance = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        default=Decimal('0.00'),
        validators=[MinValueValidator(Decimal('0.00'))],
        help_text="Current chama balance"
    )
    idle_cash = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        default=Decimal('0.00'),
        help_text="Cash not moved in 30+ days"
    )
    
    # Membership
    max_members = models.PositiveIntegerField(
        default=50,
        validators=[MinValueValidator(2)],
        help_text="Maximum allowed members"
    )
    chair = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.PROTECT,
        related_name='chaired_chamas',
        help_text="Chama chairperson"
    )
    treasurer = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.PROTECT,
        related_name='treasured_chamas',
        null=True,
        blank=True,
        help_text="Chama treasurer"
    )
    
    # Subscription
    subscription_tier = models.CharField(
        max_length=20,
        choices=SUBSCRIPTION_TIER_CHOICES,
        default='FREE'
    )
    subscription_expires_at = models.DateTimeField(null=True, blank=True)
    
    # Status
    is_active = models.BooleanField(default=True)
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'chamas'
        verbose_name = 'Chama'
        verbose_name_plural = 'Chamas'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['name']),
            models.Index(fields=['subscription_tier']),
            models.Index(fields=['-created_at']),
        ]
        constraints = [
            models.CheckConstraint(
                check=models.Q(balance__gte=0),
                name='chama_balance_positive'
            ),
            models.CheckConstraint(
                check=models.Q(contribution_amount__gt=0),
                name='chama_contribution_positive'
            ),
        ]
    
    def __str__(self):
        return self.name
    
    @property
    def member_count(self):
        """Return current number of members."""
        return self.members.filter(is_active=True).count()
    
    @property
    def is_premium(self):
        """Check if chama has active premium subscription."""
        from django.utils import timezone
        if self.subscription_tier != 'PREMIUM':
            return False
        if not self.subscription_expires_at:
            return False
        return self.subscription_expires_at > timezone.now()


class Member(models.Model):
    """
    Junction table for User-Chama relationship.
    Stores member-specific data like contribution share and credit score.
    """
    
    ROLE_CHOICES = [
        ('CHAIR', 'Chairperson'),
        ('TREASURER', 'Treasurer'),
        ('SECRETARY', 'Secretary'),
        ('MEMBER', 'Member'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='memberships'
    )
    chama = models.ForeignKey(
        Chama,
        on_delete=models.CASCADE,
        related_name='members'
    )
    
    # Role and status
    role = models.CharField(
        max_length=20,
        choices=ROLE_CHOICES,
        default='MEMBER'
    )
    is_active = models.BooleanField(default=True)
    
    # Financial tracking
    contribution_share = models.DecimalField(
        max_digits=5,
        decimal_places=4,
        default=Decimal('0.0000'),
        validators=[MinValueValidator(Decimal('0.0000'))],
        help_text="Proportional ownership (0.0000 to 1.0000)"
    )
    total_contributed = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        default=Decimal('0.00'),
        help_text="Lifetime contributions"
    )
    
    # Credit scoring
    credit_score = models.PositiveIntegerField(
        default=50,
        validators=[MinValueValidator(0)],
        help_text="Member reliability score (0-100)"
    )
    
    # Timestamps
    joined_date = models.DateField(auto_now_add=True)
    left_date = models.DateField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'members'
        verbose_name = 'Member'
        verbose_name_plural = 'Members'
        ordering = ['-joined_date']
        unique_together = [['user', 'chama']]
        indexes = [
            models.Index(fields=['user', 'chama']),
            models.Index(fields=['chama', 'is_active']),
            models.Index(fields=['-credit_score']),
        ]
        constraints = [
            models.CheckConstraint(
                check=models.Q(contribution_share__gte=0) & models.Q(contribution_share__lte=1),
                name='member_share_valid_range'
            ),
            models.CheckConstraint(
                check=models.Q(credit_score__lte=100),
                name='member_credit_score_max'
            ),
        ]
    
    def __str__(self):
        return f"{self.user.get_full_name()} - {self.chama.name}"


class Contribution(models.Model):
    """
    Individual member contributions to chama.
    Tracks M-Pesa payments and confirmation status.
    """
    
    STATUS_CHOICES = [
        ('PENDING', 'Pending Confirmation'),
        ('CONFIRMED', 'Confirmed'),
        ('FAILED', 'Failed'),
        ('REVERSED', 'Reversed'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    member = models.ForeignKey(
        Member,
        on_delete=models.PROTECT,
        related_name='contributions'
    )
    amount = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        validators=[MinValueValidator(Decimal('0.01'))]
    )
    
    # M-Pesa tracking
    mpesa_transaction_id = models.CharField(
        max_length=50,
        unique=True,
        null=True,
        blank=True
    )
    mpesa_phone_number = models.CharField(max_length=15)
    
    # Status and timing
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default='PENDING'
    )
    contribution_date = models.DateTimeField(auto_now_add=True)
    confirmed_at = models.DateTimeField(null=True, blank=True)
    
    # Metadata
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'contributions'
        verbose_name = 'Contribution'
        verbose_name_plural = 'Contributions'
        ordering = ['-contribution_date']
        indexes = [
            models.Index(fields=['member', '-contribution_date']),
            models.Index(fields=['status']),
            models.Index(fields=['mpesa_transaction_id']),
        ]
        constraints = [
            models.CheckConstraint(
                check=models.Q(amount__gt=0),
                name='contribution_amount_positive'
            ),
        ]
    
    def __str__(self):
        return f"{self.member.user.get_full_name()} - KES {self.amount}"


# apps/chamas/admin.py
from django.contrib import admin
from .models import Chama, Member, Contribution


@admin.register(Chama)
class ChamaAdmin(admin.ModelAdmin):
    list_display = ['name', 'chair', 'balance', 'member_count', 'subscription_tier', 'is_active']
    list_filter = ['subscription_tier', 'is_active', 'contribution_frequency']
    search_fields = ['name', 'chair__email']
    readonly_fields = ['balance', 'idle_cash', 'created_at', 'updated_at']


@admin.register(Member)
class MemberAdmin(admin.ModelAdmin):
    list_display = ['user', 'chama', 'role', 'credit_score', 'total_contributed', 'is_active']
    list_filter = ['role', 'is_active', 'chama']
    search_fields = ['user__email', 'chama__name']
    readonly_fields = ['total_contributed', 'credit_score', 'created_at', 'updated_at']


@admin.register(Contribution)
class ContributionAdmin(admin.ModelAdmin):
    list_display = ['member', 'amount', 'status', 'contribution_date', 'mpesa_transaction_id']
    list_filter = ['status', 'contribution_date']
    search_fields = ['member__user__email', 'mpesa_transaction_id']
    readonly_fields = ['contribution_date', 'confirmed_at', 'created_at', 'updated_at']
```

### 3.3 Update Settings

```python
# config/settings/base.py

INSTALLED_APPS = [
    # ... existing apps ...
    'apps.chamas',
]
```

### 3.4 Create and Run Migrations

```bash
python manage.py makemigrations chamas
python manage.py migrate chamas
```

---

## 4. Model Relationships

**Relationships Summary:**

1. **User ↔ Chama (Many-to-Many through Member)**
   - One user can belong to multiple chamas
   - One chama has multiple users
   - `Member` junction table stores relationship data

2. **Chama ↔ Member (One-to-Many)**
   - One chama has many members
   - Each member belongs to one chama

3. **Member ↔ Contribution (One-to-Many)**
   - One member makes many contributions
   - Each contribution belongs to one member

---

## 5. Database Indexes and Constraints

### 5.1 Indexes Added

```python
# User model indexes
models.Index(fields=['email'])  # Fast email lookup
models.Index(fields=['phone_number'])  # Fast phone lookup
models.Index(fields=['-date_joined'])  # Sort by newest users

# Chama model indexes
models.Index(fields=['name'])  # Fast name search
models.Index(fields=['subscription_tier'])  # Filter by subscription
models.Index(fields=['-created_at'])  # Sort by newest chamas

# Member model indexes
models.Index(fields=['user', 'chama'])  # Fast relationship lookup
models.Index(fields=['chama', 'is_active'])  # Active members per chama
models.Index(fields=['-credit_score'])  # Sort by credit score

# Contribution model indexes
models.Index(fields=['member', '-contribution_date'])  # Member's contributions
models.Index(fields=['mpesa_transaction_id'])  # M-Pesa transaction lookup
```

### 5.2 Database Constraints

```python
# Chama constraints
models.CheckConstraint(
    check=models.Q(balance__gte=0),
    name='chama_balance_positive'  # Balance cannot be negative
)

# Member constraints
models.CheckConstraint(
    check=models.Q(contribution_share__gte=0) & models.Q(contribution_share__lte=1),
    name='member_share_valid_range'  # Share must be between 0 and 1
)

# Contribution constraints
models.CheckConstraint(
    check=models.Q(amount__gt=0),
    name='contribution_amount_positive'  # Amount must be positive
)
```

---

## 6. Django Signals

### 6.1 Create signals.py

```python
# apps/chamas/signals.py
from django.db.models.signals import post_save
from django.dispatch import receiver
from decimal import Decimal
from .models import Contribution, Member


@receiver(post_save, sender=Contribution)
def update_member_totals(sender, instance, created, **kwargs):
    """
    Update member's total_contributed when contribution is confirmed.
    Update chama balance.
    """
    if instance.status == 'CONFIRMED' and created:
        member = instance.member
        chama = member.chama
        
        # Update member's total contributed
        member.total_contributed += instance.amount
        member.save(update_fields=['total_contributed'])
        
        # Update chama balance
        chama.balance += instance.amount
        chama.save(update_fields=['balance'])
        
        # Recalculate contribution shares for all members
        total_contributed = sum(
            m.total_contributed for m in chama.members.filter(is_active=True)
        )
        if total_contributed > 0:
            for m in chama.members.filter(is_active=True):
                m.contribution_share = m.total_contributed / total_contributed
                m.save(update_fields=['contribution_share'])


# apps/chamas/apps.py
from django.apps import AppConfig


class ChamasConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'apps.chamas'
    verbose_name = 'Chamas'
    
    def ready(self):
        import apps.chamas.signals  # Register signals
```

---

## 7. Testing Models

### 7.1 Create test file

```python
# apps/chamas/tests/test_models.py
from django.test import TestCase
from django.contrib.auth import get_user_model
from decimal import Decimal
from apps.chamas.models import Chama, Member, Contribution

User = get_user_model()


class ChamaModelTest(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            email='test@example.com',
            password='testpass123',
            first_name='Test',
            last_name='User'
        )
    
    def test_create_chama(self):
        """Test creating a chama."""
        chama = Chama.objects.create(
            name='Test Chama',
            contribution_amount=Decimal('1000.00'),
            chair=self.user
        )
        self.assertEqual(chama.name, 'Test Chama')
        self.assertEqual(chama.balance, Decimal('0.00'))
    
    def test_chama_balance_cannot_be_negative(self):
        """Test that chama balance constraint works."""
        from django.db import IntegrityError
        
        chama = Chama.objects.create(
            name='Test Chama',
            contribution_amount=Decimal('1000.00'),
            chair=self.user,
            balance=Decimal('0.00')
        )
        
        with self.assertRaises(IntegrityError):
            chama.balance = Decimal('-100.00')
            chama.save()


class MemberModelTest(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            email='test@example.com',
            password='testpass123',
            first_name='Test',
            last_name='User'
        )
        self.chama = Chama.objects.create(
            name='Test Chama',
            contribution_amount=Decimal('1000.00'),
            chair=self.user
        )
    
    def test_create_member(self):
        """Test creating a member."""
        member = Member.objects.create(
            user=self.user,
            chama=self.chama,
            role='CHAIR'
        )
        self.assertEqual(member.user, self.user)
        self.assertEqual(member.chama, self.chama)
        self.assertEqual(member.credit_score, 50)


# Run tests
# python manage.py test apps.chamas
```

---

## 🎯 Next Steps

**Proceed to Guide 5:** [Advanced DRF Features](./05-advanced-drf.md)

In the next guide, you'll:
- Create API endpoints for models
- Implement JWT authentication
- Add permissions and throttling
- Build serializers and viewsets

---

<div align="center">

**Built with ❤️ by [Phinehas Macharia](https://github.com/MachariaP)**

[⬅️ Previous: Deployment](./03-deployment.md) | [Next: Advanced DRF ➡️](./05-advanced-drf.md)

</div>
