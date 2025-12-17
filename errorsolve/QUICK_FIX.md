# ⚡ Quick Fix Guide

## 🔥 Immediate Fixes Needed

### 1. Fix Frontend API Call ❌ → ✅

**WRONG URL:**
```
/groups/my-groups/
```

**CORRECT URL:**
```
/api/v1/groups/chama-groups/my_groups/
```

**Search in your frontend code for:**
```javascript
// Find this:
"my-groups"

// Replace with:
"chama-groups/my_groups"
```

---

### 2. Fix M-Pesa Passkey in `.env` ❌ → ✅

**Open your `.env` file and change:**

```bash
# ❌ REMOVE THIS (incorrect passkey)
MPESA_PASSKEY=RWloVyZPbhuyDg61sWXWFnrSfpV/vAaF546NWF258Y7H1+cjUBcOjZWHwMPs4JBl9au0D9TmzHntiIbk8bLRRo3Cd3GArgVNXlKX0PpfHl8eJiIPXv8vRqZKW32EpL3mpyuI4RqSM+VEtXrAccQ1/f/p9mfHUnveWTq6F9l8tXH6PAIB68d2claoGaK4cGMKr5JqzDroYXGXgsqgNGfDZEZA0zTMp3D76P35C9wkK/mmX9sY+svdrFEwHjZ/X2GCDgIj6I3APQN84XlVcrX8+jGVm1x0TxLsQj9ZrmB8cgWKa8DG7zIc3WkD9kolL/RxI97gPXbGOa7b40zR/awRUg==

# ✅ ADD THIS (correct sandbox passkey)
MPESA_PASSKEY=bfb279f9aa9bdbcf158e97dd71a467cd2e0c893059b10f78e6b72ada1ed2c919
MPESA_BUSINESS_SHORTCODE=174379
```

---

### 3. Restart Your Application

```bash
# If on Render: Go to dashboard and click "Manual Deploy" or restart service

# If local:
python manage.py runserver
```

---

## 🎯 That's It!

These two changes will fix:
- ✅ 404 Error on `/groups/my-groups/`
- ✅ 500 Error on M-Pesa STK Push

---

## 📝 Files You Need to Edit

### Backend (`.env` file):
```
/home/runner/work/ProDev-Backend/ProDev-Backend/.env
```

### Frontend (Likely locations):
```
chamahub-frontend/src/services/api.ts
chamahub-frontend/src/pages/groups/GroupsListPage.tsx
```

**Search for:** `my-groups`  
**Replace with:** `chama-groups/my_groups`

---

## 🧪 Test After Fixing

### Test 1: Groups Endpoint
```bash
curl -H "Authorization: Bearer YOUR_TOKEN" \
     https://chama-hub.onrender.com/api/v1/groups/chama-groups/my_groups/
```

**Expected:** HTTP 200 with list of groups

### Test 2: M-Pesa STK Push
```bash
curl -X POST https://chama-hub.onrender.com/api/v1/mpesa/transactions/initiate_stk_push/ \
     -H "Authorization: Bearer YOUR_TOKEN" \
     -H "Content-Type: application/json" \
     -d '{
       "phone_number": "254708374149",
       "amount": 10,
       "account_reference": "TEST",
       "transaction_desc": "Test"
     }'
```

**Expected:** HTTP 201 with "STK Push initiated successfully"

---

## 🚨 Browser Extension Errors?

**Ignore these errors** - they don't affect your app:
```
chrome-extension://invalid/:1 Failed to load resource: net::ERR_FAILED
```

These are from browser extensions, not your backend.

---

## ✅ Checklist

- [ ] Updated M-Pesa passkey in `.env`
- [ ] Updated shortcode to `174379` in `.env`
- [ ] Fixed frontend URL from `my-groups` to `chama-groups/my_groups`
- [ ] Restarted/redeployed application
- [ ] Tested groups endpoint
- [ ] Tested M-Pesa STK Push

---

**Need more details?** See [ERROR_SOLUTION_GUIDE.md](./ERROR_SOLUTION_GUIDE.md)
