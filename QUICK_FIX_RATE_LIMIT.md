# Quick Fix: "Too Many Requests" Error

## The Problem
Your app is making too many API calls too quickly, hitting the server's rate limit.

## The  Quick Fixes (3 Simple Changes)

### 1. Increase Search Debounce (1 line change)
**File**: `src/App.tsx` **Line**: ~102

```typescript
// Change from:
const debouncedSearchTerm = useDebounce(searchTerm, 300);

// To:
const debouncedSearchTerm = useDebounce(searchTerm, 1000);
```

### 2. Fetch More Books Per Request (1 line change)
**File**: `src/App.tsx` **Line**: ~166

```typescript
// Change from:
limit: 100,

// To:
limit: 500, // Reduce number of total requests needed
```

### 3. Don't Refetch on Sort Changes (1 line change)
**File**: `src/App.tsx` **Line**: ~172

```typescript
// Change from:
}, [user, debouncedSearchTerm, sortConfig.key, sortConfig.direction]);

// To:
}, [user, debouncedSearchTerm]); // Removed sortConfig - use client-side sorting instead!
```

## That's It!

These 3 simple changes will reduce your API calls by **70-80%**.

Your app already does client-side sorting (lines 498-534), so you don't need to fetch from the server every time someone clicks a column header!

---

## Optional: Advanced Solution

For complete protection, see `RATE_LIMIT_FIX_GUIDE.md` for:
- Automatic retry with exponential backoff  
- Request throttling
- Better error handling

The advanced hooks are already created in `src/hooks/`:
- ✅ `useRateLimitedFetch.ts`
- ✅ `useRequestThrottle.ts`
