# Quick Deployment Checklist for Render

Follow these steps to deploy your ChamaHub frontend to Render:

## Pre-Deployment Checklist

- [ ] Ensure backend API is deployed and accessible
- [ ] Have your backend API URL ready (e.g., `https://your-backend.onrender.com/api/v1`)
- [ ] Ensure all code is committed and pushed to your repository

## Deployment Steps

### 1. Create Render Account (if needed)
- [ ] Sign up at [render.com](https://render.com)
- [ ] Connect your GitHub/GitLab/Bitbucket account

### 2. Deploy via Blueprint (Recommended)
- [ ] Click "New +" → "Blueprint" in Render Dashboard
- [ ] Select your `chamahub-frontend` repository
- [ ] Render auto-detects `render.yaml` file
- [ ] Click "Apply" to create the service

### 3. Configure Environment Variables
- [ ] Navigate to your web service in Render Dashboard
- [ ] Go to "Environment" tab
- [ ] Add environment variable:
  - **Key:** `VITE_API_URL`
  - **Value:** Your backend API URL
- [ ] Save changes (this will trigger a redeploy)

### 4. Verify Deployment
- [ ] Wait for build to complete (check "Logs" tab)
- [ ] Visit your Render app URL (e.g., `https://chamahub-frontend.onrender.com`)
- [ ] Verify the application loads without errors
- [ ] Test login/API connectivity

### 5. Optional: Custom Domain
- [ ] Go to "Settings" → "Custom Domains"
- [ ] Add your custom domain
- [ ] Update DNS records as instructed
- [ ] Wait for SSL certificate provisioning

## Post-Deployment

- [ ] Update backend CORS settings to allow requests from your Render URL
- [ ] Test all major features (login, dashboard, navigation)
- [ ] Share the URL with stakeholders
- [ ] Monitor logs for any errors

## Troubleshooting Quick Fixes

**Build fails?**
- Check the Logs tab for specific error messages
- Verify all dependencies are in package.json

**API not connecting?**
- Verify VITE_API_URL is set correctly
- Check backend CORS configuration
- Ensure backend is deployed and running

**Blank page?**
- Check browser console for JavaScript errors
- Verify build completed successfully in Render logs

## Files Created for Render Deployment

- ✅ `render.yaml` - Render service configuration
- ✅ `.env.example` - Environment variables template
- ✅ `RENDER_DEPLOYMENT.md` - Comprehensive deployment guide
- ✅ Updated `package.json` with start script
- ✅ Updated `vite.config.ts` with preview configuration

## Need Help?

- See detailed guide: [RENDER_DEPLOYMENT.md](./RENDER_DEPLOYMENT.md)
- Render docs: [render.com/docs](https://render.com/docs)
- Check repository issues

---

**Estimated Deployment Time:** 5-10 minutes

**Note:** Free tier services sleep after 15 minutes of inactivity. First request after sleep may take 30-60 seconds.
