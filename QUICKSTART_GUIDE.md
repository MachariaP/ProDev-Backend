# ChamaHub - Quick Start Guide

This guide will get you up and running with ChamaHub in 5 minutes!

## Prerequisites

- Python 3.12+
- Node.js 18+
- PostgreSQL (optional - defaults to SQLite for development)

## Backend Setup (2 minutes)

```bash
# 1. Install Python dependencies
pip install -r requirements.txt

# 2. Run database migrations
python manage.py migrate

# 3. Seed database with 50 African members and 15 groups
python manage.py seed_data

# 4. Create superuser (optional - already created by seeder)
# Email: admin@chamahub.com
# Password: admin123

# 5. Start backend server
python manage.py runserver
```

Backend will be available at: **http://localhost:8000**

## Frontend Setup (2 minutes)

```bash
# 1. Navigate to frontend directory
cd chamahub-frontend

# 2. Install dependencies
npm install

# 3. Start development server
npm run dev
```

Frontend will be available at: **http://localhost:5173**

## Login Credentials

**Superuser:**
- Email: `admin@chamahub.com`
- Password: `admin123`

**Sample Users:**
- Email: `amara.okonkwo1@example.com`
- Password: `password123`

(All seeded users use password: `password123`)

## What You'll See

### Dashboard
- Overview statistics (total groups, contributions, loans)
- Recent activity feed
- Quick actions panel

### Groups
- 15 pre-seeded chama groups
- Various types: Savings, Investment, Welfare, Mixed
- 8-15 members per group

### Finance
- Contributions tracking
- Loan management
- Expense recording
- Transaction history

### Features
✅ **50 African members** with realistic data
✅ **15 diverse groups** across different categories
✅ **750+ contributions** already recorded
✅ **200+ loans** with various statuses
✅ **75+ expenses** categorized and tracked
✅ **300+ group messages** for communication
✅ **Smooth navigation** with animations
✅ **Responsive design** for mobile and desktop

## API Documentation

Access interactive API docs at:
- Swagger UI: http://localhost:8000/api/docs/
- ReDoc: http://localhost:8000/api/redoc/

## Need Help?

See detailed guides:
- `SEEDING_AND_TESTING_GUIDE.md` - Complete testing and data guide
- `README.md` - Full documentation and deployment guides
- `API_README.md` - API endpoint documentation

## Quick Commands

```bash
# Reset and re-seed database
python manage.py flush --noinput && python manage.py migrate && python manage.py seed_data

# Run backend tests
pytest

# Run frontend tests
cd chamahub-frontend && npm test

# Build frontend for production
cd chamahub-frontend && npm run build
```

## Troubleshooting

**Backend not starting?**
```bash
pip install -r requirements.txt
python manage.py migrate
```

**Frontend not loading?**
```bash
cd chamahub-frontend
npm install
```

**Can't login?**
- Check that backend is running at http://localhost:8000
- Use credentials: `admin@chamahub.com` / `admin123`

---

🎉 **You're all set! Enjoy using ChamaHub!**
