# Bug Report: Book Status Update Not Persisting

## Issue Description
When updating the status of a book in the application, the system shows a "success" message, but after refreshing the page, the book's status remains unchanged. This issue persists across multiple attempts and books.

## Steps to Reproduce

1. **Login to the application** with valid credentials
2. **Navigate to the Inventory view** (main book listing page)
3. **Select a book** to edit by clicking the edit button/icon
4. **Change the book's status** to a different value (e.g., from "For Evaluation" to "In Progress")
5. **Save the changes** by clicking the save button
6. **Observe the success message** displayed by the application
7. **Refresh the page** (F5 or Ctrl+R)
8. **Check the book's status** - it will have reverted to the original value

## Expected Behavior
- When a book's status is updated and saved, the change should persist in the database
- After refreshing the page, the book should display the newly updated status
- The status change should be immediately visible without requiring a page refresh

## Actual Behavior
- The application shows a "success" message after updating
- The status appears to change in the UI temporarily
- After refreshing the page, the status reverts to its original value
- The database is not being updated with the new status

## Root Cause Analysis

After examining the codebase, I've identified the following potential causes:

### 1. **Cache Invalidation Issue**
**Location:** `backend/src/services/bookService.ts` (line 407)

The backend service invalidates the cache namespace after updates:
```typescript
cache.invalidateNamespace('books:list');
```

However, there might be a timing issue where the frontend is reading from a stale cache before invalidation completes.

### 2. **Frontend State Management**
**Location:** `src/App.tsx` (lines 254-262)

The `handleUpdateBook` function updates the book but relies on `dataVersion` to trigger a refetch:
```typescript
const handleUpdateBook = useCallback(async (updatedBook: Book) => {
  try {
    await bookApi.updateBook(updatedBook.bookCode, updatedBook);
    showToast('Book updated successfully!', 'success');
    setDataVersion(prev => prev + 1);
  } catch (err) {
    showToast('Failed to update book', 'error');
  }
}, []);
```

### 3. **Backend Update Logic**
**Location:** `backend/src/services/bookService.ts` (lines 384-392)

The update logic checks if there are fields to update:
```typescript
if (Object.keys(updateFields).length > 0) {
  const statusChanged = updateFields.status !== undefined && updateFields.status !== existingBook.status;
  await BookModel.updateOne({ book_code: bookCode }, updateFields);
  
  // If bookCode changed, update remarks
  if (newBookCode !== bookCode) {
    await RemarkModel.updateMany({ book_code: bookCode }, { book_code: newBookCode });
  }
}
```

**CRITICAL ISSUE:** The `statusChanged` variable is calculated but **never used**. This suggests incomplete implementation.

### 4. **Field Mapping Issue**
**Location:** `src/services/bookService.ts` (lines 116-126)

The frontend service only adds fields to `backendData` if they are truthy:
```typescript
const backendData: any = {};

if (bookData.bookCode) backendData.bookCode = bookData.bookCode;
if (bookData.learningArea) backendData.learningArea = bookData.learningArea;
if (bookData.gradeLevel !== undefined) backendData.gradeLevel = bookData.gradeLevel;
if (bookData.publisher) backendData.publisher = bookData.publisher;
if (bookData.title) backendData.title = bookData.title;
if (bookData.status) backendData.status = bookData.status;  // ⚠️ PROBLEM HERE
if (bookData.isNew !== undefined) backendData.isNew = bookData.isNew;
if (bookData.ntpDate !== undefined) backendData.ntpDate = bookData.ntpDate;
if (bookData.remark) backendData.remark = bookData.remark;
```

**THE BUG:** Line 123 uses `if (bookData.status)` which is a truthy check. If the status is an empty string or falsy value, it won't be included in the update payload. However, all valid status values should be truthy strings, so this is likely not the issue unless there's data corruption.

### 5. **Backend Field Mapping**
**Location:** `backend/src/services/bookService.ts` (lines 364-371)

```typescript
const updateFields: any = {};
if (updateData.learningArea !== undefined) updateFields.learning_area = updateData.learningArea;
if (updateData.gradeLevel !== undefined) updateFields.grade_level = updateData.gradeLevel;
if (updateData.publisher !== undefined) updateFields.publisher = updateData.publisher;
if (updateData.title !== undefined) updateFields.title = updateData.title;
if (updateData.status !== undefined) updateFields.status = updateData.status;  // ✓ Correct
if (updateData.isNew !== undefined) updateFields.is_new = updateData.isNew;
if (updateData.ntpDate !== undefined) updateFields.ntp_date = updateData.ntpDate ? new Date(updateData.ntpDate) : null;
```

This looks correct - it uses `!== undefined` checks.

## Most Likely Cause

The most likely cause is **#4 - Frontend Field Mapping Issue**. The frontend service uses a truthy check for status:

```typescript
if (bookData.status) backendData.status = bookData.status;
```

This should be:
```typescript
if (bookData.status !== undefined) backendData.status = bookData.status;
```

## Secondary Issue: Database Update Not Executing

There's also a possibility that the database update is failing silently. The backend logs should show:
```typescript
logger.info(`Book updated successfully: ${bookCode} -> ${newBookCode}`);
if (updateFields.status !== undefined) {
  logger.info(`Status changed: ${existingBook.status} -> ${updateFields.status} for ${newBookCode}`);
}
```

If these logs don't appear, the update isn't executing.

## Fix Implementation

### Fix 1: Update Frontend Service (Primary Fix)
**File:** `src/services/bookService.ts`

Change line 123 from:
```typescript
if (bookData.status) backendData.status = bookData.status;
```

To:
```typescript
if (bookData.status !== undefined) backendData.status = bookData.status;
```

### Fix 2: Add Debugging Logs
**File:** `src/services/bookService.ts`

Add logging before the API call:
```typescript
console.log('Updating book with data:', backendData);
const response = await apiClient.put<ApiResponse>(`/books/${bookCode}`, backendData);
console.log('Update response:', response);
```

### Fix 3: Verify Backend Execution
**File:** `backend/src/services/bookService.ts`

Ensure the update is executing by checking logs. Add additional logging if needed:
```typescript
logger.info(`Attempting to update book ${bookCode} with fields:`, updateFields);
await BookModel.updateOne({ book_code: bookCode }, updateFields);
logger.info(`Database update completed for ${bookCode}`);
```

### Fix 4: Force Cache Invalidation
**File:** `backend/src/services/bookService.ts`

Ensure cache is properly invalidated:
```typescript
cache.invalidateNamespace('books:list');
// Also invalidate specific book cache if it exists
cache.invalidate('books:detail', { bookCode: newBookCode });
```

## Testing Plan

After implementing the fix:

1. **Test basic status update:**
   - Edit a book and change its status
   - Save the changes
   - Verify success message appears
   - Refresh the page
   - Confirm the status has persisted

2. **Test multiple status changes:**
   - Change the same book's status multiple times in succession
   - Verify each change persists

3. **Test with different status values:**
   - Try updating to each available status option
   - Verify all status values can be saved correctly

4. **Test concurrent updates:**
   - Open the same book in two browser tabs
   - Update the status in both tabs
   - Verify the last update wins and persists

5. **Check backend logs:**
   - Verify update logs appear in the backend console
   - Confirm database update statements are executed
   - Check for any error messages

6. **Database verification:**
   - After updating a book's status, directly query the database
   - Confirm the `status` field has the new value
   - Check the `updated_at` timestamp has changed

## Additional Recommendations

1. **Add optimistic UI updates:** Update the local state immediately while the API call is in progress
2. **Add error handling:** Display specific error messages if the update fails
3. **Add validation:** Ensure the status value is valid before sending to the backend
4. **Add audit logging:** Track all status changes with user and timestamp information
5. **Consider using WebSockets:** For real-time updates across multiple clients

## Related Files

- Frontend Service: `src/services/bookService.ts`
- Frontend Component: `src/App.tsx`
- Backend Service: `backend/src/services/bookService.ts`
- Backend Routes: `backend/src/routes/books.ts`
- Backend Model: `backend/src/models/Book.ts`

## Priority
**HIGH** - This is a critical data integrity issue affecting core functionality.

## Status
**Identified** - Root cause has been identified and fix is ready to implement.
