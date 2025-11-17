# 📧 Guide 8: Email Integration - Sending Emails from Your Django App

> **Duration:** 60-90 minutes  
> **Prerequisites:** Completed Guide 1 and Guide 2  
> **Outcome:** Fully functional email system with beautiful templates and verification flows

---

## 🎯 What You'll Learn

- How email works in web applications (explained simply)
- Configure Django's email backend for development and production
- Send emails using Django's email utilities
- Create beautiful HTML email templates
- Integrate with SendGrid and Mailgun (professional email services)
- Build email verification flows for user registration
- Implement password reset via email
- Best practices for email deliverability and security

---

## 📋 Table of Contents

1. [How Email Works in Web Apps](#1-how-email-works-in-web-apps)
2. [Django Email Basics](#2-django-email-basics)
3. [Development Setup (Console Backend)](#3-development-setup-console-backend)
4. [Creating Email Templates](#4-creating-email-templates)
5. [SendGrid Integration](#5-sendgrid-integration)
6. [Mailgun Integration](#6-mailgun-integration)
7. [Email Verification Flow](#7-email-verification-flow)
8. [Password Reset Flow](#8-password-reset-flow)
9. [Testing Emails](#9-testing-emails)
10. [Best Practices](#10-best-practices)

---

## 1. How Email Works in Web Apps

### 🤔 The Simple Explanation

Think of sending emails from your app like sending physical mail:

**Traditional Mail** 📬:
1. You write a letter
2. Put it in an envelope with an address
3. Drop it in a mailbox
4. The post office picks it up
5. They sort and deliver it

**Email from Web Apps** 📧:
1. Your app creates an email message (the letter)
2. Adds recipient, subject, body (the envelope and content)
3. Sends it to an SMTP server (the post office)
4. The SMTP server routes it to the recipient's email provider
5. The recipient receives it in their inbox

### 🏢 What is SMTP?

**SMTP** = Simple Mail Transfer Protocol (fancy name for "how to send email")

- It's like the **postal service for the internet**
- Your Django app can't send emails directly (no built-in mailman)
- You need an SMTP server (like Gmail, SendGrid, Mailgun)
- They handle delivery, spam filtering, and all the complicated stuff

### 🎭 Two Modes of Email

#### Development Mode 🛠️
- Emails are "sent" but just printed to your console/terminal
- No actual emails delivered (safe for testing)
- Free and instant
- **Use when**: Building features, testing locally

#### Production Mode 🚀
- Emails actually sent to real inboxes
- Uses a real SMTP service (costs money usually)
- Needs proper configuration
- **Use when**: App is live, users need real emails

---

## 2. Django Email Basics

### 📦 Built-in Email Utilities

Django makes sending emails easy with built-in functions:

```python
# Simple email sending
from django.core.mail import send_mail

send_mail(
    subject='Welcome to ChamaHub!',
    message='Thanks for joining our platform.',
    from_email='noreply@chamahub.co.ke',
    recipient_list=['user@example.com'],
    fail_silently=False,  # Raise errors if sending fails
)
```

**That's it!** 🎉 This code sends an email. Django handles all the SMTP complexity.

### 🔧 Email Configuration Settings

All email settings go in your Django settings file:

```python
# config/settings/base.py

# Email backend (how Django sends emails)
EMAIL_BACKEND = 'django.core.mail.backends.console.EmailBackend'  # For development

# Email server settings
EMAIL_HOST = 'smtp.gmail.com'  # SMTP server address
EMAIL_PORT = 587  # Usually 587 for TLS or 465 for SSL
EMAIL_USE_TLS = True  # Encrypt the connection (important for security)
EMAIL_HOST_USER = 'your-email@gmail.com'  # Your email account
EMAIL_HOST_PASSWORD = 'your-app-password'  # NOT your regular password!

# Default sender info
DEFAULT_FROM_EMAIL = 'ChamaHub <noreply@chamahub.co.ke>'
SERVER_EMAIL = 'admin@chamahub.co.ke'  # For error emails
```

### 🛡️ Security Note About Passwords

**NEVER** put real passwords directly in settings files!

❌ **Wrong**:
```python
EMAIL_HOST_PASSWORD = 'mySecretPassword123'  # Don't do this!
```

✅ **Correct**:
```python
from decouple import config

EMAIL_HOST_PASSWORD = config('EMAIL_HOST_PASSWORD')  # Read from environment
```

Then in your `.env` file:
```bash
EMAIL_HOST_PASSWORD=mySecretPassword123
```

---

## 3. Development Setup (Console Backend)

### 🎮 Let's Send Our First Email!

#### Step 1: Configure Console Backend

For development, we'll use the **console backend** (emails printed to terminal instead of sent):

```python
# config/settings/development.py

EMAIL_BACKEND = 'django.core.mail.backends.console.EmailBackend'
```

Why console backend?
- ✅ Free (no email service needed)
- ✅ Instant (no waiting for delivery)
- ✅ Safe (won't accidentally email real users)
- ✅ Easy debugging (see exactly what was "sent")

#### Step 2: Send a Test Email

Create a management command to test email sending:

```python
# apps/users/management/commands/test_email.py
from django.core.management.base import BaseCommand
from django.core.mail import send_mail

class Command(BaseCommand):
    help = 'Send a test email'

    def handle(self, *args, **options):
        send_mail(
            subject='🎉 Test Email from ChamaHub',
            message='If you see this, email setup works!',
            from_email='noreply@chamahub.co.ke',
            recipient_list=['test@example.com'],
        )
        self.stdout.write(self.style.SUCCESS('✅ Email sent successfully!'))
```

#### Step 3: Run the Command

```bash
python manage.py test_email
```

**You should see** this in your terminal:
```
Content-Type: text/plain; charset="utf-8"
MIME-Version: 1.0
Content-Transfer-Encoding: 7bit
Subject: 🎉 Test Email from ChamaHub
From: noreply@chamahub.co.ke
To: test@example.com
Date: Sun, 17 Nov 2024 10:30:00 +0300

If you see this, email setup works!

✅ Email sent successfully!
```

**Congratulations! 🎊** You just sent your first Django email (to the console).

---

## 4. Creating Email Templates

Plain text emails are boring. Let's make beautiful HTML emails!

### 📝 Email Template Structure

Create this folder structure:
```
apps/users/
├── templates/
│   └── emails/
│       ├── base.html          # Base template with styling
│       ├── welcome.html       # Welcome email
│       ├── verify_email.html  # Email verification
│       └── password_reset.html # Password reset
```

### 🎨 Base Email Template

```html
<!-- apps/users/templates/emails/base.html -->
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{% block title %}ChamaHub{% endblock %}</title>
    <style>
        /* Email-safe CSS (inline styles work better) */
        body {
            font-family: Arial, sans-serif;
            background-color: #f4f4f4;
            margin: 0;
            padding: 0;
        }
        .email-container {
            max-width: 600px;
            margin: 20px auto;
            background-color: #ffffff;
            border-radius: 8px;
            overflow: hidden;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        .email-header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: #ffffff;
            padding: 30px;
            text-align: center;
        }
        .email-body {
            padding: 30px;
            color: #333333;
            line-height: 1.6;
        }
        .email-footer {
            background-color: #f9f9f9;
            padding: 20px;
            text-align: center;
            font-size: 12px;
            color: #666666;
        }
        .button {
            display: inline-block;
            padding: 12px 30px;
            background-color: #667eea;
            color: #ffffff;
            text-decoration: none;
            border-radius: 5px;
            margin: 20px 0;
        }
        .button:hover {
            background-color: #764ba2;
        }
    </style>
</head>
<body>
    <div class="email-container">
        <div class="email-header">
            <h1>🏦 ChamaHub</h1>
            <p>{% block header_text %}Smart Chama Management{% endblock %}</p>
        </div>
        <div class="email-body">
            {% block content %}{% endblock %}
        </div>
        <div class="email-footer">
            <p>© 2024 ChamaHub. All rights reserved.</p>
            <p>
                <a href="https://chamahub.co.ke">Website</a> |
                <a href="https://chamahub.co.ke/help">Help Center</a> |
                <a href="https://chamahub.co.ke/unsubscribe">Unsubscribe</a>
            </p>
        </div>
    </div>
</body>
</html>
```

### 🎉 Welcome Email Template

```html
<!-- apps/users/templates/emails/welcome.html -->
{% extends "emails/base.html" %}

{% block title %}Welcome to ChamaHub!{% endblock %}

{% block header_text %}Welcome to Your Chama Journey!{% endblock %}

{% block content %}
    <h2>Hello {{ user.first_name }}! 👋</h2>
    
    <p>
        Welcome to <strong>ChamaHub</strong> – the smart way to manage your savings group!
    </p>
    
    <p>
        We're excited to have you on board. Here's what you can do with ChamaHub:
    </p>
    
    <ul>
        <li>💰 Track contributions automatically with M-Pesa integration</li>
        <li>📊 View real-time financial reports and balances</li>
        <li>🤝 Manage loans and welfare payouts seamlessly</li>
        <li>🚀 Grow your wealth with our automated investment engine</li>
    </ul>
    
    <p>
        <a href="{{ dashboard_url }}" class="button">Go to Your Dashboard</a>
    </p>
    
    <p>
        If you have any questions, our support team is here to help!
    </p>
    
    <p>
        Best regards,<br>
        The ChamaHub Team 🎉
    </p>
{% endblock %}
```

### 📧 Sending HTML Emails

```python
# apps/users/utils.py
from django.core.mail import EmailMultiAlternatives
from django.template.loader import render_to_string
from django.utils.html import strip_tags

def send_welcome_email(user):
    """
    Send a welcome email to newly registered users.
    
    Args:
        user: User instance who just registered
    """
    # Render the HTML template
    html_content = render_to_string('emails/welcome.html', {
        'user': user,
        'dashboard_url': 'https://chamahub.co.ke/dashboard',
    })
    
    # Create plain text version (fallback for email clients that don't support HTML)
    text_content = strip_tags(html_content)
    
    # Create the email
    email = EmailMultiAlternatives(
        subject='🎉 Welcome to ChamaHub!',
        body=text_content,  # Plain text version
        from_email='ChamaHub <noreply@chamahub.co.ke>',
        to=[user.email],
    )
    
    # Attach the HTML version
    email.attach_alternative(html_content, "text/html")
    
    # Send it!
    email.send()
```

**💡 Why Both HTML and Plain Text?**
- Some email clients only show plain text
- Spam filters like plain text versions
- Accessibility (screen readers work better with plain text)

---

## 5. SendGrid Integration

**SendGrid** is a professional email service that ensures your emails actually get delivered (not marked as spam).

### 🌟 Why Use SendGrid?

| Feature | Gmail SMTP | SendGrid |
|---------|-----------|----------|
| **Free Tier** | ❌ Very limited | ✅ 100 emails/day free |
| **Deliverability** | ⚠️ Often marked spam | ✅ Excellent delivery rates |
| **Analytics** | ❌ None | ✅ Open rates, click tracking |
| **API** | ❌ SMTP only | ✅ REST API available |
| **Scalability** | ❌ Limited | ✅ Millions of emails |
| **Templates** | ❌ Manual | ✅ Built-in template editor |

### 📝 Step-by-Step SendGrid Setup

#### Step 1: Create SendGrid Account

1. Go to [SendGrid.com](https://sendgrid.com)
2. Sign up for free account
3. Verify your email address

#### Step 2: Create API Key

1. Go to Settings → API Keys
2. Click "Create API Key"
3. Name it "Django ChamaHub"
4. Choose "Full Access" (for simplicity) or "Mail Send" (more secure)
5. Copy the API key (you'll only see it once!)

```
SG.xxxxxxxxxxxxxxxxxx.yyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyy
```

#### Step 3: Add API Key to Environment

```bash
# .env file
SENDGRID_API_KEY=SG.xxxxxxxxxxxxxxxxxx.yyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyy
```

#### Step 4: Install SendGrid Package

```bash
pip install sendgrid
```

#### Step 5: Configure Django Settings

```python
# config/settings/production.py
from decouple import config

# SendGrid Email Backend
EMAIL_BACKEND = 'sendgrid_backend.SendgridBackend'
SENDGRID_API_KEY = config('SENDGRID_API_KEY')

# OR use Django's SMTP backend with SendGrid SMTP
EMAIL_BACKEND = 'django.core.mail.backends.smtp.EmailBackend'
EMAIL_HOST = 'smtp.sendgrid.net'
EMAIL_PORT = 587
EMAIL_USE_TLS = True
EMAIL_HOST_USER = 'apikey'  # Literally the string "apikey"
EMAIL_HOST_PASSWORD = config('SENDGRID_API_KEY')

DEFAULT_FROM_EMAIL = 'noreply@chamahub.co.ke'
```

#### Step 6: Verify Sender Identity

SendGrid requires you to verify your sender email/domain:

**Option A: Single Sender Verification** (Quick & Easy)
1. Go to Settings → Sender Authentication
2. Click "Verify a Single Sender"
3. Enter your email (e.g., noreply@chamahub.co.ke)
4. Check your inbox and click verification link

**Option B: Domain Authentication** (Professional)
1. Go to Settings → Sender Authentication
2. Click "Authenticate Your Domain"
3. Add the provided DNS records to your domain registrar
4. Wait for verification (can take up to 48 hours)

#### Step 7: Test SendGrid

```python
# Test sending via SendGrid
from django.core.mail import send_mail

send_mail(
    subject='Test Email via SendGrid',
    message='This email was sent using SendGrid!',
    from_email='noreply@chamahub.co.ke',
    recipient_list=['your-email@example.com'],
)
```

Check your inbox! 📬 You should receive a real email.

### 📊 SendGrid Dashboard Features

After sending emails, check your SendGrid dashboard:

- **Activity Feed**: See all sent emails in real-time
- **Stats**: Open rates, click rates, bounces, spam reports
- **Suppressions**: Emails that bounced or unsubscribed
- **Templates**: Create and manage email templates visually

---

## 6. Mailgun Integration

**Mailgun** is another excellent email service, preferred by many developers.

### 🌟 Why Use Mailgun?

| Feature | SendGrid | Mailgun |
|---------|----------|---------|
| **Free Tier** | 100/day | 5,000/month (first 3 months) |
| **Pricing** | Pay-as-you-go | Volume discounts |
| **API** | ✅ Excellent | ✅ Excellent |
| **Simplicity** | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| **Developer Experience** | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ |

### 📝 Step-by-Step Mailgun Setup

#### Step 1: Create Mailgun Account

1. Go to [Mailgun.com](https://mailgun.com)
2. Sign up for free account
3. Verify your email

#### Step 2: Get API Credentials

1. Go to Settings → API Keys
2. Copy your **Private API key**
3. Note your **Domain** (e.g., `sandbox123.mailgun.org` for testing)

#### Step 3: Install Mailgun Package

```bash
pip install django-anymail[mailgun]
```

#### Step 4: Configure Django Settings

```python
# config/settings/production.py
from decouple import config

# Anymail (unified email backend for multiple providers)
EMAIL_BACKEND = 'anymail.backends.mailgun.EmailBackend'

ANYMAIL = {
    'MAILGUN_API_KEY': config('MAILGUN_API_KEY'),
    'MAILGUN_SENDER_DOMAIN': config('MAILGUN_DOMAIN', default='sandbox123.mailgun.org'),
}

DEFAULT_FROM_EMAIL = 'ChamaHub <noreply@chamahub.co.ke>'
```

#### Step 5: Add to Environment

```bash
# .env file
MAILGUN_API_KEY=your-private-api-key-here
MAILGUN_DOMAIN=sandbox123.mailgun.org  # Or your custom domain
```

#### Step 6: Test Mailgun

```python
from django.core.mail import send_mail

send_mail(
    subject='Test Email via Mailgun',
    message='This email was sent using Mailgun!',
    from_email='noreply@chamahub.co.ke',
    recipient_list=['your-email@example.com'],
)
```

### 🎯 Custom Domain Setup (Production)

For production, use your own domain instead of sandbox:

1. **Add Your Domain** in Mailgun dashboard
2. **Add DNS Records** (they'll provide MX, TXT, CNAME records)
3. **Verify** domain ownership
4. **Update** `MAILGUN_DOMAIN` to your domain

---

## 7. Email Verification Flow

Let's build a complete email verification system!

### 🎯 How It Works

1. User registers → Email sent with verification link
2. User clicks link → Email verified
3. Account activated ✅

### 📝 Implementation

#### Step 1: Add Email Verification Fields to User Model

```python
# apps/users/models.py
import uuid
from django.utils import timezone
from datetime import timedelta

class User(AbstractBaseUser, PermissionsMixin):
    # ... existing fields ...
    
    email_verified = models.BooleanField(default=False)
    email_verification_token = models.UUIDField(default=uuid.uuid4, editable=False)
    email_verification_sent_at = models.DateTimeField(null=True, blank=True)
    
    def generate_verification_token(self):
        """Generate a new verification token."""
        self.email_verification_token = uuid.uuid4()
        self.email_verification_sent_at = timezone.now()
        self.save()
        return self.email_verification_token
    
    def is_verification_token_valid(self):
        """Check if verification token is still valid (24 hours)."""
        if not self.email_verification_sent_at:
            return False
        expiry = self.email_verification_sent_at + timedelta(hours=24)
        return timezone.now() < expiry
```

#### Step 2: Create Verification Email Template

```html
<!-- apps/users/templates/emails/verify_email.html -->
{% extends "emails/base.html" %}

{% block title %}Verify Your Email{% endblock %}

{% block header_text %}Email Verification Required{% endblock %}

{% block content %}
    <h2>Hi {{ user.first_name }}! 👋</h2>
    
    <p>
        Thanks for signing up with ChamaHub! To get started, please verify your email address.
    </p>
    
    <p>
        <a href="{{ verification_url }}" class="button">Verify Email Address</a>
    </p>
    
    <p style="color: #666; font-size: 14px;">
        Or copy and paste this link in your browser:<br>
        <code>{{ verification_url }}</code>
    </p>
    
    <p style="color: #999; font-size: 12px;">
        This link expires in 24 hours. If you didn't create an account, please ignore this email.
    </p>
{% endblock %}
```

#### Step 3: Send Verification Email Function

```python
# apps/users/utils.py
from django.core.mail import EmailMultiAlternatives
from django.template.loader import render_to_string
from django.utils.html import strip_tags
from django.urls import reverse

def send_verification_email(user, request=None):
    """
    Send email verification link to user.
    
    Args:
        user: User instance
        request: HTTP request object (to build absolute URL)
    """
    # Generate new verification token
    token = user.generate_verification_token()
    
    # Build verification URL
    if request:
        verification_url = request.build_absolute_uri(
            reverse('users:verify-email', kwargs={'token': token})
        )
    else:
        verification_url = f'https://chamahub.co.ke/verify-email/{token}/'
    
    # Render HTML email
    html_content = render_to_string('emails/verify_email.html', {
        'user': user,
        'verification_url': verification_url,
    })
    
    # Plain text version
    text_content = strip_tags(html_content)
    
    # Send email
    email = EmailMultiAlternatives(
        subject='🔐 Verify Your ChamaHub Email',
        body=text_content,
        from_email='ChamaHub <noreply@chamahub.co.ke>',
        to=[user.email],
    )
    email.attach_alternative(html_content, "text/html")
    email.send()
```

#### Step 4: Verification View

```python
# apps/users/views.py
from django.shortcuts import get_object_or_404, redirect
from django.contrib import messages
from django.views import View
from .models import User

class VerifyEmailView(View):
    """Handle email verification when user clicks link."""
    
    def get(self, request, token):
        # Find user with this token
        user = get_object_or_404(User, email_verification_token=token)
        
        # Check if token is still valid
        if not user.is_verification_token_valid():
            messages.error(request, '❌ Verification link has expired. Request a new one.')
            return redirect('users:resend-verification')
        
        # Verify the email
        user.email_verified = True
        user.save()
        
        messages.success(request, '✅ Email verified successfully! You can now log in.')
        return redirect('users:login')
```

#### Step 5: URL Configuration

```python
# apps/users/urls.py
from django.urls import path
from .views import VerifyEmailView

app_name = 'users'

urlpatterns = [
    path('verify-email/<uuid:token>/', VerifyEmailView.as_view(), name='verify-email'),
]
```

#### Step 6: Send Email on Registration

```python
# apps/users/serializers.py or views.py
from .utils import send_verification_email

class UserRegistrationSerializer(serializers.ModelSerializer):
    # ... existing code ...
    
    def create(self, validated_data):
        validated_data.pop('password_confirm')
        user = User.objects.create_user(**validated_data)
        
        # Send verification email
        send_verification_email(user, request=self.context.get('request'))
        
        return user
```

---

## 8. Password Reset Flow

Let's implement password reset via email!

### 📝 Implementation

#### Step 1: Password Reset Email Template

```html
<!-- apps/users/templates/emails/password_reset.html -->
{% extends "emails/base.html" %}

{% block title %}Reset Your Password{% endblock %}

{% block header_text %}Password Reset Request{% endblock %}

{% block content %}
    <h2>Hi {{ user.first_name }}! 👋</h2>
    
    <p>
        We received a request to reset your password for your ChamaHub account.
    </p>
    
    <p>
        <a href="{{ reset_url }}" class="button">Reset Password</a>
    </p>
    
    <p style="color: #666; font-size: 14px;">
        Or copy and paste this link in your browser:<br>
        <code>{{ reset_url }}</code>
    </p>
    
    <p style="color: #d9534f; font-size: 14px;">
        ⚠️ <strong>Important:</strong> This link expires in 1 hour.
    </p>
    
    <p style="color: #999; font-size: 12px;">
        If you didn't request a password reset, please ignore this email or contact support if you have concerns.
    </p>
{% endblock %}
```

#### Step 2: Django Built-in Password Reset

Django provides built-in password reset views! We just need to configure them:

```python
# config/urls.py
from django.contrib.auth import views as auth_views
from django.urls import path

urlpatterns = [
    # Password reset URLs
    path('password-reset/', 
         auth_views.PasswordResetView.as_view(
             template_name='users/password_reset.html',
             email_template_name='emails/password_reset.html',
             subject_template_name='emails/password_reset_subject.txt',
         ), 
         name='password_reset'),
    
    path('password-reset/done/', 
         auth_views.PasswordResetDoneView.as_view(
             template_name='users/password_reset_done.html'
         ), 
         name='password_reset_done'),
    
    path('password-reset-confirm/<uidb64>/<token>/', 
         auth_views.PasswordResetConfirmView.as_view(
             template_name='users/password_reset_confirm.html'
         ), 
         name='password_reset_confirm'),
    
    path('password-reset-complete/', 
         auth_views.PasswordResetCompleteView.as_view(
             template_name='users/password_reset_complete.html'
         ), 
         name='password_reset_complete'),
]
```

**That's it!** Django handles:
- Token generation
- Email sending
- Token validation
- Password update

You just need to create the templates! 🎉

---

## 9. Testing Emails

### 🧪 Unit Tests for Email Sending

```python
# apps/users/tests/test_emails.py
from django.test import TestCase
from django.core import mail
from apps.users.models import User
from apps.users.utils import send_welcome_email, send_verification_email

class EmailTest(TestCase):
    """Test email sending functionality."""
    
    def setUp(self):
        """Create a test user."""
        self.user = User.objects.create_user(
            email='test@example.com',
            password='testpass123',
            first_name='John',
            last_name='Doe',
        )
    
    def test_welcome_email_sent(self):
        """Test that welcome email is sent to new users."""
        # Send email
        send_welcome_email(self.user)
        
        # Check that one email was sent
        self.assertEqual(len(mail.outbox), 1)
        
        # Check email details
        email = mail.outbox[0]
        self.assertEqual(email.subject, '🎉 Welcome to ChamaHub!')
        self.assertIn('test@example.com', email.to)
        self.assertIn('John', email.body)  # User's first name in body
    
    def test_verification_email_content(self):
        """Test verification email contains correct information."""
        send_verification_email(self.user)
        
        email = mail.outbox[0]
        self.assertEqual(email.subject, '🔐 Verify Your ChamaHub Email')
        self.assertIn(str(self.user.email_verification_token), email.body)
    
    def test_verification_token_generated(self):
        """Test that verification token is generated when email is sent."""
        old_token = self.user.email_verification_token
        send_verification_email(self.user)
        self.user.refresh_from_db()
        
        # Token should be different (newly generated)
        self.assertNotEqual(old_token, self.user.email_verification_token)
        self.assertIsNotNone(self.user.email_verification_sent_at)
```

### 🏃 Run Tests

```bash
python manage.py test apps.users.tests.test_emails
```

---

## 10. Best Practices

### ✅ Email Deliverability

**How to ensure your emails don't end up in spam:**

1. **Authenticate Your Domain** (SPF, DKIM, DMARC)
   - Set up in SendGrid/Mailgun dashboard
   - Proves emails are really from you

2. **Use Professional From Addresses**
   - ✅ `noreply@chamahub.co.ke`
   - ❌ `johndoe123@gmail.com`

3. **Avoid Spam Triggers**
   - Don't use ALL CAPS in subject lines
   - Avoid excessive punctuation (!!!)
   - Don't use spam words (FREE, WIN, CLICK NOW)

4. **Include Unsubscribe Link**
   - Required by law in many countries
   - Improves deliverability

### 🔒 Security Best Practices

1. **Rate Limit Email Sending**
   ```python
   # Prevent email bombing attacks
   from django.core.cache import cache
   
   def send_rate_limited_email(user_email, email_type):
       cache_key = f'email_sent_{user_email}_{email_type}'
       if cache.get(cache_key):
           raise Exception('Email already sent recently. Wait 1 minute.')
       
       # Send email...
       
       # Set cache for 1 minute
       cache.set(cache_key, True, 60)
   ```

2. **Expire Tokens**
   - Verification links: 24 hours
   - Password reset: 1 hour
   - Don't make them permanent!

3. **Use HTTPS for Links**
   - ✅ `https://chamahub.co.ke/verify/...`
   - ❌ `http://chamahub.co.ke/verify/...`

### 📊 Monitoring & Analytics

Track important email metrics:

```python
# Send email with tracking (if using SendGrid/Mailgun)
from anymail.message import AnymailMessage

msg = AnymailMessage(
    subject='Welcome!',
    body='...',
    to=['user@example.com'],
    track_clicks=True,  # Track link clicks
    track_opens=True,   # Track when email is opened
)
msg.send()
```

Monitor:
- **Delivery rate**: % of emails successfully delivered
- **Open rate**: % of emails opened
- **Click rate**: % of links clicked
- **Bounce rate**: % of emails that failed to deliver
- **Spam complaints**: Users marking as spam

### 🎯 Template Best Practices

1. **Mobile-Responsive**
   - 50%+ of emails opened on mobile
   - Use max-width: 600px for email containers
   - Test on multiple devices

2. **Fallback Fonts**
   ```css
   font-family: Arial, Helvetica, sans-serif;
   ```

3. **Inline CSS**
   - Some email clients strip `<style>` tags
   - Use tools like [Premailer](https://premailer.dialect.ca/) to inline CSS

4. **Plain Text Alternative**
   - Always include plain text version
   - Some users prefer it or have HTML disabled

---

## 🎓 Learning Checkpoint

Test your understanding! Answer these questions:

1. **What is SMTP and why do we need it?**
   <details>
   <summary>Click for answer</summary>
   SMTP (Simple Mail Transfer Protocol) is the protocol for sending emails. Django can't send emails directly to recipients—it needs an SMTP server (like SendGrid or Mailgun) to handle the actual delivery, spam filtering, and routing.
   </details>

2. **What's the difference between console and SMTP email backends?**
   <details>
   <summary>Click for answer</summary>
   Console backend prints emails to your terminal (for development/testing). SMTP backend actually sends emails to real inboxes via an SMTP server (for production).
   </details>

3. **Why do we need both HTML and plain text versions of emails?**
   <details>
   <summary>Click for answer</summary>
   Some email clients don't support HTML. Plain text also improves deliverability (spam filters like it) and accessibility (screen readers work better with plain text).
   </details>

4. **How long should email verification tokens be valid?**
   <details>
   <summary>Click for answer</summary>
   24 hours is standard for email verification. Password reset tokens should expire sooner (1 hour) for security.
   </details>

---

## 🐛 Troubleshooting

### ❌ Problem: Emails not appearing in console

**Solution**:
```python
# Check your EMAIL_BACKEND setting
EMAIL_BACKEND = 'django.core.mail.backends.console.EmailBackend'

# Make sure you're looking at the correct terminal (where Django is running)
```

### ❌ Problem: "SMTPAuthenticationError: Username and Password not accepted"

**Solutions**:
1. Using Gmail? Enable "Less secure app access" or use App Password
2. Check that `EMAIL_HOST_USER` and `EMAIL_HOST_PASSWORD` are correct
3. For SendGrid/Mailgun, make sure you're using API key, not regular password

### ❌ Problem: Emails go to spam

**Solutions**:
1. Set up SPF, DKIM, DMARC records (in SendGrid/Mailgun dashboard)
2. Verify your sending domain
3. Avoid spam trigger words in subject/body
4. Include unsubscribe link
5. Warm up your IP address (start with small volumes, increase gradually)

### ❌ Problem: "Connection refused" error

**Solution**:
```python
# Check these settings:
EMAIL_HOST = 'smtp.sendgrid.net'  # Correct SMTP server?
EMAIL_PORT = 587  # Correct port? (587 for TLS, 465 for SSL)
EMAIL_USE_TLS = True  # Should be True for port 587
```

---

## 🚀 Next Steps

Congratulations! You now know how to:
- ✅ Configure Django email backends
- ✅ Send emails in development and production
- ✅ Create beautiful HTML email templates
- ✅ Integrate with SendGrid and Mailgun
- ✅ Build email verification flows
- ✅ Implement password reset
- ✅ Test email functionality
- ✅ Follow email best practices

### What's Next?

1. **[Guide 9: PostgreSQL Deep Dive →](./09-postgresql-deep-dive.md)**
   - Learn database optimization
   - Understand indexes and performance
   - Master advanced PostgreSQL features

2. **[Guide 10: Authentication Explained →](./10-authentication-explained.md)**
   - Deep dive into JWT authentication
   - Understand security best practices
   - Learn about OAuth and social login

3. **Practice Projects**:
   - Add email notifications for chama events
   - Build monthly report emails
   - Create email digest system

---

<div align="center">

**Need Help?** Open an [issue](https://github.com/MachariaP/ProDev-Backend/issues) or check our [discussions](https://github.com/MachariaP/ProDev-Backend/discussions).

**Found this helpful?** ⭐ Star the repository and share with others!

[⬅️ Back to Guide Index](./README.md) | [➡️ Next: PostgreSQL Deep Dive](./09-postgresql-deep-dive.md)

</div>
