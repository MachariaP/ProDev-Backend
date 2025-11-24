# ChamaHub API - Django Backend

A comprehensive Django REST API for managing Chama (savings groups) operations including onboarding, finances, governance, and investments.

## Features Implemented

### 🔐 I. Onboarding and Profile Management

#### Group Registration/KYB Flow
- Complete group registration with KYB (Know Your Business) verification
- Upload registration certificate, KRA PIN, and Articles of Association
- Elect and manage group officials
- Track group type, objectives, and settings

#### Member Onboarding/KYC Flow
- Email-based user registration
- Secure KYC (Know Your Customer) document upload
- Government-issued ID and KRA PIN verification
- User profile management

#### Individual Member Wallet/Account
- Personal wallet for each member
- Internal credit score tracking
- Transaction history
- Balance management

### 💰 II. Core Financial Dashboard

#### Financial Overview
- Total group balance tracking
- Total loans outstanding
- Total contributions collected
- Overall investment value

#### Goal Tracker
- Define and track group financial goals
- Progress visualization
- Achievement tracking

#### Transaction Feed
- Chronological log of all transactions
- Deposits, withdrawals, and disbursements
- Real-time accountability

### 💵 III. Deposits, Loans, and Credit Management

#### Contributions/Deposit Management
- Multiple payment methods (M-Pesa, Bank, Cash)
- Auto-reconciliation functionality
- Contribution history
- Arrears tracking

#### Loan and Credit Module
- Digital loan application workflow
- Approval and disbursement tracking
- Automated interest calculation
- Repayment schedule management
- Outstanding balance tracking

#### Multi-Signature/Security
- Multi-signature approval system
- Multiple officials required for disbursements
- Secure fund movement controls
- Approval signatures tracking

### ⚖️ IV. Governance, Compliance, and Decisions

#### Digital Constitution/Rules Center
- Centralized constitution storage
- Membership and contribution rules
- Loan policies and exit procedures
- Automated fine calculations

#### Digital Voting Module
- Secure in-app voting system
- Proxy voting support
- Multiple voting types (Simple, Two-thirds, Unanimous)
- Auditable voting records

#### Document Repository
- Meeting minutes storage
- Financial statements
- Regulatory filings
- Secure document access

#### Compliance Center
- ODPC registration status
- AML/KYC policy tracking
- Security certifications
- Audit trail

### 📈 V. Investment Portfolio Management

#### External Assets Tracking
- Fixed deposits, Treasury bills, Money Market Funds
- Real estate and bonds tracking
- Investment performance monitoring

#### Capital Markets Integration
- CDSC account linkage
- NSE stock tracking
- Share quantity and price monitoring

#### Investment Performance
- ROI calculations
- Portfolio diversification metrics
- YTD return tracking
- Best/worst performing assets

## Technology Stack

- **Django 5.1+** - Web framework
- **Django REST Framework** - API toolkit
- **PostgreSQL** - Database (SQLite for development)
- **JWT Authentication** - djangorestframework-simplejwt
- **CORS Headers** - django-cors-headers
- **Filtering** - django-filter
- **Audit Logging** - django-auditlog
- **API Documentation** - drf-spectacular (Swagger/ReDoc)

## Installation

### Prerequisites

- Python 3.12+
- pip
- virtualenv (optional but recommended)

### Setup

1. **Clone the repository**
```bash
git clone https://github.com/MachariaP/ProDev-Backend.git
cd ProDev-Backend
```

2. **Create and activate virtual environment**
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

3. **Install dependencies**
```bash
pip install -r requirements.txt
```

4. **Set up environment variables**
```bash
cp .env.example .env
# Edit .env file with your settings
```

5. **Run migrations**
```bash
python manage.py migrate
```

6. **Create superuser**
```bash
python manage.py createsuperuser
```

7. **Run development server**
```bash
python manage.py runserver
```

The API will be available at `http://localhost:8000/`

## API Documentation

Interactive API documentation is available at:
- **Swagger UI**: http://localhost:8000/api/docs/
- **ReDoc**: http://localhost:8000/api/redoc/
- **OpenAPI Schema**: http://localhost:8000/api/schema/

## API Endpoints

### Authentication

```
POST   /api/v1/token/                 # Obtain JWT token (recommended)
POST   /api/v1/token/refresh/         # Refresh access token (recommended)
POST   /api/token/                    # Obtain JWT token (legacy, backwards compatible)
POST   /api/token/refresh/            # Refresh access token (legacy, backwards compatible)
```

### Accounts

```
POST   /api/v1/accounts/users/register/        # Register new user
GET    /api/v1/accounts/users/me/              # Get current user
POST   /api/v1/accounts/users/upload_kyc/      # Upload KYC documents
GET    /api/v1/accounts/wallets/my_wallet/     # Get user's wallet
```

### Groups

```
GET    /api/v1/groups/chama-groups/                    # List all groups
POST   /api/v1/groups/chama-groups/                    # Create group
GET    /api/v1/groups/chama-groups/{id}/               # Get group details
GET    /api/v1/groups/chama-groups/{id}/dashboard/    # Group dashboard
GET    /api/v1/groups/chama-groups/{id}/members/      # Get group members
GET    /api/v1/groups/chama-groups/my_groups/         # User's groups
GET    /api/v1/groups/memberships/                     # List memberships
POST   /api/v1/groups/memberships/                     # Join group
POST   /api/v1/groups/memberships/{id}/approve/       # Approve membership
GET    /api/v1/groups/officials/                       # List officials
GET    /api/v1/groups/goals/                           # List goals
POST   /api/v1/groups/goals/                           # Create goal
```

### Finance

```
GET    /api/v1/finance/contributions/              # List contributions
POST   /api/v1/finance/contributions/              # Make contribution
GET    /api/v1/finance/loans/                      # List loans
POST   /api/v1/finance/loans/                      # Apply for loan
GET    /api/v1/finance/loan-repayments/            # List repayments
POST   /api/v1/finance/loan-repayments/            # Make repayment
GET    /api/v1/finance/expenses/                   # List expenses
POST   /api/v1/finance/expenses/                   # Request expense
GET    /api/v1/finance/disbursement-approvals/    # List approvals
POST   /api/v1/finance/disbursement-approvals/    # Request approval
```

### Governance

```
GET    /api/v1/governance/constitutions/       # List constitutions
POST   /api/v1/governance/constitutions/       # Create constitution
GET    /api/v1/governance/fines/               # List fines
POST   /api/v1/governance/fines/               # Issue fine
GET    /api/v1/governance/votes/               # List votes
POST   /api/v1/governance/votes/               # Create vote
GET    /api/v1/governance/vote-ballots/        # List ballots
POST   /api/v1/governance/vote-ballots/        # Cast vote
GET    /api/v1/governance/documents/           # List documents
POST   /api/v1/governance/documents/           # Upload document
GET    /api/v1/governance/compliance-records/  # Compliance status
```

### Investments

```
GET    /api/v1/investments/investments/              # List investments
POST   /api/v1/investments/investments/              # Create investment
GET    /api/v1/investments/stock-holdings/           # List stock holdings
POST   /api/v1/investments/stock-holdings/           # Add stock holding
GET    /api/v1/investments/portfolios/               # List portfolios
GET    /api/v1/investments/investment-transactions/  # Investment transactions
```

## Usage Examples

### 1. Register a User

```bash
curl -X POST http://localhost:8000/api/v1/accounts/users/register/ \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "securepassword123",
    "password_confirm": "securepassword123",
    "first_name": "John",
    "last_name": "Doe",
    "phone_number": "254712345678"
  }'
```

### 2. Login and Get Token

```bash
# Using recommended v1 endpoint
curl -X POST http://localhost:8000/api/v1/token/ \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "securepassword123"
  }'

# Or using legacy endpoint (backwards compatible)
curl -X POST http://localhost:8000/api/token/ \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "securepassword123"
  }'
```

### 3. Create a Chama Group

```bash
curl -X POST http://localhost:8000/api/v1/groups/chama-groups/ \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Women Empowerment Chama",
    "description": "Savings group for women entrepreneurs",
    "group_type": "SAVINGS",
    "objectives": "Save for business expansion",
    "contribution_frequency": "MONTHLY",
    "minimum_contribution": "1000.00"
  }'
```

### 4. Make a Contribution

```bash
curl -X POST http://localhost:8000/api/v1/finance/contributions/ \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "group": 1,
    "amount": "5000.00",
    "payment_method": "MPESA",
    "reference_number": "QA12B3C4D5"
  }'
```

### 5. Apply for a Loan

```bash
curl -X POST http://localhost:8000/api/v1/finance/loans/ \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "group": 1,
    "principal_amount": "50000.00",
    "interest_rate": "10.00",
    "duration_months": 12,
    "purpose": "Business inventory purchase"
  }'
```

## Admin Interface

Access the Django admin interface at `http://localhost:8000/admin/` using your superuser credentials.

All models are registered in the admin interface for easy management:
- Users and Wallets
- Chama Groups and Memberships
- Contributions and Loans
- Votes and Documents
- Investments and Portfolios

## Testing

Run tests with:
```bash
python manage.py test
```

## Project Structure

```
ProDev-Backend/
├── accounts/           # User authentication and profiles
│   ├── models.py      # User and MemberWallet models
│   ├── serializers.py # User serializers
│   ├── views.py       # User viewsets
│   └── urls.py        # User endpoints
├── groups/            # Chama group management
│   ├── models.py      # ChamaGroup, Membership, Officials, Goals
│   ├── serializers.py # Group serializers
│   ├── views.py       # Group viewsets
│   └── urls.py        # Group endpoints
├── finance/           # Financial operations
│   ├── models.py      # Contributions, Loans, Expenses
│   ├── serializers.py # Finance serializers
│   ├── views.py       # Finance viewsets
│   └── urls.py        # Finance endpoints
├── governance/        # Governance and compliance
│   ├── models.py      # Constitution, Votes, Documents
│   ├── serializers.py # Governance serializers
│   ├── views.py       # Governance viewsets
│   └── urls.py        # Governance endpoints
├── investments/       # Investment management
│   ├── models.py      # Investments, Stocks, Portfolio
│   ├── serializers.py # Investment serializers
│   ├── views.py       # Investment viewsets
│   └── urls.py        # Investment endpoints
├── chamahub/          # Project settings
│   ├── settings.py    # Django settings
│   ├── urls.py        # Main URL configuration
│   └── wsgi.py        # WSGI configuration
├── docs/              # Documentation guides
├── learn/             # Learning materials
├── manage.py          # Django management script
└── requirements.txt   # Python dependencies
```

## Environment Variables

Copy `.env.example` to `.env` and configure:

```env
SECRET_KEY=your-secret-key-here
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1

# Database (PostgreSQL for production)
DB_NAME=chamahub_db
DB_USER=chamahub_user
DB_PASSWORD=your-db-password
DB_HOST=localhost
DB_PORT=5432

# CORS
CORS_ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5173
```

## Security Features

- JWT-based authentication with token rotation
- Password hashing using Django's default PBKDF2
- CORS protection
- File upload validation
- SQL injection protection (Django ORM)
- XSS protection
- CSRF protection for non-API requests
- Audit logging for all financial transactions

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests
5. Submit a pull request

## License

MIT License - See LICENSE file for details

## Support

For issues and questions:
- GitHub Issues: https://github.com/MachariaP/ProDev-Backend/issues
- Documentation: See `/docs` folder

## Roadmap

### Future Enhancements
- [ ] M-Pesa payment integration
- [ ] Real-time notifications via WebSockets
- [ ] PDF report generation
- [ ] Email notifications
- [ ] SMS notifications
- [ ] Mobile app (React Native)
- [ ] Advanced analytics dashboard
- [ ] AI-powered fraud detection
- [ ] Automated investment recommendations

---

Built with ❤️ for Kenya's Chama community
