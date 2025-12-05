# 🔧 CORS Troubleshooting Guide

## Problem: Login/Registration Not Working in Production

If your superuser login and registration work locally but fail when deployed, the issue is almost always **CORS (Cross-Origin Resource Sharing)** configuration.

---

## 🎯 Quick Fix

### Step 1: Identify Your Frontend URL
- Example: `https://chama-hub-qe2d.onrender.com`
- Example: `https://your-app.vercel.app`

### Step 2: Add to Backend Environment Variables

Go to your **backend** deployment (Render/Railway/etc) and add:

```bash
CORS_ALLOWED_ORIGINS=https://your-frontend-url.com
```

**Multiple frontends?** Separate with commas:
```bash
CORS_ALLOWED_ORIGINS=https://frontend1.com,https://frontend2.com,https://app.vercel.app
```

### Step 3: Redeploy Backend
- The backend service should auto-redeploy when you update environment variables
- If not, trigger a manual deployment

### Step 4: Test
- Try logging in from your frontend
- Check browser console (F12) for errors
- Should see no CORS errors

---

## 🔍 How to Diagnose CORS Issues

### Symptoms
- ✗ Login/registration forms submit but nothing happens
- ✗ Browser console shows "CORS policy blocked" errors
- ✗ Network tab shows requests with status "(failed)" or "CORS error"
- ✗ Backend logs show no incoming requests (requests blocked before reaching backend)

### Check Browser Console
1. Open your frontend app
2. Press **F12** to open Developer Tools
3. Go to **Console** tab
4. Try to login
5. Look for errors like:
   ```
   Access to XMLHttpRequest at 'https://backend.com/api/token/' 
   from origin 'https://frontend.com' has been blocked by CORS policy
   ```

### Check Network Tab
1. Open Developer Tools (F12)
2. Go to **Network** tab
3. Try to login
4. Look for the login request
5. If it shows "CORS error" or is red, it's a CORS issue

---

## 🛠️ Configuration Options

### Option 1: Specific Origins (Recommended for Production)
Most secure - only allow specific frontend URLs:

```bash
# In your backend environment variables
CORS_ALLOWED_ORIGINS=https://your-frontend.onrender.com,https://your-app.vercel.app
```

### Option 2: Regex Patterns (Good for Multiple Subdomains)
Allow all subdomains from a trusted domain:

```bash
# Allow all *.onrender.com subdomains
CORS_ALLOWED_ORIGIN_REGEXES=^https://.*\.onrender\.com$

# Multiple patterns
CORS_ALLOWED_ORIGIN_REGEXES=^https://.*\.onrender\.com$,^https://.*\.vercel\.app$
```

### Option 3: Allow All Origins (ONLY for Development/Testing)
⚠️ **NOT SECURE** - Do not use in production!

```bash
# Temporary testing only!
CORS_ALLOW_ALL_ORIGINS=True
```

### Note: Recent Fix
As of the latest update, the backend now includes comprehensive CORS headers configuration:
- `CORS_ALLOW_HEADERS` - Allows necessary request headers (authorization, content-type, etc.)
- `CORS_ALLOW_METHODS` - Allows all necessary HTTP methods (GET, POST, OPTIONS, etc.)
- `CORS_EXPOSE_HEADERS` - Exposes necessary response headers

These settings are already configured in the backend, so you only need to set `CORS_ALLOWED_ORIGINS` to your frontend URL.

---

## 📋 Complete Deployment Checklist

### Backend Setup (Django)
- [ ] `CORS_ALLOWED_ORIGINS` includes your frontend URL
- [ ] `ALLOWED_HOSTS` includes your backend domain
- [ ] `DEBUG=False` in production
- [ ] `SECRET_KEY` is unique and secret
- [ ] Database is connected (`DATABASE_URL` set)

### Frontend Setup
- [ ] `VITE_API_URL` points to your backend URL
  ```bash
  # Example
  VITE_API_URL=https://your-backend.onrender.com/api/v1
  ```
- [ ] Frontend is deployed and accessible
- [ ] HTTPS is enabled (most platforms do this automatically)

### Test After Setup
- [ ] Can access backend API docs at `https://backend.com/api/docs/`
- [ ] Can access frontend at `https://frontend.com`
- [ ] Can register a new user from frontend
- [ ] Can login from frontend
- [ ] Browser console shows no CORS errors

---

## 🚨 Common Mistakes

### 1. Using HTTP Instead of HTTPS
```bash
# ❌ Wrong - mixing HTTP and HTTPS
CORS_ALLOWED_ORIGINS=http://frontend.onrender.com

# ✅ Correct - both use HTTPS in production
CORS_ALLOWED_ORIGINS=https://frontend.onrender.com
```

### 2. Trailing Slashes
```bash
# ❌ Wrong - has trailing slash
CORS_ALLOWED_ORIGINS=https://frontend.com/

# ✅ Correct - no trailing slash
CORS_ALLOWED_ORIGINS=https://frontend.com
```

### 3. Wrong Domain
```bash
# ❌ Wrong - using backend URL
CORS_ALLOWED_ORIGINS=https://backend.onrender.com

# ✅ Correct - using frontend URL
CORS_ALLOWED_ORIGINS=https://frontend.onrender.com
```

### 4. Localhost in Production
```bash
# ❌ Wrong - localhost won't work in production
CORS_ALLOWED_ORIGINS=http://localhost:5173

# ✅ Correct - actual production URL
CORS_ALLOWED_ORIGINS=https://your-app.onrender.com
```

### 5. Not Including Port Numbers (if needed)
```bash
# ❌ Wrong - if frontend uses custom port
CORS_ALLOWED_ORIGINS=https://frontend.com

# ✅ Correct - include port if non-standard
CORS_ALLOWED_ORIGINS=https://frontend.com:3000
```

---

## 🔬 Advanced Debugging

### Test CORS with curl
```bash
# Test if backend accepts requests from your frontend
curl -H "Origin: https://your-frontend.com" \
     -H "Access-Control-Request-Method: POST" \
     -H "Access-Control-Request-Headers: Content-Type" \
     -X OPTIONS \
     https://your-backend.com/api/token/

# Should return headers including:
# Access-Control-Allow-Origin: https://your-frontend.com
# Access-Control-Allow-Credentials: true
```

### Check Django Settings
SSH into your backend server and run:
```bash
python manage.py shell
```

Then check:
```python
from django.conf import settings
print("CORS_ALLOWED_ORIGINS:", settings.CORS_ALLOWED_ORIGINS)
print("CORS_ALLOW_ALL_ORIGINS:", settings.CORS_ALLOW_ALL_ORIGINS)
print("CORS_ALLOWED_ORIGIN_REGEXES:", settings.CORS_ALLOWED_ORIGIN_REGEXES)
```

### View Environment Variables
In Render/Railway dashboard:
1. Go to your backend service
2. Click "Environment" tab
3. Check `CORS_ALLOWED_ORIGINS` is set correctly
4. No quotes needed: `https://frontend.com` not `"https://frontend.com"`

---

## 📱 Frontend Configuration

### Axios Setup (src/services/api.ts)
```typescript
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Important for CORS with credentials
});
```

### Environment Variables (.env.production)
```bash
VITE_API_URL=https://your-backend.onrender.com/api/v1
```

---

## 🎓 Understanding CORS

### What is CORS?
CORS (Cross-Origin Resource Sharing) is a security feature that browsers use to block requests from one domain to another domain.

### Why Does It Exist?
To prevent malicious websites from making requests to your API on behalf of users.

### When Is It a Problem?
- Frontend at `https://frontend.com`
- Backend at `https://backend.com`
- Browser blocks frontend → backend requests by default

### How to Fix?
Tell the backend "it's okay to accept requests from this frontend":
```bash
CORS_ALLOWED_ORIGINS=https://frontend.com
```

---

## 📞 Still Having Issues?

### Check These:
1. ✅ Frontend URL is correct and accessible
2. ✅ Backend URL is correct and accessible
3. ✅ Both use HTTPS (or both use HTTP in local development)
4. ✅ No trailing slashes in URLs
5. ✅ Environment variables are set in the **backend** deployment
6. ✅ Backend has been redeployed after environment variable changes
7. ✅ Browser cache is cleared

### Get More Help:
- Check browser console for exact error messages
- Check backend logs for incoming requests
- Test with curl to isolate the issue
- Create an issue on GitHub with error details

---

## 📚 Related Documentation
- [Django CORS Headers](https://github.com/adamchainz/django-cors-headers)
- [MDN CORS Guide](https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS)
- [Render Deployment Guide](./DEPLOY_RENDER.md)
- [Full Setup Guide](./docs/01-initial-setup.md)

---

**Last Updated:** November 2025
