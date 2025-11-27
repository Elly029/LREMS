# Railway Frontend Deployment - Environment Variable Fix

## Problem
The frontend is making requests to `/auth/login` instead of `/api/auth/login` because the `VITE_API_BASE_URL` environment variable is not set during the build process on Railway.

## Solution

### Step 1: Set Environment Variable in Railway

1. Go to your Railway project dashboard
2. Click on your **frontend service** (lrems or whatever you named it)
3. Go to the **Variables** tab
4. Click **+ New Variable**
5. Add the following variable:
   ```
   Key: VITE_API_BASE_URL
   Value: https://backend-production-27eda.up.railway.app/api
   ```
   
   **Important:** Make sure the URL includes `/api` at the end!

### Step 2: Redeploy the Frontend

After adding the environment variable:
1. Go to the **Deployments** tab
2. Click on the latest deployment
3. Click **Redeploy** (or trigger a new deployment by pushing to your repo)

### Step 3: Verify

Once redeployed:
1. Open your frontend URL in the browser
2. Try to login
3. Check the browser developer console (F12 → Network tab)
4. Verify that login requests are going to: `https://backend-production-27eda.up.railway.app/api/auth/login`

## Why This Happens

Vite (the frontend build tool) replaces `import.meta.env.VITE_*` variables at **build time**, not runtime. This means:
- If the variable isn't set when building, it uses the default value
- The default is `http://localhost:3000/api` which is wrong for production
- You must set `VITE_API_BASE_URL` as an environment variable in Railway **before** building

## Railway Environment Variables Checklist

### Frontend Service
- ✅ `VITE_API_BASE_URL=https://backend-production-27eda.up.railway.app/api`

### Backend Service  
- ✅ `DATABASE_URL` (should be automatically set by PostgreSQL/MongoDB service)
- ✅ `CORS_ORIGIN=https://lrems.up.railway.app`
- ✅ `NODE_ENV=production`
- ✅ `JWT_SECRET` (set to a secure random string)
- ✅ `PORT` (Railway sets this automatically, but you can verify it's available)

## Additional Notes

- The backend URL in `VITE_API_BASE_URL` must match your actual backend Railway URL
- Always include `/api` at the end of the backend URL
- After changing environment variables, you **must** redeploy for changes to take effect
- For Vite apps, environment variables starting with `VITE_` are exposed to the client-side code
