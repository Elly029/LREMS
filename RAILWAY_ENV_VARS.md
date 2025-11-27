# 🔐 Railway Environment Variables - Quick Reference

## Backend Service Environment Variables

Copy and paste these into Railway's Variables tab for your **Backend** service:

```bash
NODE_ENV=production
DATABASE_URL=mongodb+srv://YOUR_USER:YOUR_PASSWORD@YOUR_CLUSTER.mongodb.net/lrems?retryWrites=true&w=majority
JWT_SECRET=REPLACE_WITH_RANDOM_32_CHAR_STRING
JWT_REFRESH_SECRET=REPLACE_WITH_DIFFERENT_RANDOM_32_CHAR_STRING
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d
BCRYPT_ROUNDS=12
CORS_ORIGIN=https://your-frontend-url.up.railway.app
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
LOG_LEVEL=info
```

### ⚠️ Important Notes for Backend:

1. **DATABASE_URL**: Get this from MongoDB Atlas
   - Go to MongoDB Atlas → Connect → Connect your application
   - Copy the connection string and replace `<password>` with your actual password
   - Add database name `/lrems` before the `?`

2. **JWT Secrets**: Generate secure random strings
   ```bash
   # Run this twice to get two different secrets:
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   ```

3. **CORS_ORIGIN**: 
   - Initially set to `*` or leave as `http://localhost:5173`
   - After frontend is deployed, update to: `https://your-frontend-url.up.railway.app`
   - **No trailing slash!**

---

## Frontend Service Environment Variables

Copy and paste this into Railway's Variables tab for your **Frontend** service:

```bash
VITE_API_BASE_URL=https://your-backend-url.up.railway.app/api
```

### ⚠️ Important Notes for Frontend:

1. **VITE_API_BASE_URL**: 
   - Get your backend URL from Railway after backend is deployed
   - Should be: `https://your-backend-url.up.railway.app/api`
   - **Include `/api` at the end!**
   - **No trailing slash after `/api`!**

---

## 📝 Deployment Order

1. **Deploy Backend First**
   - Set all backend environment variables
   - Deploy and get the backend URL
   - Test: `https://your-backend.up.railway.app/health`

2. **Deploy Frontend Second**
   - Set `VITE_API_BASE_URL` to your backend URL + `/api`
   - Deploy frontend
   - Get the frontend URL

3. **Update Backend CORS**
   - Go back to backend service
   - Update `CORS_ORIGIN` to your frontend URL
   - Save (Railway will auto-redeploy)

---

## ✅ Validation Checklist

### Backend is working when:
- [ ] Health check responds: `https://backend-url.up.railway.app/health`
- [ ] Returns: `{"status":"OK", ...}`
- [ ] No errors in Railway logs

### Frontend is working when:
- [ ] Can access: `https://frontend-url.up.railway.app`
- [ ] Login page loads
- [ ] Can login with credentials
- [ ] No CORS errors in browser console

### Integration is working when:
- [ ] Backend CORS_ORIGIN matches frontend URL
- [ ] Frontend VITE_API_BASE_URL matches backend URL
- [ ] Can perform all operations (create, edit, delete books, etc.)

---

## 🎯 Example Configuration

### Backend Variables (Example)
```
NODE_ENV=production
DATABASE_URL=mongodb+srv://lrems_user:MySecurePass123@cluster0.ab1cd.mongodb.net/lrems?retryWrites=true&w=majority
JWT_SECRET=a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6
JWT_REFRESH_SECRET=p6o5n4m3l2k1j0i9h8g7f6e5d4c3b2a1
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d
BCRYPT_ROUNDS=12
CORS_ORIGIN=https://lrems-frontend.up.railway.app
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
LOG_LEVEL=info
```

### Frontend Variables (Example)
```
VITE_API_BASE_URL=https://lrems-backend.up.railway.app/api
```

---

## 🐛 Common Issues

### Issue: CORS Error
**Solution**: Make sure `CORS_ORIGIN` in backend exactly matches frontend URL (no trailing slash, use https://)

### Issue: Cannot connect to database
**Solution**: 
- Check MongoDB Atlas IP whitelist includes `0.0.0.0/0`
- Verify DATABASE_URL has correct username, password, and database name

### Issue: Environment variables not working
**Solution**: 
- Railway environment variables are case-sensitive
- After changing variables, Railway auto-redeploys
- Wait for redeployment to complete

### Issue: 404 on API calls
**Solution**: 
- Ensure `VITE_API_BASE_URL` ends with `/api` (no trailing slash)
- Backend should be deployed and accessible

---

## 🔄 How to Update Environment Variables

1. Go to Railway project
2. Click on the service (Backend or Frontend)
3. Go to "Variables" tab
4. Click "New Variable" or edit existing ones
5. Save - Railway will automatically redeploy

---

**💡 Pro Tip**: Keep a copy of your production environment variables in a secure password manager!
