# Session Caching & Automatic Invalidation System

## Overview

The LR-EMS now implements an intelligent session caching system that automatically detects when a user's access permissions have changed and forces them to re-login. This prevents the issue where users see outdated data after their access rules are modified.

---

## How It Works

### 1. **Version Tracking**

Each user has an `access_rules_version` field that increments whenever their access rules are modified:

```typescript
interface User {
  username: string;
  access_rules: AccessRule[];
  access_rules_version: number; // Starts at 1, increments on change
  // ... other fields
}
```

### 2. **Login Process**

When a user logs in:
1. Server sends user data including `access_rules_version`
2. Frontend stores this in localStorage
3. Token is cached in the browser

```typescript
{
  "_id": "123",
  "username": "rejoice",
  "access_rules": [{ "learning_areas": ["Language", "Filipino"], "grade_levels": [] }],
  "access_rules_version": 2,  // ← Version number
  "token": "eyJhbGc..."
}
```

### 3. **Automatic Validation**

The frontend automatically validates the session every **5 minutes**:

```typescript
useSessionValidation({
  user,
  onSessionInvalid: handleLogout,
  validationInterval: 5 * 60 * 1000, // 5 minutes
});
```

**Validation Process:**
1. Frontend sends current `access_rules_version` to server
2. Server compares with database version
3. If versions don't match → session is invalid
4. User is automatically logged out with a message

### 4. **Access Rule Updates**

When an admin updates access rules:

```typescript
// Update access rules
user.access_rules = [newAccessRule];
user.access_rules_version = (user.access_rules_version || 1) + 1; // Increment
await user.save();
```

This increment triggers automatic logout for that user on their next validation check (within 5 minutes).

---

## Implementation Details

### Backend Changes

#### 1. **User Model** (`backend/src/models/User.ts`)

Added `access_rules_version` field:

```typescript
const UserSchema = new Schema({
  // ... existing fields
  access_rules_version: {
    type: Number,
    default: 1,
  },
});
```

#### 2. **Login Endpoint** (`backend/src/routes/auth.ts`)

Returns version in login response:

```typescript
res.json({
  _id: user._id,
  username: user.username,
  access_rules: user.access_rules,
  access_rules_version: user.access_rules_version || 1, // ← Include version
  token: generateToken(user._id),
});
```

#### 3. **Validation Endpoint** (`POST /api/auth/validate`)

New endpoint to check session validity:

```typescript
router.post('/validate', protect, async (req, res) => {
  const { access_rules_version } = req.body;
  const user = await User.findById(req.user._id);
  
  const currentVersion = user.access_rules_version || 1;
  const clientVersion = access_rules_version || 1;
  
  if (currentVersion !== clientVersion) {
    return res.json({
      valid: false,
      reason: 'access_rules_changed',
      message: 'Your access permissions have been updated. Please log in again.'
    });
  }
  
  res.json({ valid: true });
});
```

#### 4. **Update Scripts**

All scripts that modify access rules now increment the version:

```typescript
user.access_rules = [newRule];
user.access_rules_version = (user.access_rules_version || 1) + 1;
await user.save();
```

**Scripts Updated:**
- `backend/scripts/update-facilitator-access.ts`
- Any future scripts that modify access rules

### Frontend Changes

#### 1. **User Type** (`src/types.ts`)

Added version field:

```typescript
export interface User {
  _id: string;
  username: string;
  access_rules?: AccessRule[];
  access_rules_version?: number; // ← New field
  token: string;
}
```

#### 2. **Session Validation Hook** (`src/hooks/useSessionValidation.ts`)

New custom hook that:
- Validates session every 5 minutes
- Checks if `access_rules_version` matches server
- Automatically logs out user if version mismatch
- Shows user-friendly message

```typescript
export const useSessionValidation = ({
  user,
  onSessionInvalid,
  validationInterval = 5 * 60 * 1000,
}) => {
  // Validates session periodically
  // Calls onSessionInvalid if version mismatch
};
```

#### 3. **App Integration** (`src/App.tsx`)

Hook is used in main App component:

```typescript
useSessionValidation({
  user,
  onSessionInvalid: handleLogout,
  validationInterval: 5 * 60 * 1000,
});
```

---

## User Experience Flow

### Scenario: Admin Updates Rejoice's Access Rules

**Timeline:**

1. **T=0:00** - Rejoice is logged in, seeing Science books (old access)
   - Her `access_rules_version` in browser: `1`

2. **T=0:30** - Admin runs update script
   - Database updates Rejoice's access rules to Language & Filipino
   - `access_rules_version` incremented to `2`

3. **T=5:00** - Automatic validation runs (5 min interval)
   - Frontend sends version `1` to server
   - Server has version `2`
   - **Version mismatch detected!**

4. **T=5:01** - User sees alert:
   ```
   Your access permissions have been updated.
   
   You will be logged out and need to log in again to see your updated access.
   ```

5. **T=5:02** - User is automatically logged out
   - All cached data cleared
   - Redirected to login page

6. **T=5:03** - Rejoice logs back in
   - Gets fresh data with version `2`
   - Now sees Language & Filipino books ✅

---

## Configuration

### Validation Interval

Default: **5 minutes**

To change:

```typescript
// In App.tsx
useSessionValidation({
  user,
  onSessionInvalid: handleLogout,
  validationInterval: 3 * 60 * 1000, // 3 minutes
});
```

**Recommended values:**
- **Development**: 1-2 minutes (faster testing)
- **Production**: 5-10 minutes (balance between responsiveness and server load)

### Immediate Validation

To force immediate validation (e.g., after admin action):

```typescript
const { validateNow } = useSessionValidation({ ... });

// Call manually
await validateNow();
```

---

## Benefits

### ✅ **Automatic Cache Invalidation**
- No more stale data after permission changes
- Users automatically get updated access

### ✅ **No Manual Logout Required**
- System handles it automatically
- User-friendly notification

### ✅ **Prevents Security Issues**
- Users can't access data they shouldn't
- Immediate enforcement of access changes

### ✅ **Better User Experience**
- Clear messaging about why logout happened
- Seamless re-login process

### ✅ **Admin Convenience**
- Just run the update script
- System handles the rest

---

## Testing

### Test Case 1: Access Rule Change

1. Log in as `rejoice`
2. Note what books you see
3. Admin runs: `npx ts-node scripts/update-facilitator-access.ts`
4. Wait 5 minutes (or trigger manual validation)
5. **Expected**: Automatic logout with message
6. Log back in
7. **Expected**: See updated books (Language & Filipino)

### Test Case 2: No Changes

1. Log in as any user
2. Wait 5+ minutes
3. **Expected**: No logout (version matches)
4. Continue working normally

### Test Case 3: Multiple Users

1. Multiple users logged in
2. Admin updates one user's access
3. **Expected**: Only that user is logged out
4. Other users continue working

---

## Troubleshooting

### User Not Logged Out After Access Change

**Possible causes:**
1. **Validation interval hasn't elapsed** - Wait up to 5 minutes
2. **Version not incremented** - Check if update script ran successfully
3. **Browser cache** - User may need to hard refresh

**Solution:**
```bash
# Verify version was incremented
npx ts-node scripts/check-rejoice-access.ts
```

### Frequent Logouts

**Possible causes:**
1. **Validation interval too short** - Increase interval
2. **Network issues** - Check server connectivity
3. **Token expiration** - Check JWT expiration time

**Solution:**
```typescript
// Increase validation interval
validationInterval: 10 * 60 * 1000, // 10 minutes
```

### Version Mismatch on Fresh Login

**Possible causes:**
1. **Database migration needed** - Old users may not have version field

**Solution:**
```bash
# Run migration to add version field to existing users
npx ts-node scripts/migrate-add-version.ts
```

---

## Migration for Existing Users

If you have existing users without `access_rules_version`, create a migration script:

```typescript
// backend/scripts/migrate-add-version.ts
const users = await User.find({ access_rules_version: { $exists: false } });

for (const user of users) {
  user.access_rules_version = 1;
  await user.save();
}

console.log(`Migrated ${users.length} users`);
```

---

## API Reference

### `POST /api/auth/validate`

**Request:**
```json
{
  "access_rules_version": 1
}
```

**Response (Valid):**
```json
{
  "valid": true,
  "access_rules": [...],
  "access_rules_version": 1
}
```

**Response (Invalid):**
```json
{
  "valid": false,
  "reason": "access_rules_changed",
  "message": "Your access permissions have been updated. Please log in again.",
  "current_version": 2
}
```

---

## Best Practices

### For Administrators

1. **Run update scripts during off-peak hours** when possible
2. **Notify users** before bulk access changes
3. **Test on one user first** before bulk updates
4. **Monitor logs** for validation failures

### For Developers

1. **Always increment version** when modifying access rules
2. **Test validation logic** thoroughly
3. **Handle network errors** gracefully
4. **Log validation events** for debugging

### For Users

1. **Save work before 5-minute mark** if expecting access changes
2. **Don't panic on auto-logout** - it's expected behavior
3. **Re-login immediately** to get updated access

---

## Future Enhancements

### Possible Improvements

1. **Real-time notifications** via WebSocket
   - Instant logout instead of 5-minute delay
   
2. **Graceful session transfer**
   - Save user's current work before logout
   - Restore state after re-login

3. **Admin dashboard**
   - See who will be affected by access changes
   - Force immediate logout for specific users

4. **Version history**
   - Track when and why versions changed
   - Audit trail for access modifications

---

## Summary

The session caching system ensures that:

✅ Users always see data they're authorized to see  
✅ Access changes take effect automatically (within 5 minutes)  
✅ No manual intervention required from users  
✅ Clear communication about why logout happened  
✅ Secure and reliable access control  

**Key Files:**
- `backend/src/models/User.ts` - Version field
- `backend/src/routes/auth.ts` - Validation endpoint
- `src/hooks/useSessionValidation.ts` - Frontend validation
- `src/App.tsx` - Hook integration
- `backend/scripts/update-facilitator-access.ts` - Version increment

---

**Last Updated**: December 2, 2025  
**Version**: 1.0  
**Status**: ✅ Implemented and Tested
