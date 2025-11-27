# 🚂 Railway Deployment Guide for LR-EMS

This guide will walk you through deploying the LR-EMS (Learning Resource Evaluation Management System) to Railway.app.

## 📋 Prerequisites

- [x] Railway.app account (free tier available)
- [x] MongoDB Atlas account (for production database)
- [x] Code pushed to GitHub repository: `https://github.com/Elly029/LREMS`

## 🗄️ Step 1: Set up MongoDB Atlas

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a new cluster (free M0 tier is available)
3. Set up database access:
   - Create a database user with username and password
   - Save these credentials securely
4. Set up network access:
   - Click "Network Access" → "Add IP Address"
   - Select "Allow access from anywhere" (0.0.0.0/0) for Railway
5. Get your connection string:
   - Click "Connect" → "Connect your application"
   - Copy the connection string (looks like: `mongodb+srv://username:password@cluster.mongodb.net/`)
   - Replace `<password>` with your actual password
   - Add your database name before the `?` (e.g., `lrems`)

**Example Connection String:**
```
mongodb+srv://youruser:yourpassword@cluster0.xxxxx.mongodb.net/lrems?retryWrites=true&w=majority
```

## 🚀 Step 2: Deploy Backend to Railway

### 2.1 Create New Project

1. Login to [Railway.app](https://railway.app)
2. Click "New Project"
3. Select "Deploy from GitHub repo"
4. Authorize Railway to access your GitHub
5. Select the repository: `Elly029/LREMS`

### 2.2 Configure Backend Service

1. Railway will detect your backend automatically
2. Go to your project settings
3. Set the **Root Directory** to `backend`
4. Set the **Start Command** to `npm start`

### 2.3 Set Environment Variables

Go to the "Variables" tab and add these environment variables:

| Variable Name | Value | Notes |
|--------------|-------|-------|
| `NODE_ENV` | `production` | Required |
| `DATABASE_URL` | `mongodb+srv://...` | Your MongoDB Atlas connection string |
| `JWT_SECRET` | `[generate-random-32-chars]` | Generate a secure random string |
| `JWT_REFRESH_SECRET` | `[generate-random-32-chars]` | Generate a different secure random string |
| `JWT_EXPIRES_IN` | `15m` | Token expiration time |
| `JWT_REFRESH_EXPIRES_IN` | `7d` | Refresh token expiration |
| `BCRYPT_ROUNDS` | `12` | Password hashing rounds |
| `CORS_ORIGIN` | `https://your-frontend.up.railway.app` | Will update after frontend deployment |
| `RATE_LIMIT_WINDOW_MS` | `900000` | 15 minutes in milliseconds |
| `RATE_LIMIT_MAX_REQUESTS` | `100` | Max requests per window |
| `LOG_LEVEL` | `info` | Logging level |

**Generate Secure Secrets:**
```bash
# Run this in your terminal to generate secure secrets:
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### 2.4 Deploy Backend

1. Click "Deploy" or push changes to Github (auto-deploys)
2. Wait for deployment to complete
3. Copy your backend URL (e.g., `https://your-backend.up.railway.app`)
4. Test the health endpoint: `https://your-backend.up.railway.app/health`

## 🎨 Step 3: Deploy Frontend to Railway

### 3.1 Create Frontend Service

1. In the same Railway project, click "New Service"
2. Select "Deploy from GitHub repo"
3. Select the same repository: `Elly029/LREMS`

### 3.2 Configure Frontend Service

1. Set the **Root Directory** to leave empty (frontend is in root)
2. Set the **Build Command** to `npm run build`
3. Set the **Start Command** to `npm run preview`

### 3.3 Set Frontend Environment Variables

| Variable Name | Value | Notes |
|--------------|-------|-------|
| `VITE_API_URL` | `https://your-backend.up.railway.app` | Your backend URL from Step 2.4 |

### 3.4 Update Backend CORS

1. Go back to your backend service
2. Update the `CORS_ORIGIN` environment variable
3. Set it to your frontend URL: `https://your-frontend.up.railway.app`
4. Railway will auto-redeploy the backend

## ✅ Step 4: Verify Deployment

### 4.1 Test Backend
```bash
# Health check
curl https://your-backend.up.railway.app/health

# Should return:
# {"status":"OK","timestamp":"...","uptime":...}
```

### 4.2 Test Frontend
1. Visit your frontend URL: `https://your-frontend.up.railway.app`
2. Try logging in with your credentials
3. Test creating/editing books, evaluators, etc.

## 🔄 Step 5: Set Up Auto-Deployment

Railway automatically deploys when you push to your `main` branch!

1. Make changes locally
2. Commit: `git commit -m "Your message"`
3. Push: `git push origin main`
4. Railway automatically deploys both services

## 📝 Environment Variables Quick Reference

### Backend (.env for Railway)
```bash
NODE_ENV=production
DATABASE_URL=mongodb+srv://user:pass@cluster.mongodb.net/lrems
JWT_SECRET=your-secure-random-string-32-chars
JWT_REFRESH_SECRET=your-other-secure-random-string
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d
BCRYPT_ROUNDS=12
CORS_ORIGIN=https://your-frontend.up.railway.app
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
LOG_LEVEL=info
```

### Frontend (.env for Railway)
```bash
VITE_API_URL=https://your-backend.up.railway.app
```

## 🐛 Troubleshooting

### Database Connection Error
- **Problem**: `MongoServerError: bad auth`
- **Solution**: Check your DATABASE_URL has the correct username and password
- **Solution**: Verify MongoDB Atlas allows connections from anywhere (0.0.0.0/0)

### CORS Error
- **Problem**: CORS errors in browser console
- **Solution**: Ensure `CORS_ORIGIN` in backend matches your frontend URL exactly
- **Solution**: Check that both URLs use `https://` (not `http://`)

### 500 Internal Server Error
- **Problem**: API returns 500 errors
- **Solution**: Check Railway logs: Click your backend service → "Logs" tab
- **Solution**: Verify all environment variables are set correctly

### Frontend Can't Connect to Backend
- **Problem**: Network errors, API calls fail
- **Solution**: Check `VITE_API_URL` is set correctly in frontend environment variables
- **Solution**: Verify backend is deployed and accessible at `/health` endpoint

## 📊 Monitoring

### View Logs
1. Go to Railway project
2. Click on a service (backend or frontend)
3. Click the "Logs" tab
4. View real-time logs

### View Metrics
1. Click "Metrics" tab in your service
2. Monitor CPU, Memory, Network usage

## 💰 Costs

Railway free tier includes:
- $5 of usage per month
- 500 hours of usage
- Perfect for small projects and testing

For production, consider:
- Railway Pro: $20/month
- MongoDB Atlas M2: ~$9/month

## 🔐 Security Checklist

- [ ] Generated strong random JWT secrets
- [ ] Set NODE_ENV to production
- [ ] Database credentials are in environment variables (not code)
- [ ] CORS_ORIGIN is set to specific frontend URL
- [ ] MongoDB Atlas network access configured
- [ ] Rate limiting enabled

## 📞 Support

If you encounter issues:
1. Check Railway logs
2. Check MongoDB Atlas connection
3. Verify all environment variables
4. Review this guide
5. Contact Railway support or check their docs

---

**🎉 Congratulations!** Your LR-EMS is now deployed on Railway!
