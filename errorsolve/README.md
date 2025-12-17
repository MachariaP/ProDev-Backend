# 🔧 Error Solutions Directory

This directory contains comprehensive guides to fix common errors in the ChamaHub application.

---

## 📁 Files in This Directory

### 1. [QUICK_FIX.md](./QUICK_FIX.md) ⚡
**Start here for immediate solutions!**
- Quick 2-minute fixes for the most common errors
- Minimal reading, maximum action
- Perfect for when you need to fix things fast

### 2. [ERROR_SOLUTION_GUIDE.md](./ERROR_SOLUTION_GUIDE.md) 📚
**Complete troubleshooting guide**
- Detailed explanations of all errors
- Root cause analysis
- Step-by-step solutions
- Testing procedures
- Additional resources

---

## 🐛 Errors Covered

### ✅ 404 Error: `/groups/my-groups/`
- **Quick Fix**: [QUICK_FIX.md - Section 1](./QUICK_FIX.md#1-fix-frontend-api-call-)
- **Detailed Guide**: [ERROR_SOLUTION_GUIDE.md - Section 1](./ERROR_SOLUTION_GUIDE.md#1-404-error-resource-not-found-groupsmy-groups)

### ✅ 500 Error: M-Pesa STK Push Failure
- **Quick Fix**: [QUICK_FIX.md - Section 2](./QUICK_FIX.md#2-fix-m-pesa-passkey-in-env-)
- **Detailed Guide**: [ERROR_SOLUTION_GUIDE.md - Section 2](./ERROR_SOLUTION_GUIDE.md#2-500-error-m-pesa-stk-push-failure)

### ✅ Browser Extension Errors
- **Quick Fix**: Ignore them (not backend issues)
- **Detailed Guide**: [ERROR_SOLUTION_GUIDE.md - Section 3](./ERROR_SOLUTION_GUIDE.md#3-browser-extension-errors)

---

## 🚀 Getting Started

### If you're in a hurry:
1. Open [QUICK_FIX.md](./QUICK_FIX.md)
2. Follow the 2 main fixes
3. Restart your app
4. Test

### If you want to understand the issues:
1. Open [ERROR_SOLUTION_GUIDE.md](./ERROR_SOLUTION_GUIDE.md)
2. Read the relevant section
3. Follow the detailed steps
4. Learn from the explanations

---

## 🎯 Summary of Main Issues

| Error | Issue | Solution |
|-------|-------|----------|
| **404** | Wrong endpoint URL | Change `my-groups` → `chama-groups/my_groups` |
| **500** | Invalid M-Pesa passkey | Use correct sandbox passkey from Safaricom |
| **Extension** | Browser extension conflicts | Ignore or disable extensions |

---

## 📝 Quick Reference

### Correct API Endpoints:
```
✅ /api/v1/groups/chama-groups/my_groups/
✅ /api/v1/mpesa/transactions/initiate_stk_push/
✅ /api/v1/mpesa/callbacks/mpesa/
```

### M-Pesa Sandbox Credentials:
```bash
MPESA_BUSINESS_SHORTCODE=174379
MPESA_PASSKEY=bfb279f9aa9bdbcf158e97dd71a467cd2e0c893059b10f78e6b72ada1ed2c919
MPESA_ENVIRONMENT=sandbox
```

---

## 🤝 Contributing

Found a new error and solution? 
1. Document it clearly
2. Add it to the appropriate guide
3. Update this README
4. Submit a PR

---

## 📞 Need More Help?

- **API Documentation**: https://chama-hub.onrender.com/api/docs/
- **Safaricom Daraja**: https://developer.safaricom.co.ke
- **Project Docs**: [../docs/](../docs/)

---

**Created**: 2025-12-17  
**Last Updated**: 2025-12-17  
**Status**: ✅ Active
