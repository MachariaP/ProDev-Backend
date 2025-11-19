# 🚀 Quick Deploy to Render

**Deploy your ProDev-Backend Django app to Render in 45 minutes!**

---

## 📖 Full Guide

For complete step-by-step instructions with screenshots and troubleshooting, see:

👉 **[Complete Render Deployment Guide](./docs/RENDER_DEPLOYMENT.md)**

---

## ⚡ Quick Start (5 Steps)

### 1️⃣ Prerequisites
- ✅ GitHub account
- ✅ Your code pushed to GitHub
- ✅ 45 minutes of time

### 2️⃣ Create Render Account
- Go to [render.com](https://render.com)
- Sign up with GitHub
- Verify email

### 3️⃣ Create PostgreSQL Database
1. Dashboard → **New +** → **PostgreSQL**
2. Name: `chamahub-db`
3. Click **Create Database**
4. Copy **Internal Database URL**

### 4️⃣ Deploy Web Service
1. Dashboard → **New +** → **Web Service**
2. Connect your GitHub repo
3. Configure:
   - **Build Command:** `./build.sh`
   - **Start Command:** `gunicorn chamahub.wsgi:application --bind 0.0.0.0:$PORT`

### 5️⃣ Set Environment Variables
Add in Environment tab:
```bash
SECRET_KEY=your-generated-secret-key
DEBUG=False
ALLOWED_HOSTS=your-app-name.onrender.com
DATABASE_URL=<paste-from-step-3>
CORS_ALLOWED_ORIGINS=https://your-frontend-app.onrender.com
# OR use regex for all onrender.com subdomains:
# CORS_ALLOWED_ORIGIN_REGEXES=^https://.*\.onrender\.com$
```

**Important for Frontend Integration:**
- If you have a separate frontend deployment, add its URL to `CORS_ALLOWED_ORIGINS`
- For multiple frontends: `CORS_ALLOWED_ORIGINS=https://frontend1.com,https://frontend2.com`
- For development/testing only: `CORS_ALLOW_ALL_ORIGINS=True` (NOT recommended for production!)

Click **Create Web Service** → Wait 5-10 minutes → Done! 🎉

---

## 🔧 After Deployment

### Create Admin User
1. Go to your service → **Shell** tab
2. Run: `python manage.py createsuperuser`
3. Access admin: `https://your-app.onrender.com/admin`

### Access Your App
- **API:** `https://your-app-name.onrender.com/api/v1/`
- **Admin:** `https://your-app-name.onrender.com/admin`
- **API Docs:** `https://your-app-name.onrender.com/api/schema/swagger-ui/`

---

## 💰 Pricing

| Service | Free Tier | Paid |
|---------|-----------|------|
| Web Service | ✅ 750 hrs/mo (spins down after 15 min) | $7/mo (always on) |
| PostgreSQL | ✅ 90 days free | $7/mo |
| Redis | ✅ 90 days free | $7/mo |

**Total:** FREE for 90 days, then $7-21/month

---

## 🆘 Common Issues

### Build Failed?
- Check `build.sh` is executable: `chmod +x build.sh`
- Verify `requirements.txt` has all dependencies

### Database Connection Error?
- Use **Internal Database URL**, not External
- Format: `postgresql://user:pass@host:port/dbname`

### Static Files Missing?
- Ensure `whitenoise` is in `requirements.txt`
- Check `build.sh` runs `collectstatic`

### Login/Registration Not Working? (CORS Error)
- **Symptom:** Frontend shows errors like "Network Error" or "CORS policy blocked"
- **Fix:** Add your frontend URL to backend's `CORS_ALLOWED_ORIGINS` environment variable
- **Example:** `CORS_ALLOWED_ORIGINS=https://your-frontend.onrender.com`
- **For multiple frontends:** Separate with commas: `https://app1.com,https://app2.com`
- **Quick test (development only):** Set `CORS_ALLOW_ALL_ORIGINS=True` temporarily
- **Check browser console:** Look for "Access-Control-Allow-Origin" errors

### App Won't Start?
- Verify Procfile uses correct WSGI path
- Check logs for Python errors

**More solutions:** [Full Troubleshooting Guide](./docs/RENDER_DEPLOYMENT.md#9-troubleshooting)

---

## 📚 Related Guides

- [Complete Render Guide](./docs/RENDER_DEPLOYMENT.md) - Full step-by-step with screenshots
- [Railway/DigitalOcean Guide](./docs/03-deployment.md) - Alternative platforms
- [Initial Setup](./docs/01-initial-setup.md) - Getting started
- [Production Features](./docs/06-production-features.md) - Celery, Redis, monitoring

---

## 🎯 Next Steps After Deployment

1. ✅ **Custom Domain** - Add `api.yourdomain.com`
2. ✅ **Monitoring** - Setup Sentry for error tracking
3. ✅ **CI/CD** - Auto-deploy on git push (already enabled!)
4. ✅ **Frontend** - Deploy React/Vue frontend
5. ✅ **Background Tasks** - Add Celery worker for emails

---

**Need help?** Check the [Full Guide](./docs/RENDER_DEPLOYMENT.md) or open an issue!

**Happy Deploying! 🚀**
