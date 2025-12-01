# 🚀 Update Railway Environment Variables - Step by Step

## ⚠️ CRITICAL: This Must Be Done to Fix 429 Errors

Your application is currently experiencing **429 (Too Many Requests)** errors because the backend rate limit is too low.

---

## 📋 Quick Fix (5 minutes)

### Option A: Via Railway Web Dashboard (Recommended)

1. **Open Railway Dashboard**
   - Go to: https://railway.app
   - Log in to your account

2. **Select Your Backend Service**
   - Click on your project (likely named something like "book-data-management-system")
   - Click on the **backend** service (NOT the frontend)

3. **Navigate to Variables Tab**
   - In the backend service view, click on the **"Variables"** tab

4. **Add/Update the Rate Limit Variable**
   - Look for `RATE_LIMIT_MAX_REQUESTS`
   - If it exists, click to edit it
   - If it doesn't exist, click **"New Variable"**
   
   **Add this variable:**
   ```
   Variable Name: RATE_LIMIT_MAX_REQUESTS
   Value: 1000
   ```

5. **Deploy the Changes**
   - Railway will show a prompt to redeploy
   - Click **"Deploy"** or the deployment will happen automatically
   - Wait for the deployment to complete (usually 1-2 minutes)

6. **Verify the Fix**
   - Once deployed, refresh your frontend application
   - The 429 errors should be gone!

---

### Option B: Via Railway CLI (Alternative)

If you prefer using the command line:

1. **Install Railway CLI**
   ```powershell
   npm install -g @railway/cli
   ```

2. **Login to Railway**
   ```powershell
   railway login
   ```

3. **Link to Your Project**
   ```powershell
   cd d:\book-data-management-system
   railway link
   ```

4. **Set the Environment Variable**
   ```powershell
   # Make sure you're in the backend service context
   railway variables set RATE_LIMIT_MAX_REQUESTS=1000
   ```

5. **Trigger Deployment**
   ```powershell
   railway up
   ```

---

## 🎯 What This Does

- **Current Limit**: 100 requests per 15 minutes
- **New Limit**: 1000 requests per 15 minutes
- **Impact**: 10x more capacity for API requests

This should completely eliminate the 429 errors you're experiencing.

---

## 🔍 How to Verify It Worked

1. **Check Railway Logs**
   - In Railway dashboard, go to your backend service
   - Click on **"Deployments"** tab
   - View the latest deployment logs
   - Look for: `Rate limit: 1000 requests per 900000ms`

2. **Test Your Application**
   - Open your frontend application
   - Login
   - Navigate between different views (Inventory, Monitoring, etc.)
   - Check browser console - no more 429 errors!

3. **Monitor Rate Limit Headers**
   - Open browser DevTools (F12)
   - Go to Network tab
   - Make an API request
   - Check response headers for:
     - `X-RateLimit-Limit: 1000`
     - `X-RateLimit-Remaining: 999` (or similar)

---

## 📊 Recommended Settings by Use Case

### For Production (Current Need)
```
RATE_LIMIT_MAX_REQUESTS=1000
RATE_LIMIT_WINDOW_MS=900000  (15 minutes - default)
```

### For Heavy Traffic
```
RATE_LIMIT_MAX_REQUESTS=5000
RATE_LIMIT_WINDOW_MS=900000
```

### For Development/Testing
```
RATE_LIMIT_MAX_REQUESTS=10000
RATE_LIMIT_WINDOW_MS=900000
```

---

## ❓ Troubleshooting

### Still Getting 429 Errors After Update?

1. **Wait for Deployment**
   - Make sure the deployment completed successfully
   - Check Railway deployment status

2. **Clear Browser Cache**
   - Hard refresh: `Ctrl + Shift + R`
   - Or clear browser cache completely

3. **Check Correct Service**
   - Ensure you updated the **backend** service, not frontend
   - The backend URL should be: `https://backend1-production-3a62.up.railway.app`

4. **Verify Environment Variable**
   - In Railway dashboard, check that the variable is set correctly
   - No typos in the variable name

### Need More Help?

- Check Railway deployment logs for errors
- Verify the backend is running: visit `https://backend1-production-3a62.up.railway.app/health`
- Contact Railway support if deployment issues persist

---

## ✅ Next Steps After Fix

Once the rate limit is updated:

1. ✅ Frontend already has retry logic (implemented)
2. ✅ Chat polling optimized to 30 seconds (implemented)
3. 🎉 Your application should work smoothly!

---

**Estimated Time**: 5 minutes
**Difficulty**: Easy
**Impact**: Fixes all 429 errors immediately
