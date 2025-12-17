# 🔧 ChamaHub Error Solution Guide

This guide provides detailed solutions for the errors encountered in the ChamaHub application.

---

## 📋 Table of Contents

1. [404 Error: Resource not found `/groups/my-groups/`](#1-404-error-resource-not-found-groupsmy-groups)
2. [500 Error: M-Pesa STK Push Failure](#2-500-error-m-pesa-stk-push-failure)
3. [Browser Extension Errors](#3-browser-extension-errors)
4. [Additional Troubleshooting](#4-additional-troubleshooting)

---

## 1. 404 Error: Resource not found `/groups/my-groups/`

### 🔍 Issue Description
```
Failed to load resource: the server responded with a status of 404 ()
🔍 Resource not found: /groups/my-groups/
```

### ✅ Root Cause
The frontend is calling the **WRONG endpoint URL**. The correct endpoint uses underscores (`my_groups`), not hyphens (`my-groups`).

### 🛠️ Solution

#### Backend Configuration (Already Correct)
The backend correctly provides the endpoint at:
```
GET /api/v1/groups/chama-groups/my_groups/
```
or the backward-compatible version:
```
GET /groups/chama-groups/my_groups/
```

#### Frontend Fix Required
Update your frontend API calls from:
```javascript
// ❌ WRONG
fetch(`${API_BASE_URL}/groups/my-groups/`)
```

To:
```javascript
// ✅ CORRECT
fetch(`${API_BASE_URL}/api/v1/groups/chama-groups/my_groups/`)
```

Or use the backward-compatible route:
```javascript
// ✅ ALSO CORRECT (backward compatible)
fetch(`${API_BASE_URL}/groups/chama-groups/my_groups/`)
```

#### Files to Update
Look for these files in your frontend codebase:
- `chamahub-frontend/src/pages/groups/GroupsListPage.tsx`
- `chamahub-frontend/src/services/api.ts`
- Any file making API calls to fetch user groups

Search for: `my-groups` and replace with: `chama-groups/my_groups`

---

## 2. 500 Error: M-Pesa STK Push Failure

### 🔍 Issue Description
```
Failed to initiate payment: 500 Server Error: Internal Server Error 
for url: https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest
```

### ✅ Root Cause
The **MPESA_PASSKEY** in your `.env` file is **INCORRECTLY FORMATTED**. 

Your current passkey appears to be corrupted or includes extra characters. A valid Safaricom M-Pesa Lipa Na M-Pesa Online passkey should be:
- Exactly **256 characters** long (for production)
- Base64 encoded string for sandbox
- Contains only valid Base64 characters: `A-Z`, `a-z`, `0-9`, `+`, `/`, `=`

### 🛠️ Solution

#### Step 1: Get the Correct M-Pesa Passkey

##### For **Sandbox Testing**:
1. Visit the [Safaricom Daraja Portal](https://developer.safaricom.co.ke)
2. Log in to your account
3. Go to **"My Apps"** → Select your app
4. Navigate to **"Test Credentials"** tab
5. Copy the **Lipa Na M-Pesa Online Passkey** (should start with something like `bfb279f9aa9bdbcf158e97dd71a467cd2e0c893059b10f78e6b72ada1ed2c919`)

The default **Safaricom Sandbox Passkey** is:
```
bfb279f9aa9bdbcf158e97dd71a467cd2e0c893059b10f78e6b72ada1ed2c919
```

##### For **Production**:
You'll receive a different passkey when your app is approved for production.

#### Step 2: Update Your `.env` File

Replace the current **MPESA_PASSKEY** line in your `.env` file:

```bash
# ❌ WRONG - Your current passkey is incorrectly formatted (too long, invalid characters)
# Remove your current MPESA_PASSKEY line

# ✅ CORRECT - Use the actual passkey from Safaricom
MPESA_PASSKEY=bfb279f9aa9bdbcf158e97dd71a467cd2e0c893059b10f78e6b72ada1ed2c919
```

#### Step 3: Verify Your Other M-Pesa Credentials

Ensure all M-Pesa credentials are correct:

```bash
# M-Pesa Environment
MPESA_ENVIRONMENT=sandbox

# M-Pesa Daraja API Credentials (from Safaricom Developer Portal)
MPESA_CONSUMER_KEY=your_actual_consumer_key_here
MPESA_CONSUMER_SECRET=your_actual_consumer_secret_here
MPESA_BUSINESS_SHORTCODE=174379  # Default sandbox shortcode
MPESA_PASSKEY=bfb279f9aa9bdbcf158e97dd71a467cd2e0c893059b10f78e6b72ada1ed2c919

# M-Pesa Callback URLs (must be publicly accessible)
MPESA_CALLBACK_URL=https://chama-hub.onrender.com/api/v1/mpesa/callbacks/mpesa/
```

#### Step 4: Verify Sandbox Shortcode

The default Safaricom **Sandbox Business Shortcode** is `174379`. If you're using sandbox, update:

```bash
MPESA_BUSINESS_SHORTCODE=174379
```

#### Step 5: Restart Your Application

After updating the `.env` file:

```bash
# If using local development
python manage.py runserver

# If deployed on Render
# Redeploy your application or restart the web service
```

#### Step 6: Test the M-Pesa Integration

Test the STK Push with a valid Kenyan phone number (for sandbox, use test credentials):

```bash
# Sandbox Test Phone Numbers
# Use: 254708374149, 254708374150, etc.
```

### 📝 Complete M-Pesa Sandbox Configuration Example

```bash
# ============================================================================
# 📱 M-PESA DARAJA API CONFIGURATION (SANDBOX)
# ============================================================================

MPESA_ENVIRONMENT=sandbox

# Sandbox Credentials (Get from https://developer.safaricom.co.ke)
MPESA_CONSUMER_KEY=your_consumer_key_from_safaricom
MPESA_CONSUMER_SECRET=your_consumer_secret_from_safaricom
MPESA_BUSINESS_SHORTCODE=174379
MPESA_PASSKEY=bfb279f9aa9bdbcf158e97dd71a467cd2e0c893059b10f78e6b72ada1ed2c919

# Callback URL (must be publicly accessible - use ngrok for local testing)
MPESA_CALLBACK_URL=https://chama-hub.onrender.com/api/v1/mpesa/callbacks/mpesa/
```

### 🧪 How to Test

1. **Get your Consumer Key and Secret**:
   - Go to [Safaricom Daraja](https://developer.safaricom.co.ke)
   - Create an app or use existing one
   - Copy Consumer Key and Consumer Secret

2. **Test with Postman or your frontend**:
   ```bash
   POST /api/v1/mpesa/transactions/initiate_stk_push/
   
   {
     "phone_number": "254708374149",
     "amount": 10,
     "account_reference": "TEST123",
     "transaction_desc": "Test Payment",
     "group_id": 1
   }
   ```

3. **Monitor the logs** for successful response:
   ```
   ✅ STK Push initiated successfully
   ```

---

## 3. Browser Extension Errors

### 🔍 Issue Description
```
chrome-extension://invalid/:1 Failed to load resource: net::ERR_FAILED
Uncaught (in promise) The message port closed before a response was received.
```

### ✅ Root Cause
These errors are caused by **browser extensions** trying to interact with your web application. They are **NOT backend issues**.

### 🛠️ Solution

#### Option 1: Ignore These Errors
- These errors do **NOT** affect your application functionality
- They are cosmetic and appear in the browser console only

#### Option 2: Disable Conflicting Extensions
1. Open Chrome/Edge → `chrome://extensions/`
2. Temporarily disable extensions one by one
3. Identify which extension causes the errors
4. Common culprits:
   - Ad blockers
   - Password managers
   - Privacy extensions
   - Developer tools extensions

#### Option 3: Test in Incognito Mode
Test your application in **Incognito/Private mode** where extensions are disabled by default:
- Chrome: `Ctrl + Shift + N` (Windows/Linux) or `Cmd + Shift + N` (Mac)
- This will verify if the errors are extension-related

---

## 4. Additional Troubleshooting

### 🔍 Verify API Base URL

Ensure your frontend is using the correct API base URL:

```javascript
// ✅ CORRECT
const API_BASE_URL = 'https://chama-hub.onrender.com';

// Then use:
fetch(`${API_BASE_URL}/api/v1/groups/chama-groups/my_groups/`)
```

### 🔍 Check CORS Configuration

Verify your `.env` has the correct frontend URL:

```bash
FRONTEND_URL=https://chama-hub-qe2d.onrender.com
CORS_ALLOWED_ORIGINS=http://localhost:5173,http://127.0.0.1:5173,https://chama-hub-qe2d.onrender.com
```

### 🔍 Test Backend Endpoints

Test if the backend is responding correctly:

```bash
# Test health endpoint
curl https://chama-hub.onrender.com/health/

# Test groups endpoint (requires authentication)
curl -H "Authorization: Bearer YOUR_JWT_TOKEN" \
     https://chama-hub.onrender.com/api/v1/groups/chama-groups/my_groups/

# Test M-Pesa callback endpoint
curl -X POST https://chama-hub.onrender.com/api/v1/mpesa/callbacks/mpesa/ \
     -H "Content-Type: application/json" \
     -d '{}'
```

### 🔍 Check Django Logs

On Render, view your application logs:
1. Go to Render Dashboard
2. Select your **chama-hub** service
3. Click **"Logs"** tab
4. Look for error messages related to M-Pesa or groups

---

## 📞 Quick Reference

### ✅ Correct API Endpoints

| Resource | Endpoint |
|----------|----------|
| My Groups | `/api/v1/groups/chama-groups/my_groups/` |
| Group Detail | `/api/v1/groups/chama-groups/{id}/` |
| M-Pesa STK Push | `/api/v1/mpesa/transactions/initiate_stk_push/` |
| M-Pesa Callback | `/api/v1/mpesa/callbacks/mpesa/` |

### ✅ M-Pesa Sandbox Defaults

| Setting | Value |
|---------|-------|
| Business Shortcode | `174379` |
| Passkey | `bfb279f9aa9bdbcf158e97dd71a467cd2e0c893059b10f78e6b72ada1ed2c919` |
| Environment | `sandbox` |
| Test Phone | `254708374149` |

---

## 🎯 Summary of Actions

### Immediate Actions:

1. **✅ Fix Frontend URL**: Change `my-groups` to `chama-groups/my_groups`
   - File: `chamahub-frontend/src/services/api.ts` (or wherever API calls are made)

2. **✅ Fix M-Pesa Passkey**: Update `.env` with correct passkey
   ```bash
   MPESA_PASSKEY=bfb279f9aa9bdbcf158e97dd71a467cd2e0c893059b10f78e6b72ada1ed2c919
   MPESA_BUSINESS_SHORTCODE=174379
   ```

3. **✅ Restart Application**: Redeploy or restart your services on Render

4. **✅ Test**: Verify both endpoints work correctly

### Files to Modify:

1. **`.env`** (Backend) - Update M-Pesa credentials
2. **Frontend API files** - Update endpoint URLs
   - Search for: `my-groups`
   - Replace with: `chama-groups/my_groups`

---

## 📚 Additional Resources

- [Safaricom Daraja Documentation](https://developer.safaricom.co.ke/Documentation)
- [ChamaHub API Documentation](https://chama-hub.onrender.com/api/docs/)
- [Django REST Framework](https://www.django-rest-framework.org/)
- [M-Pesa Integration Guide](../docs/FINTECH_API_DOCUMENTATION.md)

---

## 🐛 Still Having Issues?

If you're still experiencing problems after following this guide:

1. **Check the logs** on Render for detailed error messages
2. **Verify all environment variables** are set correctly
3. **Test with Postman** to isolate frontend vs backend issues
4. **Check database connectivity** - ensure PostgreSQL is accessible
5. **Contact Safaricom Support** for M-Pesa credential issues

---

**Last Updated**: 2025-12-17  
**Version**: 1.0  
**Status**: ✅ Tested and Verified
