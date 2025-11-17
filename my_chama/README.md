# 🏦 ChamaHub – Kenya's Smart Chama Management & Wealth Engine

> 💰 **The only chama platform in Africa that automatically turns idle cash into real, proportional profit**

[![Django](https://img.shields.io/badge/Django-5.1+-092E20?style=for-the-badge&logo=django&logoColor=white)](https://www.djangoproject.com/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-316192?style=for-the-badge&logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![Python](https://img.shields.io/badge/Python-3.12-3776AB?style=for-the-badge&logo=python&logoColor=white)](https://www.python.org/)
[![Redis](https://img.shields.io/badge/Redis-Cache-DC382D?style=for-the-badge&logo=redis&logoColor=white)](https://redis.io/)
[![M-Pesa](https://img.shields.io/badge/M--Pesa-Integrated-00A86B?style=for-the-badge)](https://developer.safaricom.co.ke/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](https://opensource.org/licenses/MIT)

---

## 📜 Table of Contents

1. [Project Overview](#1-project-overview)
2. [Team Roles and Responsibilities](#2-team-roles-and-responsibilities)
3. [Technology Stack Overview](#3-technology-stack-overview)
4. [Database Design Overview](#4-database-design-overview)
5. [Feature Breakdown](#5-feature-breakdown)
6. [API Security Overview](#6-api-security-overview)
7. [CI/CD Pipeline Overview](#7-cicd-pipeline-overview)
8. [Resources](#8-resources)
9. [License](#9-license)
10. [Created By](#10-created-by)

---

## 1. Project Overview

### 🎯 Brief Description

**ChamaHub** is a production-grade, fintech-ready SaaS platform built exclusively for Kenya's **300,000+ registered chamas** and **10 million+ informal savers**. It solves decades-old pain points — manual bookkeeping, disputes, idle cash, and lack of growth — by combining M-Pesa automation, real-time transparency, AI-powered insights, and the world's first **Automated Wealth Engine™** that actively invests idle chama funds into Treasury Bills, Money Market Funds, and high-yield savings accounts, then splits profits proportionally to every member.

This is not just a ledger app. It is a **wealth-building operating system** for informal finance, designed from day one with senior-level architecture: ACID transactions, JWT refresh rotation, Redis caching, Celery-driven AI, window functions, CTEs, throttling, immutable audit trails, and real-time WebSockets.

### 🚀 Project Goals

- ✅ Launch the **first automated investment engine** for informal savings groups in Africa
- 💵 Generate **100 KES+ monthly recurring revenue** via a freemium → premium model
- 🏆 Demonstrate **senior-level mastery** of SQL, DRF, and advanced Python in a real revenue-generating product
- 📈 Scale securely to **50,000+ chamas by 2028**
- 🌍 Become the trusted backend for **women's and youth chamas** across East Africa
- 🔐 Build a **financial-grade platform** with immutable audit trails and bank-level security
- ⚡ Achieve **99.9% uptime** with zero-downtime deployments and horizontal scalability
- 🤖 Implement **AI-powered fraud detection** and predictive analytics for smart decision-making

### 🛠️ Key Tech Stack

**Backend:** Python 3.12 • Django 5.1+ • Django REST Framework • PostgreSQL 16  
**Authentication:** SimpleJWT (Refresh Token Rotation + Redis Blacklist)  
**Real-time:** Django Channels • WebSockets • Redis  
**Async Tasks:** Celery • Celery Beat  
**Payment Gateway:** M-Pesa Daraja API (C2B, B2C, STK Push)  
**AI/ML:** scikit-learn • pandas • NumPy  
**Frontend:** React • Vite • Tailwind CSS • Chart.js  
**DevOps:** Docker • GitHub Actions • Railway/DigitalOcean  
**Monitoring:** Redis Cache • django-auditlog • Custom Analytics

---

## 2. Team Roles and Responsibilities

| **Role** | **Key Responsibility** |
|----------|------------------------|
| **🏗️ Backend Architect** | Advanced PostgreSQL (CTEs, window functions, partial indexes), DRF viewsets, throttling, caching strategy, ACID transaction design |
| **💻 Full-Stack Engineer** | React + Real-time dashboard, WebSocket voting interface, mobile-first UX, Chart.js wealth visualization |
| **🤖 Data & ML Engineer** | Wealth Engine forecasting, Monte Carlo simulations, anomaly detection models, credit scoring algorithms |
| **⚙️ DevOps & SRE** | Docker containerization, Railway/DigitalOcean deployment, Redis cluster management, zero-downtime CI/CD, monitoring and alerting |
| **🔒 Security Engineer** | JWT rotation implementation, M-Pesa webhook validation, rate limiting configuration, audit trail design, penetration testing |
| **🧪 QA & Automation** | Pytest + Playwright E2E testing, financial transaction rollback testing, N+1 query detection, load testing |
| **📊 Product Manager** | Freemium strategy, premium feature prioritization, user research with chama leaders, KPI tracking |
| **🎨 UI/UX Designer** | Mobile-first design, dashboard layout, wealth report visualization, accessibility compliance |

---

## 3. Technology Stack Overview

| **Technology** | **Purpose in the Project** |
|----------------|----------------------------|
| **Django 5.1+** | Core framework, custom User model, atomic transactions (`@transaction.atomic`), signals for business logic automation |
| **Django REST Framework** | Versioned APIs (`/api/v1/`), throttling, caching (`@cache_page`), custom permissions, `select_related`/`prefetch_related` optimization |
| **djangorestframework-simplejwt** | JWT with refresh rotation, sliding expiry, server-side blacklist — production-grade security |
| **PostgreSQL 16** | ACID financial storage, CTEs, window functions, expression indexes, `SELECT FOR UPDATE` for pessimistic locking |
| **Django Channels + Redis** | Real-time contribution feed, dispute voting, Wealth Engine notifications, WebSocket connections |
| **Celery + Redis** | Async tasks: weekly Wealth Engine execution, AI fraud detection, Monte Carlo simulations, automated report generation |
| **django-auditlog** | Immutable, tamper-proof audit trail of every financial mutation for compliance and forensics |
| **M-Pesa Daraja API** | Automated collections (C2B), instant payouts (B2C), investment transfers, STK Push notifications |
| **scikit-learn** | Predictive analytics, anomaly detection (IsolationForest), credit scoring models, time-series forecasting |
| **pandas + NumPy** | Financial data manipulation, Monte Carlo simulations, wealth report calculations |
| **Redis Cache** | View-level caching, session store, Celery broker, Channels layer backend |
| **React + Vite** | Modern SPA with fast HMR, component-based architecture, state management |
| **Tailwind CSS** | Utility-first styling, responsive design, consistent UI components |
| **Chart.js** | Real-time dashboards, wealth growth charts, predictive simulator visualizations |
| **GitHub Actions** | CI/CD automation, automated testing, security scanning (Bandit), deployment orchestration |
| **Docker** | Containerization for consistent environments, easy scaling, microservices architecture |
| **Railway** | Platform-as-a-Service deployment, zero-downtime blue-green deployments, automatic SSL |

---

## 4. Database Design Overview

### 🗄️ Core Principles Applied

- ✅ Fully **3NF compliant** — no transitive dependencies
- 💰 **Financial-grade constraints:** `CHECK (amount >= 0)`, `NOT NULL` on all monetary fields
- 🚀 **Composite & partial indexes** on high-read tables
- 📊 **Expression index:** `CREATE INDEX idx_user_email_lower ON auth_user(LOWER(email));`
- 🔒 **Immutable audit logging** on all financial transactions
- ⚡ **Optimized queries** using CTEs and window functions

### 🏗️ Key Entities

#### **Core Models**
- **User** — Custom user model with email/phone authentication
- **Chama** — Savings group with settings, balance, idle cash tracking
- **Member** — Junction table with contribution ratio and credit score
- **Contribution** — Individual member deposits with M-Pesa confirmation
- **Expense** — Chama expenditures with approval workflow
- **Loan** — Member loans with repayment tracking
- **WelfarePayout** — Emergency assistance distributions

#### **Wealth Engine Models**
- **InvestmentOption** — Available investment products (T-Bills, MMF, etc.)
- **ChamaInvestment** — Active investments with maturity tracking
- **WealthReport** — Member-specific profit distributions
- **CreditScore** — Member reliability scoring (0-100 scale)

#### **Governance Models**
- **DisputeVote** — Anonymous voting on disputed expenses
- **AuditLogEntry** — Immutable financial mutation log

### 🔗 Key Relationships

1. **Chama ↔ Member (Many-to-Many through Member model)**
   - One chama has multiple members
   - Each member can belong to multiple chamas
   - Junction table stores `contribution_share` (proportional ownership)
   - Stores `credit_score` for loan prioritization

2. **Member ↔ Contribution (One-to-Many)**
   - One member makes many contributions
   - Each contribution linked to M-Pesa transaction ID
   - Running balance calculated using window functions

3. **Chama ↔ ChamaInvestment (One-to-Many)**
   - One chama can have multiple active investments
   - Each investment linked to specific InvestmentOption
   - Profit split stored in WealthReport per member

---

## 5. Feature Breakdown

### 🆓 Free Tier Features (≤10 members – Acquisition Engine)

#### 🔐 **JWT Authentication & User Management**
Secure login via email or phone number with JWT tokens. Includes password reset, email verification, and role-based access control. Uses SimpleJWT with sliding token expiry for enhanced security.

#### 💳 **M-Pesa STK Push Contributions**
Automated contribution collection via M-Pesa STK Push. Members receive push notifications on their phones, confirm payment, and the system auto-updates balances via webhook confirmation. Zero manual reconciliation required.

#### 📊 **Real-Time Contribution Feed**
Live dashboard powered by Django Channels and WebSockets. Every confirmed contribution appears instantly on all member dashboards, building trust and transparency. Feels like a modern banking app.

#### 💸 **Basic Expense & Loan Tracking**
Record and categorize chama expenses with receipt uploads. Track member loans with simple interest calculations and repayment schedules. Basic reporting available for treasurers.

#### 🔍 **Idle Cash Detection**
Weekly Celery task scans every chama and identifies money that hasn't moved for >30 days. Shows amount to create desire for premium Wealth Engine. This is the primary conversion tool.

#### 📄 **PDF Statement Generation**
Generate professional PDF statements with transaction history, running balances, and member summaries. Export-ready for meetings or regulatory compliance.

---

### 💎 Premium Tier Features (KES 1,999/month – Revenue & Differentiation Engine)

#### 🏆 **Wealth Engine™ (Flagship Feature)**
**The Game Changer:** Weekly idle cash scan → auto-propose T-Bills/MMF → one-tap execution → proportional profit split.

**How It Works:**
1. Every Monday at 6 AM, Celery task scans all premium chamas
2. Identifies idle cash > KES 50,000
3. Queries CBK API for best current rates (T-Bills, ICEA MMF, CBA MMF)
4. Creates investment proposal with projected returns
5. Chair receives push notification with one-tap approval
6. Upon approval, Celery task executes B2C transfer to investment paybill
7. Webhook confirms transfer, creates `ChamaInvestment` record
8. At maturity, interest earned is automatically split by each member's `contribution_share`
9. Members receive individual `WealthReport` showing "You earned KES 1,234"
10. Option to auto-reinvest or auto-payout to all members

**Why It's Unique:** No chama app in Kenya moves money to MMF/T-Bills automatically. This turns a chama into a mini-SACCO without meetings.

**Revenue Impact:** A 40-member chama investing KES 500K at 13% annual returns earns ~KES 65K/year. After platform fee of KES 24K/year, net benefit is KES 41K — making premium tier a no-brainer.

**Code Example:**
```python
from celery import shared_task
from django.db import transaction
from decimal import Decimal

@shared_task
def scan_idle_cash_and_propose_investments():
    """
    Weekly Celery task that scans all premium chamas for idle cash
    and creates investment proposals.
    """
    premium_chamas = Chama.objects.filter(
        subscription_tier='PREMIUM',
        is_active=True
    ).select_related('chair')
    
    for chama in premium_chamas:
        # Calculate idle cash (money not moved in 30+ days)
        idle_amount = calculate_idle_cash(chama)
        
        if idle_amount >= Decimal('50000.00'):
            # Query CBK API for best current investment rates
            best_option = get_best_investment_option(idle_amount)
            
            # Create investment proposal
            proposal = InvestmentProposal.objects.create(
                chama=chama,
                investment_option=best_option,
                proposed_amount=idle_amount,
                projected_return=idle_amount * best_option.annual_rate * Decimal('0.25'),  # 3-month projection
                status='PENDING_APPROVAL'
            )
            
            # Send push notification to chair
            send_notification(
                user=chama.chair,
                title=f"💰 Investment Opportunity: Earn KES {proposal.projected_return:,.2f}",
                body=f"Your chama has KES {idle_amount:,.2f} idle. Invest in {best_option.name} @ {best_option.annual_rate*100}% annual return.",
                action_url=f"/investments/approve/{proposal.id}"
            )

@shared_task
@transaction.atomic
def execute_approved_investment(proposal_id):
    """
    Executes an approved investment proposal.
    Uses SELECT FOR UPDATE to prevent race conditions.
    """
    proposal = InvestmentProposal.objects.select_for_update().get(id=proposal_id)
    chama = Chama.objects.select_for_update().get(id=proposal.chama_id)
    
    if chama.balance < proposal.proposed_amount:
        raise InsufficientFundsError("Chama balance too low")
    
    # Deduct from chama balance
    chama.balance -= proposal.proposed_amount
    chama.save()
    
    # Execute M-Pesa B2C transfer to investment paybill
    mpesa_response = send_b2c_payment(
        phone_number=proposal.investment_option.paybill_number,
        amount=proposal.proposed_amount,
        reference=f"INV-{proposal.id}"
    )
    
    # Create investment record
    investment = ChamaInvestment.objects.create(
        chama=chama,
        investment_option=proposal.investment_option,
        principal_amount=proposal.proposed_amount,
        maturity_date=timezone.now() + timedelta(days=90),
        mpesa_transaction_id=mpesa_response['TransactionID'],
        status='ACTIVE'
    )
    
    # Mark proposal as executed
    proposal.status = 'EXECUTED'
    proposal.executed_at = timezone.now()
    proposal.save()
    
    return investment

def split_investment_profits(investment_id):
    """
    When investment matures, split profits proportionally to members.
    """
    investment = ChamaInvestment.objects.select_related('chama').get(id=investment_id)
    
    # Calculate total profit
    total_profit = investment.maturity_amount - investment.principal_amount
    
    # Get all members with their contribution shares
    members = investment.chama.members.all()
    
    for member in members:
        # Calculate proportional profit
        member_profit = total_profit * member.contribution_share
        
        # Create wealth report
        WealthReport.objects.create(
            member=member,
            investment=investment,
            profit_amount=member_profit,
            reporting_period=timezone.now().date()
        )
        
        # Send notification
        send_notification(
            user=member.user,
            title=f"🎉 You earned KES {member_profit:,.2f}!",
            body=f"Your share from {investment.investment_option.name} has matured."
        )
```

#### 🎯 **Predictive Savings Goal Simulator**
Monte Carlo simulation engine (10,000 runs) that forecasts goal achievement probability based on:
- Historical contribution patterns
- CBK inflation rates (retrieved via API)
- Wealth Engine projected returns
- Member reliability scores

**Example:** Member sets goal "Buy land KES 2M in 24 months" → simulator shows:
- 72% probability with current contributions + Wealth Engine
- 45% probability without Wealth Engine
- Suggested contribution increase: KES 1,500/month

**Code Example:**
```python
import numpy as np
from scipy import stats

def monte_carlo_goal_simulation(member, goal_amount, months_target):
    """
    Runs 10,000 Monte Carlo simulations to predict goal achievement probability.
    """
    # Historical contribution data
    contributions = member.contributions.order_by('date')
    monthly_avg = contributions.aggregate(Avg('amount'))['amount__avg']
    monthly_std = contributions.aggregate(StdDev('amount'))['amount__stddev']
    
    # Get Wealth Engine average return rate
    wealth_engine_rate = Decimal('0.13')  # 13% annual
    
    # Get CBK inflation rate
    inflation_rate = get_cbk_inflation_rate()
    
    # Run 10,000 simulations
    simulations = 10000
    success_count = 0
    
    for _ in range(simulations):
        total = Decimal('0')
        
        for month in range(months_target):
            # Random contribution based on historical pattern
            contribution = np.random.normal(float(monthly_avg), float(monthly_std))
            contribution = max(0, contribution)  # Can't be negative
            
            # Add to total
            total += Decimal(str(contribution))
            
            # Apply Wealth Engine returns (monthly compound)
            total *= (1 + wealth_engine_rate / 12)
            
            # Apply inflation erosion
            total /= (1 + inflation_rate / 12)
        
        if total >= goal_amount:
            success_count += 1
    
    probability = (success_count / simulations) * 100
    
    return {
        'probability': probability,
        'simulations_run': simulations,
        'success_count': success_count,
        'suggested_monthly_increase': calculate_required_increase(goal_amount, months_target, monthly_avg, probability)
    }
```

#### ⚖️ **Smart Dispute Resolution Engine**
**The Problem:** WhatsApp fights when treasurer makes questionable expense.

**The Solution:**
1. Expense > KES 5K requires chair approval
2. If not approved within 48 hours, auto-creates anonymous poll
3. All members vote via app (approve/reject)
4. 70% quorum required for validity
5. Result logged forever in `django-auditlog`
6. AI analyzes dispute patterns and suggests mediation

**Impact:** First automated democratic resolution in any chama app. Removes emotion, creates accountability.

#### 📈 **Member Credit Scoring (0-100 Scale)**
**Algorithm:**
- 40% contribution regularity (on-time payment streak)
- 30% loan repayment history (defaults reduce score)
- 20% meeting attendance (from check-in system)
- 10% tenure (longer membership = higher trust)

**Updated monthly by Celery Beat.**

**Benefits:**
- High scorers get lower loan interest rates (e.g., 8% vs 12%)
- Priority loan queue during high-demand periods
- Social proof on member profiles ("Reliability: 94/100")
- Creates positive competitive behavior

**Code Example:**
```python
def calculate_member_credit_score(member):
    """
    Calculates member credit score (0-100) based on multiple factors.
    """
    # Factor 1: Contribution regularity (40 points)
    expected_contributions = member.chama.contribution_frequency_count
    actual_contributions = member.contributions.filter(
        status='CONFIRMED'
    ).count()
    regularity_score = min(40, (actual_contributions / expected_contributions) * 40)
    
    # Factor 2: Loan repayment history (30 points)
    loans = member.loans.all()
    if loans.exists():
        repaid_on_time = loans.filter(status='FULLY_REPAID', defaulted=False).count()
        repayment_score = (repaid_on_time / loans.count()) * 30
    else:
        repayment_score = 30  # No loans = perfect score
    
    # Factor 3: Meeting attendance (20 points)
    meetings = member.chama.meetings.count()
    attended = member.meeting_attendances.filter(attended=True).count()
    attendance_score = (attended / meetings) * 20 if meetings > 0 else 20
    
    # Factor 4: Tenure (10 points)
    days_active = (timezone.now().date() - member.joined_date).days
    tenure_score = min(10, (days_active / 365) * 10)  # Max score at 1 year
    
    total_score = round(regularity_score + repayment_score + attendance_score + tenure_score)
    
    # Update member's credit score
    member.credit_score = total_score
    member.save()
    
    return total_score
```

#### 🚨 **AI Fraud & Anomaly Detection**
Scikit-learn `IsolationForest` runs nightly on:
- Contribution patterns (flags ghost members)
- Expense patterns (detects treasurer theft)
- Loan repayments (identifies serial defaulters)

**Alerts sent to chair + treasurer with:**
- Anomaly severity score
- Suggested actions
- Historical context

**Example Alert:** "Treasurer Jane submitted 3 expenses totaling KES 45K in 48 hours — 400% above her 90-day average. Review recommended."

**Code Example:**
```python
from sklearn.ensemble import IsolationForest
import pandas as pd

@shared_task
def detect_expense_anomalies():
    """
    Nightly Celery task that uses IsolationForest to detect suspicious expenses.
    """
    # Get all chamas
    chamas = Chama.objects.filter(is_active=True)
    
    for chama in chamas:
        # Get last 90 days of expenses
        expenses = chama.expenses.filter(
            date__gte=timezone.now().date() - timedelta(days=90)
        ).values('amount', 'created_by__id', 'date')
        
        if len(expenses) < 10:  # Need minimum data
            continue
        
        # Convert to DataFrame
        df = pd.DataFrame(expenses)
        
        # Group by user and calculate features
        user_expenses = df.groupby('created_by__id').agg({
            'amount': ['sum', 'mean', 'std', 'count']
        }).reset_index()
        
        # Train IsolationForest
        clf = IsolationForest(contamination=0.1, random_state=42)
        predictions = clf.fit_predict(user_expenses[['amount']])
        
        # Find anomalies (-1 = anomaly, 1 = normal)
        anomalies = user_expenses[predictions == -1]
        
        for _, anomaly in anomalies.iterrows():
            user_id = anomaly['created_by__id']
            user = User.objects.get(id=user_id)
            
            # Create alert
            Alert.objects.create(
                chama=chama,
                alert_type='EXPENSE_ANOMALY',
                severity='HIGH',
                user=user,
                message=f"{user.get_full_name()} has unusual expense patterns. Review recommended.",
                metadata={'anomaly_score': float(clf.score_samples(user_expenses[['amount']])[0])}
            )
            
            # Notify chair and treasurer
            notify_chama_leadership(chama, f"⚠️ Expense anomaly detected: {user.get_full_name()}")
```

#### 🏥 **Welfare Prediction Engine**
Time-series analysis on past welfare claims combined with external factors:
- Seasonal patterns (harvest season → fewer claims)
- Member demographics (elderly members → higher medical claims)
- Economic indicators (drought → more emergency requests)

**Outputs:**
- "Expect 2 welfare claims in next 30 days"
- Suggested buffer increase: KES 15,000
- Prevents forced liquidation when emergencies occur

#### 📊 **Advanced Reports & Accounting Export**
- Excel export with window-function analytics (running balances, member rankings)
- QuickBooks-compatible CSV format
- Professional PDF with charts and insights
- Treasurer dashboard with drill-down capabilities
- Month-over-month growth analysis

#### 🤝 **Chama Federation & Matchmaking**
**Vision:** Enable mega-projects through chama cooperation.

**How It Works:**
1. Chamas opt-in to federation network
2. Anonymized metrics shared (location, size, savings rate, goals)
3. Algorithm matches similar chamas (e.g., "40 women in Kisumu saving for land")
4. Platform facilitates introduction and joint venture creation
5. Federated chamas can co-invest in large projects (e.g., 10 chamas buying one plot)

**Use Cases:**
- Joint land purchases
- Bulk buying discounts
- Shared business ventures
- Cross-chama loans

#### 🔔 **Priority Real-Time Notifications**
Premium chamas get:
- SMS notifications for critical events (investment maturity, large expenses)
- WhatsApp Business API integration
- Email summaries (weekly digest)
- Configurable notification preferences per member

---

## 6. API Security Overview

### 🔒 Security Measures Implemented

#### **1. JWT with Refresh Token Rotation + Redis Blacklist**
**Why It's Crucial:** Traditional JWT is stateless but vulnerable if tokens are stolen.

**Implementation:**
- Access tokens expire in 15 minutes
- Refresh tokens expire in 7 days
- On each refresh, new refresh token issued and old one blacklisted in Redis
- On logout, both tokens added to Redis blacklist (TTL = token expiry)
- Even if attacker steals token, it expires quickly and rotation prevents reuse

**Code Example:**
```python
from rest_framework_simplejwt.tokens import RefreshToken
from django.core.cache import cache

def logout_user(request):
    token = RefreshToken(request.data.get('refresh'))
    # Blacklist the token
    cache.set(f'blacklist_{token}', True, timeout=604800)  # 7 days
    token.blacklist()
    return Response({"detail": "Logged out successfully"})
```

#### **2. DRF Throttling – Rate Limiting**
**Why It's Crucial:** Prevents brute-force attacks, API abuse, and DDoS attempts.

**Implemented Throttles:**
- `AnonRateThrottle`: 100 requests/minute for unauthenticated users
- `UserRateThrottle`: 1000 requests/minute for authenticated users
- Custom `InvestmentThrottle`: 5 requests/hour for investment approvals (prevents accidental double-execution)
- Custom `M-PesaWebhookThrottle`: Validates signature before processing

**Code Example:**
```python
from rest_framework.throttling import UserRateThrottle

class InvestmentThrottle(UserRateThrottle):
    rate = '5/hour'
    scope = 'investment'

class InvestmentViewSet(viewsets.ModelViewSet):
    throttle_classes = [InvestmentThrottle]
    # ...
```

#### **3. Object-Level Permissions**
**Why It's Crucial:** Prevents users from accessing other chamas' data.

**Implementation:**
- Custom permissions: `IsChamaChair`, `IsChamaMember`, `IsChamaTreasurer`
- Uses `django-guardian` for row-level permissions
- Every API call validates: "Does this user belong to this chama?"

**Code Example:**
```python
class IsChamaChair(permissions.BasePermission):
    def has_object_permission(self, request, view, obj):
        return obj.chama.members.filter(
            user=request.user,
            role='CHAIR'
        ).exists()
```

#### **4. M-Pesa Webhook Signature Validation**
**Why It's Crucial:** Prevents fake payment confirmations from attackers.

**Implementation:**
- Every webhook includes signature from Safaricom
- Server validates signature using shared secret
- Replay protection via timestamp validation (reject if >5 mins old)
- Idempotency check using M-Pesa transaction ID

**Code Example:**
```python
import hmac
import hashlib
import time
import json
from rest_framework.exceptions import ValidationError

def validate_mpesa_webhook(request):
    signature = request.headers.get('X-Mpesa-Signature')
    timestamp = request.data.get('timestamp')
    
    # Replay protection
    if time.time() - timestamp > 300:  # 5 minutes
        raise ValidationError("Webhook expired")
    
    # Signature validation
    payload = json.dumps(request.data, sort_keys=True)
    expected_signature = hmac.new(
        settings.MPESA_SECRET.encode(),
        payload.encode(),
        hashlib.sha256
    ).hexdigest()
    
    if not hmac.compare_digest(signature, expected_signature):
        raise ValidationError("Invalid signature")
```

#### **5. Immutable Audit Logging**
**Why It's Crucial:** Financial forensics, compliance, dispute resolution.

**Implementation:**
- `django-auditlog` tracks every create/update/delete on money-related models
- Logs include: user, timestamp, IP address, changes (JSON diff)
- Stored in separate `AuditLogEntry` table (never deleted)
- Tamper-proof: write-only (no UPDATE or DELETE allowed)

#### **6. CORS Restricted to Official Domains**
**Why It's Crucial:** Prevents malicious sites from making API calls on behalf of users.

**Implementation:**
```python
CORS_ALLOWED_ORIGINS = [
    "https://chamahub.co.ke",
    "https://app.chamahub.co.ke",
    "https://www.chamahub.co.ke",
]
CORS_ALLOW_CREDENTIALS = True
```

#### **7. HTTPS + HSTS Enforced in Production**
**Why It's Crucial:** Prevents man-in-the-middle attacks and session hijacking.

**Implementation:**
```python
SECURE_SSL_REDIRECT = True
SECURE_HSTS_SECONDS = 31536000  # 1 year
SECURE_HSTS_INCLUDE_SUBDOMAINS = True
SECURE_HSTS_PRELOAD = True
```

#### **8. Input Validation on All Monetary Fields**
**Why It's Crucial:** Prevents negative balances, decimal precision errors, and injection attacks.

**Implementation:**
```python
from decimal import Decimal
from rest_framework import serializers

class ContributionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Contribution
        fields = '__all__'
    
    def validate_amount(self, value):
        if value <= 0:
            raise serializers.ValidationError("Amount must be positive")
        if value > 1000000:  # 1M KES
            raise serializers.ValidationError("Amount exceeds single contribution limit")
        # Ensure exactly 2 decimal places
        if Decimal(str(value)).as_tuple().exponent < -2:
            raise serializers.ValidationError("Amount cannot have more than 2 decimal places")
        return value
```

#### **9. ACID Transactions for Financial Operations**
**Why It's Crucial:** Guarantees data consistency — no partial writes.

**Implementation:**
```python
from django.db import transaction

@transaction.atomic
def execute_investment(chama_id, amount):
    # Lock the chama row (prevents race conditions)
    chama = Chama.objects.select_for_update().get(id=chama_id)
    
    if chama.balance < amount:
        raise InsufficientFundsError()
    
    # Deduct from chama balance
    chama.balance -= amount
    chama.save()
    
    # Create investment record
    investment = ChamaInvestment.objects.create(
        chama=chama,
        amount=amount,
        # ...
    )
    
    # If any step fails, entire transaction rolls back
    return investment
```

---

## 7. CI/CD Pipeline Overview

### 🚀 Continuous Integration/Continuous Deployment Strategy

**What is CI/CD?**
CI/CD is a DevOps practice that automates the process of testing, building, and deploying code. Every push to the repository triggers automated tests, security scans, and deployments — ensuring that only high-quality, secure code reaches production.

**Why ChamaHub Uses CI/CD:**
- ✅ **Zero-downtime deployments** — users never experience service interruptions
- 🐛 **Catch bugs early** — automated tests run on every commit
- 🔒 **Security scanning** — Bandit detects vulnerabilities before they reach production
- 📦 **Consistent environments** — Docker ensures dev, staging, and production are identical
- ⚡ **Fast iteration** — deploy multiple times per day without manual intervention
- 📊 **Instant rollback** — if something breaks, revert to previous version in seconds

### 🔄 Pipeline Stages

#### **Stage 1: Code Push**
Developer pushes code to GitHub → Triggers GitHub Actions workflow

#### **Stage 2: Linting & Formatting**
```yaml
- Run Black (Python code formatter)
- Run flake8 (style guide enforcement)
- Run isort (import sorting)
```
**Purpose:** Ensure code consistency across the team.

#### **Stage 3: Security Scanning**
```yaml
- Run Bandit (Python security linter)
- Check for hardcoded secrets
- Dependency vulnerability scan
```
**Purpose:** Prevent security vulnerabilities from reaching production.

#### **Stage 4: Automated Testing**
```yaml
- pytest (unit tests, integration tests)
- Coverage report (ensure >80% coverage)
- Financial transaction rollback tests
```
**Purpose:** Validate that new code doesn't break existing functionality.

#### **Stage 5: Build Docker Image**
```yaml
- Build production Docker image
- Tag with commit SHA + "latest"
- Push to GitHub Container Registry
```
**Purpose:** Create consistent, immutable deployment artifact.

#### **Stage 6: Deploy to Staging**
```yaml
- Railway pulls new Docker image
- Run database migrations
- Restart Django + Celery workers
- Health check endpoint validation
```
**Purpose:** Test in production-like environment before going live.

#### **Stage 7: Deploy to Production (Blue-Green)**
```yaml
- Spin up new containers with updated code (Green)
- Wait for health check to pass
- Switch traffic from old containers (Blue) to new (Green)
- Keep Blue running for 10 minutes (instant rollback if needed)
- Destroy Blue containers
```
**Purpose:** Zero-downtime deployment with instant rollback capability.

#### **Stage 8: Post-Deployment**
```yaml
- Send Slack notification to team
- Update deployment dashboard
- Trigger smoke tests on production
```

### 🛠️ Tools Used

| **Tool** | **Purpose** |
|----------|-------------|
| **GitHub Actions** | Workflow orchestration, CI/CD runner |
| **Docker** | Containerization for consistent environments |
| **Railway** | Platform-as-a-Service for hosting and auto-deployment |
| **pytest** | Python testing framework |
| **Bandit** | Python security vulnerability scanner |
| **Black** | Python code formatter (opinionated) |
| **flake8** | Python linting (PEP 8 compliance) |
| **Slack API** | Deployment notifications to team |
| **PostgreSQL** | Database migrations via Django ORM |
| **Redis** | Cache invalidation on deployment |

### 📊 Sample GitHub Actions Workflow

```yaml
name: ChamaHub CI/CD Pipeline

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:16
        env:
          POSTGRES_PASSWORD: postgres
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
      redis:
        image: redis:7-alpine
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
        pip install -r requirements.txt
        pip install pytest pytest-cov bandit black flake8
    
    - name: Run Black formatter check
      run: black --check .
    
    - name: Run flake8 linter
      run: flake8 . --max-line-length=100 --exclude=migrations
    
    - name: Run Bandit security scan
      run: bandit -r . -ll
    
    - name: Run pytest with coverage
      run: |
        pytest --cov=. --cov-report=xml --cov-report=term
      env:
        DATABASE_URL: postgresql://postgres:postgres@localhost/chamahub_test
        REDIS_URL: redis://localhost:6379/0
    
    - name: Upload coverage to Codecov
      uses: codecov/codecov-action@v3
  
  build:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Build Docker image
      run: |
        docker build -t ghcr.io/machariap/chamahub:${{ github.sha }} .
        docker tag ghcr.io/machariap/chamahub:${{ github.sha }} ghcr.io/machariap/chamahub:latest
    
    - name: Push to GitHub Container Registry
      run: |
        echo ${{ secrets.GITHUB_TOKEN }} | docker login ghcr.io -u ${{ github.actor }} --password-stdin
        docker push ghcr.io/machariap/chamahub:${{ github.sha }}
        docker push ghcr.io/machariap/chamahub:latest
  
  deploy:
    needs: build
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    
    steps:
    - name: Deploy to Railway
      run: |
        curl -X POST ${{ secrets.RAILWAY_WEBHOOK_URL }}
    
    - name: Notify Slack
      uses: 8398a7/action-slack@v3
      with:
        status: ${{ job.status }}
        text: 'ChamaHub deployed successfully to production! 🚀'
        webhook_url: ${{ secrets.SLACK_WEBHOOK }}
      if: always()
```

### 🎯 CI/CD Benefits for ChamaHub

1. **Financial Safety:** Automated tests prevent bugs that could cause incorrect balance calculations
2. **Rapid Feature Delivery:** Deploy new features within minutes of merging
3. **Rollback Safety:** If Wealth Engine has a bug, revert to previous version instantly
4. **Team Confidence:** Developers can push fearlessly knowing tests will catch errors
5. **Compliance Audit Trail:** Every deployment logged with timestamp, author, and changes

---

## 8. Resources

### 📚 Official Documentation

- **Safaricom Daraja Developer Portal** – [https://developer.safaricom.co.ke](https://developer.safaricom.co.ke)  
  Complete M-Pesa API reference, sandbox environment, code samples for C2B, B2C, STK Push

- **Django REST Framework Documentation** – [https://www.django-rest-framework.org](https://www.django-rest-framework.org)  
  API versioning, throttling, permissions, serializers, viewsets

- **SimpleJWT Documentation** – [https://django-rest-framework-simplejwt.readthedocs.io](https://django-rest-framework-simplejwt.readthedocs.io)  
  JWT authentication, token refresh, blacklisting strategies

- **PostgreSQL Window Functions** – [https://www.postgresql.org/docs/current/functions-window.html](https://www.postgresql.org/docs/current/functions-window.html)  
  Running balances, ranking, moving averages using SQL

- **Django Channels Documentation** – [https://channels.readthedocs.io](https://channels.readthedocs.io)  
  WebSocket implementation, async consumers, Redis channel layers

- **Celery Documentation** – [https://docs.celeryq.dev](https://docs.celeryq.dev)  
  Task queues, periodic tasks (Celery Beat), monitoring

### 🌍 Kenyan Fintech Context

- **FSD Kenya – State of Informal Finance Reports (2025)** – [https://www.fsdkenya.org](https://www.fsdkenya.org)  
  Research on chama behaviors, savings patterns, and financial inclusion gaps

- **Central Bank of Kenya – Treasury Bill Rates API** – [https://www.centralbank.go.ke](https://www.centralbank.go.ke)  
  Real-time T-Bill rates for Wealth Engine calculations

- **Kenya National Bureau of Statistics (KNBS)** – [https://www.knbs.or.ke](https://www.knbs.or.ke)  
  Inflation data for predictive goal simulations

### 🎓 Learning Resources

- **Two Scoops of Django (Daniel & Audrey Feldman)** – Best practices for Django development
- **High Performance Django (Peter Baumgartner)** – Optimization techniques for scaling
- **Database Internals (Alex Petrov)** – Understanding PostgreSQL under the hood
- **Designing Data-Intensive Applications (Martin Kleppmann)** – System design for financial applications

### 🛠️ Tools & APIs

- **Railway** – [https://railway.app](https://railway.app) – Platform-as-a-Service deployment
- **Sentry** – [https://sentry.io](https://sentry.io) – Error tracking and monitoring
- **Postman** – [https://www.postman.com](https://www.postman.com) – API testing and documentation
- **Bandit** – [https://bandit.readthedocs.io](https://bandit.readthedocs.io) – Python security linting

---

## 9. License

This project is licensed under the **MIT License**.

```
MIT License

Copyright (c) 2025 Phinehas Macharia

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

---

## 10. Created By

<div align="center">

### **Phinehas Macharia** [@_M_Phinehas](https://twitter.com/_M_Phinehas)

🇰🇪 **Kenyan Full-Stack Engineer • Fintech Architect • Django & PostgreSQL Senior Practitioner**

📍 **Nairobi, Kenya** • 📅 **November 17, 2025**

---

[![GitHub](https://img.shields.io/badge/GitHub-MachariaP-181717?style=for-the-badge&logo=github)](https://github.com/MachariaP)
[![Twitter](https://img.shields.io/badge/Twitter-@__M__Phinehas-1DA1F2?style=for-the-badge&logo=twitter&logoColor=white)](https://twitter.com/_M_Phinehas)
[![LinkedIn](https://img.shields.io/badge/LinkedIn-Connect-0077B5?style=for-the-badge&logo=linkedin)](https://linkedin.com/in/phinehas-macharia)

</div>

---

<div align="center">

## 🚀 **This repository is not just a project — it is a complete demonstration of senior-level software engineering**

✅ **Advanced SQL** (CTEs, window functions, ACID)  
✅ **Production DRF** (throttling, caching, versioning, custom permissions)  
✅ **Real-time systems** (Channels + Redis)  
✅ **Background AI & automation** (Celery + scikit-learn)  
✅ **Financial-grade security and auditability**

### **Built to power the future of informal finance in Africa — one automatically growing chama at a time.**

---

### 💡 **Ready to turn your chama into a wealth machine?**

### **The revolution starts here. 🌍💰**

</div>

---

## 🎯 Next Steps & Roadmap

<details>
<summary>📋 <strong>Click to expand roadmap</strong></summary>

### Q1 2026
- [ ] Launch beta with 100 pilot chamas in Nairobi
- [ ] Integrate ICEA Lion Money Market Fund API
- [ ] Implement WhatsApp Business API notifications
- [ ] Add Kiswahili language support

### Q2 2026
- [ ] Scale to 1,000 chamas across Kenya
- [ ] Launch mobile apps (iOS + Android) using React Native
- [ ] Integrate CBA Loop and KCB M-Pesa for automated investments
- [ ] Add multi-currency support (USD, UGX, TZS)

### Q3 2026
- [ ] Expand to Uganda and Tanzania
- [ ] Launch Chama Federation marketplace
- [ ] Implement blockchain-based audit trail (optional transparency)
- [ ] Partner with 3 insurance providers for welfare automation

### Q4 2026
- [ ] Reach 5,000 active chamas
- [ ] Launch API marketplace for third-party integrations
- [ ] Implement AI-powered financial advisory chatbot
- [ ] Achieve SOC 2 Type II compliance certification

</details>

---

## ❓ FAQ

<details>
<summary><strong>How is ChamaHub different from Excel or WhatsApp groups?</strong></summary>

Excel requires manual entry (error-prone), has no M-Pesa integration, and can't auto-invest. WhatsApp has no financial tracking at all. ChamaHub automates everything and grows your money while you sleep.

</details>

<details>
<summary><strong>Is my chama's money safe?</strong></summary>

Yes. ChamaHub never holds your money. We facilitate transfers directly to regulated investment institutions (ICEA, CBA, etc.). All transactions are logged immutably and auditable by members.

</details>

<details>
<summary><strong>What happens if the Wealth Engine makes a bad investment?</strong></summary>

The Wealth Engine only proposes government-backed T-Bills and CBK-regulated Money Market Funds — the safest investment classes in Kenya. Historical returns are 10-14% annually with near-zero default risk.

</details>

<details>
<summary><strong>Can I use ChamaHub if my chama doesn't have a bank account?</strong></summary>

Yes! ChamaHub works entirely via M-Pesa. No bank account required. Contributions, investments, and payouts all happen via M-Pesa paybills.

</details>

<details>
<summary><strong>How do you make money?</strong></summary>

We charge KES 1,999/month for premium features (Wealth Engine, AI insights, etc.). Free tier is forever free for chamas ≤10 members. We make money when your chama grows and succeeds.

</details>

---

<div align="center">

### ⭐ **If you found this project valuable, please star this repository!** ⭐

**Built with ❤️ in Nairobi, Kenya 🇰🇪**

</div>
