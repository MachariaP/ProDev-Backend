# 🚀 Guide 3: Deployment Guide (Railway & DigitalOcean)

> **Duration:** 60-90 minutes  
> **Prerequisites:** Completed Guide 1 & 2, GitHub account  
> **Outcome:** Production-ready deployment with CI/CD pipeline

---

## 🎯 What You'll Learn

- Prepare Django app for production deployment
- Deploy to Railway (PaaS - easiest option)
- Alternative deployment to DigitalOcean (more control)
- Configure environment variables for production
- Set up GitHub Actions CI/CD
- Monitor and debug production issues

---

## 📋 Table of Contents

1. [Pre-Deployment Checklist](#1-pre-deployment-checklist)
2. [Configure Production Settings](#2-configure-production-settings)
3. [Deploy to Railway](#3-deploy-to-railway)
4. [Alternative: Deploy to DigitalOcean](#4-alternative-deploy-to-digitalocean)
5. [Setup GitHub Actions CI/CD](#5-setup-github-actions-cicd)
6. [Post-Deployment Verification](#6-post-deployment-verification)
7. [Troubleshooting](#7-troubleshooting)

---

## 1. Pre-Deployment Checklist

### 1.1 Create Production Dependencies

```bash
# Create Procfile for Railway/Heroku
cat > Procfile << 'EOF'
web: gunicorn config.wsgi:application --bind 0.0.0.0:$PORT
worker: celery -A config worker --loglevel=info
beat: celery -A config beat --loglevel=info
EOF

# Add gunicorn to requirements.txt
echo "gunicorn==21.2.0" >> requirements.txt
pip install gunicorn
```

### 1.2 Create runtime.txt

```bash
# Specify Python version
cat > runtime.txt << 'EOF'
python-3.12.0
EOF
```

### 1.3 Update requirements.txt

```bash
# Add production-specific packages
cat >> requirements.txt << 'EOF'
# Production server
gunicorn==21.2.0
whitenoise==6.6.0

# Monitoring
sentry-sdk==1.39.2

# Production database adapter
psycopg2-binary==2.9.9
EOF

pip install -r requirements.txt
```

### 1.4 Configure WhiteNoise for Static Files

```python
# Update config/settings/production.py

# Add to MIDDLEWARE (after SecurityMiddleware)
MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'whitenoise.middleware.WhiteNoiseMiddleware',  # Add this line
    # ... rest of middleware
]

# Static files configuration
STATICFILES_STORAGE = 'whitenoise.storage.CompressedManifestStaticFilesStorage'
STATIC_ROOT = BASE_DIR / 'staticfiles'
STATIC_URL = '/static/'

# WhiteNoise configuration
WHITENOISE_AUTOREFRESH = False
WHITENOISE_USE_FINDERS = False
```

### 1.5 Collect Static Files

```bash
# Test static file collection locally
python manage.py collectstatic --noinput

# Should see: X static files copied to 'staticfiles'
```

---

## 2. Configure Production Settings

### 2.1 Update .env.example

```bash
# Create .env.example for documentation
cat > .env.example << 'EOF'
# Environment
ENVIRONMENT=production

# Django
SECRET_KEY=your-secret-key-here
DEBUG=False
ALLOWED_HOSTS=yourdomain.com,www.yourdomain.com

# Database
DATABASE_URL=postgresql://user:password@host:5432/database

# Redis
REDIS_URL=redis://host:6379/0
CELERY_BROKER_URL=redis://host:6379/0

# Channels
CHANNEL_LAYERS_HOST=redis://host:6379/1

# JWT
JWT_ACCESS_TOKEN_LIFETIME=15
JWT_REFRESH_TOKEN_LIFETIME=10080

# M-Pesa
MPESA_ENVIRONMENT=production
MPESA_CONSUMER_KEY=your_key
MPESA_CONSUMER_SECRET=your_secret
MPESA_SHORTCODE=your_shortcode
MPESA_PASSKEY=your_passkey

# Email
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_HOST_USER=your_email@gmail.com
EMAIL_HOST_PASSWORD=your_app_password

# CORS
CORS_ALLOWED_ORIGINS=https://yourdomain.com,https://www.yourdomain.com

# Sentry (optional)
SENTRY_DSN=your_sentry_dsn_here
EOF
```

### 2.2 Add Sentry for Error Tracking

```python
# Update config/settings/production.py

import sentry_sdk
from sentry_sdk.integrations.django import DjangoIntegration
from decouple import config

# Sentry Configuration
SENTRY_DSN = config('SENTRY_DSN', default='')
if SENTRY_DSN:
    sentry_sdk.init(
        dsn=SENTRY_DSN,
        integrations=[DjangoIntegration()],
        traces_sample_rate=1.0,
        send_default_pii=True,
        environment='production',
    )
```

---

## 3. Deploy to Railway

Railway is the easiest deployment option with automatic SSL, GitHub integration, and managed PostgreSQL.

### 3.1 Sign Up for Railway

1. Go to [railway.app](https://railway.app)
2. Click "Start a New Project"
3. Sign in with GitHub

### 3.2 Create New Project

```bash
# Install Railway CLI (optional but recommended)
npm install -g @railway/cli

# Login
railway login

# Initialize project
railway init
```

### 3.3 Add PostgreSQL Database

1. In Railway dashboard, click "New"
2. Select "Database" → "PostgreSQL"
3. Railway will automatically create the database
4. Copy the `DATABASE_URL` from the database settings

### 3.4 Add Redis

1. Click "New" again
2. Select "Database" → "Redis"
3. Copy the `REDIS_URL`

### 3.5 Deploy Your App

1. Click "New" → "GitHub Repo"
2. Select your `ProDev-Backend` repository
3. Railway will auto-detect Django and start building

### 3.6 Configure Environment Variables

In Railway dashboard, go to your service → Variables:

```bash
ENVIRONMENT=production
SECRET_KEY=your-generated-secret-key-here
DEBUG=False
ALLOWED_HOSTS=your-app-name.railway.app
DATABASE_URL=${{Postgres.DATABASE_URL}}  # Railway auto-links this
REDIS_URL=${{Redis.REDIS_URL}}  # Railway auto-links this
CELERY_BROKER_URL=${{Redis.REDIS_URL}}
CHANNEL_LAYERS_HOST=${{Redis.REDIS_URL}}

# Add other variables from .env.example
```

### 3.7 Run Migrations

In Railway dashboard:

1. Go to your service → Settings → "Deploy"
2. Add custom build command:
```bash
python manage.py migrate --noinput && python manage.py collectstatic --noinput
```

Or use Railway CLI:
```bash
railway run python manage.py migrate
railway run python manage.py createsuperuser
```

### 3.8 Set Custom Domain (Optional)

1. Go to Settings → Domains
2. Click "Generate Domain" for a free `.railway.app` domain
3. Or add your custom domain

---

## 4. Alternative: Deploy to DigitalOcean

DigitalOcean gives you more control but requires more setup.

### 4.1 Create Droplet

1. Sign up at [digitalocean.com](https://www.digitalocean.com)
2. Create a Droplet:
   - **Image:** Ubuntu 22.04 LTS
   - **Plan:** Basic ($6/month for 1GB RAM)
   - **Add SSH Key** (recommended)

### 4.2 Connect to Droplet

```bash
# SSH into your droplet
ssh root@your_droplet_ip

# Update system
apt update && apt upgrade -y
```

### 4.3 Install Dependencies

```bash
# Install Python 3.12
apt install software-properties-common
add-apt-repository ppa:deadsnakes/ppa
apt update
apt install python3.12 python3.12-venv python3.12-dev

# Install PostgreSQL
apt install postgresql postgresql-contrib

# Install Redis
apt install redis-server

# Install Nginx
apt install nginx

# Install Supervisor (for process management)
apt install supervisor

# Install other tools
apt install git curl build-essential libpq-dev
```

### 4.4 Create Database

```bash
sudo -u postgres psql

# Inside PostgreSQL:
CREATE USER chamahub WITH PASSWORD 'strong_password_here';
CREATE DATABASE chamahub_prod OWNER chamahub;
GRANT ALL PRIVILEGES ON DATABASE chamahub_prod TO chamahub;
\q
```

### 4.5 Clone and Setup Project

```bash
# Create app user
adduser --disabled-password chamahub
su - chamahub

# Clone repository
git clone https://github.com/MachariaP/ProDev-Backend.git
cd ProDev-Backend

# Create virtual environment
python3.12 -m venv venv
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Create .env file
nano .env
# (Add production environment variables)

# Run migrations
python manage.py migrate
python manage.py collectstatic --noinput
python manage.py createsuperuser
```

### 4.6 Configure Gunicorn

```bash
# Create systemd service file
sudo nano /etc/systemd/system/chamahub.service
```

```ini
[Unit]
Description=ChamaHub Gunicorn Service
After=network.target

[Service]
User=chamahub
Group=www-data
WorkingDirectory=/home/chamahub/ProDev-Backend
Environment="PATH=/home/chamahub/ProDev-Backend/venv/bin"
ExecStart=/home/chamahub/ProDev-Backend/venv/bin/gunicorn \
    --workers 3 \
    --bind unix:/home/chamahub/ProDev-Backend/gunicorn.sock \
    config.wsgi:application

[Install]
WantedBy=multi-user.target
```

```bash
# Start and enable service
sudo systemctl start chamahub
sudo systemctl enable chamahub
```

### 4.7 Configure Nginx

```bash
sudo nano /etc/nginx/sites-available/chamahub
```

```nginx
server {
    listen 80;
    server_name your_domain.com www.your_domain.com;

    location = /favicon.ico { access_log off; log_not_found off; }
    
    location /static/ {
        alias /home/chamahub/ProDev-Backend/staticfiles/;
    }

    location /media/ {
        alias /home/chamahub/ProDev-Backend/media/;
    }

    location / {
        include proxy_params;
        proxy_pass http://unix:/home/chamahub/ProDev-Backend/gunicorn.sock;
    }
}
```

```bash
# Enable site
sudo ln -s /etc/nginx/sites-available/chamahub /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### 4.8 Configure SSL with Let's Encrypt

```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx

# Get SSL certificate
sudo certbot --nginx -d your_domain.com -d www.your_domain.com

# Certbot will automatically configure Nginx for SSL
```

---

## 5. Setup GitHub Actions CI/CD

### 5.1 Create GitHub Workflow

```bash
mkdir -p .github/workflows
```

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
    
    - name: Install dependencies
      run: |
        python -m pip install --upgrade pip
        pip install -r requirements.txt
    
    - name: Run Black formatter check
      run: black --check .
    
    - name: Run flake8 linter
      run: flake8 . --max-line-length=100 --exclude=migrations,venv
    
    - name: Run tests
      env:
        DATABASE_URL: postgresql://postgres:postgres@localhost:5432/test_db
        REDIS_URL: redis://localhost:6379/0
        SECRET_KEY: test-secret-key-for-ci
      run: |
        python manage.py migrate
        pytest --cov=. --cov-report=xml
    
    - name: Upload coverage
      uses: codecov/codecov-action@v3

  deploy:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    
    steps:
    - name: Deploy to Railway
      run: |
        curl -X POST ${{ secrets.RAILWAY_WEBHOOK_URL }}
```

### 5.2 Add GitHub Secrets

Go to your GitHub repository → Settings → Secrets and variables → Actions:

Add:
- `RAILWAY_WEBHOOK_URL` (from Railway deployment settings)

---

## 6. Post-Deployment Verification

### 6.1 Check Health Endpoint

```bash
# Test your deployed API
curl https://your-app.railway.app/api/v1/health/

# Should return:
# {"status": "healthy", "timestamp": "...", "database": "connected", "cache": "connected"}
```

### 6.2 Access Admin Panel

Visit: `https://your-app.railway.app/admin/`

### 6.3 Check API Documentation

Visit: `https://your-app.railway.app/api/docs/`

---

## 7. Troubleshooting

### Issue 1: Static Files Not Loading

```bash
# Run collectstatic again
railway run python manage.py collectstatic --noinput

# Check STATIC_ROOT in settings
```

### Issue 2: Database Connection Error

```bash
# Verify DATABASE_URL format
echo $DATABASE_URL

# Should be: postgresql://user:password@host:5432/database
```

### Issue 3: 502 Bad Gateway

```bash
# Check Gunicorn logs
railway logs

# Or on DigitalOcean:
sudo journalctl -u chamahub -n 50
```

---

## 🎯 Next Steps

**Proceed to Guide 4:** [Core Django Models and Database Design](./04-models-database.md)

In the next guide, you'll:
- Design database schema
- Create Django models
- Implement relationships
- Add indexes and constraints

---

<div align="center">

**Built with ❤️ by [Phinehas Macharia](https://github.com/MachariaP)**

[⬅️ Previous: First Endpoint](./02-first-endpoint.md) | [Next: Models & Database ➡️](./04-models-database.md)

</div>
