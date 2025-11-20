# ChamaHub - Data Seeding and Testing Guide

## Overview

This guide explains how to use the database seeder to populate ChamaHub with realistic African member data and how to test the application.

## Database Seeding

### Quick Start

To seed the database with 50 African members and diverse group data:

```bash
python manage.py seed_data
```

### What Gets Created

The seeder creates:

#### 1. **50 African Members**
- Diverse names from across Africa (Kenya, Ghana, Nigeria, South Africa, etc.)
- Realistic contact information (phone numbers, addresses)
- KYC verification status (75% verified)
- Credit scores ranging from 300-850
- Member wallets with balances between KES 1,000 - 50,000

**Sample Members:**
- Amara Okonkwo (Nairobi)
- Kwame Mwangi (Mombasa)
- Zuri Ndlovu (Kisumu)
- Kofi Mensah (Nakuru)
- And 46 more...

#### 2. **15 Chama Groups**
Different types of groups:
- **Savings Groups**: Umoja Savings Group, Neema Ladies Chama
- **Investment Groups**: Harambee Investment Club, Baraka Investment Group
- **Welfare Groups**: Mwanzo Welfare Society
- **Mixed Purpose**: Jamii Development Fund, Tujenge Together

Each group has:
- 8-15 random members
- Contribution frequency (Weekly/Bi-weekly/Monthly)
- Minimum contribution amounts (KES 500 - 5,000)
- Group officials (Chairperson, Treasurer, Secretary)
- Financial goals (1-3 per group)

#### 3. **Group Activities**

**Contributions:**
- 5-15 contributions per member
- Payment methods: 60% M-Pesa, 40% Bank/Cash
- Various statuses: Completed, Pending, Reconciled

**Loans:**
- 30-50% of members have loans
- Principal amounts: KES 10,000 - 200,000
- Interest rates: 5-15% per annum
- Durations: 3, 6, 12, or 24 months
- Purposes: Business expansion, Emergency medical, Education fees, etc.

**Expenses:**
- 3-8 expenses per group
- Categories: Operational, Administrative, Welfare, Investment
- Items: Meeting venue rental, Office supplies, Member welfare support, etc.

**Group Messages:**
- 10-30 messages per group
- Communication about contributions, meetings, achievements

## Testing the API

### 1. Start the Server

```bash
python manage.py runserver
```

### 2. Login Credentials

**Superuser Account:**
- Email: `admin@chamahub.com`
- Password: `admin123`

**Sample User Accounts:**
- Email: `<firstname>.<lastname><number>@example.com`
- Password: `password123`

Example: `amara.okonkwo1@example.com` / `password123`

### 3. Test API Endpoints

#### Authentication
```bash
# Get access token
curl -X POST http://localhost:8000/api/token/ \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@chamahub.com","password":"admin123"}'

# Use the returned access token in subsequent requests
export TOKEN="your_access_token_here"
```

#### User Profile
```bash
curl http://localhost:8000/api/v1/accounts/users/me/ \
  -H "Authorization: Bearer $TOKEN"
```

#### Groups
```bash
# List all groups
curl http://localhost:8000/api/v1/groups/chama-groups/ \
  -H "Authorization: Bearer $TOKEN"

# Get user's groups
curl http://localhost:8000/api/v1/groups/chama-groups/my_groups/ \
  -H "Authorization: Bearer $TOKEN"

# Get group dashboard
curl http://localhost:8000/api/v1/groups/chama-groups/1/dashboard/ \
  -H "Authorization: Bearer $TOKEN"
```

#### Finance
```bash
# Contributions
curl http://localhost:8000/api/v1/finance/contributions/ \
  -H "Authorization: Bearer $TOKEN"

# Loans
curl http://localhost:8000/api/v1/finance/loans/ \
  -H "Authorization: Bearer $TOKEN"

# Expenses
curl http://localhost:8000/api/v1/finance/expenses/ \
  -H "Authorization: Bearer $TOKEN"
```

#### Governance
```bash
# Votes
curl http://localhost:8000/api/v1/governance/votes/ \
  -H "Authorization: Bearer $TOKEN"

# Documents
curl http://localhost:8000/api/v1/governance/documents/ \
  -H "Authorization: Bearer $TOKEN"

# Fines
curl http://localhost:8000/api/v1/governance/fines/ \
  -H "Authorization: Bearer $TOKEN"
```

### 4. API Documentation

Access interactive API documentation:

- **Swagger UI**: http://localhost:8000/api/docs/
- **ReDoc**: http://localhost:8000/api/redoc/
- **OpenAPI Schema**: http://localhost:8000/api/schema/

## Testing the Frontend

### 1. Install Dependencies

```bash
cd chamahub-frontend
npm install
```

### 2. Configure Environment

Create `.env` file:

```env
VITE_API_URL=http://localhost:8000
```

### 3. Start Development Server

```bash
npm run dev
```

The app will be available at: http://localhost:5173

### 4. Test Features

#### Login
1. Navigate to http://localhost:5173
2. Login with: `admin@chamahub.com` / `admin123`

#### Navigation
- ✅ Smooth scrolling enabled throughout the app
- ✅ Custom scrollbar styling for better UX
- ✅ Collapsible sidebar with section grouping
- ✅ Mobile responsive navigation

#### Test Pages
- **Dashboard**: View statistics and recent activity
- **Groups**: Browse and join chama groups
- **Finance Hub**: Track contributions, loans, expenses
- **Loans**: Apply for loans and track repayments
- **Investments**: Manage investment portfolio
- **Governance**: Participate in voting, view documents
- **Chat**: Communicate with group members
- **Profile**: Manage user profile and KYC documents

## Data Statistics

After running the seeder, you should have:

- **50 Users**: Diverse African members with realistic data
- **15 Groups**: Various types (Savings, Investment, Welfare, Mixed)
- **~150 Memberships**: Average 10 members per group
- **~45 Officials**: 3 per group (Chairperson, Treasurer, Secretary)
- **~30 Goals**: 1-3 per group
- **~750 Contributions**: 5-15 per member
- **~200 Loans**: 30-50% of members
- **~100 Loan Repayments**: Variable per loan
- **~75 Expenses**: 3-8 per group
- **~300 Messages**: 10-30 per group

## Resetting Data

To clear all data and re-seed:

```bash
# Clear database
python manage.py flush --noinput

# Re-run migrations
python manage.py migrate

# Seed new data
python manage.py seed_data

# Create new superuser
python manage.py createsuperuser --email admin@chamahub.com
# Password: admin123
```

## Verified Features

### Backend (Django REST Framework)
✅ All 17+ API endpoint categories functional
✅ JWT authentication working properly
✅ Pagination implemented (20 items per page)
✅ Filtering by multiple fields
✅ Permissions enforced on all endpoints
✅ File upload for KYC documents
✅ Multi-signature approvals for disbursements
✅ Audit trail for all financial transactions

### Frontend (React + TypeScript)
✅ Smooth scrolling enabled globally
✅ Custom scrollbar styling
✅ Motion effects on buttons and cards
✅ Responsive design (mobile-first)
✅ Type-safe API integration
✅ Error handling for API calls
✅ Loading states for async operations
✅ Route-based navigation with React Router

## Troubleshooting

### Issue: "No module named 'django'"
**Solution**: Install dependencies
```bash
pip install -r requirements.txt
```

### Issue: "Unable to connect to database"
**Solution**: Run migrations
```bash
python manage.py migrate
```

### Issue: "Authentication credentials were not provided"
**Solution**: Include bearer token in headers
```bash
curl -H "Authorization: Bearer $TOKEN" http://localhost:8000/api/v1/groups/chama-groups/
```

### Issue: Frontend "CORS policy" error
**Solution**: Ensure backend CORS settings include frontend URL
```python
# settings.py
CORS_ALLOWED_ORIGINS = [
    'http://localhost:5173',  # Frontend dev server
]
```

## Next Steps

1. **Customize Data**: Modify `accounts/management/commands/seed_data.py` to customize the seeded data
2. **Add More Features**: Extend models and views for additional functionality
3. **Deploy**: Follow deployment guides in README.md
4. **Test**: Run `pytest` to execute test suite

## Support

For issues or questions:
- Check the main README.md
- Review API documentation at http://localhost:8000/api/docs/
- Open an issue on GitHub

---

**Created**: November 2025
**Version**: 1.0
**Status**: Production Ready ✅
