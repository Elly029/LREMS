# Production Database - User Seeding Guide

## Problem
The Railway production database doesn't have any users, so you can't log in (401 Unauthorized).

## Solution: Seed Users in Production

### Option 1: Run Seed Script via Railway CLI (Recommended)

1. **Open terminal in the backend directory**
2. **Run the seed script via Railway:**
   ```bash
   npx @railway/cli run npm run seed:users
   ```

   This will connect to the production MongoDB database and create all the default users.

### Option 2: Create Admin User via Railway Console

If the above doesn't work, you can use Railway's Run Command feature:

1. Go to Railway Dashboard → Your backend service
2. Click on **"Settings"** tab
3. Scroll to **"Deploy"** section
4. Under **"One-off Command"**, enter:
   ```bash
   npm run seed:users
   ```
5. Click **"Run"**

### Option 3: Add Seed Script to package.json (If Not Present)

Check if `backend/package.json` has the seed script. If not, add it:

```json
{
  "scripts": {
    "seed:users": "ts-node src/scripts/seed_users.ts"
  }
}
```

Then run using Railway CLI or the console.

## Default Admin Credentials

After seeding, you can log in with any of these admin accounts:

| Username | Password | Role |
|----------|----------|------|
| `celso` | `BLRFACI123` | Admin |
| `leo` | `BLRFACI123` | Admin |
| `nonie` | `BLRFACI123` | Admin (Full Access) |
| `jc` | `BLRFACI123` | Admin (Full Access) |
| `admin-l` | `BLRFACI123` | Admin (Full Access) |
| `admin-c` | `BLRFACI123` | Admin (Full Access) |

## Verification

1. After running the seed script, check the logs to confirm:
   ```
   ✅ All users seeded successfully.
   ```

2. Try logging in with one of the admin credentials above

3. If login works, you should see the dashboard

## Troubleshooting

### Error: "Cannot find module 'ts-node'"

If you get this error, you need to install ts-node in the backend:
```bash
cd backend
npm install --save-dev ts-node
```

Then try running the seed script again.

### Alternative: Use Compiled JavaScript

If ts-node doesn't work, run the compiled version:
```bash
npx @railway/cli run node dist/scripts/seed_users.js
```

Make sure the script has been compiled first:
```bash
npx @railway/cli run npm run build
npx @railway/cli run node dist/scripts/seed_users.js
```

## For Local Development

To seed your local database:
```bash
cd backend
npm run seed:users
```

Or directly with ts-node:
```bash
cd backend
npx ts-node src/scripts/seed_users.ts
```
