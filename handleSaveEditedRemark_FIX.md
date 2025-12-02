# Fix for handleSaveEditedRemark Function

## Current Implementation Issues
The `handleSaveEditedRemark` function in `src/App.tsx` has similar issues to `handleAddRemark`:
1. No optimistic UI update
2. Potential race conditions with event listeners
3. No immediate visual feedback to users

## Recommended Fix

Replace the current `handleSaveEditedRemark` function with this improved version:

```typescript
const handleSaveEditedRemark = async (bookCode: string, remarkId: string, remark: Remark) => {
  try {
    // Store the original remark in case we need to revert
    const originalBook = books.find(b => b.bookCode === bookCode);
    const originalRemark = originalBook?.remarks?.find(r => r.id === remarkId);
    
    // Optimistically update the UI
    setBooks(prevBooks => 
      prevBooks.map(book => {
        if (book.bookCode === bookCode) {
          const updatedRemarks = book.remarks?.map(r => 
            r.id === remarkId ? { ...remark, id: remarkId } : r
          ) || [];
          return {
            ...book,
            remarks: updatedRemarks
          };
        }
        return book;
      })
    );

    // Update selectedBookForRemarks if needed
    if (selectedBookForRemarks && selectedBookForRemarks.bookCode === bookCode) {
      setSelectedBookForRemarks(prevBook => ({
        ...prevBook!,
        remarks: prevBook!.remarks?.map(r => 
          r.id === remarkId ? { ...remark, id: remarkId } : r
        ) || []
      }));
    }

    // Update the remark in the backend
    await bookApi.updateRemark(bookCode, remarkId, remark);
    showToast('Remark updated successfully!', 'success');
    
    // Refresh to ensure consistency
    await fetchBooks();
  } catch (err) {
    // Revert the optimistic update on error
    await fetchBooks(); // Refresh to get the actual state
    showToast('Failed to update remark', 'error');
  }
};
```

This implementation provides:
1. Immediate visual feedback
2. Better error handling
3. Consistent user experience
4. Data integrity through refresh on error