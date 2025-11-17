# ⚡ Guide 6: Production Features (Celery, Redis, Testing, CI/CD)

> **Duration:** 120-180 minutes  
> **Prerequisites:** Completed Guide 1-5  
> **Outcome:** Production-ready application with background tasks, real-time features, comprehensive tests, and CI/CD

---

## 🎯 What You'll Learn

- Configure Celery for background tasks
- Implement periodic tasks with Celery Beat
- Add Django Channels for real-time WebSockets
- Write comprehensive tests (unit, integration, e2e)
- Set up GitHub Actions CI/CD pipeline
- Implement caching with Redis
- Add monitoring and logging

---

## 📋 Table of Contents

1. [Celery Setup for Background Tasks](#1-celery-setup-for-background-tasks)
2. [Periodic Tasks with Celery Beat](#2-periodic-tasks-with-celery-beat)
3. [Django Channels for Real-Time Features](#3-django-channels-for-real-time-features)
4. [Redis Caching](#4-redis-caching)
5. [Comprehensive Testing](#5-comprehensive-testing)
6. [GitHub Actions CI/CD](#6-github-actions-cicd)
7. [Monitoring and Logging](#7-monitoring-and-logging)
8. [Production Deployment Checklist](#8-production-deployment-checklist)

---

## 1. Celery Setup for Background Tasks

### 1.1 Configure Celery

```python
# config/celery.py
import os
from celery import Celery
from celery.schedules import crontab

# Set default Django settings module
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')

app = Celery('chamahub')

# Load config from Django settings with CELERY_ prefix
app.config_from_object('django.conf:settings', namespace='CELERY')

# Auto-discover tasks in all installed apps
app.autodiscover_tasks()

# Celery Beat schedule for periodic tasks
app.conf.beat_schedule = {
    'scan-idle-cash-weekly': {
        'task': 'apps.chamas.tasks.scan_idle_cash',
        'schedule': crontab(hour=6, minute=0, day_of_week='monday'),
    },
    'calculate-credit-scores-monthly': {
        'task': 'apps.chamas.tasks.calculate_all_credit_scores',
        'schedule': crontab(hour=0, minute=0, day_of_month='1'),
    },
}


@app.task(bind=True)
def debug_task(self):
    """Debug task for testing Celery."""
    print(f'Request: {self.request!r}')


# config/__init__.py
from .celery import app as celery_app

__all__ = ('celery_app',)
```

### 1.2 Update Settings

```python
# config/settings/base.py

from decouple import config

# Celery Configuration
CELERY_BROKER_URL = config('CELERY_BROKER_URL', default='redis://localhost:6379/0')
CELERY_RESULT_BACKEND = config('CELERY_BROKER_URL', default='redis://localhost:6379/0')
CELERY_ACCEPT_CONTENT = ['json']
CELERY_TASK_SERIALIZER = 'json'
CELERY_RESULT_SERIALIZER = 'json'
CELERY_TIMEZONE = 'Africa/Nairobi'
CELERY_TASK_TRACK_STARTED = True
CELERY_TASK_TIME_LIMIT = 30 * 60  # 30 minutes
CELERY_RESULT_EXPIRES = 3600  # 1 hour
```

### 1.3 Create Celery Tasks

```python
# apps/chamas/tasks.py
from celery import shared_task
from django.utils import timezone
from django.db import transaction
from decimal import Decimal
from datetime import timedelta
from .models import Chama, Member, Contribution
import logging

logger = logging.getLogger(__name__)


@shared_task(name='apps.chamas.tasks.scan_idle_cash')
def scan_idle_cash():
    """
    Weekly task to identify idle cash in chamas.
    Runs every Monday at 6:00 AM.
    """
    logger.info("Starting idle cash scan...")
    
    threshold_date = timezone.now() - timedelta(days=30)
    chamas_updated = 0
    
    for chama in Chama.objects.filter(is_active=True):
        # Find contributions older than 30 days
        old_contributions = Contribution.objects.filter(
            member__chama=chama,
            status='CONFIRMED',
            contribution_date__lt=threshold_date
        )
        
        idle_amount = sum(c.amount for c in old_contributions)
        
        if idle_amount != chama.idle_cash:
            chama.idle_cash = idle_amount
            chama.save(update_fields=['idle_cash'])
            chamas_updated += 1
            
            logger.info(f"Updated idle cash for {chama.name}: KES {idle_amount}")
    
    logger.info(f"Idle cash scan completed. Updated {chamas_updated} chamas.")
    return f"Updated {chamas_updated} chamas"


@shared_task(name='apps.chamas.tasks.calculate_all_credit_scores')
def calculate_all_credit_scores():
    """
    Monthly task to recalculate credit scores for all members.
    Runs on the 1st of every month.
    """
    logger.info("Starting credit score calculation...")
    
    members_updated = 0
    
    for member in Member.objects.filter(is_active=True):
        old_score = member.credit_score
        new_score = calculate_member_credit_score(member)
        
        if new_score != old_score:
            member.credit_score = new_score
            member.save(update_fields=['credit_score'])
            members_updated += 1
            
            logger.info(
                f"Updated credit score for {member.user.get_full_name()}: "
                f"{old_score} -> {new_score}"
            )
    
    logger.info(f"Credit score calculation completed. Updated {members_updated} members.")
    return f"Updated {members_updated} members"


def calculate_member_credit_score(member):
    """
    Calculate member credit score (0-100).
    
    Algorithm:
    - 40% contribution regularity
    - 30% loan repayment history (placeholder)
    - 20% meeting attendance (placeholder)
    - 10% tenure
    """
    # Factor 1: Contribution regularity (40 points)
    expected_contributions = 12  # Assume monthly for a year
    actual_contributions = Contribution.objects.filter(
        member=member,
        status='CONFIRMED'
    ).count()
    regularity_score = min(40, (actual_contributions / expected_contributions) * 40)
    
    # Factor 2: Loan repayment (30 points) - placeholder
    repayment_score = 30  # Default full score for now
    
    # Factor 3: Meeting attendance (20 points) - placeholder
    attendance_score = 20  # Default full score for now
    
    # Factor 4: Tenure (10 points)
    days_active = (timezone.now().date() - member.joined_date).days
    tenure_score = min(10, (days_active / 365) * 10)
    
    total_score = round(regularity_score + repayment_score + attendance_score + tenure_score)
    
    return min(100, max(0, total_score))


@shared_task(name='apps.chamas.tasks.process_contribution')
@transaction.atomic
def process_contribution(contribution_id):
    """
    Process a contribution after M-Pesa confirmation.
    Updates member totals and chama balance.
    """
    try:
        contribution = Contribution.objects.select_for_update().get(id=contribution_id)
        
        if contribution.status != 'PENDING':
            logger.warning(f"Contribution {contribution_id} already processed")
            return f"Already processed: {contribution.status}"
        
        # Mark as confirmed
        contribution.status = 'CONFIRMED'
        contribution.confirmed_at = timezone.now()
        contribution.save()
        
        # Update member total
        member = contribution.member
        member.total_contributed += contribution.amount
        member.save(update_fields=['total_contributed'])
        
        # Update chama balance
        chama = member.chama
        chama.balance += contribution.amount
        chama.save(update_fields=['balance'])
        
        # Recalculate contribution shares
        recalculate_contribution_shares(chama.id)
        
        logger.info(f"Processed contribution {contribution_id}: KES {contribution.amount}")
        return f"Processed: KES {contribution.amount}"
        
    except Contribution.DoesNotExist:
        logger.error(f"Contribution {contribution_id} not found")
        return "Error: Contribution not found"


@shared_task(name='apps.chamas.tasks.recalculate_contribution_shares')
def recalculate_contribution_shares(chama_id):
    """
    Recalculate contribution shares for all members in a chama.
    """
    try:
        chama = Chama.objects.get(id=chama_id)
        members = chama.members.filter(is_active=True)
        
        total_contributed = sum(m.total_contributed for m in members)
        
        if total_contributed > 0:
            for member in members:
                member.contribution_share = member.total_contributed / total_contributed
                member.save(update_fields=['contribution_share'])
        
        logger.info(f"Recalculated shares for {chama.name}")
        return f"Recalculated {members.count()} members"
        
    except Chama.DoesNotExist:
        logger.error(f"Chama {chama_id} not found")
        return "Error: Chama not found"
```

### 1.4 Run Celery Worker and Beat

```bash
# Terminal 1: Start Celery worker
celery -A config worker --loglevel=info

# Terminal 2: Start Celery Beat (scheduler)
celery -A config beat --loglevel=info

# Terminal 3: Django development server
python manage.py runserver
```

---

## 2. Periodic Tasks with Celery Beat

Periodic tasks are already configured in `config/celery.py`. They will run automatically when Celery Beat is running.

### 2.1 Monitor Celery Tasks

```bash
# View Celery Flower (web-based monitoring tool)
pip install flower
echo "flower==2.0.1" >> requirements.txt

# Start Flower
celery -A config flower

# Access at: http://localhost:5555
```

---

## 3. Django Channels for Real-Time Features

### 3.1 Configure Channels

```python
# config/settings/base.py

INSTALLED_APPS = [
    'daphne',  # Must be before django.contrib.staticfiles
    # ... other apps ...
]

# ASGI Application
ASGI_APPLICATION = 'config.asgi.application'

# Channel Layers
CHANNEL_LAYERS = {
    'default': {
        'BACKEND': 'channels_redis.core.RedisChannelLayer',
        'CONFIG': {
            "hosts": [config('CHANNEL_LAYERS_HOST', default='redis://localhost:6379/1')],
        },
    },
}


# config/asgi.py
import os
from django.core.asgi import get_asgi_application
from channels.routing import ProtocolTypeRouter, URLRouter
from channels.auth import AuthMiddlewareStack
from channels.security.websocket import AllowedHostsOriginValidator

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')

django_asgi_app = get_asgi_application()

from apps.core import routing

application = ProtocolTypeRouter({
    "http": django_asgi_app,
    "websocket": AllowedHostsOriginValidator(
        AuthMiddlewareStack(
            URLRouter(
                routing.websocket_urlpatterns
            )
        )
    ),
})
```

### 3.2 Create WebSocket Consumer

```python
# apps/core/consumers.py
import json
from channels.generic.websocket import AsyncWebsocketConsumer


class ContributionConsumer(AsyncWebsocketConsumer):
    """
    WebSocket consumer for real-time contribution updates.
    Broadcasts when a contribution is confirmed.
    """
    
    async def connect(self):
        """Accept WebSocket connection."""
        self.chama_id = self.scope['url_route']['kwargs']['chama_id']
        self.room_group_name = f'contributions_{self.chama_id}'
        
        # Join room group
        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )
        
        await self.accept()
    
    async def disconnect(self, close_code):
        """Leave room group."""
        await self.channel_layer.group_discard(
            self.room_group_name,
            self.channel_name
        )
    
    async def receive(self, text_data):
        """Receive message from WebSocket."""
        # Not used for broadcast-only consumer
        pass
    
    async def contribution_update(self, event):
        """
        Receive message from room group.
        Send message to WebSocket.
        """
        await self.send(text_data=json.dumps({
            'type': 'contribution_update',
            'contribution': event['contribution']
        }))


# apps/core/routing.py
from django.urls import re_path
from . import consumers

websocket_urlpatterns = [
    re_path(r'ws/contributions/(?P<chama_id>[^/]+)/$', consumers.ContributionConsumer.as_asgi()),
]
```

### 3.3 Broadcast from Signals

```python
# apps/chamas/signals.py
from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync

# ... existing imports ...

@receiver(post_save, sender=Contribution)
def broadcast_contribution(sender, instance, created, **kwargs):
    """
    Broadcast contribution update via WebSocket.
    """
    if instance.status == 'CONFIRMED':
        channel_layer = get_channel_layer()
        
        async_to_sync(channel_layer.group_send)(
            f'contributions_{instance.member.chama.id}',
            {
                'type': 'contribution_update',
                'contribution': {
                    'id': str(instance.id),
                    'member_name': instance.member.user.get_full_name(),
                    'amount': str(instance.amount),
                    'date': instance.contribution_date.isoformat()
                }
            }
        )
```

---

## 4. Redis Caching

### 4.1 Configure Redis Cache

```python
# config/settings/base.py

CACHES = {
    'default': {
        'BACKEND': 'django_redis.cache.RedisCache',
        'LOCATION': config('REDIS_URL', default='redis://localhost:6379/0'),
        'OPTIONS': {
            'CLIENT_CLASS': 'django_redis.client.DefaultClient',
        },
        'KEY_PREFIX': 'chamahub',
        'TIMEOUT': 300,  # 5 minutes default
    }
}
```

### 4.2 Use Cache in Views

```python
# apps/chamas/views.py
from django.views.decorators.cache import cache_page
from django.utils.decorators import method_decorator

class ChamaViewSet(viewsets.ModelViewSet):
    # ... existing code ...
    
    @method_decorator(cache_page(60 * 15))  # Cache for 15 minutes
    @action(detail=True, methods=['get'])
    def statistics(self, request, pk=None):
        """
        GET /api/v1/chamas/{id}/statistics/
        Get chama statistics (cached).
        """
        chama = self.get_object()
        
        stats = {
            'total_members': chama.members.filter(is_active=True).count(),
            'total_contributions': Contribution.objects.filter(
                member__chama=chama,
                status='CONFIRMED'
            ).count(),
            'total_balance': str(chama.balance),
            'idle_cash': str(chama.idle_cash),
        }
        
        return Response(stats)
```

---

## 5. Comprehensive Testing

### 5.1 Configure pytest

```python
# pytest.ini
[pytest]
DJANGO_SETTINGS_MODULE = config.settings
python_files = tests.py test_*.py *_tests.py
addopts = --cov=apps --cov-report=html --cov-report=term-missing --reuse-db
```

### 5.2 Create Fixtures

```python
# apps/chamas/tests/conftest.py
import pytest
from django.contrib.auth import get_user_model
from decimal import Decimal
from apps.chamas.models import Chama, Member

User = get_user_model()


@pytest.fixture
def user(db):
    """Create a test user."""
    return User.objects.create_user(
        email='test@example.com',
        password='testpass123',
        first_name='Test',
        last_name='User',
        phone_number='+254712345678'
    )


@pytest.fixture
def chama(db, user):
    """Create a test chama."""
    return Chama.objects.create(
        name='Test Chama',
        contribution_amount=Decimal('1000.00'),
        chair=user
    )


@pytest.fixture
def member(db, user, chama):
    """Create a test member."""
    return Member.objects.create(
        user=user,
        chama=chama,
        role='CHAIR'
    )
```

### 5.3 Write Unit Tests

```python
# apps/chamas/tests/test_models.py
import pytest
from decimal import Decimal
from apps.chamas.models import Chama, Member, Contribution


@pytest.mark.django_db
class TestChamaModel:
    """Test Chama model."""
    
    def test_create_chama(self, user):
        """Test creating a chama."""
        chama = Chama.objects.create(
            name='Test Chama',
            contribution_amount=Decimal('1000.00'),
            chair=user
        )
        assert chama.name == 'Test Chama'
        assert chama.balance == Decimal('0.00')
    
    def test_chama_member_count(self, chama, member):
        """Test member_count property."""
        assert chama.member_count == 1


@pytest.mark.django_db
class TestMemberModel:
    """Test Member model."""
    
    def test_create_member(self, user, chama):
        """Test creating a member."""
        member = Member.objects.create(
            user=user,
            chama=chama,
            role='MEMBER'
        )
        assert member.credit_score == 50
        assert member.total_contributed == Decimal('0.00')
```

### 5.4 Write API Tests

```python
# apps/chamas/tests/test_api.py
import pytest
from rest_framework.test import APIClient
from django.urls import reverse


@pytest.mark.django_db
class TestChamaAPI:
    """Test Chama API endpoints."""
    
    @pytest.fixture
    def api_client(self):
        """Create API client."""
        return APIClient()
    
    @pytest.fixture
    def authenticated_client(self, api_client, user):
        """Create authenticated API client."""
        api_client.force_authenticate(user=user)
        return api_client
    
    def test_create_chama(self, authenticated_client):
        """Test creating a chama via API."""
        url = reverse('chama-list')
        data = {
            'name': 'New Chama',
            'contribution_amount': '1000.00',
            'contribution_frequency': 'MONTHLY',
            'max_members': 50
        }
        
        response = authenticated_client.post(url, data)
        assert response.status_code == 201
        assert response.data['name'] == 'New Chama'
    
    def test_list_chamas_unauthenticated(self, api_client):
        """Test that unauthenticated users cannot list chamas."""
        url = reverse('chama-list')
        response = api_client.get(url)
        assert response.status_code == 401
```

### 5.5 Run Tests

```bash
# Run all tests
pytest

# Run with coverage
pytest --cov=apps --cov-report=html

# Run specific test file
pytest apps/chamas/tests/test_models.py

# Run specific test
pytest apps/chamas/tests/test_models.py::TestChamaModel::test_create_chama
```

---

## 6. GitHub Actions CI/CD

### 6.1 Create Workflow File

```yaml
# .github/workflows/django-ci.yml
name: Django CI/CD

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main ]

jobs:
  test:
    runs-on: ubuntu-latest
    
    services:
      postgres:
        image: postgres:16
        env:
          POSTGRES_USER: postgres
          POSTGRES_PASSWORD: postgres
          POSTGRES_DB: test_db
        ports:
          - 5432:5432
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
      
      redis:
        image: redis:7-alpine
        ports:
          - 6379:6379
        options: >-
          --health-cmd "redis-cli ping"
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Set up Python 3.12
      uses: actions/setup-python@v4
      with:
        python-version: '3.12'
        cache: 'pip'
    
    - name: Install dependencies
      run: |
        python -m pip install --upgrade pip
        pip install -r requirements.txt
    
    - name: Run Black formatter check
      run: black --check . --exclude="migrations|venv"
    
    - name: Run flake8 linter
      run: flake8 . --max-line-length=100 --exclude=migrations,venv
    
    - name: Run Bandit security scan
      run: bandit -r apps -ll
    
    - name: Run tests with coverage
      env:
        DATABASE_URL: postgresql://postgres:postgres@localhost:5432/test_db
        REDIS_URL: redis://localhost:6379/0
        SECRET_KEY: test-secret-key-for-ci
        DEBUG: False
      run: |
        python manage.py migrate
        pytest --cov=apps --cov-report=xml --cov-report=term
    
    - name: Upload coverage to Codecov
      uses: codecov/codecov-action@v3
      with:
        file: ./coverage.xml
        fail_ci_if_error: false

  deploy:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main' && github.event_name == 'push'
    
    steps:
    - name: Deploy to Railway
      run: |
        curl -X POST ${{ secrets.RAILWAY_WEBHOOK_URL }}
    
    - name: Notify deployment
      if: success()
      run: echo "Deployment successful!"
```

---

## 7. Monitoring and Logging

### 7.1 Configure Logging

```python
# config/settings/production.py

LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'formatters': {
        'verbose': {
            'format': '{levelname} {asctime} {module} {message}',
            'style': '{',
        },
    },
    'handlers': {
        'console': {
            'class': 'logging.StreamHandler',
            'formatter': 'verbose',
        },
        'file': {
            'class': 'logging.handlers.RotatingFileHandler',
            'filename': 'logs/django.log',
            'maxBytes': 1024 * 1024 * 10,  # 10 MB
            'backupCount': 10,
            'formatter': 'verbose',
        },
    },
    'root': {
        'handlers': ['console', 'file'],
        'level': 'INFO',
    },
    'loggers': {
        'django': {
            'handlers': ['console', 'file'],
            'level': 'INFO',
            'propagate': False,
        },
        'apps': {
            'handlers': ['console', 'file'],
            'level': 'INFO',
            'propagate': False,
        },
    },
}
```

---

## 8. Production Deployment Checklist

### 8.1 Pre-Deployment

- [ ] All tests passing
- [ ] Code linted with Black and flake8
- [ ] Security scan passed (Bandit)
- [ ] Environment variables configured
- [ ] Database migrations tested
- [ ] Static files collected
- [ ] Redis connection tested
- [ ] Celery workers configured

### 8.2 Deployment

- [ ] Deploy to Railway/DigitalOcean
- [ ] Run migrations on production database
- [ ] Verify health check endpoint
- [ ] Test authentication flow
- [ ] Test WebSocket connections
- [ ] Verify Celery tasks are running

### 8.3 Post-Deployment

- [ ] Monitor error logs
- [ ] Check Sentry for errors
- [ ] Verify API documentation
- [ ] Test critical user flows
- [ ] Monitor performance metrics

---

## 🎉 Congratulations!

You've completed all 6 guides and built a production-ready Django REST Framework application!

**What you've accomplished:**
- ✅ Set up a complete development environment
- ✅ Built a Django REST API with authentication
- ✅ Deployed to production
- ✅ Created normalized database models
- ✅ Implemented JWT authentication and permissions
- ✅ Added background tasks with Celery
- ✅ Implemented real-time features with WebSockets
- ✅ Written comprehensive tests
- ✅ Set up CI/CD pipeline

---

<div align="center">

**Built with ❤️ by [Phinehas Macharia](https://github.com/MachariaP)**

[⬅️ Previous: Advanced DRF](./05-advanced-drf.md) | [Next: Full-Stack Mastery →](./07-django-typescript-fullstack-mastery.md) | [Back to Main README](../README.md)

</div>
