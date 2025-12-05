# Deploy ChamaHub Frontend to Render

This guide will help you deploy the ChamaHub frontend application to [Render](https://render.com).

## Prerequisites

- A Render account ([sign up here](https://render.com))
- This repository pushed to GitHub, GitLab, or Bitbucket

## Quick Deploy

### Option 1: Deploy using render.yaml (Recommended)

1. **Connect your repository to Render:**
   - Log into [Render Dashboard](https://dashboard.render.com)
   - Click "New +" button and select "Blueprint"
   - Connect your repository
   - Render will automatically detect the `render.yaml` file

2. **Configure environment variables:**
   - Set `VITE_API_URL` to your backend API URL (e.g., `https://your-backend.onrender.com/api/v1`)

3. **Deploy:**
   - Click "Apply" to deploy
   - Render will automatically build and deploy your application

### Option 2: Manual Deployment

1. **Create a new Web Service:**
   - Log into [Render Dashboard](https://dashboard.render.com)
   - Click "New +" → "Web Service"
   - Connect your repository

2. **Configure the service:**
   - **Name:** `chamahub-frontend` (or your preferred name)
   - **Runtime:** `Node`
   - **Build Command:** `npm install && npm run build`
   - **Start Command:** `npm start`
   - **Instance Type:** Free (or choose based on your needs)

3. **Add environment variables:**
   - Click "Environment" tab
   - Add environment variable:
     - Key: `VITE_API_URL`
     - Value: Your backend API URL (e.g., `https://your-backend.onrender.com/api/v1`)

4. **Deploy:**
   - Click "Create Web Service"
   - Render will automatically build and deploy your application

## Environment Variables

The following environment variable should be configured in Render:

| Variable | Description | Example |
|----------|-------------|---------|
| `VITE_API_URL` | Backend API base URL | `https://chamahub-backend.onrender.com/api/v1` |
| `NODE_ENV` | Node environment (automatically set to `production`) | `production` |

## Post-Deployment

After deployment:

1. **Verify the deployment:**
   - Visit your Render app URL (e.g., `https://chamahub-frontend.onrender.com`)
   - Check that the application loads correctly

2. **Test API connectivity:**
   - Try logging in or making API calls
   - Ensure the backend API URL is correctly configured

3. **Custom Domain (Optional):**
   - Go to "Settings" → "Custom Domains"
   - Add your custom domain
   - Update DNS records as instructed by Render

## Build Configuration

The application is configured with the following build settings:

- **Build Command:** `npm install && npm run build`
  - Installs dependencies
  - Compiles TypeScript
  - Builds optimized production bundle using Vite

- **Start Command:** `npm start`
  - Serves the built static files using Vite preview server
  - Listens on all network interfaces (0.0.0.0)
  - Uses the PORT environment variable provided by Render (defaults to 4173 locally)

## Troubleshooting

### Build Fails

**Issue:** Build fails with TypeScript errors
- **Solution:** Run `npm run build` locally to identify and fix type errors

**Issue:** Out of memory during build
- **Solution:** Upgrade to a paid Render instance with more resources

### Application Not Loading

**Issue:** Blank page or 404 errors
- **Solution:** Check the build output in Render logs to ensure files are generated in `dist/` directory

**Issue:** API calls failing
- **Solution:** Verify `VITE_API_URL` environment variable is correctly set
- **Solution:** Check backend CORS settings to allow requests from your Render frontend URL

### Performance Issues

**Issue:** Slow initial load
- **Solution:** Consider enabling gzip compression (Render does this automatically)
- **Solution:** Implement code splitting in the application

## Continuous Deployment

Render automatically deploys your application when you push changes to your repository's default branch:

1. Push changes to your repository
2. Render detects the changes
3. Automatically builds and deploys the new version

You can configure this behavior in Render's service settings.

## Monitoring

Monitor your deployment:

- **Logs:** View real-time logs in the Render dashboard
- **Metrics:** Check CPU, memory, and bandwidth usage
- **Alerts:** Set up notifications for deployment failures

## Cost

- **Free Tier:** Includes 750 hours/month (with automatic sleep after 15 minutes of inactivity)
- **Paid Plans:** Start at $7/month for always-on instances with more resources

For more information, visit [Render Pricing](https://render.com/pricing).

## Support

- [Render Documentation](https://render.com/docs)
- [Vite Deployment Guide](https://vitejs.dev/guide/static-deploy.html)
- [ChamaHub Repository](https://github.com/MachariaP/chamahub-frontend)

---

**Note:** Make sure your backend API is deployed and accessible before deploying the frontend. Update the `VITE_API_URL` environment variable to point to your backend API URL.
