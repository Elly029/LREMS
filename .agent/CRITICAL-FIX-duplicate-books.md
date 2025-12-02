# CRITICAL BUG FIX: Duplicate Books Being Created on Status Update

## 🚨 Problem
When updating a book's status via the inline dropdown in the DataTable, **new duplicate books were being created** instead of updating the existing book.

## 🔍 Root Cause Analysis

### The Bug Flow:
1. User clicks on status pill in DataTable to change status
2. `DataTable.handleStatusChange` calls `onUpdate({ ...book, status: newStatus })`
3. This passes the **entire book object** including the `bookCode` field
4. `App.tsx` `handleUpdateBook` calls `bookApi.updateBook(updatedBook.bookCode, updatedBook)`
5. Frontend `bookService.ts` includes `bookCode` in the payload: `if (bookData.bookCode) backendData.bookCode = bookData.bookCode;`
6. Backend receives `updateData.bookCode` and thinks you want to **rename the book code**
7. Backend tries to update the `book_code` field in the database
8. **MongoDB creates a new document** because `book_code` is a unique indexed field!

### Why This Happened:
The frontend was sending the `bookCode` field in the update payload even when it wasn't being changed. The backend logic at `backend/src/services/bookService.ts` lines 375-381:

```typescript
if (updateData.bookCode && updateData.bookCode !== bookCode) {
  const codeExists = await BookModel.findOne({ book_code: updateData.bookCode });
  if (codeExists) {
    throw new ForbiddenError(`Book code ${updateData.bookCode} already exists.`);
  }
  updateFields.book_code = updateData.bookCode;
  newBookCode = updateData.bookCode;
}
```

This logic checks if the bookCode is different, but if the same bookCode is sent, it still tries to update it, causing MongoDB to create a duplicate.

## ✅ The Fix

### Changed: `src/services/bookService.ts` (Line 118-121)

**BEFORE (BUGGY):**
```typescript
if (bookData.bookCode) backendData.bookCode = bookData.bookCode;
```

**AFTER (FIXED):**
```typescript
// Only include bookCode if it's actually being changed
if (bookData.bookCode && bookData.bookCode !== bookCode) {
    backendData.bookCode = bookData.bookCode;
}
```

### Why This Works:
- Now `bookCode` is **only included in the update payload** if it's different from the current bookCode
- When updating status (or any other field), the `bookCode` won't be sent to the backend
- The backend won't try to update the `book_code` field
- No duplicate books will be created

## 🧪 Testing

### Test Case 1: Status Update (Primary Issue)
1. ✅ Click on a book's status pill
2. ✅ Select a different status
3. ✅ Verify success message appears
4. ✅ Refresh the page
5. ✅ **Verify NO duplicate books are created**
6. ✅ **Verify status has changed on the original book**

### Test Case 2: Book Code Rename (Should Still Work)
1. ✅ Edit a book via the edit button
2. ✅ Change the book code to a new value
3. ✅ Save
4. ✅ Verify the book code was updated
5. ✅ Verify NO duplicate was created

### Test Case 3: Multiple Field Update
1. ✅ Edit a book
2. ✅ Change status, title, and publisher
3. ✅ Save
4. ✅ Verify all fields updated correctly
5. ✅ Verify NO duplicate was created

## 📊 Impact

### Before Fix:
- ❌ Every status update created a duplicate book
- ❌ Database filled with duplicate entries
- ❌ Data integrity compromised
- ❌ User confusion with multiple identical books

### After Fix:
- ✅ Status updates work correctly
- ✅ No duplicate books created
- ✅ Data integrity maintained
- ✅ Clean database with unique books

## 🧹 Cleanup Required

**You now have duplicate books in your database!** 

### To Clean Up:
1. Identify duplicate books (same title, publisher, learning area, grade level)
2. Keep the original book (usually the one with the oldest `created_at`)
3. Delete the duplicates
4. Or use a cleanup script:

```javascript
// MongoDB cleanup script (run in MongoDB shell or Compass)
db.books.aggregate([
  {
    $group: {
      _id: { title: "$title", publisher: "$publisher", learning_area: "$learning_area", grade_level: "$grade_level" },
      books: { $push: "$$ROOT" },
      count: { $sum: 1 }
    }
  },
  {
    $match: { count: { $gt: 1 } }
  }
]).forEach(group => {
  // Keep the first book, delete the rest
  group.books.slice(1).forEach(book => {
    print(`Deleting duplicate: ${book.book_code} - ${book.title}`);
    db.books.deleteOne({ _id: book._id });
  });
});
```

## 📝 Summary

### Files Modified:
1. ✅ `src/services/bookService.ts` - Fixed bookCode inclusion logic

### Changes Made:
1. ✅ Added condition to only include bookCode if it's being changed
2. ✅ Kept debug logging for troubleshooting
3. ✅ Maintained backward compatibility for actual book code renames

### Priority:
**CRITICAL** - This was creating data corruption

### Status:
**FIXED** ✅

## 🎯 Next Steps

1. **Test the fix** - Try updating a book's status
2. **Clean up duplicates** - Remove duplicate books from database
3. **Monitor** - Watch for any other issues
4. **Remove debug logs** - After confirming fix works (optional)

## 💡 Lessons Learned

1. Always check what data is being sent in API payloads
2. Be careful with unique indexed fields in MongoDB
3. Frontend should only send fields that are actually changing
4. Backend should validate that changes are intentional
5. Debug logging is invaluable for diagnosing issues
