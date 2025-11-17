# 📦 Guide 1: Initial Setup and Project Cloning

> **Duration:** 30-45 minutes  
> **Prerequisites:** Basic command line knowledge, Git installed  
> **Outcome:** Fully configured local development environment ready for coding

---

## 🎯 What You'll Learn

- How to clone and set up the ProDev-Backend repository
- Install and configure Python, PostgreSQL, and Redis
- Understand the project structure
- Set up virtual environments and dependencies
- Configure environment variables for local development

---

## 📋 Table of Contents

1. [System Requirements](#1-system-requirements)
2. [Installing Prerequisites](#2-installing-prerequisites)
3. [Cloning the Repository](#3-cloning-the-repository)
4. [Setting Up Python Virtual Environment](#4-setting-up-python-virtual-environment)
5. [Installing Dependencies](#5-installing-dependencies)
6. [Database Configuration](#6-database-configuration)
7. [Redis Configuration](#7-redis-configuration)
8. [Environment Variables Setup](#8-environment-variables-setup)
9. [Verifying Installation](#9-verifying-installation)
10. [Common Issues and Solutions](#10-common-issues-and-solutions)

---

## 1. System Requirements

### Minimum Hardware
- **RAM:** 4GB minimum (8GB recommended)
- **Storage:** 10GB free space
- **Processor:** Dual-core processor or better

### Operating Systems Supported
- **Ubuntu/Debian:** 20.04+ (Recommended)
- **macOS:** 11.0+ (Big Sur or later)
- **Windows:** 10/11 with WSL2

---

## 2. Installing Prerequisites

### 2.1 Install Python 3.12

#### Ubuntu/Debian
```bash
# Add deadsnakes PPA for latest Python versions
sudo apt update
sudo apt install software-properties-common
sudo add-apt-repository ppa:deadsnakes/ppa
sudo apt update

# Install Python 3.12
sudo apt install python3.12 python3.12-venv python3.12-dev

# Verify installation
python3.12 --version  # Should show: Python 3.12.x
```

#### macOS
```bash
# Using Homebrew
brew update
brew install python@3.12

# Verify installation
python3.12 --version
```

#### Windows (WSL2)
```bash
# First, install WSL2 and Ubuntu from Microsoft Store
# Then follow Ubuntu/Debian instructions above
```

### 2.2 Install PostgreSQL 16

#### Ubuntu/Debian
```bash
# Add PostgreSQL official repository
sudo sh -c 'echo "deb http://apt.postgresql.org/pub/repos/apt $(lsb_release -cs)-pgdg main" > /etc/apt/sources.list.d/pgdg.list'
wget -qO- https://www.postgresql.org/media/keys/ACCC4CF8.asc | sudo tee /etc/apt/trusted.gpg.d/pgdg.asc &>/dev/null

# Install PostgreSQL
sudo apt update
sudo apt install postgresql-16 postgresql-contrib-16

# Start PostgreSQL service
sudo systemctl start postgresql
sudo systemctl enable postgresql

# Verify installation
psql --version  # Should show: psql (PostgreSQL) 16.x
```

#### macOS
```bash
# Using Homebrew
brew install postgresql@16

# Start PostgreSQL service
brew services start postgresql@16

# Verify installation
psql --version
```

### 2.3 Install Redis

#### Ubuntu/Debian
```bash
# Install Redis
sudo apt install redis-server

# Start Redis service
sudo systemctl start redis-server
sudo systemctl enable redis-server

# Verify installation
redis-cli ping  # Should return: PONG
```

#### macOS
```bash
# Using Homebrew
brew install redis

# Start Redis service
brew services start redis

# Verify installation
redis-cli ping
```

### 2.4 Install Git

#### Ubuntu/Debian
```bash
sudo apt install git
git --version
```

#### macOS
```bash
# Git comes pre-installed, but you can update via Homebrew
brew install git
git --version
```

### 2.5 Install Additional Tools

```bash
# Ubuntu/Debian
sudo apt install build-essential libpq-dev curl

# macOS (most come with Xcode Command Line Tools)
xcode-select --install
```

---

## 3. Cloning the Repository

### 3.1 Clone via HTTPS

```bash
# Navigate to your projects directory
cd ~/projects  # or wherever you keep your code

# Clone the repository
git clone https://github.com/MachariaP/ProDev-Backend.git

# Navigate into the project
cd ProDev-Backend

# Verify you're on the correct branch
git branch  # Should show: * main or * develop
```

### 3.2 Clone via SSH (Recommended for Contributors)

```bash
# First, set up SSH key with GitHub (if you haven't)
ssh-keygen -t ed25519 -C "your_email@example.com"
cat ~/.ssh/id_ed25519.pub  # Copy this and add to GitHub SSH keys

# Clone using SSH
git clone git@github.com:MachariaP/ProDev-Backend.git
cd ProDev-Backend
```

### 3.3 Explore Project Structure

```bash
# List all files and directories
ls -la

# View project tree (install tree if not available)
tree -L 2 -I '__pycache__|*.pyc'
```

**Expected Structure:**
```
ProDev-Backend/
├── README.md
├── my_chama/
│   └── README.md
├── docs/              # Guide files
├── .gitignore
└── .git/
```

---

## 4. Setting Up Python Virtual Environment

### 4.1 Create Virtual Environment

```bash
# Make sure you're in the project root
cd /path/to/ProDev-Backend

# Create virtual environment using Python 3.12
python3.12 -m venv venv

# Verify venv was created
ls -la venv/
```

### 4.2 Activate Virtual Environment

#### Linux/macOS
```bash
source venv/bin/activate

# Your prompt should now show: (venv) user@machine:~/ProDev-Backend$
```

#### Windows (WSL2)
```bash
source venv/bin/activate
```

### 4.3 Upgrade pip and setuptools

```bash
# Always upgrade pip first
pip install --upgrade pip setuptools wheel

# Verify pip version
pip --version  # Should show: pip 24.x or higher
```

---

## 5. Installing Dependencies

### 5.1 Create requirements.txt

Since the project is starting fresh, create the initial `requirements.txt`:

```bash
# Create requirements file with essential packages
cat > requirements.txt << 'EOF'
# Core Django
Django==5.1.3
djangorestframework==3.14.0
django-cors-headers==4.3.1

# Database
psycopg2-binary==2.9.9
dj-database-url==2.1.0

# Authentication
djangorestframework-simplejwt==5.3.1

# Environment variables
python-decouple==3.8

# Task Queue
celery==5.3.4
redis==5.0.1

# Caching
django-redis==5.4.0

# Real-time
channels==4.0.0
channels-redis==4.1.0

# API Documentation
drf-spectacular==0.27.0

# Testing
pytest==7.4.3
pytest-django==4.7.0
pytest-cov==4.1.0

# Code Quality
black==23.12.1
flake8==6.1.0
isort==5.13.2

# Security
django-auditlog==2.3.0
bandit==1.7.6

# Development
django-debug-toolbar==4.2.0
ipython==8.19.0
EOF
```

### 5.2 Install All Dependencies

```bash
# Install all packages (this may take 3-5 minutes)
pip install -r requirements.txt

# Verify key packages
python -c "import django; print(f'Django: {django.__version__}')"
python -c "import rest_framework; print('DRF: Installed')"
python -c "import celery; print('Celery: Installed')"
```

---

## 6. Database Configuration

### 6.1 Create PostgreSQL User and Database

```bash
# Switch to postgres user
sudo -u postgres psql

# Inside PostgreSQL shell, run:
```

```sql
-- Create database user
CREATE USER chamahub_user WITH PASSWORD 'chamahub_dev_password_2024';

-- Create database
CREATE DATABASE chamahub_dev OWNER chamahub_user;

-- Grant privileges
GRANT ALL PRIVILEGES ON DATABASE chamahub_dev TO chamahub_user;

-- Enable required extensions
\c chamahub_dev
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Exit PostgreSQL
\q
```

### 6.2 Test Database Connection

```bash
# Test connection
psql -U chamahub_user -d chamahub_dev -h localhost -W

# If successful, you'll see:
# chamahub_dev=>

# Type \q to exit
```

### 6.3 Configure Database for Django

The database URL will be:
```
postgresql://chamahub_user:chamahub_dev_password_2024@localhost:5432/chamahub_dev
```

---

## 7. Redis Configuration

### 7.1 Test Redis Connection

```bash
# Connect to Redis
redis-cli

# Inside Redis shell, test:
127.0.0.1:6379> PING
# Should return: PONG

127.0.0.1:6379> SET test_key "Hello Redis"
# Should return: OK

127.0.0.1:6379> GET test_key
# Should return: "Hello Redis"

127.0.0.1:6379> DEL test_key
127.0.0.1:6379> quit
```

### 7.2 Redis URL for Django

Default Redis URL:
```
redis://localhost:6379/0
```

---

## 8. Environment Variables Setup

### 8.1 Create .env File

```bash
# Create .env file in project root
cat > .env << 'EOF'
# Django Settings
SECRET_KEY='django-insecure-dev-key-change-in-production-x7h8j9k0'
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1

# Database
DATABASE_URL=postgresql://chamahub_user:chamahub_dev_password_2024@localhost:5432/chamahub_dev

# Redis
REDIS_URL=redis://localhost:6379/0
CELERY_BROKER_URL=redis://localhost:6379/0

# Channels (WebSocket)
CHANNEL_LAYERS_HOST=redis://localhost:6379/1

# JWT Settings
JWT_ACCESS_TOKEN_LIFETIME=15  # minutes
JWT_REFRESH_TOKEN_LIFETIME=10080  # 7 days in minutes

# M-Pesa (Sandbox credentials for now)
MPESA_ENVIRONMENT=sandbox
MPESA_CONSUMER_KEY=your_consumer_key_here
MPESA_CONSUMER_SECRET=your_consumer_secret_here
MPESA_SHORTCODE=174379
MPESA_PASSKEY=your_passkey_here

# Email (Development)
EMAIL_BACKEND=django.core.mail.backends.console.EmailBackend

# CORS (Development)
CORS_ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5173

# Security (Development only)
CSRF_TRUSTED_ORIGINS=http://localhost:3000,http://localhost:5173
EOF
```

### 8.2 Add .env to .gitignore

```bash
# Create or update .gitignore
cat >> .gitignore << 'EOF'
# Environment variables
.env
.env.local
.env.*.local

# Python
__pycache__/
*.py[cod]
*$py.class
*.so
.Python
venv/
env/
ENV/

# Django
*.log
db.sqlite3
db.sqlite3-journal
media/
staticfiles/

# IDE
.vscode/
.idea/
*.swp
*.swo

# OS
.DS_Store
Thumbs.db

# Testing
.coverage
htmlcov/
.pytest_cache/

# Celery
celerybeat-schedule
celerybeat.pid
EOF
```

---

## 9. Verifying Installation

### 9.1 Create Verification Script

```bash
# Create a test script
cat > verify_setup.py << 'EOF'
#!/usr/bin/env python3.12
"""Setup verification script for ProDev-Backend"""
import sys

def check_python_package(package_name):
    """Check if a Python package is installed"""
    try:
        __import__(package_name)
        print(f"✅ {package_name}: Installed")
        return True
    except ImportError:
        print(f"❌ {package_name}: Not installed")
        return False

def main():
    print("🔍 Verifying ProDev-Backend Setup...\n")
    
    all_ok = True
    
    # Check Python packages
    print("🐍 Python Packages:")
    all_ok &= check_python_package("django")
    all_ok &= check_python_package("rest_framework")
    all_ok &= check_python_package("celery")
    all_ok &= check_python_package("redis")
    all_ok &= check_python_package("psycopg2")
    
    print("\n" + "="*50)
    if all_ok:
        print("✅ All checks passed! You're ready to proceed.")
    else:
        print("❌ Some checks failed. Please review and fix.")
        sys.exit(1)

if __name__ == "__main__":
    main()
EOF

# Make it executable
chmod +x verify_setup.py

# Run verification
python verify_setup.py
```

---

## 10. Common Issues and Solutions

### Issue 1: PostgreSQL Connection Failed

**Solution:**
```bash
# Check if PostgreSQL is running
sudo systemctl status postgresql

# If not running, start it
sudo systemctl start postgresql
```

### Issue 2: pip Install Fails

**Solution:**
```bash
# Install PostgreSQL development headers
sudo apt install libpq-dev python3.12-dev build-essential

# Then retry pip install
pip install -r requirements.txt
```

---

## 🎯 Next Steps

**Proceed to Guide 2:** [Building Your First Simple Endpoint](./02-first-endpoint.md)

---

<div align="center">

**Built with ❤️ by [Phinehas Macharia](https://github.com/MachariaP)**

[⬅️ Back to Main README](../README.md) | [Next Guide: First Endpoint ➡️](./02-first-endpoint.md)

</div>
