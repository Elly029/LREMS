# How to Avoid "Too Many Requests" Error

## Problem Summary

The "Too Many Requests" error occurs because your frontend is making too many API calls to the backend in a short period, triggering the server's rate limiting protection.

### Root Causes:

1. **Frequent API calls on every search/sort change** - Line 208-212 in `App.tsx` triggers `fetch Books()` whenever `debouncedSearchTerm`, `sortConfig.key`, or `sortConfig.direction` changes
2. **Short debounce delay** - Currently 300ms, which still allows many requests during typing  
3. **No request throttling** - Multiple rapid changes can queue up several API calls
4. **No retry backoff** - When rate limited, clicking "Try Again" immediately retries without delay
5. **Server-side operations that could be client-side** - Your app already has client-side filtering logic but still makes server requests for search/sort

## Solutions Implemented

I've created three custom hooks to solve this problem:

### 1. **useRateLimitedFetch** (`src/hooks/useRateLimitedFetch.ts` ✓ Created)
   - Enforces minimum interval between requests (500ms default)
   - Implements exponential backoff retry logic
   - Automatically retries on rate limit errors (429 status)
   - Queues requests to prevent overlapping calls

### 2. **useRequestThrottle** (`src/hooks/useRequestThrottle.ts` ✓ Created)
   - Ensures functions are called at most once per interval
   - Prevents API spam from rapid user interactions
   - Useful for debouncing + throttling combo

## Recommended Changes to App.tsx

### Change 1: Increase Debounce Delay (Line 102)

```typescript
// BEFORE:
const debouncedSearchTerm = useDebounce(searchTerm, 300);

// AFTER (reduces API calls while typing):
const debouncedSearchTerm = useDebounce(searchTerm, 1000); // 1 second delay
```

### Change 2: Add Rate Limiting to fetchBooks (Around Line 107-114)

```typescript
// Add this BEFORE the fetchBooks function:
const { rateLimitedFetch } = useRateLimitedFetch({
  minInterval: 500, // Minimum 500ms between requests
  maxRetries: 3, // Retry up to 3 times on rate limit
  baseDelay: 2000, // Start with 2 second delay
});

// Then wrap your fetchBooks call:
const fetchBooks = async () => {
  if (!user) return;

  setLoading(true);
  setError(null);
  
  try {
    const result = await rateLimitedFetch(async () => {
      return await bookApi.fetchBooks({
        search: debouncedSearchTerm || undefined,
        page: 1,
        limit: 500, // Fetch more to reduce need for subsequent requests
        sortBy: sortConfig.key,
        sortOrder: sortConfig.direction === 'ascending' ? 'asc' : 'desc',
      });
    });

    setBooks(result.books);
  } catch (err: any) {
    let errorMessage = 'Failed to fetch books';
    
    // Better error handling
    if (err?.status === 429 || err?.message?.includes('too many requests')) {
      errorMessage = 'Too many requests. The system is retrying automatically...';
    } else if (err?.message?.includes('Network error')) {
      errorMessage = 'Unable to connect to the server. Please check your connection.';
    } else if (err?.message?.includes('timeout')) {
      errorMessage = 'Request timed out. Please try again.';
    } else if (err instanceof Error) {
      errorMessage = err.message;
    }
    
    setError(errorMessage);
    console.error('Error fetching books:', err);
    
    // Don't clear books on error - keep showing what we have
    // setBooks([]); // REMOVE THIS LINE
    
    // Show toast notification
    showToast(errorMessage, 'error');
  } finally {
    setLoading(false);
  }
};
```

### Change 3: Optimize useEffect Dependencies (Line 168-172)

Consider removing `sortConfig.key` and `sortConfig.direction` from dependencies since you have client-side sorting:

```typescript
// CURRENT - triggers API call on every sort change:
useEffect(() => {
  if (user) {
    fetchBooks();
  }
}, [user, debouncedSearchTerm, sortConfig.key, sortConfig.direction]);

// BETTER - only fetch on search/initial load:
useEffect(() => {
  if (user) {
    fetchBooks();
  }
}, [user, debouncedSearchTerm]); // Removed sortConfig

// Your client-side sorting (line 498-534) handles the rest!
```

## Alternative: Client-Side Only Approach

For even better performance, consider fetching ALL books once and doing everything client-side:

```typescript
useEffect(() => {
  if (user) {
    fetchBooks(); // Only call ONCE on mount
  }
}, [user]); //  Only trigger on user change

// Then filteredBooks and sortedBooks memos handle everything else
```

This eliminates most API calls entirely!

## Error Display Improvements

Update the error UI (line 817-831) to show a retry countdown:

```typescript
{error && !loading && (
  <div className="p-4 sm:p-8 text-center">
    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-100 mb-4">
      <svg className="h-8 w-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    </div>
    <h3 className="text-lg font-medium text-gray-900 mb-2">Unable to load books</h3>
    <p className="text-gray-500 mb-6 max-w-md mx-auto text-sm">{error}</p>
    {error.includes('Too many requests') && (
      <p className="text-sm text-amber-600 mb-4">
        ⏳ Request limiting in effect. Wait a moment before retrying.
      </p>
    )}
    <button
      onClick={fetchBooks}
      className="bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 font-medium py-2 px-4 rounded-lg transition-colors"
    >
      Try Again
    </button>
  </div>
)}
```

## Backend Considerations

If you have access to the backend, you can also:

1. **Increase rate limit thresholds** - Allow more requests per minute
2. **Implement caching** - Cache frequent queries
3. **Add pagination awareness** - Return cached results for repeated queries
4. **Implement request batching** - Combine multiple operations into one request

## Testing the Fix

1. Type rapidly in the search box - should only make ONE request after you stop typing (1 second delay)
2. Change sort column quickly - should throttle requests
3. If you hit rate limit - should automatically retry with exponential backoff
4. Error messages should be user-friendly

## Summary of Benefits

✅ **Reduced API calls** - Debounce increased to 1 second
✅ **Automatic retry** - Handles rate limits gracefully  
✅ **Request queuing** - Prevents concurrent calls
✅ **Better error handling** - User-friendly messages
✅ **Preserved data** - Books don't disappear on error
✅ **Client-side operations** - Sorting and basic filtering happen locally

## Quick Start

1. The custom hooks are already created in `src/hooks/`
2. Update `App.tsx` with the changes above
3. Test the application
4. Monitor console for any rate limiting messages
5. Adjust `minInterval` and `baseDelay` values if needed

---

**Need Help?** The hooks are well-documented with TypeScript types. Check the comments in:
- `src/hooks/useRateLimitedFetch.ts`
- `src/hooks/useRequestThrottle.ts`
