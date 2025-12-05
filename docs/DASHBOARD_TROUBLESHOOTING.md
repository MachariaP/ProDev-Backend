# Dashboard Troubleshooting Guide

## Issue: Dashboard Failed to Load at http://localhost:5173/dashboard

This guide helps you resolve issues with the ChamaHub dashboard not loading properly.

---

## 🔍 Quick Diagnosis

**Symptom:** Visiting `http://localhost:5173/dashboard` shows an error or blank page.

**Common Causes:**
1. Backend server not running (port 8000)
2. Frontend server not running (port 5173)
3. Missing `.env` file in frontend
4. No authenticated user session
5. API connectivity issues (CORS, authentication)

---

## ✅ Step-by-Step Fix

### 1. Automated Setup (Recommended)

Run the setup script to configure everything automatically:

```bash
./setup_dashboard.sh
```

Then follow the instructions to start both servers.

### 2. Manual Setup

If the automated setup doesn't work, follow these steps:

#### A. Backend Setup

```bash
# Install Python dependencies
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt

# Setup database
python manage.py migrate

# Create test user
python manage.py createsuperuser
# OR use the existing test account:
# Email: test@example.com
# Password: password123

# Start backend server
python manage.py runserver
```

**Expected output:** `Starting development server at http://127.0.0.1:8000/`

#### B. Frontend Setup

```bash
# Navigate to frontend directory
cd chamahub-frontend

# Create .env file
echo "VITE_API_URL=http://localhost:8000/api/v1" > .env

# Install dependencies
npm install

# Start frontend server
npm run dev
```

**Expected output:** `Local: http://localhost:5173/`

---

## 🧪 Testing

### 1. Test Backend API

```bash
# Get JWT token
curl -X POST http://localhost:8000/api/token/ \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com", "password": "password123"}'
```

**Expected:** JSON response with `access` and `refresh` tokens.

### 2. Test Frontend Access

Open browser and visit: `http://localhost:5173`

**Expected:** Login page should load.

### 3. Test Dashboard Access

1. Log in with credentials:
   - Email: `test@example.com`
   - Password: `password123`

2. You should be redirected to `/dashboard`

**Expected:** Dashboard with charts, stats, and transaction list.

---

## 🐛 Common Issues & Solutions

### Issue 1: "Failed to load dashboard" Error

**Cause:** No groups exist for the logged-in user.

**Solution:**
```python
# Create a test group via Django shell
python manage.py shell

from accounts.models import User
from groups.models import ChamaGroup, GroupMembership

user = User.objects.get(email='test@example.com')
group = ChamaGroup.objects.create(
    name='Test Chama',
    group_type='SAVINGS',
    description='Test savings group',
    created_by=user
)
GroupMembership.objects.create(
    group=group,
    user=user,
    role='ADMIN',
    status='ACTIVE'
)
```

### Issue 2: CORS Errors in Browser Console

**Cause:** Backend CORS configuration not allowing frontend origin.

**Solution:** Check `chamahub/settings.py`:
```python
CORS_ALLOWED_ORIGINS = [
    'http://localhost:3000',
    'http://localhost:5173',  # Vite default port
]
```

### Issue 3: 401 Unauthorized Errors

**Cause:** JWT token expired or missing.

**Solution:**
1. Clear browser localStorage
2. Log out and log in again
3. Check that tokens are being saved to localStorage

### Issue 4: Port Already in Use

**Backend (port 8000):**
```bash
# Find and kill process
lsof -ti:8000 | xargs kill -9
# Or use a different port
python manage.py runserver 8001
```

**Frontend (port 5173):**
```bash
# Vite will automatically try the next available port
# Or kill the process
lsof -ti:5173 | xargs kill -9
```

### Issue 5: Charts Not Rendering

**Cause:** Chart width/height calculation issues.

**Solution:** This is usually a timing issue. The charts should render after a moment. If they don't:
1. Refresh the page
2. Check browser console for errors
3. Ensure recharts is properly installed: `npm install recharts`

### Issue 6: Cannot Connect to Backend

**Symptoms:** Network errors, "Failed to fetch"

**Checklist:**
- [ ] Backend server is running (`http://localhost:8000`)
- [ ] Frontend `.env` file exists with correct API URL
- [ ] CORS is configured in backend settings
- [ ] Firewall/antivirus not blocking connections

**Test backend connectivity:**
```bash
curl http://localhost:8000/api/v1/groups/chama-groups/
```

---

## 🔧 Environment Configuration

### Backend (.env in project root)

```env
SECRET_KEY=your-secret-key-here
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1
CORS_ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5173
```

### Frontend (.env in chamahub-frontend/)

```env
VITE_API_URL=http://localhost:8000/api/v1
```

---

## 📊 Verify Dashboard is Working

Once both servers are running:

1. **Visit:** `http://localhost:5173`
2. **Login:** Use test credentials
3. **Check:** You should see:
   - Performance metrics (ROI, Savings Growth, etc.)
   - Quick stats (Pending Actions, Meetings, etc.)
   - Charts (Contribution Trend, Weekly Activity)
   - Recent Transactions list
   - Quick Actions buttons

---

## 🆘 Still Having Issues?

### Enable Debug Mode

**Backend:**
1. Check Django error logs in terminal
2. Enable Django Debug Toolbar (if needed)

**Frontend:**
1. Open browser DevTools (F12)
2. Check Console tab for JavaScript errors
3. Check Network tab for failed API requests

### Collect Information

When reporting issues, include:
- [ ] Error messages from browser console
- [ ] Error messages from backend terminal
- [ ] Network requests from browser DevTools
- [ ] Python version: `python --version`
- [ ] Node version: `node --version`
- [ ] Operating system

---

## 📝 Quick Reference

| Component | Port | URL | Status Check |
|-----------|------|-----|--------------|
| Backend API | 8000 | http://localhost:8000 | `curl http://localhost:8000/admin/` |
| Frontend | 5173 | http://localhost:5173 | Open in browser |
| Dashboard | 5173 | http://localhost:5173/dashboard | Login required |

---

## ✨ Success Checklist

- [ ] Backend server running on port 8000
- [ ] Frontend server running on port 5173
- [ ] `.env` file exists in `chamahub-frontend/`
- [ ] Database migrations applied
- [ ] Test user created
- [ ] Test group created for user
- [ ] Can log in at http://localhost:5173/auth/login
- [ ] Dashboard loads at http://localhost:5173/dashboard
- [ ] Charts and data display correctly

---

**Last Updated:** 2025-11-23
