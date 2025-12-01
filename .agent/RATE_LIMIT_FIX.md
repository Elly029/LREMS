# Rate Limiting Fix Guide

## Problem
Your application is experiencing **429 (Too Many Requests)** errors from the Railway backend. This happens because:
1. Backend has a rate limit of **100 requests per 15 minutes** (default)
2. Frontend makes multiple simultaneous API calls on page load
3. No retry logic was in place to handle rate limit errors

## Solutions Implemented

### ✅ Frontend Fix (Already Applied)
The API client (`src/api/client.ts`) now includes:
- **Automatic retry with exponential backoff** for 429 errors
- **Up to 3 retry attempts** with increasing delays (1s, 2s, 4s)
- **Respects `Retry-After` header** if provided by server

### 🔧 Backend Fix (Action Required)

You need to increase the rate limit on your Railway backend:

#### Option 1: Via Railway Dashboard (Recommended)
1. Go to your Railway project: https://railway.app
2. Select your **backend service**
3. Go to **Variables** tab
4. Add/update these environment variables:
   ```
   RATE_LIMIT_WINDOW_MS=900000
   RATE_LIMIT_MAX_REQUESTS=1000
   ```
5. Click **Deploy** to apply changes

#### Option 2: Via Railway CLI
```bash
# Set rate limit to 1000 requests per 15 minutes
railway variables set RATE_LIMIT_MAX_REQUESTS=1000

# Optionally increase the window (e.g., 30 minutes)
railway variables set RATE_LIMIT_WINDOW_MS=1800000
```

## Recommended Settings

### For Production
```env
RATE_LIMIT_WINDOW_MS=900000    # 15 minutes
RATE_LIMIT_MAX_REQUESTS=1000   # 1000 requests per window
```

### For Heavy Traffic
```env
RATE_LIMIT_WINDOW_MS=900000    # 15 minutes
RATE_LIMIT_MAX_REQUESTS=5000   # 5000 requests per window
```

### For Development/Testing
```env
RATE_LIMIT_WINDOW_MS=900000    # 15 minutes
RATE_LIMIT_MAX_REQUESTS=10000  # Very high limit
```

## Additional Optimizations

### 1. Reduce Unnecessary API Calls
Review your components to ensure they're not making redundant API calls:
- Use React Query or SWR for caching
- Debounce search inputs
- Batch related requests

### 2. Implement Request Queuing
For critical operations, consider implementing a request queue to prevent overwhelming the server.

### 3. Monitor Rate Limit Headers
The backend sends these headers:
- `X-RateLimit-Limit`: Maximum requests allowed
- `X-RateLimit-Remaining`: Requests remaining
- `X-RateLimit-Reset`: When the limit resets

## Testing the Fix

1. **Deploy the frontend** with the updated API client
2. **Update backend environment variables** on Railway
3. **Test the application** - it should now handle rate limits gracefully
4. **Monitor the logs** for retry messages

## Current Status

✅ **Frontend**: Updated with automatic retry logic
⏳ **Backend**: Awaiting environment variable update on Railway

Once you update the Railway environment variables, the rate limiting issue should be resolved!
